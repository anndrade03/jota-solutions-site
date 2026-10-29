/* ============================================================
   JOTA SOLUTIONS — script.js
   ============================================================ */
"use strict";

/* ════════════════════════════════════════════════════════════
   CONFIGURAÇÃO — preencha os IDs quando criar as contas.
   Campo vazio = script não carrega (site fica mais leve).
   ════════════════════════════════════════════════════════════ */
const CONFIG = {
  GTM_ID:        "",   // ex.: "GTM-XXXXXXX"  (se usar o Tag Manager, deixe os 3 abaixo vazios)
  GA4_ID:        "",   // ex.: "G-XXXXXXXXXX"
  GADS_ID:       "",   // ex.: "AW-123456789"
  GADS_LABEL_WA:   "", // rótulo da conversão "Clique no WhatsApp"
  GADS_LABEL_FORM: "", // rótulo da conversão "Formulário enviado"
  META_PIXEL_ID: "",   // ex.: "123456789012345"
  FORM_URL: "https://script.google.com/macros/s/AKfycbwp-przzCg0uVCR-Vw51A8cnRsHfLJ_BWTGZZ25-azowYOIZEWLOd_A16-Gwt5GgKs/exec",
  WA_NUMBER: "5514996969391",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer  = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

document.documentElement.classList.add("js");

/* ── Armazenamento seguro (navegação anônima pode bloquear) ── */
const store = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ════════════════════════════════════════════════════════════
   1. ATRIBUIÇÃO — guarda de onde veio o visitante (UTM, gclid, fbclid)
   ════════════════════════════════════════════════════════════ */
const ATTR = (() => {
  const p = new URLSearchParams(location.search);
  const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","s"];
  const fresh = {};
  keys.forEach(k => { if (p.get(k)) fresh[k] = p.get(k).slice(0, 120); });
  if (Object.keys(fresh).length) {
    fresh.landing = location.pathname + location.search;
    store.set("jota_attr", fresh);
    return fresh;
  }
  return store.get("jota_attr") || {};
})();

function attrLabel() {
  if (ATTR.gclid && !ATTR.utm_source) return "google-ads";
  if (ATTR.fbclid && !ATTR.utm_source) return "meta-ads";
  if (!ATTR.utm_source) return "";
  return [ATTR.utm_source, ATTR.utm_medium, ATTR.utm_campaign].filter(Boolean).join(" / ");
}

/* ════════════════════════════════════════════════════════════
   2. RASTREAMENTO — GA4, Google Ads, Meta Pixel, GTM
   ════════════════════════════════════════════════════════════ */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

function loadScript(src) {
  const s = document.createElement("script");
  s.async = true; s.src = src; document.head.appendChild(s);
}

function initTracking() {
  if (CONFIG.GTM_ID) {
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${CONFIG.GTM_ID}`);
  }
  const gId = CONFIG.GA4_ID || CONFIG.GADS_ID;
  if (gId && !CONFIG.GTM_ID) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gId}`);
    gtag("js", new Date());
    if (CONFIG.GA4_ID)  gtag("config", CONFIG.GA4_ID);
    if (CONFIG.GADS_ID) gtag("config", CONFIG.GADS_ID);
  }
  if (CONFIG.META_PIXEL_ID && !CONFIG.GTM_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", CONFIG.META_PIXEL_ID);
    fbq("track", "PageView");
  }
}

/**
 * Dispara um evento em todas as ferramentas configuradas.
 * type: "whatsapp" | "instagram" | "form" | "email" | "case"
 */
function track(type, loc = "") {
  const params = { location: loc, origem: attrLabel() || "direto" };
  dataLayer.push({ event: `jota_${type}`, ...params });

  if (typeof window.gtag === "function" && (CONFIG.GA4_ID || CONFIG.GADS_ID) && !CONFIG.GTM_ID) {
    const ga4Name = { whatsapp: "contact_whatsapp", instagram: "click_instagram", form: "generate_lead", email: "contact_email", case: "view_case" }[type];
    if (CONFIG.GA4_ID) gtag("event", ga4Name, params);
    if (CONFIG.GADS_ID) {
      if (type === "whatsapp" && CONFIG.GADS_LABEL_WA)   gtag("event", "conversion", { send_to: `${CONFIG.GADS_ID}/${CONFIG.GADS_LABEL_WA}` });
      if (type === "form"     && CONFIG.GADS_LABEL_FORM) gtag("event", "conversion", { send_to: `${CONFIG.GADS_ID}/${CONFIG.GADS_LABEL_FORM}` });
    }
  }
  if (typeof window.fbq === "function") {
    if (type === "whatsapp") fbq("track", "Contact", params);
    if (type === "form")     fbq("track", "Lead", params);
    if (type === "instagram") fbq("trackCustom", "InstagramClick", params);
  }
}

