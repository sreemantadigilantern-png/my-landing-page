/* Eye Q /book-consultation: vanilla JS, no dependencies.
   Everything marked CONFIG lives in this block. */
const CONFIG = {
  gtmId: "GTM-XXXXXXX",                       // CONFIG: GTM container ID. Also change the <noscript> iframe URL in index.html.
  phone: "+919972053909",                     // clinic phone, E.164
  phoneDisplay: "+91 99720 53909",
  forwardingNumber: "",                       // CONFIG: Google forwarding number for website calls, E.164 (e.g. "+918012345678"). Empty = use clinic phone.
  forwardingDisplay: "",                      // CONFIG: how the forwarding number is shown (e.g. "+91 80123 45678")
  whatsappNumber: "919972053909",             // digits only, no plus sign
  formEndpoint: "https://REPLACE-ME.example/api/eyeq-lead",   // CONFIG: URL that accepts a POST (multipart form data) and returns 2xx
  hours: "",                                  // CONFIG: clinic hours, e.g. "Mon to Sat, 10 am to 8 pm". Empty = "Call or WhatsApp to confirm today's timings".
  walkInPolicy: "",                           // CONFIG: e.g. "Walk-ins are welcome when the doctor is available." Empty = nothing is shown.
  registrationNumber: "36059",                // CONFIRM WITH DOCTOR: Karnataka Medical Council Reg. No.
  privacyUrl: "/privacy-policy/",             // CONFIG
  termsUrl: "/terms-and-conditions/",         // CONFIG
  bookingEmbedUrl: "",                        // CONFIG: online booking tool URL. Empty keeps #booking-embed hidden.
  bookingEmbedOrigin: "",                     // CONFIG: origin of the booking tool, used to trust its completion message
  SHOW_DOCTOR_PHOTO: false,                   // CONFIG: stays false. No doctor photo is used on this page.
  noindex: false,                             // CONFIG: true adds <meta name="robots" content="noindex">
  /* HELD IMAGES. Files in assets/held/ are NOT used. To enable one later: confirm it is a real photograph with written
     consent, move it from assets/held/ to assets/source/, run `npm run images`, then add its file name here.
     The page then swaps the matching green panel (IMAGE_SLOTS below) for the photo. Nothing else changes. */
  APPROVED_IMAGES: [],                        // CONFIG: e.g. ["child-glasses.jpg"]
  IMAGE_ALT: {                                // alt text per held file: edit to say what the photo really shows
    "child-glasses.jpg": "Child trying on glasses at Eye Q Opticals & Eye Clinic",
    "elderly-reading.jpg": "Older adult reading at Eye Q Opticals & Eye Clinic",
    "woman-glasses.jpg": "Adult trying on glasses at Eye Q Opticals & Eye Clinic",
    "doctor-portrait.jpg": "Dr. Shalini Shetty, Eye Q Opticals & Eye Clinic"
  }
};
/* Which panel each held photo may fill. doctor-portrait.jpg is used only when SHOW_DOCTOR_PHOTO is true. */
const IMAGE_SLOTS = {
  "child-glasses.jpg": ["audience-children", "myopia"],
  "elderly-reading.jpg": ["audience-adults40", "diabetic"],
  "woman-glasses.jpg": ["audience-working", "contact-lens"],
  "doctor-portrait.jpg": ["doctor"]
};

