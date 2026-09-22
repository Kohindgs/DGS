
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024; // 250 MB

export const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
export const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);

export type ValidatedMediaType = {
  valid: true;
  mediaType: "image" | "video";
  mimeType: string;
  extension: string;
} | {
  valid: false;
  error: string;
};

export function validateSafeFilename(filename: string): boolean {
  if (!filename || typeof filename !== "string") return false;
  if (filename.length > 255) return false;
  // Disallow path traversal, slashes, null bytes
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || filename.includes("\0")) {
    return false;
  }
  // Check for dangerous double extensions like .php.jpg or .exe.png
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) return false;
  const dangerous = ["php", "phtml", "php3", "php4", "php5", "php7", "phps", "cgi", "pl", "asp", "aspx", "jsp", "sh", "bash", "exe", "bat", "cmd", "vbs", "js", "html", "htm", "svg"];
  for (let i = 1; i < parts.length - 1; i++) {
    if (dangerous.includes(parts[i])) return false;
  }
  return true;
}

export function detectMagicBytes(buffer: Buffer): { mimeType: string; mediaType: "image" | "video" } | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", mediaType: "image" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", mediaType: "image" };
  }

  // WebP: RIFF ... WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mimeType: "image/webp", mediaType: "image" };
  }

  // GIF: GIF8 (47 49 46 38)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { mimeType: "image/gif", mediaType: "image" };
  }

  // WebM: EBML header 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { mimeType: "video/webm", mediaType: "video" };
  }

  // MP4: bytes 4-7 are 'ftyp' (66 74 79 70)
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return { mimeType: "video/mp4", mediaType: "video" };
  }

  return null;
}

export function validateUploadedFile(originalFilename: string, buffer: Buffer): ValidatedMediaType {
  if (!validateSafeFilename(originalFilename)) {
    return { valid: false, error: "Invalid or unsafe filename." };
  }

  const ext = originalFilename.split(".").pop()?.toLowerCase() || "";
  const isImageExt = ALLOWED_IMAGE_EXTENSIONS.has(ext);
  const isVideoExt = ALLOWED_VIDEO_EXTENSIONS.has(ext);

  if (!isImageExt && !isVideoExt) {
    return { valid: false, error: `Unsupported file extension: .${ext}. Allowed extensions: jpg, jpeg, png, webp, gif, mp4, webm.` };
  }

  if (isImageExt && buffer.length > MAX_IMAGE_BYTES) {
    return { valid: false, error: `Image exceeds maximum allowed size of 25MB (size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).` };
  }

  if (isVideoExt && buffer.length > MAX_VIDEO_BYTES) {
    return { valid: false, error: `Video exceeds maximum allowed size of 250MB (size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).` };
  }

  const magic = detectMagicBytes(buffer);
  if (!magic) {
    return { valid: false, error: "File contents do not match any permitted image or video format." };
  }

  // Verify consistency between extension and magic type
  if (isImageExt && magic.mediaType !== "image") {
    return { valid: false, error: "File content does not match image extension." };
  }
  if (isVideoExt && magic.mediaType !== "video") {
    return { valid: false, error: "File content does not match video extension." };
  }

  return {
    valid: true,
    mediaType: magic.mediaType,
    mimeType: magic.mimeType,
    extension: ext,
  };
}
