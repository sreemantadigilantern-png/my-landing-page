# Image inventory

## Status

The image plan (three approved photos, four held) is implemented in code, but **none of the photo files are in the repository**: `assets/source/` and `assets/held/` do not exist on any branch, so no photo is on the page yet. Add the files, run `npm run images`, then follow "Placing the approved photos" below. Nothing was generated, downloaded or drawn to stand in for them.

Sections without an approved photo use a brand green panel with an inline SVG line icon and a short text block: `#myopia`, `#diabetic`, `#contact-lens`, the four audience cards and the doctor block. There are no placeholder boxes.

## Approved photos (assets/source/)

| File | Crop (in `scripts/image-plan.json`) | Output files | Where it is used | Alt text |
|---|---|---|---|---|
| `kids-optical-arches.jpg` | Desktop: whole image, 800/1200/1600 px. Mobile: right two-thirds (x 0.333 to 1) trimmed to 16:10, 400/800 px | `hero-*.webp`, `hero-m-*.webp`, `hero-fallback.jpg` | Hero. Desktop: background, with the H1, benefits and form over the pale mint fade on the left third. Mobile: 16:10 strip above the H1, form below it. Second use: a footer strip (same crop, never stretched or tiled) | Write from what the photo shows |
| `clinic-eyechart-wall.jpg` | **Banner on the left must be removed first.** Crop it out (or paint it out with a plain matching wall tone) so no text or figure from the "Slow down myopia progression" stand is legible. Keep the eye chart wall and the EYE Q sign. The script refuses this file until a crop is entered and `cropChecked` is `true` | `eyechart-*.webp` | `#eye-test` and the location section | Eye test area at Eye Q Opticals & Eye Clinic, Koramangala |
| `slit-lamp-exam.jpg` | Right half (x 0.5 to 1, full height): slit lamp equipment and hands only, no face. Check by eye | `slit-lamp-*.webp` | "What to expect" in `#eye-test`, and the doctor and clinic section | Eye examination equipment at Eye Q eye clinic |

Check each output by eye after running the script. If a face is visible in the slit lamp crop, or any banner text in the eye chart crop, change the numbers in `image-plan.json` and run again.

## Placing the approved photos (once the files exist)

1. Put the three files in `assets/source/`, run `npm install && npm run images`, edit `scripts/image-plan.json` for the eye chart crop, run again.
2. Hero: in `index.html`, add a `<picture>` inside `.hero` (desktop: `hero-1200.webp` / `hero-1600.webp`, absolutely positioned behind the content, `fetchpriority="high"`, not lazy; mobile: a `hero-m` strip above the H1). Check text contrast on the pale fade at AA (4.5:1 for body, 3:1 for large text) with a screenshot, and use dark text (`--ink`) over the fade. The hero currently has a dark background and white text, so the left-hand text colours and the card colours change with the photo.
3. `#eye-test` and location: `<picture>` with `srcset="images/eyechart-400.webp 400w, images/eyechart-800.webp 800w, images/eyechart-1200.webp 1200w"`, `width`/`height` set, `loading="lazy"`, same corner radius as the cards (`--r-panel`).
4. Slit lamp: `<picture>` in the "What to expect" card of `#eye-test` and in `.clinic-card`.

## Held images (assets/held/): do NOT use

These four files are held. Do not copy them to `images/`, reference them in HTML, or convert them. `scripts/optimise-images.mjs` never reads `assets/held/`, and `node scripts/check-copy.mjs` fails if any of them appears in `images/` or `index.html` without being enabled.

| File | Intended slot (if later confirmed) | Why it is held |
|---|---|---|
| `child-glasses.jpg` | "Children" audience card and `#myopia` | Not yet confirmed as a real photograph; shows a child's face, so written consent is needed |
| `elderly-reading.jpg` | "Adults 40 and above" card and `#diabetic` | Not yet confirmed as a real photograph; shows a person's face, so consent is needed |
| `woman-glasses.jpg` | "Working adults and students" card and `#contact-lens` | Not yet confirmed as a real photograph; shows a person's face, so consent is needed |
| `doctor-portrait.jpg` | Doctor block, only if `SHOW_DOCTOR_PHOTO` is true | Compliance: no doctor photograph on this page unless the clinic and the NMC advice allow it |

**To enable one later:** confirm it is a real photograph with written consent, move it from `assets/held/` to `assets/source/`, run `npm run images`, then add its file name to `CONFIG.APPROVED_IMAGES` in `script.js` (for `doctor-portrait.jpg` also set `SHOW_DOCTOR_PHOTO` to `true`). The page swaps the matching green panel for the photo (mapping in `IMAGE_SLOTS`) and falls back to the panel if the file is missing. Edit the alt text in `CONFIG.IMAGE_ALT` to say what the photo really shows.

## Icons and logo

Icons are inline SVG. The "Eye Q" logo is text plus a CSS ring because no logo file was supplied.
