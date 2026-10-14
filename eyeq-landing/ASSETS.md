# Image inventory

**There are no photographs on this page yet.** This is a deliberate gap, not an oversight.

## Why

- `./assets/source/` (the edited clinic photos) does not exist in the repository, and `./reference/figma/` does not either.
- The Figma file (`7oLAtypAVzYmeVSbuX60yk`, frame `108:9`) could be read (layout, colours, type, copy) but its image files could not be downloaded: this build environment's network policy blocks `www.figma.com` image downloads (HTTP 403 from the proxy).
- The brief forbids stock photos, AI images and placeholder boxes, so no image was invented, substituted or drawn. Every section that would carry a photo is a text and icon layout instead.

## Inventory

| File | Shows | Orientation | Section it will serve |
|---|---|---|---|
| (none supplied) | n/a | n/a | n/a |

Images referenced in the page today: **none**. Icons are inline SVG. The "Eye Q" logo is text plus a CSS ring, because no logo file was supplied.

## How to add the real photos (about 10 minutes)

1. Put the edited photos in `assets/source/`. Name the hero shot `hero.jpg`.
2. `npm install && npm run images` writes `images/<name>-400.webp`, `-800.webp`, `-1200.webp` (quality 78, never upscaled) and `images/hero-fallback.jpg` (800 px).
3. Open every photo and fill in this table (file, what it shows, orientation, section). **If a photo shows Dr. Shetty, do not use it on this page** (compliance). If it shows a patient or a child's face, get written consent first and note it in README.
4. Suggested slots, if suitable photos exist:

| Slot | Where in `index.html` | Notes |
|---|---|---|
| Hero | after `.hero-panel`, or replace it | Eager-loaded, `fetchpriority="high"`, `width`/`height` set. Do not lazy-load. |
| Service sections | inside each `.svc-side` card, above "What to expect" | Alternating layout already exists via `.flip` |
| Clinic interior and equipment | `#doctor` section, inside `.clinic-card` | No doctor photo. `CONFIG.SHOW_DOCTOR_PHOTO` stays false |
| Exterior | `#location`, above the map | |
| Open Graph image | `<meta property="og:image">` in `<head>` | 1200 x 630 real photo, absolute URL |

Markup to use (keeps the page light and sharp):

```html
<picture>
  <source type="image/webp" srcset="images/hero-400.webp 400w, images/hero-800.webp 800w, images/hero-1200.webp 1200w" sizes="(min-width: 900px) 45vw, 100vw">
  <img src="images/hero-fallback.jpg" width="800" height="600" fetchpriority="high" decoding="async" alt="Describe what the photo really shows">
</picture>
```

Use the same corner radius as the cards (`border-radius: var(--r-panel)`) and a consistent crop (`aspect-ratio: 4 / 3; object-fit: cover`). Figma applies a dark green overlay on the hero image: `linear-gradient(rgba(11,19,14,.55), rgba(11,19,14,.55))`.

## Figma images seen in metadata (not used)

Figma layer names such as `2150670786 1`, `96296 1`, `10973 1`, `21859 1`, `235 1` and `34154 1` look like numbered stock-library files, used on the homepage for frames, lenses and kids' eyewear. They were not downloaded and must not be used here unless the clinic confirms they are its own photographs.
