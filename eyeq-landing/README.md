# Eye Q Opticals & Eye Clinic: /book-consultation

One mobile-first landing page for Google Ads and Meta Ads traffic. Plain HTML, CSS and vanilla JS. No framework, no build step for the page. Tracking is Google Tag Manager only.

| File | Purpose |
|---|---|
| `index.html` | The page, JSON-LD (MedicalClinic, FAQPage), static default H1 |
| `styles.css` | All styling. Figma tokens are CSS variables at the top |
| `script.js` | `CONFIG` block at the top, GTM loader, URL parameters, WhatsApp codes, forms, events |
| `fonts/` | Inter variable font, latin subset, self-hosted, `font-display: swap` |
| `scripts/optimise-images.mjs` | sharp script: photos in `assets/source/` to responsive WebP in `images/` |
| `scripts/check-copy.mjs` | Counts keywords and scans for banned terms. `--write` regenerates `KEYWORDS.md` |
| `ASSETS.md`, `KEYWORDS.md`, `TEST.md` | Image inventory, keyword audit, tracking tests |

Preview: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000/index.html?svc=myopia`.

## Status: read this first

1. **No photographs are on the page.** `assets/source/` was not in the repository and the Figma image files could not be downloaded from this environment (network policy blocks `www.figma.com` assets). No stock, AI or placeholder images were used, so the photo sections are text and icon layouts. See `ASSETS.md` for the 10-minute steps to add the real photos. Until then there is no `og:image` either.
2. **Hero layout differs from the brief on purpose.** With no photo, the hero form sits on the right on desktop (visible without scrolling) and the clinic facts card sits under the ticks. On mobile the order is H1, form, subhead, ticks, clinic card, so the form and Book button fit inside a 375 x 667 screen.
3. **No ads-ready until** the GTM ID, form endpoint and privacy policy URL are set (see checklist).

## Design tokens (from the Eye Q homepage Figma, file `7oLAtypAVzYmeVSbuX60yk`, frame `108:9`)

Read from the frame with the Figma MCP (`get_design_context`). All are CSS variables in `styles.css`.

| Token | Value | Figma source |
|---|---|---|
| `--green` | `#0fb07a` | Buttons, ticks, eyebrow border and text |
| `--ink` | `#0b130e` | Hero background, headings, footer |
| `--grey` | `#4a504c` | Body text on light backgrounds |
| `--mint` | `#e4f7ed` | Light section background |
| `--line` | `#b2d7c3` | Input and card borders |
| `--moss` | `#4e675a` | Muted green-grey |
| Hero tint | `rgba(146,255,218,.06 to .2)` | Cards and borders on dark |
| Font | Inter (Regular 400, Medium 500, Semi Bold 600, Bold 700) | All text. The Figma also uses Jomolhari in a few spots (not used here: one family only) |
| H1 | 65 px / 70 px line height, semi-bold (scaled: 28 to 52 px here) | Hero |
| H2 | 50 px semi-bold (scaled: 26 to 44 px) | Section titles |
| Card title | 25 px | Product cards |
| Body | 18 px regular (17 px mobile, 18 px desktop here) | Paragraphs, ticks |
| Button text | 15 px bold, uppercase, 0.75 px tracking (raised to 16 px, 0.05em) | `Book Eye Test` |
| `--r-btn` | 50 px | All buttons |
| `--r-input` | 70 px | Form fields |
| `--r-card` | 20 px | Cards |
| `--r-panel` | 40 px | Large panels and image frames |
| `--r-pill` | 40 px | Eyebrow label |
| Button padding | 30 px x 15 px (Figma); 24 x 12, min height 48 to 52 px here | |
| Eyebrow | Pill, 1 px green border, 15 px semi-bold uppercase green | Section labels |
| Section rhythm | Dark hero, mint, white, dark green band, alternating | |

**Deliberate deviations from Figma**
- Button text is dark (`#0b130e`) on the green button, not white. White on `#0fb07a` is 2.8:1 (fails WCAG AA); dark on green is 6.7:1.
- Green text on light backgrounds uses `--green-text: #087048` (5.5:1 on mint) instead of `#0fb07a`.
- Sizes are larger on mobile because the client said earlier designs were too small. Body 17 px or more, buttons 48 px or more high.
- The `WhatsApp` sticky button uses WhatsApp green with dark text.

