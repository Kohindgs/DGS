import { spawn } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const TEXT_ROOTS = ["app", "components", "lib", "data", "public", "scripts"];
const TEXT_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css", ".scss", ".html", ".md", ".txt", ".xml"]);
const APPLY = process.argv.includes("--apply");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}

function publicUrl(path) {
  return "/" + relative(PUBLIC, path).replace(/\\/g, "/");
}
async function convertVideo(input, output) {
  if (!ffmpegPath) throw new Error("Bundled FFmpeg is unavailable");
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      "-y", "-i", input,
      "-map_metadata", "0",
      "-c:v", "libvpx-vp9", "-crf", "18", "-b:v", "0",
      "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
      "-c:a", "libopus", "-b:a", "160k",
      output,
    ], { windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr = (stderr + String(chunk)).slice(-8000); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`FFmpeg failed (${code}): ${stderr}`)));
  });
}

const files = await walk(PUBLIC);
const sourceMedia = files.filter((file) => /\.(jpe?g|mp4)$/i.test(file));
const replacements = new Map();
let converted = 0;
let skipped = 0;
for (const input of sourceMedia) {
  const ext = extname(input).toLowerCase();
  const output = input.replace(/\.(jpe?g)$/i, ".webp").replace(/\.mp4$/i, ".webm");
  replacements.set(publicUrl(input), publicUrl(output));
  try {
    await stat(output);
    skipped++;
    continue;
  } catch {}

  if (!APPLY) continue;
  if (ext === ".mp4") {
    await convertVideo(input, output);
  } else {
    await sharp(input).rotate().webp({ quality: 92, effort: 5, smartSubsample: true }).toFile(output);
  }
  converted++;
}

let referenceFilesChanged = 0;
let referencesChanged = 0;
for (const rootName of TEXT_ROOTS) {
  const root = join(ROOT, rootName);
  let candidates = [];
  try { candidates = await walk(root); } catch { continue; }
  for (const file of candidates) {
    if (!TEXT_EXTS.has(extname(file).toLowerCase())) continue;
    let text;
    try { text = await readFile(file, "utf8"); } catch { continue; }
    let next = text;
    let localChanges = 0;
    for (const [from, to] of replacements) {
      const count = next.split(from).length - 1;
      if (!count) continue;
      next = next.split(from).join(to);
      localChanges += count;
    }
    if (!localChanges) continue;
    referenceFilesChanged++;
    referencesChanged += localChanges;
    if (APPLY) await writeFile(file, next, "utf8");
  }
}

console.log(JSON.stringify({
  mode: APPLY ? "apply" : "dry-run",
  sourceMedia: sourceMedia.length,
  jpg: sourceMedia.filter((f) => /\.jpe?g$/i.test(f)).length,
  mp4: sourceMedia.filter((f) => /\.mp4$/i.test(f)).length,
  converted,
  alreadyConverted: skipped,
  referenceFilesChanged,
  referencesChanged,
}, null, 2));
