/* ============================================================
   JOTA SOLUTIONS — script.js (Final)
   ============================================================ */
"use strict";

const FORMSPREE_URL = "https://script.google.com/macros/s/AKfycbwp-przzCg0uVCR-Vw51A8cnRsHfLJ_BWTGZZ25-azowYOIZEWLOd_A16-Gwt5GgKs/exec"; // substitua pela URL real

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initMobileMenu();
  initProgress();
  initReveal();
  initCounters();
  initOrbit();
  initFAQ();
  initForm();
  initBackToTop();
  initSmoothScroll();
  document.getElementById("yr").textContent = new Date().getFullYear();
});

/* ── NAV SCROLL ─────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById("nav");
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── PROGRESS BAR ───────────────────────────────────────────── */
function initProgress() {
  const bar = document.getElementById("navProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
  }, { passive: true });
}

/* ── MOBILE MENU ────────────────────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById("burger");
  const menu = document.getElementById("navLinks");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("click", e => {
    if (!document.querySelector(".nav").contains(e.target)) close();
  });

  function close() {
    menu.classList.remove("open");
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
}

/* ── REVEAL ON SCROLL ───────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...(entry.target.parentElement?.querySelectorAll(".reveal:not(.visible)") || [])];
      const delay = Math.min(siblings.indexOf(entry.target) * 75, 400);
      setTimeout(() => entry.target.classList.add("visible"), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => obs.observe(el));
}

/* ── ANIMATED COUNTERS ──────────────────────────────────────── */
function initCounters() {
  const nums = document.querySelectorAll(".num__val[data-target]");
  if (!nums.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const dur = 1200;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
}

/* ── TECH ORBIT ─────────────────────────────────────────────── */
function initOrbit() {
  const track = document.getElementById("orbitTrack");
  if (!track) return;

  const TECHS = [
    { name: "React",      svg: `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="11.4" fill="#61DAFB"/><g fill="none" stroke="#61DAFB" stroke-width="6"><ellipse rx="51" ry="19.5" cx="64" cy="64"/><ellipse rx="51" ry="19.5" cx="64" cy="64" transform="rotate(60 64 64)"/><ellipse rx="51" ry="19.5" cx="64" cy="64" transform="rotate(120 64 64)"/></g></svg>` },
    { name: "Node.js",    svg: `<svg viewBox="0 0 128 128"><path fill="#83CD29" d="M112.41 32.96l-47-27.64a4.21 4.21 0 00-4.2 0l-47.02 27.64A4.2 4.2 0 0012.1 36.6v54.93a4.2 4.2 0 002.1 3.63l47.02 27.64a4.2 4.2 0 004.2 0l47.01-27.64a4.2 4.2 0 002.1-3.63V36.6a4.2 4.2 0 00-2.12-3.64z"/><text x="64" y="78" font-family="Arial" font-size="22" font-weight="900" fill="#fff" text-anchor="middle">Node</text></svg>` },
    { name: "Python",     svg: `<svg viewBox="0 0 128 128"><path fill="#3776AB" d="M63.4 2C43 2 44.6 10.8 44.6 10.8l.02 9.27h19.17v2.78H34.1S20 21.1 20 42.2s12.4 20.36 12.4 20.36H40V52.9S39.5 41.3 51.3 41.3h19.1S81.6 41.5 81.6 30.4V14.7S83.1 2 63.4 2z"/><path fill="#FFD43B" d="M64.6 126c20.4 0 18.8-8.8 18.8-8.8l-.02-9.27H64.2v-2.78h29.69S108 106.9 108 85.8c0-21.1-12.4-20.36-12.4-20.36H88v9.66S88.5 86.7 76.7 86.7H57.6s-11.1-.2-11.1 10.9v15.73S44.9 126 64.6 126z"/></svg>` },
    { name: "JavaScript", svg: `<svg viewBox="0 0 128 128"><path fill="#F0DB4F" d="M1.4 1.4h125.2v125.2H1.4z"/><path fill="#323330" d="M93.3 105.4c2.5 4.1 5.8 7.2 11.7 7.2 4.9 0 8-2.5 8-5.8 0-4.1-3.2-5.5-8.6-7.8l-3-1.3c-8.5-3.6-14.2-8.2-14.2-17.8 0-8.9 6.7-15.6 17.3-15.6 7.5 0 12.9 2.6 16.8 9.4l-9.2 5.9c-2-3.6-4.2-5.1-7.6-5.1-3.5 0-5.7 2.2-5.7 5.1 0 3.5 2.2 5 7.3 7.2l3 1.3c10 4.3 15.7 8.7 15.7 18.5 0 10.6-8.3 16.5-19.5 16.5-11 0-18-5.2-21.5-12.1l9.5-5.5zM52.3 105.7c1.8 3.2 3.5 5.8 7.5 5.8 3.8 0 6.3-1.5 6.3-7.3V67H78v37.3c0 12.2-7.2 17.7-17.6 17.7-9.4 0-14.9-4.9-17.7-10.8l9.8-5.6z"/></svg>` },
    { name: "TypeScript", svg: `<svg viewBox="0 0 128 128"><path fill="#3178C6" d="M2 63.9v55.5h124V8.4H2z"/><path fill="#fff" d="M69.7 87.6v10.9c1.8.9 3.9 1.6 6.4 2.1s5.1.7 7.8.7c2.6 0 5.1-.3 7.4-.8s4.3-1.4 6-2.6 3-2.8 4-4.7 1.4-4.3 1.4-7.1c0-2-.3-3.8-.9-5.3s-1.4-2.9-2.5-4.1-2.4-2.3-4-3.3-3.3-1.9-5.3-2.8c-1.4-.6-2.7-1.2-3.8-1.8s-2-1.1-2.8-1.7-1.4-1.2-1.8-1.9-.6-1.5-.6-2.4c0-.8.2-1.6.6-2.2s1-1.2 1.7-1.6 1.6-.8 2.5-1 2-.3 3.1-.3c0 0 4.5 0 8.6 2.1l3.4-8c-1.4-.8-3.1-1.5-5.2-2s-4.4-.8-6.9-.8c-2.6 0-5 .3-7.2.9s-4.1 1.5-5.7 2.7-2.9 2.7-3.8 4.5-1.4 3.8-1.4 6.1c0 3.9 1.1 7.1 3.3 9.4s5.5 4.3 10 5.9c1.5.5 2.9 1.1 4.1 1.7s2.2 1.2 3.1 1.9 1.5 1.4 2 2.2.7 1.7.7 2.7c0 1.8-.7 3.2-2.1 4.2s-3.4 1.5-6 1.5c-4.5 0-8.7-1.7-11.9-4.2zM47.2 60.8H61v-9.3H28.3v9.3H42v38.7h5.2V60.8z"/></svg>` },
    { name: "Next.js",    svg: `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="#000"/><path d="M106.5 114.6L44.4 36H36v56.1h7.6V46l56.9 73.2c2.1-1.4 4.1-3 6-4.6z" fill="url(#nj)"/><rect x="84.5" y="36" width="7.5" height="56" fill="#fff"/><defs><linearGradient id="nj" x1="0" x2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>` },
    { name: "PostgreSQL", svg: `<svg viewBox="0 0 128 128"><ellipse cx="64" cy="58" rx="46" ry="42" fill="#336791"/><text x="64" y="50" font-family="Arial" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">Post</text><text x="64" y="65" font-family="Arial" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">greSQL</text></svg>` },
    { name: "MongoDB",    svg: `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="#13AA52"/><path d="M64 18c-2.5 13-16 21-16 44 0 14 7.5 24 16 29 8.5-5 16-15 16-29 0-23-13.5-31-16-44z" fill="#fff"/><path d="M64 91v22" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>` },
    { name: "MySQL",      svg: `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="#00758F"/><ellipse cx="64" cy="40" rx="36" ry="14" fill="#F29111"/><path d="M28 40v20c0 8 16 14 36 14s36-6 36-14V40" stroke="#F29111" stroke-width="2" fill="none"/><text x="64" y="80" font-family="Arial" font-size="18" font-weight="800" fill="#fff" text-anchor="middle">MySQL</text></svg>` },
    { name: "Docker",     svg: `<svg viewBox="0 0 128 128"><rect x="10" y="50" width="108" height="46" rx="10" fill="#2496ED"/><rect x="20" y="58" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><rect x="40" y="58" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><rect x="60" y="58" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><rect x="80" y="58" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><rect x="40" y="38" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><rect x="60" y="38" width="16" height="12" rx="2" fill="#fff" opacity=".9"/><path d="M100 64 Q118 58 116 74" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>` },
    { name: "OpenAI",     svg: `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="#000"/><path d="M64 20a44 44 0 00-30.8 75.1L64 64V20z" fill="#fff" opacity=".85"/><path d="M64 20a44 44 0 0130.8 75.1L64 64V20z" fill="#fff" opacity=".5"/><path d="M33.2 44.9A44 44 0 0064 108V64L33.2 44.9z" fill="#fff" opacity=".65"/><path d="M94.8 44.9A44 44 0 0164 108V64l30.8-19.1z" fill="#fff" opacity=".4"/><circle cx="64" cy="64" r="10" fill="#fff"/></svg>` },
  ];

  const SIZE = 52;
  const COUNT = TECHS.length;

  TECHS.forEach((tech, i) => {
    const angle = (360 / COUNT) * i - 90;
    const rad = angle * (Math.PI / 180);
    const r = 50;
    const x = 50 + r * Math.cos(rad);
    const y = 50 + r * Math.sin(rad);

    const div = document.createElement("div");
    div.className = "orbit-icon";
    div.setAttribute("tabindex", "0");
    div.setAttribute("aria-label", tech.name);
    div.style.cssText = `left:calc(${x}% - ${SIZE / 2}px); top:calc(${y}% - ${SIZE / 2}px);`;
    div.innerHTML = `${tech.svg}<span class="tip">${tech.name}</span>`;
    track.appendChild(div);
  });
}

/* ── FAQ ────────────────────────────────────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll(".faq__item");
  items.forEach(item => {
    const btn = item.querySelector(".faq__q");
    const ans = item.querySelector(".faq__a");
    if (!btn || !ans) return;
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach(i => {
        i.classList.remove("open");
        const a = i.querySelector(".faq__a"), b = i.querySelector(".faq__q");
        if (a) a.hidden = true;
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        ans.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ── CONTACT FORM ───────────────────────────────────────────── */
function initForm() {
  const form = document.getElementById("contactForm");
  const fb = document.getElementById("cfFeedback");
  const btn = document.getElementById("submitBtn");
  if (!form) return;

  // Máscara telefone
  const tel = document.getElementById("tel");
  if (tel) {
    tel.addEventListener("input", () => {
      let v = tel.value.replace(/\D/g, "").slice(0, 11);
      if (v.length >= 7) v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      else if (v.length >= 3) v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      else v = v.replace(/^(\d{0,2})/, "($1");
      tel.value = v;
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors();
    fb.className = "cf__fb";
    fb.style.display = "none";
    if (!validate()) return;

    btn.disabled = true;
    const span = btn.querySelector("span");
    const orig = span?.textContent;
    if (span) span.textContent = "Enviando...";

    try {
  const formData = new FormData();
  formData.append("nome", document.getElementById("nome").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("telefone", document.getElementById("tel").value);
  formData.append("tipo", document.getElementById("tipo").value);
  formData.append("mensagem", document.getElementById("msg").value);

  await fetch(FORMSPREE_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });

  fb.textContent = "✓ Mensagem enviada! Entraremos em contato em até 24 horas.";
  fb.className = "cf__fb success";
  fb.style.display = "block";
  form.reset();
} catch {
  fb.textContent = "Erro ao enviar. Tente novamente ou fale pelo WhatsApp.";
  fb.className = "cf__fb err";
  fb.style.display = "block";
} finally {
  btn.disabled = false;
  if (span) span.textContent = orig;
  fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

  function validate() {
    let ok = true;
    const n = document.getElementById("nome");
    const e = document.getElementById("email");
    const t = document.getElementById("tel");
    const tp = document.getElementById("tipo");
    const m = document.getElementById("msg");
    if (!n.value.trim() || n.value.trim().length < 3) { setErr(n,"nomeErr","Informe seu nome completo."); ok=false; }
    if (!e.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value)) { setErr(e,"emailErr","E-mail inválido."); ok=false; }
    if (!t.value.trim() || t.value.replace(/\D/g,"").length < 10) { setErr(t,"telErr","WhatsApp inválido."); ok=false; }
    if (!tp.value) { setErr(tp,"tipoErr","Selecione uma opção."); ok=false; }
    if (!m.value.trim() || m.value.trim().length < 20) { setErr(m,"msgErr","Mínimo de 20 caracteres."); ok=false; }
    return ok;
  }

  function setErr(f, id, msg) {
    f.classList.add("error");
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
    form.querySelectorAll(".cf__err").forEach(el => el.textContent = "");
  }
}

/* ── BACK TO TOP ────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById("btt");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 400), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ── SMOOTH SCROLL ──────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
    });
  });
}