(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var dl = (window.dataLayer = window.dataLayer || []);
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage blocked: carry on */ } }
  };
  root.classList.add("js");

  /* ---------- robots ---------- */
  if (CONFIG.noindex) {
    var m = doc.createElement("meta");
    m.name = "robots"; m.content = "noindex";
    doc.head.appendChild(m);
  }

  /* ---------- GTM (the only third-party script besides the map) ---------- */
  if (CONFIG.gtmId && CONFIG.gtmId !== "GTM-XXXXXXX") {
    dl.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var g = doc.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.gtmId);
    doc.head.appendChild(g);
  }

  /* Events carry only a location label and a service category. Never a name, number or health detail. */
  function track(event, params) {
    var p = { event: event };
    for (var k in params) { if (params[k] !== undefined && params[k] !== "") p[k] = params[k]; }
    dl.push(p);
  }

  /* ---------- URL parameters, kept for the session ---------- */
  var TRACK_KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
  var saved = {};
  try { saved = JSON.parse(store.get("eyeq_params") || "{}"); } catch (e) { saved = {}; }
  var url = new URLSearchParams(window.location.search);
  TRACK_KEYS.concat(["svc"]).forEach(function (k) {
    var v = url.get(k);
    if (v) saved[k] = v.slice(0, 200);
  });
  store.set("eyeq_params", JSON.stringify(saved));

  /* ---------- service variants ---------- */
  var VARIANTS = {
    "default":  { h1: "Eye Clinic in Koramangala: Book Your Eye Consultation", service: "adult_eye_test",       ref: "G-DEF",  ask: "an eye test" },
    "eyetest":  { h1: "Eye Test in Koramangala: Book a Comprehensive Eye Exam", service: "adult_eye_test",     ref: "G-EYE",  ask: "an eye test" },
    "myopia":   { h1: "Myopia Management and Children's Eye Care in Bangalore", service: "myopia_assessment",  ref: "G-MYO",  ask: "a children's eye check" },
    "diabetic": { h1: "Diabetic Eye Screening in Koramangala",                  service: "diabetic_screening", ref: "G-DIA",  ask: "a diabetic eye screening" },
    "lens":     { h1: "Contact Lens Fitting in Koramangala",                    service: "contact_lens_fitting", ref: "G-LENS", ask: "a contact lens fitting" }
  };
  var svc = VARIANTS[saved.svc] ? saved.svc : "default";
  var serviceValue = VARIANTS[svc].service;
  var h1 = $("[data-h1]");
  if (h1 && svc !== "default") {
    h1.textContent = VARIANTS[svc].h1;
    doc.title = VARIANTS[svc].h1 + " | Eye Q Opticals";
  }

  /* ---------- WhatsApp and phone ---------- */
  var fromMeta = /facebook|instagram/i.test(saved.utm_source || "");
  function waRef() { return fromMeta ? "M-DEF" : VARIANTS[svc].ref; }
  function waHref() {
    var text = "Hi Eye Q, I would like to book " + VARIANTS[svc].ask + ". Ref " + waRef();
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }
  function refreshLinks() {
    var tel = CONFIG.forwardingNumber || CONFIG.phone;
    var shown = (CONFIG.forwardingNumber && CONFIG.forwardingDisplay) || CONFIG.phoneDisplay;
    $$("a[data-phone-link]").forEach(function (a) { a.setAttribute("href", "tel:" + tel); });
    $$("[data-phone-text]").forEach(function (s) { s.textContent = shown; });
    $$("a[data-wa]").forEach(function (a) { a.setAttribute("href", waHref()); });
  }
  refreshLinks();
  $$("a[data-privacy]").forEach(function (a) { a.setAttribute("href", CONFIG.privacyUrl); });
  $$("a[data-terms]").forEach(function (a) { a.setAttribute("href", CONFIG.termsUrl); });
  $$("[data-regno]").forEach(function (s) { s.textContent = CONFIG.registrationNumber; });
  if (CONFIG.hours) $$("[data-hours]").forEach(function (s) { s.textContent = CONFIG.hours; });
  if (CONFIG.walkInPolicy) $$("[data-walkin]").forEach(function (s) { s.textContent = CONFIG.walkInPolicy; s.hidden = false; s.classList.remove("placeholder"); });
  root.setAttribute("data-doctor-photo", CONFIG.SHOW_DOCTOR_PHOTO ? "on" : "off");

  /* ---------- forms: hidden fields, preselect ---------- */
  var forms = $$("form[data-form]");
  function fillHidden() {
    forms.forEach(function (f) {
      TRACK_KEYS.forEach(function (k) { var i = f.elements[k]; if (i) i.value = saved[k] || ""; });
      if (f.elements.svc) f.elements.svc.value = svc;
    });
  }
  function setService(value) {
    serviceValue = value;
    $$("[data-service]").forEach(function (el) { el.value = value; });
  }
  function setWho(value) {
    $$("input[name=who]").forEach(function (r) { r.checked = (r.value === value); });
  }
  function setSvc(key, value, who) {
    if (VARIANTS[key]) { svc = key; saved.svc = key; store.set("eyeq_params", JSON.stringify(saved)); }
    setService(value || VARIANTS[svc].service);
    if (who) setWho(who);
    fillHidden();
    refreshLinks();
  }
  setService(serviceValue);
  if (svc === "myopia") setWho("my_child");
  fillHidden();

  /* ---------- Book buttons ---------- */
  var heroForm = $("#hero-form");
  var fullForm = $("#book");
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= (window.innerHeight || root.clientHeight);
  }
  function focusFirst(form) {
    var i = $("input[name=name]", form);
    if (i) { try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); } }
  }
  $$("a[data-book]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var cta = a.getAttribute("data-cta") || "";
      store.set("eyeq_entry_cta", cta);
      var key = a.getAttribute("data-svc");
      var forced = a.getAttribute("data-service-value");
      var who = a.getAttribute("data-who");
      if (key) setSvc(key, forced || VARIANTS[key].service, who);
      var href = a.getAttribute("href");
      if (href === "#book") {
        e.preventDefault();
        if (heroForm && inView(heroForm) && window.innerWidth >= 900) {
          focusFirst(heroForm);
        } else {
          fullForm.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(function () { focusFirst(fullForm); }, 600);
        }
      }
      /* other hrefs (#myopia etc.) use normal anchor scrolling */
    });
  });

  /* ---------- validation and submit ---------- */
  function cleanMobile(v) {
    var d = String(v || "").replace(/[\s\-().]/g, "");
    d = d.replace(/^\+?91/, "").replace(/^0+/, "");
    return /^[6-9]\d{9}$/.test(d) ? d : "";
  }
  function showErr(field, msg) {
    var p = $(".err", field);
    if (p) p.textContent = msg || "";
    field.classList.toggle("invalid", !!msg);
  }
  function validate(f) {
    var ok = true;
    var name = f.elements.name, mobile = f.elements.mobile;
    var nf = name.closest(".field"), mf = mobile.closest(".field"), wf = $("fieldset[data-who]", f);
    if (name.value.trim().length < 2) { showErr(nf, "Please enter your name."); ok = false; } else showErr(nf, "");
    if (!cleanMobile(mobile.value)) { showErr(mf, "Please enter a 10-digit Indian mobile number."); ok = false; } else showErr(mf, "");
    if (!f.querySelector("input[name=who]:checked")) { showErr(wf, "Please choose who the eye test is for."); ok = false; } else showErr(wf, "");
    return ok;
  }
  forms.forEach(function (f) {
    $$("input", f).forEach(function (i) {
      i.addEventListener("input", function () { var fld = i.closest(".field"); if (fld && fld.classList.contains("invalid")) validate(f); });
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(f)) {
        var bad = $(".field.invalid input, .field.invalid select", f);
        if (bad) bad.focus();
        return;
      }
      submit(f);
    });
  });

  function payload(f) {
    var fd = new FormData();
    fd.append("name", f.elements.name.value.trim());
    fd.append("mobile", cleanMobile(f.elements.mobile.value));
    fd.append("who", f.querySelector("input[name=who]:checked").value);
    var sv = f.elements.service ? f.elements.service.value : serviceValue;
    fd.append("service", sv);
    fd.append("preferred_day", f.elements.preferred_day ? f.elements.preferred_day.value : "");
    fd.append("svc", svc);
    TRACK_KEYS.forEach(function (k) { fd.append(k, saved[k] || ""); });
    fd.append("entry_cta", store.get("eyeq_entry_cta") || "");
    fd.append("form_location", f.getAttribute("data-form"));
    fd.append("page", window.location.pathname);
    return fd;
  }

  function submit(f) {
    var btn = $("button[type=submit]", f);
    var status = $(".form-status", f);
    var where = f.getAttribute("data-form");
    var sv = f.elements.service ? f.elements.service.value : serviceValue;
    if (f.elements.company && f.elements.company.value) { success(f, where, sv, true); return; }  // honeypot: look successful, send nothing
    btn.disabled = true;
    status.className = "form-status"; status.textContent = "Sending...";
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    fetch(CONFIG.formEndpoint, { method: "POST", body: payload(f), headers: { Accept: "application/json" }, signal: ctl ? ctl.signal : undefined })
      .then(function (res) {
        window.clearTimeout(timer);
        if (!res.ok) throw new Error("HTTP " + res.status);
        success(f, where, sv, false);
      })
      .catch(function () {
        window.clearTimeout(timer);
        btn.disabled = false;
        status.className = "form-status error";
        status.innerHTML = "Sorry, we could not send your request just now. Please call us on <a href=\"tel:" + (CONFIG.forwardingNumber || CONFIG.phone) +
          "\" data-cta=\"form\">" + ((CONFIG.forwardingNumber && CONFIG.forwardingDisplay) || CONFIG.phoneDisplay) + "</a> or message us on WhatsApp.";
      });
  }

  function success(f, where, sv, fake) {
    if (!fake) track("generate_lead", { service_interest: sv, cta_location: where, entry_cta: store.get("eyeq_entry_cta") || "" });
    var tel = CONFIG.forwardingNumber || CONFIG.phone;
    var div = doc.createElement("div");
    div.className = "success"; div.setAttribute("tabindex", "-1");
    div.innerHTML = "<h3>Thank you, we will call you to confirm</h3><p>Our team will phone you to confirm your appointment. If it is urgent, call or message us now.</p>" +
      "<div class=\"row\"><a class=\"btn btn-primary\" href=\"tel:" + tel + "\" data-cta=\"" + where + "\">Call</a>" +
      "<a class=\"btn btn-outline\" href=\"" + waHref() + "\" data-wa data-cta=\"" + where + "\" rel=\"noopener\">WhatsApp</a></div>";
    f.innerHTML = ""; f.appendChild(div);
    f.removeAttribute("novalidate");
    div.focus();
  }

  /* ---------- click tracking (delegated, so success-state links count too) ---------- */
  function ctaOf(el) {
    var n = el.closest("[data-cta]");
    return n ? n.getAttribute("data-cta") : "";
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) track("click_call", { cta_location: ctaOf(a) });
    else if (href.indexOf("wa.me") !== -1) track("click_whatsapp", { cta_location: ctaOf(a), ref_code: waRef() });
    else if (a.hasAttribute("data-directions")) track("click_directions", { cta_location: ctaOf(a) });
  });

  /* ---------- optional online booking embed ---------- */
  var embed = $("#booking-embed");
  if (embed && CONFIG.bookingEmbedUrl) {
    var fr = doc.createElement("iframe");
    fr.src = CONFIG.bookingEmbedUrl; fr.title = "Online booking"; fr.loading = "lazy";
    embed.appendChild(fr); embed.hidden = false;
    window.addEventListener("message", function (ev) {
      if (CONFIG.bookingEmbedOrigin && ev.origin !== CONFIG.bookingEmbedOrigin) return;
      /* STUB: adapt to the booking tool's real completion message. */
      if (ev.data && (ev.data.type === "booking_completed" || ev.data === "booking_completed")) {
        track("booking_confirmed", { cta_location: "form" });
      }
    });
  }

  /* ---------- sticky bar: never sits over a form ---------- */
  var bar = $(".sticky-bar");
  if (bar && "IntersectionObserver" in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
      var any = Object.keys(seen).some(function (k) { return seen[k]; });
      bar.classList.toggle("is-hidden", any);
    }, { threshold: 0 });
    [heroForm, fullForm].forEach(function (el) { if (el) io.observe(el); });
  }
  doc.addEventListener("focusin", function (e) {
    if (bar && e.target.matches && e.target.matches("input, select")) bar.classList.add("is-hidden");
  });

  /* ---------- held images: only files listed in CONFIG.APPROVED_IMAGES are ever shown ---------- */
  CONFIG.APPROVED_IMAGES.forEach(function (file) {
    if (file === "doctor-portrait.jpg" && !CONFIG.SHOW_DOCTOR_PHOTO) return;
    var slots = IMAGE_SLOTS[file];
    if (!slots) return;
    var base = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    slots.forEach(function (slot) {
      var box = $("[data-img-slot=\"" + slot + "\"]");
      if (!box) return;
      var path = "images/" + base + "-800.webp";
      var probe = new Image();   /* the photo replaces the panel only once the file has loaded; a missing file leaves the panel */
      probe.onload = function () {
        var pic = doc.createElement("picture");
        var src = doc.createElement("source");
        src.type = "image/webp";
        src.srcset = "images/" + base + "-400.webp 400w, " + path + " 800w, images/" + base + "-1200.webp 1200w";
        src.sizes = box.classList.contains("green-panel") ? "(min-width: 900px) 40vw, 92vw" : "(min-width: 900px) 22vw, 92vw";
        var img = doc.createElement("img");
        img.src = path; img.loading = "lazy"; img.decoding = "async"; img.width = 800; img.height = 500; img.alt = CONFIG.IMAGE_ALT[file] || "";
        pic.appendChild(src); pic.appendChild(img);
        box.textContent = ""; box.appendChild(pic); box.classList.add("has-photo");
      };
      probe.src = path;
    });
  });

  /* ---------- gentle fade on scroll ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); fio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -60px 0px" });
    $$(".sec .card, .svc-text, .sec h2").forEach(function (el) {
      if (el.getBoundingClientRect().top > (window.innerHeight || 700)) { el.classList.add("fx"); fio.observe(el); }
    });
  }
})();