Contrast checked: white on `--ink` 18.9:1; `--grey` on white 8.3:1 and on mint 7.4:1; `--ink` on `--green` 6.7:1; `--green-text` on mint 5.5:1.

## CONFIG checklist (all in the `CONFIG` block at the top of `script.js`)

| Item | Key | Now | Action |
|---|---|---|---|
| GTM container ID | `gtmId` | `GTM-XXXXXXX` | Set it. Also change the same ID in the `<noscript>` iframe in `index.html` (JS cannot reach it) |
| Clinic phone and WhatsApp | `phone`, `phoneDisplay`, `whatsappNumber` | +91 99720 53909 | Filled. Static HTML fallbacks hold the same number |
| Google forwarding number | `forwardingNumber`, `forwardingDisplay` | empty | Add later. Every `tel:` link and visible number switches. It is never put in JSON-LD. GTM can also swap it via `a[data-phone-link]` and `[data-phone-text]` |
| Form endpoint | `formEndpoint` | placeholder (fails, shows the friendly error) | Set. Must allow CORS from the page origin and return 2xx. Receives `multipart/form-data` with an `Accept: application/json` header |
| Clinic hours | `hours` | empty | Until set, the page says "Call or WhatsApp to confirm today's timings" |
| Walk-in policy | `walkInPolicy` | empty | Until set, the FAQ says to call for walk-in availability. Update the FAQPage JSON-LD answer to match |
| Doctor registration number | `registrationNumber` | 36059 | **CONFIRM WITH DOCTOR.** Static HTML fallback is also 36059 |
| Privacy and terms URLs | `privacyUrl`, `termsUrl` | `/privacy-policy/`, `/terms-and-conditions/` | Pages must exist before ads go live |
| Online booking embed | `bookingEmbedUrl`, `bookingEmbedOrigin` | empty | `#booking-embed` stays hidden until set. Adapt the `message` listener (stub) to the tool's completion message, which fires `booking_confirmed` |
| Doctor photo | `SHOW_DOCTOR_PHOTO` | `false` | Leave false. No doctor photo is used on this page |
| noindex | `noindex` | `false` | Set `true` on staging |
| Canonical and share URL | `index.html` head | `https://eyeq.biz/book-consultation` | **Assumed** from the Figma footer email domain. Check it |
| Open Graph image | `index.html` head | absent | Add a real 1200 x 630 clinic photo when available |
| Map | iframe in `#location` | Google Maps embed by address | Swap to the Google Business Profile link if preferred |

## Confirm with Dr. Shetty and the clinic's advisor

Marked in `index.html` as HTML comments where relevant.

1. **CONFIRM WITH DOCTOR:** Karnataka Medical Council Reg. No. 36059, plus name and qualifications as shown (MBBS, MS (Ophthalmology), FRCS (Edinburgh), over 24 years).
2. **CONFIRM LIST WITH DR. SHETTY:** the "What your visit includes" list. Every line comes from the clinic's signage or your brief. No tests were invented.
3. **FAQ wording:** "Adults are usually advised a yearly eye test; children with myopia a check every 6 months." Doctor to confirm.
4. **Descriptions of the doctor and clinic.** The copy calls Dr. Shetty "the eye doctor" and the clinic an eye clinic with an ophthalmologist. The phrases "child eye specialist Koramangala" and "paediatric eye clinic Koramangala" appear once each. Confirm both are fair descriptions. **`pediatric ophthalmologist Bangalore` was skipped on purpose** (you said to use it only if confirmed). If confirmed, add it once in the doctor section and re-run `node scripts/check-copy.mjs --write`.
5. **Ortho-k and orthokeratology.** The copy says the doctor can talk through options "such as ortho k lenses" and "orthokeratology". Confirm the clinic provides these. If it does not, remove both sentences and the two keywords.
6. **Diabetic eye screening** and **contact lens fitting** descriptions: confirm the "What to expect" steps match how the clinic works.
7. **Walk-in policy** and **opening hours** (above).
8. **Advisor check on the "budget frames" wording** in the visit list. It comes from the clinic's signage ("designer and budget frames"), but remove it if the advisor reads it as a price claim.
9. **WhatsApp codes for Meta traffic.** Per the brief, any visitor with `utm_source` containing facebook or instagram gets `M-DEF`, even when `svc` is set. If the team wants service-level Meta codes (M-EYE, M-MYO and so on), change `waRef()` in `script.js`.
10. Doctor registration and NMC wording on ads themselves, outside this page.

