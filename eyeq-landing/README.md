# Eye Q Opticals & Eye Clinic: /book-consultation landing page

One mobile-first page for Google Ads and Meta Ads traffic. Plain HTML, CSS and vanilla JS. No framework, no build step.

| File | Purpose |
|---|---|
| `index.html` | The page, JSON-LD (MedicalClinic, FAQPage), static default H1 |
| `styles.css` | Styling. Colours are CSS variables at the top |
| `script.js` | `CONFIG` block at the top, GTM loader, URL parameters, WhatsApp ref codes, form, events |
| `images/placeholder-*.svg` | Labelled placeholders for real clinic photos |
| `KEYWORDS.md` | Keyword table: where each phrase appears and how many times |
| `TEST.md` | How to verify each event in GTM Preview, GA4 DebugView and Meta Test Events |

To preview locally: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000/index.html?svc=eyetest`.

---

## 1. CONFIG checklist

Everything marked CONFIG is in the `CONFIG` block at the top of `script.js` unless noted.

| # | Item | Where | Status |
|---|---|---|---|
| 1 | **GTM container ID** (`gtmId`, now `GTM-XXXXXXX`). While it is the placeholder, GTM is not loaded but events still go to `dataLayer`. | `script.js` **and** the `<noscript>` iframe URL in `index.html` (it cannot read JS) | To do |
| 2 | **Clinic phone / WhatsApp** (`phone`, `phoneDisplay`, `whatsappNumber`) | `script.js`. Static fallbacks in `index.html` also hold +91 99720 53909 and `JSON-LD` telephone | Filled: +91 99720 53909 |
| 3 | **Google forwarding number** (`forwardingNumber`, `forwardingDisplay`). When set, every `tel:` link and visible number switches to it. It is never put in the JSON-LD. | `script.js` or GTM (see section 3) | To do |
| 4 | **Form endpoint** (`formEndpoint`). Must send CORS headers allowing the page's origin and return 2xx. Posts `multipart/form-data` with an `Accept: application/json` header. | `script.js` | To do (placeholder URL fails, which shows the friendly error) |
| 5 | **Clinic hours** (`hours`). Empty shows the yellow "Hours: to be confirmed" box in the doctor and location sections. Also add `openingHoursSpecification` to the MedicalClinic JSON-LD when known. | `script.js` + JSON-LD | To do |
| 6 | **Walk-in policy** (`walkInPolicy`). Empty shows a yellow "Walk-in policy: to be confirmed" box in the FAQ. Update the matching sentence in the FAQPage JSON-LD too. | `script.js` + JSON-LD | To do |
| 7 | **Doctor registration number** (`registrationNumber`, now 36059) | `script.js`; static fallback text in `index.html` | **CONFIRM WITH DOCTOR** |
| 8 | **Real clinic photos.** Replace the three SVGs in `images/` (keep 640x480, or change `width`/`height` in the `<img>` tags), and rewrite the `alt` text and captions. Real photos only: no stock people, no AI images, no doctor photo. | `images/`, `index.html` | To do |
| 9 | **Privacy policy and terms URLs** (`privacyUrl`, `termsUrl`, now `/privacy-policy/` and `/terms-and-conditions/`). These pages must exist before ads go live because the form consent line links to the privacy policy. | `script.js` | To do |
| 10 | **Online booking embed URL** (`bookingEmbedUrl`). Empty keeps `#booking-embed` hidden. Adapt the `message` listener in `initEmbed()` to the tool's completion message. | `script.js` | Future |
| 11 | `noindex` (default `false`). Set `true` on staging. | `script.js` | Leave false for live |
| 12 | Map link (`mapUrl`). Swap for the Google Business Profile link when available. | `script.js` | Optional |
| 13 | Canonical and Open Graph URL (`https://eyeq.biz/book-consultation`). This is an assumption from the footer link. Add a 1200x630 `og:image` once a real photo exists. | `index.html` head | Check |

### Items to confirm with Dr. Shetty before going live

These are statements a medical regulator or the doctor should own. They are also marked in `index.html` as HTML comments.

1. Name, qualifications and Karnataka Medical Council Reg. No. 36059 (**CONFIRM WITH DOCTOR**).
2. FAQ answer: "adults are usually advised a yearly eye test; children with myopia a check every 6 months".
3. Whether Dr. Shetty may be described as "ophthalmologist", "eye specialist" and "child eye specialist". The phrase **"pediatric ophthalmologist Bangalore" was skipped on purpose** because it needs her confirmation. If confirmed, add it once (for example in the doctor profile).
4. Whether the clinic provides ortho-k / orthokeratology and runs a myopia clinic. The copy only says the doctor can discuss options, but the keywords imply the service exists.
5. The "paediatric eye clinic" description and the diabetic eye screening wording ("regular screening is usually advised").
6. Whether diabetic screening and contact lens fitting are done as described in each "What to expect" section.

---

## 2. Google Ads final URLs

Use auto-tagging (gclid is captured automatically). Add UTM parameters through a **Final URL suffix** so the same final URL works across ad groups:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}
```

| Campaign | Final URL |
|---|---|
| Brand | `https://eyeq.biz/book-consultation?svc=default` |
| Eye test | `https://eyeq.biz/book-consultation?svc=eyetest#eye-test` |
| Myopia and children | `https://eyeq.biz/book-consultation?svc=myopia#myopia` |

Meta Ads (not for paid search): `?svc=diabetic#diabetic` and `?svc=lens#contact-lens`, with `utm_source=meta&utm_medium=paid_social&utm_campaign=...&utm_content=...` set in the ad's URL parameters.

