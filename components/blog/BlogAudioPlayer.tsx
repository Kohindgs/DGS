"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Blog.module.css";

type BlogAudioPlayerProps = {
  title: string;
  summary?: string;
  bodyHtml: string;
  readingTimeMinutes?: number;
};

type StudioVoiceOption = {
  id: "Aoede" | "Charon" | "Kore" | "Fenrir" | "Puck";
  label: string;
  langFallback: string;
  genderHint: "female" | "male";
};

const STUDIO_VOICES: StudioVoiceOption[] = [
  { id: "Aoede", label: "Aoede (Studio Female)", langFallback: "en-US", genderHint: "female" },
  { id: "Charon", label: "Charon (Executive Male)", langFallback: "en-GB", genderHint: "male" },
  { id: "Kore", label: "Kore (Editorial Female)", langFallback: "en-GB", genderHint: "female" },
  { id: "Fenrir", label: "Fenrir (Broadcast Male)", langFallback: "en-US", genderHint: "male" },
  { id: "Puck", label: "Puck (Podcast Male)", langFallback: "en-IN", genderHint: "male" },
];

function htmlToNarrativeSegments(
  title: string,
  summary: string | undefined,
  bodyHtml: string
): string[] {
  const rawBlocks: string[] = [];

  if (title?.trim()) {
    rawBlocks.push(title.trim().replace(/\s+/g, " "));
  }
  if (summary?.trim()) {
    rawBlocks.push(`Executive Summary: ${summary.trim().replace(/\s+/g, " ")}`);
  }

  if (bodyHtml) {
    const spaced = bodyHtml
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/(h1|h2|h3|h4|p|li|tr|blockquote|div|section|article)>/gi, ". ")
      .replace(/<(br|hr)\b[^>]*\/?>/gi, ". ")
      .replace(/<th\b[^>]*>([\s\S]*?)<\/th>/gi, "$1: ")
      .replace(/<td\b[^>]*>([\s\S]*?)<\/td>/gi, "$1, ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&rarr;|→/g, " to ")
      .replace(/\s+/g, " ")
      .trim();

    if (spaced) {
      rawBlocks.push(spaced);
    }
  }

  const combined = rawBlocks.join(". ").replace(/\.\s*\./g, ".").trim();
  if (!combined) return [];

  const sentences = combined.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [combined];
  const segments: string[] = [];
  let current = "";

  for (const rawSentence of sentences) {
    const s = rawSentence.trim();
    if (!s || s.length < 2) continue;

    if (!current) {
      current = s;
    } else if ((current + " " + s).length <= 280) {
      current = `${current} ${s}`;
    } else {
      segments.push(current);
      current = s;
    }
  }
  if (current) {
    segments.push(current);
  }

  return segments;
}