/* Cliques em WhatsApp/Instagram/e-mail/cases + origem na mensagem do WhatsApp */
function initClickTracking() {
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const loc = a.dataset.loc || a.closest("section")?.id || "";

    if (href.includes("wa.me")) {
      const label = attrLabel();
      if (label) {
        const url = new URL(a.href);
        const text = url.searchParams.get("text") || "Olá! Vim pelo site da Jota Solutions.";
        if (!text.includes("[origem:")) url.searchParams.set("text", `${text} [origem: ${label}]`);
        a.href = url.toString();
      }
      track("whatsapp", loc);
    } else if (href.includes("instagram.com")) track("instagram", loc);
    else if (href.startsWith("mailto:")) track("email", loc);
    else if (a.classList.contains("case")) track("case", loc);
  });
}

/* ════════════════════════════════════════════════════════════
   3. MENSAGEM POR CAMPANHA — ?s=site | chatbot | automacao | skill
   Use no link do anúncio para o título combinar com o anúncio.
   ════════════════════════════════════════════════════════════ */
const VARIANTS = {
  site: {
    h1: 'Um site profissional que transforma visitas em <span class="hl">clientes no WhatsApp.</span>',
    lead: "Rápido, pronto para o Google e feito para o seu cliente chamar você — com cases reais no ar.",
    cta: "Quero um site para meu negócio",
  },
  chatbot: {
    h1: 'Um chatbot com IA que atende seus clientes <span class="hl">24 horas por dia.</span>',
    lead: "Responde dúvidas, qualifica e agenda no WhatsApp enquanto você foca no que importa.",
    cta: "Quero um chatbot no meu WhatsApp",
  },
  automacao: {
    h1: 'Automações que acabam com o trabalho manual e <span class="hl">economizam horas.</span>',
    lead: "Planilhas, CRM, e-mails e avisos rodando sozinhos, sem erro e sem retrabalho.",
    cta: "Quero automatizar minha empresa",
  },
  skill: {
    h1: 'IA treinada no jeito da sua empresa para <span class="hl">produzir muito mais.</span>',
    lead: "Propostas, contratos, posts e análises prontos em segundos, no seu padrão.",
    cta: "Quero uma skill personalizada",
  },
};

function initVariant() {
  const key = (ATTR.s || "").toLowerCase();
  const v = VARIANTS[key];
  if (!v) return;
  document.getElementById("heroTitle").innerHTML = v.h1;
  document.getElementById("heroLead").textContent = v.lead;
  const cta = document.getElementById("heroCta");
  cta.lastChild.textContent = " " + v.cta;
  cta.href = `https://wa.me/${CONFIG.WA_NUMBER}?text=` + encodeURIComponent(`Olá! ${v.cta}.`);
  const radio = document.querySelector(`input[name=tipo][value="${key}"]`);
  if (radio) radio.checked = true;
}

/* ════════════════════════════════════════════════════════════
   4. INTERFACE
   ════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById("nav");
  const bar = document.getElementById("navProgress");
  const menu = document.getElementById("navLinks");
  let lastY = window.scrollY, ticking = false;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    // esconde a barra ao descer, mostra ao subir
    nav.classList.toggle("hide", y > 500 && y > lastY + 4 && !menu.classList.contains("open"));
    if (y < lastY - 4 || y < 500) nav.classList.remove("hide");
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();

  // destaca o link da seção atual
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => obs.observe(s));
  }
}

function initMenu() {
  const btn = document.getElementById("burger");
  const menu = document.getElementById("navLinks");
  const set = open => {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  btn.addEventListener("click", () => set(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const group = [...entry.target.parentElement.children].filter(c => c.classList.contains("reveal"));
      const delay = Math.min(group.indexOf(entry.target) * 90, 400);
      setTimeout(() => entry.target.classList.add("in"), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => obs.observe(el));
}

/* Navegador do hero alternando entre os cases */
function initHeroScreens() {
  const screen = document.getElementById("heroScreen");
  const url = document.getElementById("heroUrl");
  const kicker = document.getElementById("heroKicker");
  const title = document.getElementById("heroScreenTitle");
  const auto = document.getElementById("autoTitle");
  const SCREENS = [
    { url: "danilomotosmarilia.com.br",     kicker: "Loja de motos · Marília-SP", title: "Estoque online com busca por marca e preço", auto: "Lead salvo no CRM" },
    { url: "gomesdeoliveiramustafa.com.br", kicker: "Advocacia · Marília-SP",     title: "Consultas agendadas direto pelo site",        auto: "Consulta agendada" },
    { url: "visagismo360.com.br",           kicker: "Consultoria online",         title: "Página de vendas com pagamento integrado",    auto: "Pagamento aprovado" },
    { url: "lipsen.com.br",                 kicker: "Página de vendas",           title: "Visitante virando cliente em poucos cliques", auto: "Novo pedido recebido" },
  ];
  if (reduceMotion) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % SCREENS.length;
    screen.classList.add("swap");
    auto.style.opacity = 0;
    setTimeout(() => {
      url.textContent = SCREENS[i].url;
      kicker.textContent = SCREENS[i].kicker;
      title.textContent = SCREENS[i].title;
      auto.textContent = SCREENS[i].auto;
      screen.classList.remove("swap");
      auto.style.opacity = 1;
    }, 350);
  }, 4000);
}

