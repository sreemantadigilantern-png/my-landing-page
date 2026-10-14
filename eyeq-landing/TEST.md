# How to verify tracking

All events go through `window.dataLayer` and Google Tag Manager only. No gtag, no Meta pixel code on the page. Before testing, set `CONFIG.gtmId` in `script.js` and the `GTM-XXXXXXX` in the `<noscript>` iframe in `index.html`.

## Events

| Event | Fires when | Parameters |
|---|---|---|
| `generate_lead` | A form submit gets a 2xx response from `CONFIG.formEndpoint` | `service_interest` (category only, e.g. `adult_eye_test`), `cta_location` (`hero` or `form`), `entry_cta` (the last Book button used, if any) |
| `click_call` | Any `tel:` link is clicked | `cta_location` |
| `click_whatsapp` | Any `wa.me` link is clicked | `cta_location`, `ref_code` (G-EYE, G-MYO, G-DIA, G-LENS, G-DEF or M-DEF) |
| `click_directions` | The "Get directions" link is clicked | `cta_location` |
| `booking_confirmed` | The booking embed posts a completion message (stub) | `cta_location: "form"` |

`cta_location` is one of: `header`, `hero`, `audience-card`, `service-section`, `sticky-bar`, `form`, `footer`. No name, phone number or health detail is ever pushed.

## 1. Quick check in the browser console (no GTM needed)

Open the page, open DevTools, then run `dataLayer` after each action below. Each action should add exactly one object.

1. Tap the phone icon in the header: `click_call`, `cta_location: "header"`.
2. Tap WhatsApp in the mobile bar (or "WhatsApp us" under the hero form): `click_whatsapp`, with `ref_code`.
3. Tap "Get directions" in the Find us section: `click_directions`, `cta_location: "footer"`.
4. Submit the hero form with valid details: `generate_lead`, `cta_location: "hero"`.
5. Submit the lower form: `generate_lead`, `cta_location: "form"`.
6. Check that none of the objects contains the name or number you typed.

URL checks: `?svc=myopia` changes the H1 and preselects "Myopia assessment"; `?svc=x&utm_source=facebook` makes the WhatsApp message end in `Ref M-DEF`; `?gclid=test123` fills the hidden `gclid` field of both forms (inspect the form in Elements, or read the POST body in the Network tab).

## 2. GTM Preview (Tag Assistant)

1. In GTM, create one **Custom Event** trigger per event name above (`generate_lead`, `click_call`, `click_whatsapp`, `click_directions`, `booking_confirmed`).
2. Create Data Layer Variables for `cta_location`, `service_interest`, `ref_code`.
3. Click Preview, enter the page URL (add `?gclid=test&utm_source=google&utm_medium=cpc`), then repeat the actions above.
4. In the Tag Assistant timeline each event must appear as its own message. Open it, check the Data Layer tab for the parameters, and check that your tags fired under "Tags Fired".

## 3. GA4 DebugView

1. Create a GA4 Event tag per trigger with the same event names, passing the parameters above. Mark `generate_lead` as a key event.
2. Preview in GTM (debug mode sends events to DebugView), then open GA4, Admin, DebugView.
3. Repeat the actions. Each event shows with its parameters. Register `cta_location`, `service_interest` and `ref_code` as custom dimensions to report on them.

## 4. Meta Test Events

1. In Meta Events Manager, open your pixel, then Test Events, and copy the test code.
2. Put the Meta pixel base code in a GTM tag (not on the page) that fires on All Pages, and add Lead on the `generate_lead` trigger. Use Contact on `click_call` and `click_whatsapp` if wanted.
3. Open the page through the "Open website" button in Test Events (or GTM Preview with the test code). Submit the form. A `Lead` event appears in Test Events with the browser source. Do not send the name or phone as parameters.
4. For a Meta ad test, open the page with `?utm_source=facebook` to see the `M-DEF` WhatsApp ref code.

## 5. Google Ads conversions

Create conversions from the GA4 key events (import) or with a Google Ads conversion tag on `generate_lead`, `click_call` and `click_whatsapp`. For calls from ads, use the forwarding number: set `CONFIG.forwardingNumber` (see README) and every `tel:` link and visible number switches. GTM can also swap numbers: target the selector `a[data-phone-link]` and `[data-phone-text]`.

## 6. Form endpoint test

Point `CONFIG.formEndpoint` at the real endpoint and submit. The request is a `multipart/form-data` POST with: name, mobile (10 digits), who, service, preferred_day, svc, gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, entry_cta, form_location, page. The honeypot field `company` is never sent: a filled honeypot shows the success screen and sends nothing. Turn the endpoint off to see the friendly error with the phone number.