export function BlogAudioPlayer({
  title,
  summary,
  bodyHtml,
  readingTimeMinutes = 4,
}: BlogAudioPlayerProps) {
  const segments = useMemo(
    () => htmlToNarrativeSegments(title, summary, bodyHtml),
    [title, summary, bodyHtml]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState<number>(1);
  const [voice, setVoice] = useState<StudioVoiceOption["id"]>("Aoede");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIndexRef = useRef(0);
  const rateRef = useRef(1);
  const voiceRef = useRef<StudioVoiceOption["id"]>("Aoede");
  const isPlayingRef = useRef(false);
  const blobCacheRef = useRef<Map<string, Promise<string>>>(new Map());
  const playSessionIdRef = useRef(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      playSessionIdRef.current += 1;
      isPlayingRef.current = false;
      try {
        audio.pause();
        audio.src = "";
      } catch {}
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    };
  }, []);

  const fetchAudioUrlForSegment = (
    idx: number,
    targetVoice: StudioVoiceOption["id"]
  ): Promise<string> => {
    const text = segments[idx];
    if (!text) return Promise.reject(new Error("Empty segment"));
    const cacheKey = `${targetVoice}::${idx}::${text}`;
    const existing = blobCacheRef.current.get(cacheKey);
    if (existing) return existing;

    const promise = (async () => {
      const res = await fetch("/api/blog-tts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: targetVoice }),
      });
      if (!res.ok) {
        throw new Error(`TTS HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size < 100) {
        throw new Error("Empty audio payload");
      }
      return URL.createObjectURL(blob);
    })();

    promise.catch(() => {
      blobCacheRef.current.delete(cacheKey);
    });

    blobCacheRef.current.set(cacheKey, promise);
    return promise;
  };

  const prefetchUpcoming = (fromIdx: number, targetVoice: StudioVoiceOption["id"]) => {
    for (let offset = 1; offset <= 2; offset++) {
      const nextIdx = fromIdx + offset;
      if (nextIdx < segments.length) {
        fetchAudioUrlForSegment(nextIdx, targetVoice).catch(() => {});
      }
    }
  };

  const speakBrowserFallbackAt = (
    idx: number,
    sessionId: number,
    targetVoice: StudioVoiceOption["id"]
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }

    setTimeout(() => {
      if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;
      const u = new SpeechSynthesisUtterance(segments[idx]);
      u.rate = rateRef.current;
      const opt = STUDIO_VOICES.find((v) => v.id === targetVoice) || STUDIO_VOICES[0];
      const voices = synth.getVoices() || [];
      const matched =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (opt.genderHint === "female"
              ? /aria|sonia|jenny|zira|samantha|female|neerja|google uk english female/i.test(v.name)
              : /guy|ryan|david|daniel|male|prabhat|google uk english male/i.test(v.name))
        ) || voices.find((v) => v.lang.startsWith("en"));

      if (matched) {
        u.voice = matched;
        u.lang = matched.lang;
      } else {
        u.lang = opt.langFallback;
      }

      u.onstart = () => {
        if (sessionId === playSessionIdRef.current) {
          setIsLoading(false);
          setIsPlaying(true);
          setIsPaused(false);
        }
      };

      u.onend = () => {
        if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;
        const nextIdx = idx + 1;
        if (nextIdx < segments.length) {
          playSegmentAt(nextIdx, voiceRef.current);
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsPaused(false);
          activeIndexRef.current = 0;
          setCurrentIndex(0);
        }
      };

      synth.speak(u);
    }, 60);
  };

  const playSegmentAt = async (
    idx: number,
    targetVoice: StudioVoiceOption["id"] = voiceRef.current
  ) => {
    if (idx >= segments.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      activeIndexRef.current = 0;
      setCurrentIndex(0);
      return;
    }

    const sessionId = ++playSessionIdRef.current;
    activeIndexRef.current = idx;
    setCurrentIndex(idx);
    setIsLoading(true);

    prefetchUpcoming(idx, targetVoice);

    try {
      const objectUrl = await fetchAudioUrlForSegment(idx, targetVoice);
      if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;

      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.src = objectUrl;
      audio.playbackRate = rateRef.current;

      audio.onended = () => {
        if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;
        playSegmentAt(idx + 1, voiceRef.current);
      };

      audio.onerror = () => {
        if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;
        speakBrowserFallbackAt(idx, sessionId, targetVoice);
      };

      await audio.play();
      if (sessionId === playSessionIdRef.current) {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch {
      if (sessionId !== playSessionIdRef.current || !isPlayingRef.current) return;
      speakBrowserFallbackAt(idx, sessionId, targetVoice);
    }
  };

  const handleTogglePlay = () => {
    if (segments.length === 0) return;
    const audio = audioRef.current;

    if (isPlaying && !isPaused) {
      isPlayingRef.current = false;
      audio?.pause();
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
      setIsPlaying(false);
      setIsPaused(true);
      setIsLoading(false);
      return;
    }

    if (isPaused && audio && audio.src && audio.currentTime > 0 && !audio.ended) {
      isPlayingRef.current = true;
      audio.playbackRate = rateRef.current;
      audio.play().catch(() => {
        playSegmentAt(activeIndexRef.current, voiceRef.current);
      });
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const startIdx = activeIndexRef.current >= segments.length ? 0 : activeIndexRef.current;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    playSegmentAt(startIdx, voiceRef.current);
  };

  const handleStop = () => {
    playSessionIdRef.current += 1;
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    activeIndexRef.current = 0;
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
  };

  const handleSpeedChange = (nextRate: number) => {
    rateRef.current = nextRate;
    setRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextVoice = e.target.value as StudioVoiceOption["id"];
    voiceRef.current = nextVoice;
    setVoice(nextVoice);
    if (isPlayingRef.current || isPaused) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);
      playSegmentAt(activeIndexRef.current, nextVoice);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (segments.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const targetIdx = Math.min(segments.length - 1, Math.floor(ratio * segments.length));
    activeIndexRef.current = targetIdx;
    setCurrentIndex(targetIdx);
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    playSegmentAt(targetIdx, voiceRef.current);
  };

  if (segments.length === 0) return null;

  const progressPct =
    segments.length > 0 ? Math.min(100, Math.round((currentIndex / segments.length) * 100)) : 0;

  return (
    <section aria-label="Listen to this article" className={styles.audioPlayerCard}>
      <div className={styles.audioPlayerTopRow}>
        <div className={styles.audioPlayerLeft}>
          <button
            type="button"
            onClick={handleTogglePlay}
            className={styles.audioPlayBtn}
            aria-label={
              isPlaying
                ? "Pause article narration"
                : isPaused
                ? "Resume article narration"
                : "Listen to full article"
            }
          >
            {isLoading ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l11-6.86a1 1 0 0 0 0-1.66l-11-6.86A1 1 0 0 0 8 5.14Z" />
              </svg>
            )}
          </button>

          <div className={styles.audioTitleGroup}>
            <div className={styles.audioEyebrowRow}>
              <span
                className={styles.audioPulseDot}
                data-playing={isPlaying || isLoading ? "true" : "false"}
              />
              <span className={styles.audioEyebrow}>
                {isLoading
                  ? "Generating Studio Neural Voice..."
                  : isPlaying
                  ? "Studio AI Narrator Live"
                  : isPaused
                  ? "Narration Paused"
                  : "Listen to This Article (Studio AI Voice)"}
              </span>
              <span className={styles.audioDurationBadge}>~{readingTimeMinutes} min audio</span>
            </div>
            <p className={styles.audioCurrentText}>
              {isPlaying || isPaused || isLoading
                ? segments[currentIndex] || title
                : "Click play to listen to the entire article in a natural Studio AI voice."}
            </p>
          </div>
        </div>

        <div className={styles.audioControlsRight}>
          <div className={styles.audioSpeedGroup} role="group" aria-label="Playback speed">
            {[1, 1.25, 1.5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleSpeedChange(r)}
                className={`${styles.audioSpeedBtn} ${rate === r ? styles.audioSpeedBtnActive : ""}`}
              >
                {r}x
              </button>
            ))}
          </div>

          <select
            value={voice}
            onChange={handleVoiceChange}
            aria-label="Select Studio AI narrator voice"
            className={styles.audioVoiceSelect}
          >
            {STUDIO_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>

          {isPlaying || isPaused || currentIndex > 0 ? (
            <button
              type="button"
              onClick={handleStop}
              className={styles.audioStopBtn}
              aria-label="Reset audio player"
              title="Reset to beginning"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* Interactive Progress Scrubber */}
      <div
        className={styles.audioProgressWrap}
        onClick={handleScrub}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        title="Click to jump to any section"
      >
        <div className={styles.audioProgressFill} style={{ width: `${progressPct}%` }} />
      </div>

      <div className={styles.audioFooterMeta}>
        <span>
          {currentIndex > 0 || isPlaying || isPaused
            ? `Paragraph ${Math.min(currentIndex + 1, segments.length)} of ${segments.length}`
            : `${segments.length} Studio Neural paragraphs ready`}
        </span>
        <span>{progressPct}% completed</span>
      </div>
    </section>
  );
}
