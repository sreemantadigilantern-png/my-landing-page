/* =====================================================================
   CONFIG: everything the clinic or web team needs to fill in lives here.
   ===================================================================== */
var CONFIG = {
  // Google Tag Manager container. While this is the placeholder, GTM is not
  // loaded (events still go to window.dataLayer). Also update the <noscript>
  // iframe URL in index.html, which cannot read this file.
  gtmId: 'GTM-XXXXXXX',

  // Adds <meta name="robots" content="noindex, nofollow"> when true.
  noindex: false,

  // Clinic phone and WhatsApp (digits only for WhatsApp, with country code).
  phone: '+919972053909',
  phoneDisplay: '+91 99720 53909',
  whatsappNumber: '919972053909',

  // CONFIG: Google forwarding number for website calls (to be added later).
  // When set, every tel: link and number on the page switches to it.
  // Leave '' to keep the clinic number. Alternative: swap it later in GTM by
  // targeting [data-phone-link] (href) and [data-phone-text] (visible text).
  forwardingNumber: '',          // e.g. '+918012345678'
  forwardingDisplay: '',         // e.g. '+91 80123 45678'

  // CONFIG: where the booking form posts (must allow CORS from this page and
  // answer 2xx on success). Example: a Formspree URL or a WordPress REST route.
  formEndpoint: 'https://REPLACE-WITH-FORM-ENDPOINT.example/submit',

  // CONFIG: clinic hours. Empty shows the yellow "to be confirmed" placeholder.
  hours: '',                     // e.g. 'Mon to Sat, 9:30 am to 8:00 pm'

  // CONFIG: walk-in policy sentence for the FAQ. Empty shows the placeholder.
  walkInPolicy: '',              // e.g. 'Walk-ins are welcome during clinic hours, subject to availability.'

  // CONFIRM WITH DOCTOR: Karnataka Medical Council registration number.
  registrationNumber: '36059',

  // CONFIG: privacy policy and terms URLs (placeholders until the pages exist).
  privacyUrl: '/privacy-policy/',
  termsUrl: '/terms-and-conditions/',

  // CONFIG: online booking tool URL. Empty keeps #booking-embed hidden.
  bookingEmbedUrl: '',

  // Directions link. Swap for the Google Business Profile link when available.
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Block+3%2C+154%2C+8th+Main+Road%2C+Koramangala%2C+Bengaluru'
};
/* ===================== end of CONFIG ===================== */