How `svc` works: it sets the headline, preselects the form service, fills the hidden `svc` field, and picks the WhatsApp ref code (`default` G-DEF, `eyetest` G-EYE, `myopia` G-MYO, `diabetic` G-DIA, `lens` G-LENS). `gclid` and the five `utm_*` values are stored in `sessionStorage` so they survive a reload or an anchor jump. An unknown `svc` falls back to `default`.

WhatsApp messages look like: `Hi Eye Q, I would like to book an eye test. Ref G-EYE`. On the form's success state, the WhatsApp ref follows the service the visitor chose.

---

## 3. Google forwarding number (call tracking)

The phone number is addressable by two data attributes:

- `a[data-phone-link]`: the `tel:` link (`href`)
- `[data-phone-text]`: the visible number text

Option A (simplest): fill `forwardingNumber` and `forwardingDisplay` in `CONFIG`.
Option B (through GTM): a Custom HTML tag, fired on DOM Ready:

```html
<script>
  var num = '+91XXXXXXXXXX', shown = '+91 XXXXX XXXXX';   // Google forwarding number
  document.querySelectorAll('[data-phone-link]').forEach(function (a) { a.href = 'tel:' + num; });
  document.querySelectorAll('[data-phone-text]').forEach(function (n) { n.textContent = shown; });
</script>
```

Because `click_call` listens for any `tel:` link at click time, the event keeps firing after the swap. No number is ever pushed to `dataLayer`.

---

## 4. Porting into WordPress (Optiplus theme)

Goal: serve this page at `/book-consultation` with the theme header, menu and footer removed, and without theme scripts competing with the page.

1. **Use a child theme** of Optiplus so theme updates do not remove the template. Create `wp-content/themes/optiplus-child/` if it does not exist.
2. **Copy assets** into the child theme: `styles.css` -> `optiplus-child/eyeq/styles.css`, `script.js` -> `optiplus-child/eyeq/script.js`, `images/` -> `optiplus-child/eyeq/images/`.
3. **Create the page template** `optiplus-child/template-eyeq-landing.php`:
   ```php
   <?php
   /* Template Name: Eye Q Landing (Ads, no header) */
   $base = get_stylesheet_directory_uri() . '/eyeq';
   ?>
   <!DOCTYPE html>
   <html lang="en-IN">
   <head>
     <!-- paste everything inside <head> from index.html here -->
     <!-- change: href="styles.css"      -> href="<?php echo esc_url($base); ?>/styles.css" -->
     <!-- change: src="script.js"        -> src="<?php echo esc_url($base); ?>/script.js" -->
   </head>
   <body>
     <!-- paste everything inside <body> from index.html here -->
     <!-- change: images/placeholder-*.svg -> <?php echo esc_url($base); ?>/images/... -->
   </body>
   </html>
   ```
   Do **not** call `get_header()`, `get_footer()`, `wp_head()` or `wp_footer()`. Leaving them out is what removes the theme header, the menu and the theme's scripts and styles, which also protects mobile load speed. The template prints its own `<head>`, including the title, meta description, canonical, Open Graph tags and JSON-LD.
4. **Create the page** in WordPress admin: Pages -> Add New, title "Book Consultation", slug `book-consultation`, Template = "Eye Q Landing (Ads, no header)". Leave the editor body empty (the template ignores it, which also avoids `wpautop` rewriting the HTML). Publish. The URL is then `https://eyeq.biz/book-consultation/`; keep the canonical tag consistent with the real URL, including the trailing slash if WordPress adds one.
5. **SEO plugin**: since `wp_head()` is not called, Yoast or Rank Math will not output tags on this page. That is intended, so the page's own tags are the only ones. If you would rather use the plugin's tags, add `wp_head()` and delete the duplicates from the template.
6. **GTM**: the snippet is injected by `script.js` from `CONFIG.gtmId` and a `<noscript>` iframe sits at the top of `<body>`. Make sure GTM is **not** also installed by a plugin or the theme on this page, or events will double count.
7. **Caching and redirects**: exclude `/book-consultation/` from page-cache query-string stripping and make sure no redirect, security plugin or CDN rule drops `gclid`, `utm_*` or `svc`. Test with the Google Ads final URLs above. Query strings must reach the browser intact.
8. **Form endpoint**: either a hosted form service that sends CORS headers (Formspree and similar), or a small WordPress REST route (`register_rest_route`) that validates the fields and emails or stores the lead, returns JSON `{ok: true}` with status 200, and allows the page's origin. Plain Google Apps Script web apps do not return CORS headers for JSON fetches from a browser, so they will show the failure message even when the data arrived. Use something else, or add a proxy.
9. **Honeypot**: the hidden field is named `website`. The script drops it for real users and silently ignores bot submissions. Server-side, also reject any request where it is non-empty.
10. **Verify** with `TEST.md` on the live URL before turning on ads. Also check the page in Google's PageSpeed Insights (mobile). The page has one local stylesheet, one deferred script, system fonts and lazy-loaded images, so LCP is the hero text.

---

## 5. Compliance notes

The page is written to the rules in the brief: no testimonials, reviews, star ratings or counts; no superlatives or guarantees; no percentages or outcome claims; no drug names; no before/after images; no offers; no AI images, stock people or doctor photograph; wording is an invitation to book a check. The form asks no medical-condition questions, and a line above it tells visitors not to type health details. The `dataLayer` helper in `script.js` only allows `link_location`, `service_interest`, `svc` and `ref_code`, so a name, phone number or health detail cannot be pushed by accident.

Before launch, have the clinic or its adviser read the final copy against the current NMC advertising rules and the Google Ads healthcare and Meta health policies. Those policies change, and this build is not a legal review.
