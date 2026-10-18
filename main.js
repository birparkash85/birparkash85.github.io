/* BIR Industries — site behaviour */
(function () {
  "use strict";

  var COMPANY_PHONE = "919872812819";
  var COMPANY_EMAIL = "mehak085@hotmail.com";

  /* ---------- Header: shadow on scroll + active section ---------- */
  var header = document.querySelector(".site-header");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a[href^='#']:not(.btn)"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function (sec) { if (sec.offsetTop <= pos) current = sec.id; });
    navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) setMenu(false); });

  /* ---------- Year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".section-head, .product, .process li, .q-card, .ind, .supply-card, .mat, .custom-band");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
    // Safety net: never leave content hidden if the observer is slow (e.g. fast jumps via nav links)
    var sweep = function () {
      var limit = window.innerHeight * 1.1;
      revealTargets.forEach(function (el) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < limit) el.classList.add("in");
      });
    };
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("load", sweep);
  }

  /* ---------- Hero video: respect reduced motion ---------- */
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  /* ---------- 3D: metallic steel look ---------- */
  var FINISHES = {
    zinc:   { color: [0.83, 0.85, 0.89, 1], metal: 0.9, rough: 0.24 },
    yellow: { color: [0.86, 0.73, 0.38, 1], metal: 0.85, rough: 0.28 },
    black:  { color: [0.10, 0.10, 0.11, 1], metal: 0.6, rough: 0.42 }
  };
  function applyFinish(viewer, key) {
    var f = FINISHES[key] || FINISHES.zinc;
    if (!viewer.model) return;
    viewer.model.materials.forEach(function (m) {
      var pbr = m.pbrMetallicRoughness;
      if (!pbr) return;
      pbr.setBaseColorFactor(f.color);
      pbr.setMetallicFactor(f.metal);
      pbr.setRoughnessFactor(f.rough);
    });
  }
  document.querySelectorAll(".product model-viewer").forEach(function (mv) {
    mv.addEventListener("load", function () { applyFinish(mv, "zinc"); });
  });

  /* ---------- Full-screen 3D viewer ---------- */
  var viewer = document.getElementById("viewer");
  var vModel = document.getElementById("viewerModel");
  var vTitle = document.getElementById("viewerTitle");
  var rotateBtn = document.getElementById("toggleRotate");
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));
  var currentFinish = "zinc";
  var currentProduct = "";

  vModel.addEventListener("load", function () { applyFinish(vModel, currentFinish); });

  function openViewer(card) {
    currentProduct = card.dataset.name;
    vTitle.textContent = currentProduct;
    vModel.setAttribute("alt", "Interactive 3D model of " + currentProduct);
    if (vModel.getAttribute("src") !== card.dataset.model) vModel.setAttribute("src", card.dataset.model);
    else applyFinish(vModel, currentFinish);
    vModel.autoRotate = true;
    rotateBtn.setAttribute("aria-pressed", "true");
    if (typeof viewer.showModal === "function") viewer.showModal(); else viewer.setAttribute("open", "");
  }
  function closeViewer() { if (viewer.open) viewer.close(); }

  document.querySelectorAll(".product").forEach(function (card) {
    card.querySelector(".expand-btn").addEventListener("click", function () { openViewer(card); });
  });
  document.getElementById("viewerClose").addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });

  rotateBtn.addEventListener("click", function () {
    var on = !vModel.autoRotate;
    vModel.autoRotate = on;
    rotateBtn.setAttribute("aria-pressed", String(on));
  });
  document.getElementById("resetView").addEventListener("click", function () {
    vModel.cameraOrbit = "0deg 75deg 105%";
    vModel.fieldOfView = "auto";
    vModel.cameraTarget = "auto auto auto";
    if (vModel.jumpCameraToGoal) vModel.jumpCameraToGoal();
  });
  swatches.forEach(function (s) {
    s.addEventListener("click", function () {
      currentFinish = s.dataset.finish;
      swatches.forEach(function (o) { o.classList.toggle("is-active", o === s); });
      applyFinish(vModel, currentFinish);
    });
  });
  document.getElementById("viewerQuote").addEventListener("click", function () {
    closeViewer();
    var sel = document.getElementById("f-product");
    var map = { "Hose Ferrule": 0, "Hose Nipple": 1, "Hydraulic Hex Nut": 2, "Bent Tube": 3 };
    Object.keys(map).forEach(function (k) { if (currentProduct.indexOf(k) === 0) sel.selectedIndex = map[k]; });
  });

  /* ---------- Gallery lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbMedia = document.getElementById("lbMedia");
  var lbCap = document.getElementById("lbCap");
  document.querySelectorAll(".g-item").forEach(function (item) {
    item.addEventListener("click", function () {
      lbMedia.innerHTML = "";
      var el;
      if (item.dataset.type === "video") {
        el = document.createElement("video");
        el.src = item.dataset.src;
        el.controls = true; el.autoplay = true; el.loop = true; el.muted = true;
        el.setAttribute("playsinline", "");
      } else {
        el = document.createElement("img");
        el.src = item.dataset.src;
        el.alt = item.dataset.caption || "";
      }
      lbMedia.appendChild(el);
      lbCap.textContent = item.dataset.caption || "";
      if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    });
  });
  function closeLb() { if (lb.open) lb.close(); }
  lb.addEventListener("close", function () { lbMedia.innerHTML = ""; });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target === lbMedia) closeLb(); });
  document.getElementById("lbClose").addEventListener("click", closeLb);

  /* ---------- RFQ form -> WhatsApp / email ---------- */
  var form = document.getElementById("rfqForm");
  var errorBox = document.getElementById("formError");
  var via = "whatsapp";
  form.querySelectorAll("button[type=submit]").forEach(function (b) {
    b.addEventListener("click", function () { via = b.dataset.via; });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });

    var nameEl = form.elements.name, emailEl = form.elements.email;
    var problems = [];
    nameEl.setAttribute("aria-invalid", d.name ? "false" : "true");
    if (!d.name) problems.push("your name");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || "");
    emailEl.setAttribute("aria-invalid", emailOk ? "false" : "true");
    if (!emailOk) problems.push("a valid email address");
    if (problems.length) {
      errorBox.textContent = "Please enter " + problems.join(" and ") + ".";
      (d.name ? emailEl : nameEl).focus();
      return;
    }
    errorBox.textContent = "";

    var lines = [
      "Request for Quotation - BIR Industries",
      "",
      "Name: " + d.name,
      d.company ? "Company: " + d.company : null,
      "Email: " + d.email,
      d.phone ? "Phone: " + d.phone : null,
      d.location ? "Location: " + d.location : null,
      "Product: " + d.product,
      d.material ? "Material / finish: " + d.material : null,
      d.qty ? "Quantity: " + d.qty : null,
      d.message ? "\nDetails:\n" + d.message : null
    ].filter(function (l) { return l !== null; });
    var text = lines.join("\n");

    if (via === "email") {
      var subject = "RFQ: " + d.product + (d.company ? " - " + d.company : "");
      window.location.href = "mailto:" + COMPANY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    } else {
      window.open("https://wa.me/" + COMPANY_PHONE + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  });
})();