(function () {
  'use strict';

  var win = window;
  var doc = document;
  win.dataLayer = win.dataLayer || [];

  /* ---------- Look-up tables ---------- */
  var HEADLINES = {
    'default':  'Eye Clinic in Koramangala: Book Your Eye Consultation',
    'eyetest':  'Eye Test in Koramangala: Book a Comprehensive Eye Exam',
    'myopia':   "Myopia Management and Children's Eye Care in Bangalore",
    'diabetic': 'Diabetic Eye Screening in Koramangala',
    'lens':     'Contact Lens Fitting in Koramangala'
  };
  // svc value -> form service option and WhatsApp reference code
  var SVC_SERVICE = {
    'default': '', 'eyetest': 'adult-eye-test', 'myopia': 'myopia-assessment',
    'diabetic': 'diabetic-eye-screening', 'lens': 'contact-lens-fitting'
  };
  var SVC_REF = { 'default': 'G-DEF', 'eyetest': 'G-EYE', 'myopia': 'G-MYO', 'diabetic': 'G-DIA', 'lens': 'G-LENS' };
  var SERVICE_REF = {
    'childrens-eye-check': 'G-MYO', 'myopia-assessment': 'G-MYO', 'adult-eye-test': 'G-EYE',
    'diabetic-eye-screening': 'G-DIA', 'contact-lens-fitting': 'G-LENS', 'other': 'G-DEF'
  };
  var REF_TEXT = {
    'G-EYE': 'book an eye test',
    'G-MYO': "book a children's eye check",
    'G-DIA': 'book a diabetic eye screening',
    'G-LENS': 'book a contact lens fitting',
    'G-DEF': 'book an eye consultation'
  };
  var URL_KEYS = ['svc', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORE_KEY = 'eyeq_params';

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function storageGet() {
    try { return JSON.parse(win.sessionStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function storageSet(obj) {
    try { win.sessionStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { /* storage blocked: fine */ }
  }
  function clean(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').slice(0, 200); }

  /* ---------- dataLayer: only these keys can ever be sent ----------
     No name, phone number or health detail is ever allowed through. */
  var ALLOWED = ['link_location', 'service_interest', 'svc', 'ref_code'];
  function track(eventName, data) {
    var payload = { event: eventName };
    data = data || {};
    ALLOWED.forEach(function (k) {
      if (data[k] != null && data[k] !== '') { payload[k] = String(data[k]).slice(0, 60); }
    });
    win.dataLayer.push(payload);
  }

  /* ---------- GTM (the only third-party script) ---------- */
  function loadGtm() {
    var id = CONFIG.gtmId;
    if (!/^GTM-[A-Z0-9]{4,}$/.test(id) || id === 'GTM-XXXXXXX') { return; }
    win.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = doc.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + id;
    doc.head.appendChild(s);
  }

  function applyNoindex() {
    if (!CONFIG.noindex) { return; }
    var m = doc.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    doc.head.appendChild(m);
  }

  /* ---------- URL parameters, kept in sessionStorage ---------- */
  var params = {};
  function readParams() {
    var stored = storageGet();
    var q = new URLSearchParams(win.location.search);
    URL_KEYS.forEach(function (k) {
      var v = q.get(k);
      if (v) { stored[k] = clean(v); }
    });
    if (!HEADLINES.hasOwnProperty(stored.svc)) { stored.svc = 'default'; }
    storageSet(stored);
    params = stored;
  }

  function currentSvc() { return params.svc || 'default'; }

  function applyParams() {
    var svc = currentSvc();
    var h1 = $('[data-h1]');
    if (h1) { h1.textContent = HEADLINES[svc]; }

    URL_KEYS.forEach(function (k) {
      var input = doc.querySelector('#booking-form input[name="' + k + '"]');
      if (input) { input.value = k === 'svc' ? svc : (params[k] || ''); }
    });

    var select = $('#f-service');
    if (select && SVC_SERVICE[svc]) { select.value = SVC_SERVICE[svc]; }
  }

  /* ---------- Phone and WhatsApp links ---------- */
  function applyPhone() {
    var number = CONFIG.forwardingNumber || CONFIG.phone;
    var display = (CONFIG.forwardingNumber && CONFIG.forwardingDisplay) || (CONFIG.forwardingNumber ? CONFIG.forwardingNumber : CONFIG.phoneDisplay);
    $$('[data-phone-link]').forEach(function (a) { a.setAttribute('href', 'tel:' + number); });
    $$('[data-phone-text]').forEach(function (n) { n.textContent = display; });
  }

  function waHref(ref) {
    var text = 'Hi Eye Q, I would like to ' + REF_TEXT[ref] + '. Ref ' + ref;
    return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(text);
  }
  function setWa(a, ref) {
    a.setAttribute('href', waHref(ref));
    a.setAttribute('data-ref', ref);
  }
  function applyWhatsApp() {
    $$('[data-wa]').forEach(function (a) {
      var v = a.getAttribute('data-wa');
      setWa(a, v === 'auto' ? SVC_REF[currentSvc()] : v);
    });
  }

  /* ---------- Config-driven text and links ---------- */
  function applyConfigText() {
    $$('[data-hours]').forEach(function (n) {
      if (CONFIG.hours) { n.textContent = 'Hours: ' + CONFIG.hours; n.classList.remove('placeholder'); }
    });
    $$('[data-walkin]').forEach(function (n) {
      if (CONFIG.walkInPolicy) { n.textContent = CONFIG.walkInPolicy; n.classList.remove('placeholder'); }
    });
    $$('[data-reg]').forEach(function (n) { if (CONFIG.registrationNumber) { n.textContent = CONFIG.registrationNumber; } });
    $$('[data-privacy]').forEach(function (a) { a.setAttribute('href', CONFIG.privacyUrl); });
    $$('[data-terms]').forEach(function (a) { a.setAttribute('href', CONFIG.termsUrl); });
    $$('[data-map-link]').forEach(function (a) { a.setAttribute('href', CONFIG.mapUrl); });
  }

  /* ---------- Click tracking (delegated, covers every link) ---------- */
  function locationOf(a) {
    var holder = a.closest('[data-loc]');
    return holder ? holder.getAttribute('data-loc') : '';
  }
  function onClick(e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) { return; }

    var svcBtn = a.getAttribute('data-service');
    if (svcBtn) {
      var select = $('#f-service');
      if (select) { select.value = svcBtn; select.removeAttribute('aria-invalid'); hideError('service'); }
    }

    var href = a.getAttribute('href') || '';
    var loc = locationOf(a);
    if (/^tel:/i.test(href)) {
      track('click_call', { link_location: loc });
    } else if (/^https?:\/\/wa\.me\//i.test(href)) {
      track('click_whatsapp', { link_location: loc, ref_code: a.getAttribute('data-ref') });
    } else if (a.hasAttribute('data-directions')) {
      track('click_directions', { link_location: loc });
    }
  }

  /* ---------- Booking form ---------- */
  var form, submitBtn;

  function showError(field, msg) {
    var el = $('#e-' + field);
    var input = field === 'consent' ? $('#f-consent') : $('#f-' + field);
    if (el) { el.textContent = msg; el.hidden = false; }
    if (input) { input.setAttribute('aria-invalid', 'true'); }
  }
  function hideError(field) {
    var el = $('#e-' + field);
    var input = field === 'consent' ? $('#f-consent') : $('#f-' + field);
    if (el) { el.textContent = ''; el.hidden = true; }
    if (input) { input.removeAttribute('aria-invalid'); }
  }

  // Accepts 10 digits starting 6-9, with optional +91, 91 or 0 in front.
  function normaliseMobile(raw) {
    var d = String(raw || '').replace(/[\s\-().]/g, '');
    d = d.replace(/^\+?91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
    return /^[6-9]\d{9}$/.test(d) ? d : '';
  }

  function validate() {
    var firstBad = null;
    function bad(field, msg, id) { showError(field, msg); if (!firstBad) { firstBad = $(id); } }
    ['name', 'mobile', 'service', 'consent'].forEach(hideError);

    var name = form.elements.name.value.trim();
    if (name.length < 2) { bad('name', 'Please enter your name.', '#f-name'); }

    var mobile = normaliseMobile(form.elements.mobile.value);
    if (!mobile) { bad('mobile', 'Please enter a 10-digit Indian mobile number, for example 98765 43210.', '#f-mobile'); }

    if (!form.elements.service.value) { bad('service', 'Please choose a service.', '#f-service'); }

    if (!form.elements.consent.checked) { bad('consent', 'Please tick the box so we can contact you about this booking.', '#f-consent'); }

    if (firstBad) { firstBad.focus(); return null; }
    return mobile;
  }

  function showSuccess() {
    var service = form.elements.service.value;
    var ref = SERVICE_REF[service] || SVC_REF[currentSvc()];
    var wa = $('#success-wa');
    if (wa) { setWa(wa, ref); }
    form.hidden = true;
    $('#form-error').hidden = true;
    var box = $('#form-success');
    box.hidden = false;
    var title = $('#success-title');
    if (title) { title.focus(); }
    // Category only. No name, number or health detail.
    track('generate_lead', { service_interest: service, svc: currentSvc(), ref_code: ref });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (submitBtn.disabled) { return; }
    var mobile = validate();
    if (!mobile) { return; }

    // Honeypot: bots fill it. Pretend to succeed, send nothing, track nothing.
    if (form.elements.website.value) { form.hidden = true; $('#form-success').hidden = false; return; }

    var fd = new FormData(form);
    fd.set('mobile', mobile);
    fd.delete('website');

    var label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    $('#form-error').hidden = true;

    var ctrl = ('AbortController' in win) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;

    fetch(CONFIG.formEndpoint, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (!res.ok) { throw new Error('bad status'); }
      showSuccess();
    }).catch(function () {
      var box = $('#form-error');
      box.hidden = false;
      box.focus();
    }).then(function () {
      if (timer) { clearTimeout(timer); }
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    });
  }

  function initForm() {
    form = $('#booking-form');
    if (!form) { return; }
    submitBtn = $('#f-submit');
    form.addEventListener('submit', onSubmit);
    ['name', 'mobile', 'service'].forEach(function (f) {
      var input = $('#f-' + f);
      if (input) { input.addEventListener('input', function () { hideError(f); }); }
    });
    var consent = $('#f-consent');
    if (consent) { consent.addEventListener('change', function () { hideError('consent'); }); }
  }

  /* ---------- Online booking embed (future tool) ---------- */
  function initEmbed() {
    var holder = $('#booking-embed');
    if (!holder || !CONFIG.bookingEmbedUrl) { return; }
    var origin;
    try { origin = new URL(CONFIG.bookingEmbedUrl, win.location.href).origin; } catch (e) { return; }

    var frame = doc.createElement('iframe');
    frame.src = CONFIG.bookingEmbedUrl;
    frame.title = 'Online booking';
    frame.loading = 'lazy';
    holder.appendChild(frame);
    holder.hidden = false;

    // STUB: adapt the message shape to whichever booking tool is chosen.
    // Expected here: the embed posts {type: 'booking_confirmed'} to this page.
    win.addEventListener('message', function (e) {
      if (e.origin !== origin || !e.data) { return; }
      if (e.data.type === 'booking_confirmed' || e.data.event === 'booking_confirmed') {
        track('booking_confirmed', { link_location: 'booking-embed' });
      }
    });
  }

  // Manual hook for testing the stub: EyeQ.bookingConfirmed() in the console.
  win.EyeQ = { bookingConfirmed: function () { track('booking_confirmed', { link_location: 'booking-embed' }); } };

  /* ---------- Start ---------- */
  applyNoindex();
  loadGtm();

  function init() {
    readParams();
    applyParams();
    applyPhone();
    applyWhatsApp();
    applyConfigText();
    initForm();
    initEmbed();
    doc.addEventListener('click', onClick);
  }
  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