/* Conversa do chatbot digitando em loop */
function initChat() {
  const box = document.getElementById("chat");
  const SCRIPT = [
    ["in",  "Oi! Vocês têm horário amanhã?"],
    ["out", "Tenho às 10h e às 15h. Qual prefere? 🙂"],
    ["in",  "15h, por favor!"],
    ["out", "Agendado ✅ Te lembro amanhã cedo."],
  ];
  const add = (cls, html) => {
    const el = document.createElement("div");
    el.className = cls; el.innerHTML = html;
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    return el;
  };
  if (reduceMotion) { SCRIPT.slice(0, 2).forEach(([w, t]) => add(`bubble bubble--${w}`, t)); return; }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function loop() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      for (const [who, text] of SCRIPT) {
        if (who === "out") {
          const t = add("bubble bubble--out typing", "<i></i><i></i><i></i>");
          await wait(1100);
          t.remove();
        }
        add(`bubble bubble--${who}`, text);
        await wait(1500);
      }
      await wait(1800);
      box.innerHTML = "";
    }
  })();
}

/* Luz que segue o mouse no hero */
function initSpotlight() {
  if (!finePointer || reduceMotion) return;
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

/* Brilho nas bordas dos cartões */
function initGlow() {
  if (!finePointer) return;
  document.querySelectorAll(".glow").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  });
}

/* Inclinação 3D */
function initTilt() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll(".tilt").forEach(el => {
    const max = el.classList.contains("browser") ? 8 : 5;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* Botões magnéticos */
function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .25;
      const y = (e.clientY - r.top - r.height / 2) * .35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* Faixa de clientes infinita */
function initMarquee() {
  const track = document.getElementById("marquee");
  if (!track || reduceMotion) return;
  [...track.children].forEach(li => {
    const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c);
  });
  // repete até preencher telas largas
  while (track.scrollWidth < innerWidth * 2.2) {
    [...track.children].slice(0, 8).forEach(li => { const c = li.cloneNode(true); c.setAttribute("aria-hidden","true"); track.appendChild(c); });
  }
}

/* Linha da seção "Como funciona" */
function initSteps() {
  const steps = document.getElementById("steps");
  if (!steps) return;
  if (reduceMotion || !("IntersectionObserver" in window)) { steps.classList.add("in"); return; }
  const obs = new IntersectionObserver(([en]) => { if (en.isIntersecting) { steps.classList.add("in"); obs.disconnect(); } }, { threshold: .35 });
  obs.observe(steps);
}

/* FAQ: só uma resposta aberta por vez */
function initFaq() {
  const items = document.querySelectorAll(".faq details");
  items.forEach(d => d.addEventListener("toggle", () => {
    if (d.open) items.forEach(o => { if (o !== d) o.open = false; });
  }));
}

/* "Qual é o seu tipo de negócio?" */
function initBusiness() {
  const tabs = [...document.querySelectorAll(".biz__tabs [role=tab]")];
  const problem = document.getElementById("bizProblem");
  const list = document.getElementById("bizList");
  const cta = document.getElementById("bizCta");

  const DATA = {
    loja: { nome: "loja / comércio",
      problem: "Cliente pergunta preço e estoque no WhatsApp o dia todo e a equipe não dá conta.",
      items: [["Site com catálogo", "e filtro por produto e preço"], ["Chatbot", "que responde estoque e formas de pagamento"], ["Automação", "que avisa a equipe quando chega cliente quente"]] },
    servicos: { nome: "prestador de serviço",
      problem: "Você perde tempo confirmando horários e respondendo as mesmas perguntas.",
      items: [["Chatbot com IA", "que agenda, confirma e lembra o cliente"], ["Site", "que mostra seu trabalho e leva direto ao WhatsApp"], ["Automação", "de lembretes e pós-atendimento"]] },
    escritorio: { nome: "escritório / clínica",
      problem: "Novos clientes não te encontram no Google e a triagem toma o dia da equipe.",
      items: [["Site institucional", "que passa autoridade e aparece no Google"], ["Formulário + automação", "que organiza cada contato na planilha ou CRM"], ["Skill personalizada", "que redige documentos e propostas no seu padrão"]] },
    digital: { nome: "infoproduto / consultoria",
      problem: "Você vende online, mas a página não converte e a entrega é toda manual.",
      items: [["Página de vendas", "rápida e com checkout integrado"], ["Automação", "que envia acesso, formulário e lembretes após a compra"], ["Chatbot com IA", "que responde objeções e recupera vendas"]] },
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

  function render(key) {
    const d = DATA[key];
    problem.textContent = d.problem;
    problem.style.animation = "none"; void problem.offsetWidth; problem.style.animation = "";
    list.innerHTML = d.items.map(([b, t]) => `<li><b>${esc(b)}</b> ${esc(t)}</li>`).join("");
    cta.href = `https://wa.me/${CONFIG.WA_NUMBER}?text=` + encodeURIComponent(`Olá! Tenho um negócio do tipo ${d.nome} e quero saber qual solução faz sentido para mim.`);
    cta.dataset.loc = `negocio-${key}`;
  }
  function select(tab, focus) {
    tabs.forEach(t => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) tab.focus();
    render(tab.dataset.biz);
  }
  tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", e => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      select(tabs[(idx + dir + tabs.length) % tabs.length], true);
    });
  });
  render("loja");
}

