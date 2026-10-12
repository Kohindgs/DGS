import https from "node:https";

const thumbs = [
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp"
];

function getChunk(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => {
        chunks.push(c);
        if (Buffer.concat(chunks).length > 200) {
          res.destroy();
          resolve(Buffer.concat(chunks));
        }
      });
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
  });
}

function parseWebpSize(buf) {
  if (!buf || buf.length < 30) return null;
  // VP8X format
  if (buf.toString("ascii", 12, 16) === "VP8X") {
    const width = 1 + buf.readUIntLE(24, 3);
    const height = 1 + buf.readUIntLE(27, 3);
    return { width, height };
  }
  // VP8L (lossless)
  if (buf.toString("ascii", 12, 16) === "VP8L") {
    const b1 = buf[21], b2 = buf[22], b3 = buf[23], b4 = buf[24];
    const width = 1 + (((b2 & 0x3f) << 8) | b1);
    const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width, height };
  }
  // VP8 (lossy)
  if (buf.toString("ascii", 12, 16) === "VP8 ") {
    const width = buf.readUInt16LE(26) & 0x3fff;
    const height = buf.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }
  return null;
}

async function main() {
  for (const t of thumbs) {
    const buf = await getChunk(t);
    const size = parseWebpSize(buf);
    console.log(t.split("/").pop(), size);
  }
}

main().catch(console.error);
