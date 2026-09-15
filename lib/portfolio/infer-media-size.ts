export type MediaSize = {
  width: number;
  height: number;
};

const FILENAME_DIM = /(\d{2,5})x(\d{2,5})/;
const PX_DIM = /(\d{2,4})-(\d{2,4})PX/i;

/** Read real pixel ratio from migrated WordPress media URLs (Envira stores dummy 640x480 on every item). */
export function inferMediaSize(url: string, fallback: MediaSize = { width: 4, height: 3 }): MediaSize {
  const filename = String(url || "").split("/").pop() || "";
  const named = filename.match(FILENAME_DIM);
  if (named) {
    const width = Number(named[1]);
    const height = Number(named[2]);
    if (width > 0 && height > 0) return { width, height };
  }
  const px = filename.match(PX_DIM);
  if (px) {
    const width = Number(px[1]);
    const height = Number(px[2]);
    if (width > 0 && height > 0) return { width, height };
  }
  return fallback;
}