/* ════════════════════════════════════════════════════════════
   5. FORMULÁRIO (envia para a planilha + dispara conversão)
   ════════════════════════════════════════════════════════════ */
function initForm() {
  const form = document.getElementById("contactForm");
  const fb = document.getElementById("cfFeedback");
  const btn = document.getElementById("submitBtn");
  const tel = document.getElementById("tel");
  const label = btn.querySelector("span");
  const original = label.textContent;

  tel.addEventListener("input", () => {
    let v = tel.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, (m, a, b, c) => `(${a}) ${b}-${c}`);
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/, "($1) $2");
    else if (v.length) v = `(${v}`;
    tel.value = v;
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors();
    fb.className = "form__fb";
    if (form.empresa_site.value) return;          // robô preencheu o campo invisível
    if (!validate()) return;

    btn.disabled = true;
    label.textContent = "Enviando...";

    const tipo = form.querySelector("input[name=tipo]:checked").value;
    const data = new FormData();
    data.append("nome", form.nome.value.trim());
    data.append("email", "");
    data.append("telefone", form.telefone.value.trim());
    data.append("tipo", tipo);
    data.append("mensagem", form.mensagem.value.trim());
    data.append("origem", attrLabel() || "direto");
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","landing"]
      .forEach(k => data.append(k, ATTR[k] || ""));

    try {
      await fetch(CONFIG.FORM_URL, { method: "POST", mode: "no-cors", body: data });
      track("form", tipo);
      fb.textContent = "✓ Recebemos! Vamos te chamar no WhatsApp em breve.";
      fb.className = "form__fb ok";
      form.reset();
    } catch {
      fb.textContent = "Não foi possível enviar. Fale com a gente direto pelo WhatsApp.";
      fb.className = "form__fb err";
    } finally {
      btn.disabled = false;
      label.textContent = original;
    }
  });

  function validate() {
    let ok = true;
    if (form.nome.value.trim().length < 2) { setErr(form.nome, "nomeErr", "Informe seu nome."); ok = false; }
    if (tel.value.replace(/\D/g, "").length < 10) { setErr(tel, "telErr", "Informe um WhatsApp com DDD."); ok = false; }
    if (!form.querySelector("input[name=tipo]:checked")) { setErr(null, "tipoErr", "Escolha uma opção."); ok = false; }
    if (!ok) form.querySelector(".error, .field__err:not(:empty)")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return ok;
  }
  function setErr(input, id, msg) {
    if (input) { input.classList.remove("error"); void input.offsetWidth; input.classList.add("error"); }
    document.getElementById(id).textContent = msg;
  }
  function clearErrors() {
    form.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
    form.querySelectorAll(".field__err").forEach(el => (el.textContent = ""));
  }
}

/* ════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initVariant();
  initNav();
  initMenu();
  initReveal();
  initHeroScreens();
  initChat();
  initSpotlight();
  initGlow();
  initTilt();
  initMagnetic();
  initMarquee();
  initSteps();
  initFaq();
  initBusiness();
  initForm();
  initClickTracking();
  document.getElementById("yr").textContent = new Date().getFullYear();
  // carrega rastreamento depois da página pronta (não pesa no carregamento)
  if ("requestIdleCallback" in window) requestIdleCallback(initTracking, { timeout: 2500 });
  else setTimeout(initTracking, 1500);
});
