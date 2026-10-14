# Verifying tracking

All events are pushed to `window.dataLayer` by `script.js`. GTM turns them into GA4, Google Ads and Meta events. Set `CONFIG.gtmId` first (and the `<noscript>` ID in `index.html`).

## Events pushed by the page

| Event | Fires when | Parameters (all non-personal) |
|---|---|---|
| `generate_lead` | Form posted successfully (HTTP 2xx) | `service_interest` (category slug such as `adult-eye-test`), `svc`, `ref_code` |
| `click_call` | Any `tel:` link is clicked | `link_location` |
| `click_whatsapp` | Any `wa.me` link is clicked | `link_location`, `ref_code` (G-EYE, G-MYO, G-DIA, G-LENS, G-DEF) |
| `click_directions` | The map/directions link is clicked | `link_location` |
| `booking_confirmed` | The booking embed reports completion (stub; also `EyeQ.bookingConfirmed()` in the console) | `link_location` |

`link_location` values: `action-bar` (desktop header), `bottom-bar` (mobile bar), `hero`, `eye-test`, `myopia`, `diabetic`, `contact-lens`, `form`, `form-error`, `form-success`, `location`, `booking-embed`.

Scroll depth is left to GTM's built-in Scroll Depth trigger. No name, phone number or health detail is ever sent.

## 0. Quick check in the browser console (no GTM needed)

1. Open `https://eyeq.biz/book-consultation?svc=eyetest&gclid=TEST123&utm_source=test`.
2. DevTools -> Console: `dataLayer` (shows the array). `sessionStorage.getItem('eyeq_params')` shows the stored `svc`, `gclid` and `utm_*`.
3. Click each Call, WhatsApp and Get directions button. On a desktop the `tel:` and `wa.me` links may open another app or tab; the event is pushed before that happens. Run `dataLayer.filter(e => e.event)` to list them.
4. Submit the form with a test number (see step 1 below), then check for `generate_lead`.
5. Confirm there is no name or number anywhere: `JSON.stringify(dataLayer)` should contain none of what you typed.

## 1. GTM Preview (Tag Assistant)

Setup in GTM (once):
- One **Custom Event** trigger per event name above (exact, case-sensitive: `generate_lead`, `click_call`, `click_whatsapp`, `click_directions`, `booking_confirmed`).
- Data Layer Variables: `service_interest`, `svc`, `ref_code`, `link_location`.
- Tags: GA4 Event tag per event (event name the same as the dataLayer event, parameters from the variables); Google Ads conversion tag on `generate_lead` (and `click_call` if you count calls); Meta tags as in section 3; Scroll Depth trigger for scroll tracking.

Test:
1. Open GTM -> Preview, enter the page URL with test params, e.g. `https://eyeq.biz/book-consultation?svc=myopia&gclid=TEST123&utm_source=google&utm_medium=cpc&utm_campaign=test`, and connect.
2. **click_call**: click Call (mobile bar, or the number in the desktop header). In the Tag Assistant summary a `click_call` message appears; its Data Layer tab shows `link_location`. The GA4 tag should show "Tag Fired".
3. **click_whatsapp**: click WhatsApp Us in the hero. Expect `ref_code: G-MYO` for `svc=myopia`. Repeat with `svc=eyetest` (G-EYE), `diabetic` (G-DIA), `lens` (G-LENS) and no `svc` (G-DEF). The message sent to WhatsApp should read like `Hi Eye Q, I would like to book an eye test. Ref G-EYE`.
4. **click_directions**: click Get directions in the Find the Clinic section.
5. **generate_lead**: fill the form with a test name, a test mobile such as `98765 43210`, any service, tick the consent, submit. After the success panel appears, the summary shows `generate_lead` with `service_interest` set to the category, and no name or number. Also open the **Variables** tab to confirm.
6. **No lead on failure**: set `formEndpoint` to a URL that fails (the placeholder does). The friendly error with the phone number appears and **no** `generate_lead` is in the summary.
7. **booking_confirmed**: with no embed yet, run `EyeQ.bookingConfirmed()` in the console and confirm the event. Once an embed is added, complete a test booking inside it and confirm it fires without the console call.
8. **Call forwarding swap** (when used): after the GTM swap tag runs, hover a Call button to confirm the `tel:` number changed, click it, and confirm `click_call` still fires.

## 2. GA4 DebugView

1. In GTM Preview mode, or with the GA Debugger extension, open GA4 -> Admin -> DebugView and pick your device.
2. Repeat the clicks and the form submission from section 1. Each should appear as an event: `click_call`, `click_whatsapp`, `click_directions`, `generate_lead` (and `booking_confirmed`).
3. Click each event and check the parameters: `ref_code`, `link_location`, `service_interest`, `svc`. Confirm there is no name or phone number.
4. In Admin -> Events, mark `generate_lead` as a key event. Register `ref_code`, `link_location`, `service_interest` and `svc` as custom dimensions if you want to report on them.
5. Landing page parameters: confirm `gclid` and the UTMs are in the page URL of the first hit (GA4 reads them from the URL).

## 3. Meta Test Events

1. In Meta Events Manager, open the Pixel (or dataset) used in GTM -> **Test events**, and copy the test code. Load the page with GTM Preview connected and the Meta Pixel Helper extension on.
2. In GTM, map events (Meta's own template or a Custom HTML tag):
   - `generate_lead` -> Meta standard event `Lead` (send only the category; no name or number as custom data and keep Advanced Matching off unless the clinic's privacy policy covers it).
   - `click_call`, `click_whatsapp` -> `Contact` (or custom events with the same names).
   - `click_directions` -> custom event `click_directions`.
   - `booking_confirmed` -> `Schedule` (or a custom event).
3. Complete each action on the page. Each should appear in the **Test events** list within a few seconds with the browser source. Check that the event parameters contain no personal data.
4. Health policy reminder: do not send health details to Meta. Service category only (for example, `adult-eye-test`) is acceptable, but if there is any doubt, drop `service_interest` from the Meta tag and keep it for GA4 only.

## 4. Regression checklist before ads go live

- [ ] `svc` values change the headline: default, `eyetest`, `myopia`, `diabetic`, `lens`; an unknown value falls back to default.
- [ ] Disabling JavaScript still shows the default H1.
- [ ] `gclid` and `utm_*` land in the form's hidden fields (DevTools -> Elements, or the received form data).
- [ ] The real form endpoint receives the submission, and the front desk can see `svc`, `gclid`, `utm_*` and the service.
- [ ] Phone and WhatsApp links work on a real phone (Android and iOS).
- [ ] The bottom bar does not cover the footer text or the consent line on a small phone.
- [ ] The privacy policy link opens a real page.
- [ ] `noindex` is `false` on production.
- [ ] GTM only loads once (the page makes a single `gtm.js` request).
