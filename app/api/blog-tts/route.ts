import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_VOICES = new Set(["Aoede", "Charon", "Kore", "Fenrir", "Puck"]);

function getCacheDir(): string {
  const cmsDir = process.env.DGS_CMS_MEDIA_DIR?.trim();
  const base = cmsDir && existsSync(cmsDir) ? join(cmsDir, "tts-cache") : join(tmpdir(), "dgs-tts-cache");
  try {
    mkdirSync(base, { recursive: true });
  } catch {}
  return base;
}

function pcm16ToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawText = String(body?.text || "").trim().slice(0, 900);
    const voice = ALLOWED_VOICES.has(String(body?.voice)) ? String(body.voice) : "Aoede";

    if (!rawText) {
      return NextResponse.json({ ok: false, message: "Missing text" }, { status: 400 });
    }

    const hash = createHash("sha256").update(`v1:${voice}:${rawText}`).digest("hex").slice(0, 32);
    const cacheDir = getCacheDir();
    const wavCachePath = join(cacheDir, `${hash}.wav`);

    if (existsSync(wavCachePath)) {
      const cached = readFileSync(wavCachePath);
      return new NextResponse(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-DGS-TTS-Cache": "HIT",
        },
      });
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (apiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Read the following paragraph aloud in a warm, natural, professional executive podcast tone without adding any extra words:\n\n${rawText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voice,
                  },
                },
              },
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (inlineData?.data) {
          const pcmBuffer = Buffer.from(inlineData.data, "base64");
          const wavBuffer = pcm16ToWav(pcmBuffer, 24000, 1);
          try {
            writeFileSync(wavCachePath, wavBuffer);
          } catch {}

          return new NextResponse(new Uint8Array(wavBuffer), {
            status: 200,
            headers: {
              "Content-Type": "audio/wav",
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-DGS-TTS-Cache": "MISS",
            },
          });
        }
      }
    }

    // Fallback to Google Cloud / Translate Neural MP3 stream if Gemini quota/network is temporarily unavailable
    const shortText = rawText.slice(0, 200);
    const tl = voice === "Charon" || voice === "Fenrir" ? "en-GB" : "en-US";
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(shortText)}&tl=${tl}&client=tw-ob`;
    const fbRes = await fetch(fallbackUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (fbRes.ok) {
      const mp3Buf = Buffer.from(await fbRes.arrayBuffer());
      return new NextResponse(new Uint8Array(mp3Buf), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ ok: false, message: "TTS generation unavailable" }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Internal TTS error" },
      { status: 500 }
    );
  }
}