## Image consent flags

No photos are on the page yet, so there is nothing to flag today. When photos arrive:
- A photo showing **Dr. Shetty: do not use on this page.**
- A photo showing a **patient or a child's face: written consent is needed** before use. Record the photo file name and the consent date here.

## Compliance

`node scripts/check-copy.mjs` scans the visible text, title, meta description, alt text and script strings for: best, top, leading, number one, world-class, 100 percent, guaranteed, proven, any percentage, drug names, eye drops, medicine, before and after, discount, free, offer, price words, urgency words, testimonial, review, rating, star, "do you have" and "is your child". The last run found none (see `KEYWORDS.md`). The page has no testimonials, ratings, outcome claims, offers or countdowns, and no photos at all.

## Google and Meta final URLs

Replace the host with the live domain.

| Use | URL |
|---|---|
| Brand campaign | `/book-consultation?svc=default` |
| Eye test ad group | `/book-consultation?svc=eyetest#eye-test` |
| Myopia ad group | `/book-consultation?svc=myopia#myopia` |

Do not run diabetic or contact lens as paid keywords (the sections use plain service language), but `?svc=diabetic#diabetic` and `?svc=lens#contact-lens` work for organic and Meta use. Keep Google Ads auto-tagging on (it adds `gclid`, `wbraid`, `gbraid`) and add UTM parameters on Meta ads (`utm_source=facebook`, `utm_medium=paid_social`, and so on). Parameters are kept for the session in `sessionStorage` and written to hidden form fields.

## Porting into WordPress (page template, theme header and menu removed)

1. Create `page-book-consultation.php` in the Optiplus child theme with only `/* Template Name: Book Consultation */` at the top. Do **not** call `get_header()` or `get_footer()`. Instead write your own minimal `<!doctype html><html <?php language_attributes(); ?>><head>`, `<?php wp_head(); ?>` (optional: only if you need the theme's cookie plugin, otherwise drop it so the theme CSS and scripts do not load), then the page body, then `<?php wp_footer(); ?>` only if needed.
2. Copy `<head>` contents from `index.html`: title, meta, canonical, Open Graph, JSON-LD, the font preload and the `dataLayer` line. Disable the SEO plugin's title, canonical and JSON-LD for this page so they are not doubled. Let the plugin own them only if you remove them from the template.
3. Copy `<body>` markup (from `<noscript>` GTM to the sticky bar) into the template. Keep the inline SVG sprite and the skip link.
4. Copy `styles.css`, `script.js` and the `fonts/` folder (and `images/` once photos exist) into the child theme, for example `/assets/landing/`. Enqueue them **only on this template** with `wp_enqueue_style` and `wp_enqueue_script` (script with `defer`), or print the `<link>` and `<script defer>` tags directly in the template. Update the font URL in `styles.css` and the preload `href` to the theme path.
5. Because the page header and sticky bar are part of this template, there is no theme header or menu. Remove any theme CSS that adds top padding for a fixed header, and check the WordPress admin bar does not cover the sticky header when you are logged in.
6. Set the page slug to `book-consultation` with a clean permalink. Exclude it from the sitemap if you want, but keep it indexable unless you set `noindex`.
7. Put the form endpoint in `CONFIG.formEndpoint`: a Contact Form 7 REST endpoint, a Make or Zapier webhook, or a small serverless function. It must send CORS headers for the page origin.
8. Caching and minification plugins: exclude `script.js` from "combine" and "delay JavaScript" options so the first tap and the GTM events are not delayed, and keep the font preload.
9. Test with `TEST.md` on the live URL.

## Verification summary

See the end of the build report for what was checked. Lighthouse (mobile, local server, no compression): performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms; total transfer about 120 KB before gzip. The map iframe loads lazily and is excluded from the weight.
