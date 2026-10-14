// Converts the real clinic photos in ./assets/source/ into responsive WebP files in ./images/.
//   npm install && npm run images
// Output per photo "name.jpg": images/name-400.webp, name-800.webp, name-1200.webp (quality 78, never upscaled).
// Hero photo: name it hero.jpg (or pass --hero=<file name>) and a small JPEG fallback images/hero-fallback.jpg is also written.
// If assets/source/ has no photos the script says so and exits cleanly. It never creates or downloads images.
import { readdir, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "assets", "source");
const out = path.join(root, "images");
const WIDTHS = [400, 800, 1200];
const QUALITY = 78;
const heroArg = (process.argv.find((a) => a.startsWith("--hero=")) || "").slice(7);

if (!existsSync(src)) {
  console.log("No assets/source/ folder yet. Add the real clinic photos there and run again.");
  process.exit(0);
}
const plan = existsSync(path.join(root, "scripts", "image-plan.json")) ? JSON.parse(await readFile(path.join(root, "scripts", "image-plan.json"), "utf8")).images : [];
const planned = new Map(plan.map((p) => [p.file, p]));
const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f));
if (files.length === 0) {
  console.log("assets/source/ has no photos. Nothing to do.");
  process.exit(0);
}
await mkdir(out, { recursive: true });

// assets/held/ is never read. Only files in assets/source/ are converted.
async function planned_out(f, entry) {
  const meta = await sharp(path.join(src, f), { failOn: "none" }).rotate().metadata();
  const W = meta.width, H = meta.height;
  if (entry.requiresCrop && !entry.cropChecked) {
    console.log(`SKIPPED ${f}: needs a checked crop in scripts/image-plan.json before it can be used (see its note).`);
    return;
  }
  for (const o of entry.outputs) {
    let c = o.crop || { x: 0, y: 0, w: 1, h: 1 };
    let left = Math.round(c.x * W), top = Math.round(c.y * H), w = Math.round(c.w * W), h = Math.round(c.h * H);
    if (o.aspect) {
      const [a, b] = o.aspect.split(":").map(Number);
      const want = Math.round((w * b) / a);
      if (want < h) { top += Math.round((h - want) * (o.focusY ?? 0.5)); h = want; }
    }
    const base = sharp(path.join(src, f), { failOn: "none" }).rotate().extract({ left, top, width: w, height: h });
    for (const width of o.widths) {
      const info = await base.clone().resize({ width: Math.min(width, w), withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(path.join(out, `${o.name}-${width}.webp`));
      console.log(`${f} [${left},${top} ${w}x${h}] -> ${o.name}-${width}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    }
    if (entry.jpegFallback === o.name) {
      const info = await base.clone().resize({ width: Math.min(800, w), withoutEnlargement: true }).jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(out, `${o.name}-fallback.jpg`));
      console.log(`${f} -> ${o.name}-fallback.jpg  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    }
  }
  console.log(`   CHECK BY EYE: open the outputs for ${f} and confirm the crop matches the note in image-plan.json.`);
}

for (const f of files) {
  if (planned.has(f)) { await planned_out(f, planned.get(f)); continue; }
  const base = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const img = sharp(path.join(src, f), { failOn: "none" }).rotate(); // honour EXIF orientation
  const { width = 0, height = 0 } = await img.metadata();
  for (const w of WIDTHS) {
    const target = Math.min(w, width || w);
    const info = await img.clone().resize({ width: target, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(path.join(out, `${base}-${w}.webp`));
    console.log(`${f} -> ${base}-${w}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
  if (f === heroArg || base === "hero") {
    const info = await img.clone().resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(out, "hero-fallback.jpg"));
    console.log(`${f} -> hero-fallback.jpg  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
  console.log(`   source ${f}: ${width}x${height}, ${width >= height ? "landscape" : "portrait"}`);
}
