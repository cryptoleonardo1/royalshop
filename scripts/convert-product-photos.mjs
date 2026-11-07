// Converts supplier photos (any format, CMYK or RGB, any size) into shop product images:
// sRGB, background trimmed, small even margin, longest edge at most 1600 px, webp.
// Usage: node scripts/convert-product-photos.mjs <map.json>
// map.json: { "srcDir": "originals/golz-photos", "outDir": "public/demo-products", "files": { "MS400.jpg": "golz-ms400" } }
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_EDGE = 1600;
const MARGIN = 0.03; // of the longest edge, on every side

const map = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const [src, name] of Object.entries(map.files)) {
  const input = path.join(map.srcDir, src);
  // Flatten transparency onto white, convert CMYK to sRGB (embedded profile is honoured), trim the background.
  const trimmed = await sharp(input)
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .trim({ background: "#ffffff", threshold: 18 })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const pad = Math.round(Math.max(w, h) * MARGIN);
  const out = path.join(map.outDir, `${name}.webp`);
  await sharp(trimmed.data)
    .resize(w, h)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" })
    .webp({ quality: 82 })
    .toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`${src} -> ${out} (${w + 2 * pad}x${h + 2 * pad}, ${kb} KB)`);
}
