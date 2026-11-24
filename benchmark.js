// Arandu site V5 · Benchmark report tab.
// Motion layer shared with the home page (reveal, counters, pointer effects) plus the report charts.
// Charts use Apache ECharts and start their entrance animation when they scroll into view.
document.documentElement.classList.add("js");
const finePointer = window.matchMedia("(pointer: fine)").matches;
const small = () => window.innerWidth < 760;
// V6 language: benchmark.pt-br.html loads this same script with <html lang="pt-BR">.
const LANG = document.documentElement.lang.toLowerCase().startsWith("pt") ? "pt" : "en";
const tr = (en, pt) => (LANG === "pt" ? pt : en);
const LOCALE = tr("en-US", "pt-BR");

/* =================================================================
   Data access
   ================================================================= */
const B = window.BENCH;
const K = Object.fromEntries(B.turnKeys.map((k, i) => [k, i]));
const DK = Object.fromEntries(B.dispKeys.map((k, i) => [k, i]));
const T = B.turns;
const D = B.dispatches;
const S = B.scenarios;
const css = getComputedStyle(document.documentElement);
const MC = [0, 1, 2].map((i) => css.getPropertyValue(`--m${i}`).trim());
const MN = ["Gemini 3.5 Flash Lite", "GPT-OSS 120B", "GPT-OSS 20B"];
const MS = ["Gemini", "GPT-OSS 120B", "GPT-OSS 20B"];
const PH = ["--ph-local", "--ph-net", "--ph-prov", "--ph-retry"].map((v) => css.getPropertyValue(v).trim());
const PHN = tr(["Arandu & Unity", "Network & front end", "Provider processing", "Rate-limit wait"],
  ["Arandu e Unity", "Rede e front end", "Processamento do provedor", "Espera de rate limit"]);
const INK = "#ece9ff", MUTED = "#a7a3cc", FAINT = "#7d79a8";
const SCEN_TXT = LANG === "pt" ? {
  PlainText: ["Prompt curto", "“Cite um benefício dos testes automatizados.” Uma resposta curta.", 1],
  LongInput: ["Documento longo", "Um documento de 96 seções (cerca de 3,5K tokens) e a pergunta: qual é a última seção?", 1],
  StructuredOutput: ["Resposta em JSON", "A resposta precisa seguir um JSON schema com uma resposta e uma confiança.", 1],
  SingleReadTool: ["Uma tool call", "Usar a tool de consulta para ler o valor da chave alpha (7) e informá-lo.", 1],
  ToolChain: ["Cadeia de tools", "Consultar alpha, beta e gamma, uma por vez, e depois dar a soma (31).", 1],
  MutationTool: ["Mudar o estado do jogo", "Somar 3 a um contador com a tool de contador. Exige um receipt e uma re-checagem.", 1],
  SkillSwitch: ["Troca de Skill", "Descrever um pôr do sol com uma Skill concisa e depois com uma Skill detalhada.", 2],
  ContextPressure: ["Conversa longa", "Sete mensagens grandes numa só Session, com os resumos de context ativados.", 7],
  MultiTurnSession: ["Memória", "Guardar uma palavra-código, responder 2 + 2 e depois lembrar a palavra-código.", 3],
  Cancellation: ["Cancelamento", "Pedir uma redação de 400 palavras e cancelá-la depois de 800 ms.", 1],
} : {
  PlainText: ["Short prompt", "“Name one benefit of automated testing.” One short answer.", 1],
  LongInput: ["Long document", "A 96-section document (about 3.5K tokens) and the question: which section is last?", 1],
  StructuredOutput: ["JSON answer", "The answer must follow a JSON schema with an answer and a confidence.", 1],
  SingleReadTool: ["One tool call", "Use the lookup tool to read the value of key alpha (7) and state it.", 1],
  ToolChain: ["Tool chain", "Look up alpha, beta and gamma one at a time, then give the sum (31).", 1],
  MutationTool: ["Change game state", "Add 3 to a counter with the counter tool. Needs a receipt and a re-check.", 1],
  SkillSwitch: ["Skill switch", "Describe a sunset with a terse skill, then again with a detailed skill.", 2],
  ContextPressure: ["Long conversation", "Seven large messages in one session, with context summaries turned on.", 7],
  MultiTurnSession: ["Memory", "Remember a code word, answer 2 + 2, then recall the code word.", 3],
  Cancellation: ["Cancel", "Ask for a 400-word essay and cancel it after 800 ms.", 1],
};
const turnsOf = (m, s) => T.filter((t) => t[K.m] === m && (s === undefined || t[K.s] === s));
const quant = (arr, p) => {
  const v = [...arr].sort((a, b) => a - b);
  if (!v.length) return null;
  const k = (v.length - 1) * p, f = Math.floor(k), c = Math.min(f + 1, v.length - 1);
  return v[f] + (v[c] - v[f]) * (k - f);
};
const med = (a) => quant(a, 0.5);
const fmt = (n, d = 0) => Number(n).toLocaleString(LOCALE, { maximumFractionDigits: d, minimumFractionDigits: d });
const fmtMs = (ms) => (ms >= 10000 ? `${fmt(ms / 1000, 1)} s` : ms >= 1000 ? `${fmt(ms / 1000, 2)} s` : `${fmt(ms, ms < 10 ? 1 : 0)} ms`);
const pctTxt = (x, d = 0) => `${fmt(x * 100, d)}%`;
const dot = (m) => `<i class="mdot" style="background:${MC[m]}"></i>`;
const camel = (s) => s.replace(/([a-z])([A-Z])/g, "$1\n$2");
const noRetry = (t) => t[K.client] - t[K.retry];
// Turns that ran while Unity was minimized (Editor throttled) are left out of every timing statistic.
const timed = (t) => t[K.status] !== "UnsupportedCapability" && !t[K.paused];
// Deterministic jitter so dots do not jump between renders.
const jit = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 - 0.5;

/* =================================================================
   Motion layer (same behavior as the home page)
   ================================================================= */
const splitWords = (el) => {
  let k = 0;
  const wrap = (node) => {
    const w = document.createElement("span"); w.className = "w";
    const wi = document.createElement("span"); wi.className = "wi"; wi.style.setProperty("--wi", k++);
    wi.appendChild(node); w.appendChild(wi); return w;
  };
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(document.createTextNode(part)));
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== "BR") {
      n.replaceWith(wrap(n.cloneNode(true)));
    }
  });
};
document.querySelectorAll(".section-head h2").forEach(splitWords);
const h1 = document.querySelector(".bhero h1");
if (h1) { splitWords(h1); h1.classList.remove("anim-in"); requestAnimationFrame(() => setTimeout(() => h1.classList.add("split-in"), 200)); }
document.querySelectorAll(".anim-in").forEach((el) => el.addEventListener("animationend", (e) => {
  if (e.target !== el) return;
  el.style.opacity = "1"; el.classList.remove("anim-in");
}));

const countUp = (el) => {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = Number(el.dataset.count), dec = Number(el.dataset.dec || 0);
  const dur = 1400 + Math.min(target, 500);
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)), dec);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const applyStagger = () => {
  document.querySelectorAll(".stagger").forEach((group) => {
    [...group.children].forEach((el, i) => el.style.setProperty("--sd", `${i * 90}ms`));
  });
  document.querySelectorAll(".bstats .stat").forEach((el, i) => el.style.setProperty("--sd", `${i * 110}ms`));
};
const onVisible = (el) => {
  el.classList.add("visible");
  el.querySelectorAll("[data-count]").forEach(countUp);
  const sd = parseInt(getComputedStyle(el).getPropertyValue("--sd")) || 0;
  setTimeout(() => el.classList.add("settled"), 1200 + sd);
};
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { onVisible(e.target); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

/* Scroll progress, top bar, contents highlight */
const topbar = document.querySelector(".topbar");
const bar = document.querySelector(".scroll-progress i");
const orbs = [...document.querySelectorAll(".bg-orbs")];
const tocLinks = [...document.querySelectorAll(".toc a")];
const tocTargets = tocLinks.map((a) => document.querySelector(a.getAttribute("href")));
let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  topbar.classList.toggle("scrolled", y > 10);
  let current = -1;
  tocTargets.forEach((s, i) => { if (s && s.offsetTop <= y + 140) current = i; });
  tocLinks.forEach((a, i) => a.classList.toggle("on", i === current));
  orbs.forEach((o) => { o.style.transform = `translate3d(0, ${-y * 0.06}px, 0)`; });
};
window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener("resize", onScroll);

/* Mobile menu */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
}));

/* Header network canvas (pre-rendered glow sprites) */
const canvas = document.getElementById("bnet");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const colors = ["192,132,252", "96,165,250", "56,189,248", "167,139,250"];
  const sprites = colors.map((c) => {
    const s = document.createElement("canvas"); s.width = s.height = 32;
    const g = s.getContext("2d"); const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.18, `rgba(${c},1)`); grd.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32); return s;
  });
  let w, h, pts, running = true;
  const mouse = { x: -9999, y: -9999 };
  const LINK2 = 130 * 130;
  const init = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(small() ? 30 : 64, (w * h) / 17000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      s: Math.random() * 10 + 8, c: (Math.random() * colors.length) | 0,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22500) { const d = Math.sqrt(d2) || 1; p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK2) {
          ctx.strokeStyle = `rgba(${colors[a.c]},${(1 - d2 / LINK2) * .3})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = "lighter";
    for (const p of pts) ctx.drawImage(sprites[p.c], p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    ctx.globalCompositeOperation = "source-over";
    if (running) requestAnimationFrame(draw);
  };
  init(); draw();
  window.addEventListener("resize", init);
  const host = canvas.parentElement;
  host.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  host.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) draw(); }).observe(canvas);
}

/* Pointer effects: glow, spotlight, tilt, magnetic buttons */
const pointerFx = () => {
  if (!finePointer) return;
  const glow = document.querySelector(".cursor-glow");
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowOn = false;
  const glowLoop = () => {
    gx += (tx - gx) * .12; gy += (ty - gy) * .12;
    glow.style.transform = `translate3d(${gx - 210}px, ${gy - 210}px, 0)`;
    if (Math.abs(tx - gx) + Math.abs(ty - gy) > .5) requestAnimationFrame(glowLoop); else glowOn = false;
  };
  document.addEventListener("pointermove", (e) => {
    document.body.classList.add("has-pointer");
    tx = e.clientX; ty = e.clientY;
    if (!glowOn) { glowOn = true; requestAnimationFrame(glowLoop); }
    const el = e.target.closest && e.target.closest(".spot");
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  }, { passive: true });
  document.querySelectorAll(".card, .finding, .stat, .passc, .scen").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translate3d(0, -6px, 0)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate3d(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px, 0)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
};

/* =================================================================
   Static report blocks built from the data
   ================================================================= */
const buildLegends = () => {
  document.querySelectorAll(".model-legend").forEach((el) => {
    el.innerHTML = MN.map((n, i) => `<span><i style="--c:${MC[i]}"></i>${n}</span>`).join("");
  });
  document.querySelectorAll(".phase-legend").forEach((el) => {
    el.innerHTML = PHN.map((n, i) => `<span><i style="--c:${PH[i]}"></i>${n}</span>`).join("");
  });
};

const buildSetup = () => {
  const body = document.querySelector("#setup-table tbody");
  body.innerHTML = B.models.map((m, i) => `<tr>
    <td>${m.adapter === "gemini" ? "Gemini" : "Groq"}</td>
    <td>${dot(i)}<b>${MN[i]}</b> <code>${m.id}</code></td>
    <td>${fmt(m.delay / 1000, 1)} s</td>
    <td>${fmt(m.inLimit / 1024, 0)}K tokens</td>
    <td>${m.records}</td>
    <td>${fmt(m.activeMin, 1)} min${m.pausedMin ? `<br><span class="faint">+ ${fmt(m.pausedMin, 1)} min ${tr("paused", "em pausa")}</span>` : ""}</td></tr>`).join("");
};

const buildScenarios = () => {
  document.getElementById("scen-grid").innerHTML = S.map((s, i) => {
    const [title, text, turns] = SCEN_TXT[s];
    return `<div class="scen reveal"><code>${s}</code><h4>${title}</h4><p>${text}</p><span class="turns">${tr(`${turns} turn${turns > 1 ? "s" : ""} × 5 repeats`, `${turns} turno${turns > 1 ? "s" : ""} × 5 repetições`)}</span></div>`;
  }).join("");
};

const FAIL_WHY = {
  ...(LANG === "pt" ? {
  "0|StructuredOutput": ["Rejeitado em cerca de 1 ms, antes de qualquer chamada de rede. O schema usa <code>maxLength</code>, que o adapter do Gemini se recusa a enviar.", "adapter", "Adapter"],
  "0|ToolChain|2": ["Rate limit duas vezes. O segundo <code>Retry-After</code> pediu 58 s, mais do que restava do prazo de 60 s do turno.", "provider", "Limite do provedor"],
  "2|ToolChain|1": ["Depois de duas consultas, a tool call do modelo veio num formato que o adapter rejeitou (<code>InvalidResponse</code>, sem retry).", "adapter", "Modelo / adapter"],
  "2|ToolChain|4": ["Quatro erros de rate limit seguidos. A execução terminou como <code>ModelUnavailable</code> depois de 3 retries.", "provider", "Limite do provedor"],
  "1|Cancellation|2": ["O modelo recusou a redação em 709 ms, então o turno terminou antes de o cancelamento chegar aos 800 ms.", "design", "Desenho do benchmark"],
  } : {
  "0|StructuredOutput": ["Rejected in about 1 ms, before any network call. The schema uses <code>maxLength</code>, which the Gemini adapter refuses to send.", "adapter", "Adapter"],
  "0|ToolChain|2": ["Rate-limited twice. The second <code>Retry-After</code> asked for 58 s, more than the 60 s turn deadline had left.", "provider", "Provider limit"],
  "2|ToolChain|1": ["After two lookups, the model's tool call came back in a form the adapter rejected (<code>InvalidResponse</code>, not retried).", "adapter", "Model / adapter"],
  "2|ToolChain|4": ["Four rate-limit errors in a row. The run ended as <code>ModelUnavailable</code> after 3 retries.", "provider", "Provider limit"],
  "1|Cancellation|2": ["The model refused the essay in 709 ms, so the turn completed before the 800 ms cancel arrived.", "design", "Benchmark design"],
  }),
};
const buildFailTable = () => {
  const fails = T.filter((t) => !t[K.met]);
  const rows = [];
  const gem = fails.filter((t) => t[K.m] === 0 && S[t[K.s]] === "StructuredOutput");
  if (gem.length) rows.push([0, "StructuredOutput", gem.map((t) => t[K.rep]).join(", "), gem[0][K.status], FAIL_WHY["0|StructuredOutput"]]);
  fails.filter((t) => !(t[K.m] === 0 && S[t[K.s]] === "StructuredOutput")).forEach((t) => {
    rows.push([t[K.m], S[t[K.s]], t[K.rep], t[K.status], FAIL_WHY[`${t[K.m]}|${S[t[K.s]]}|${t[K.rep]}`] || [tr("See the exported record.", "Veja o registro exportado."), "design", tr("Other", "Outro")]]);
  });
  document.querySelector("#fail-table tbody").innerHTML = rows.map(([m, s, rep, st, [why, cls, who]]) =>
    `<tr><td>${dot(m)}${MS[m]}</td><td><code>${s}</code></td><td>${rep}</td><td><code>${st}</code></td><td>${why}</td><td><span class="who ${cls}">${who}</span></td></tr>`).join("");
};

const buildPassRow = () => {
  document.getElementById("pass-row").innerHTML = [0, 1, 2].map((m) => {
    const a = B.stats[m]._all;
    let reps = 0, repsOk = 0;
    S.forEach((s) => { reps += B.stats[m][s].reps; repsOk += B.stats[m][s].repsOk; });
    return `<div class="passc reveal" style="--c:${MC[m]}">
      <header>${dot(m)}${MN[m]}</header>
      <div class="big">${a.met}/${a.n}<small>${tr("turns passed", "turnos aprovados")} (${pctTxt(a.met / a.n, 1)})</small></div>
      <div class="wil" aria-label="${tr("95% interval", "intervalo de 95%")} ${pctTxt(a.lo, 0)} ${tr("to", "a")} ${pctTxt(a.hi, 0)}"><i style="left:${a.lo * 100}%;width:${(a.hi - a.lo) * 100}%"></i><u style="left:calc(${(a.met / a.n) * 100}% - 1px)"></u></div>
      <div class="wil-scale"><span>0%</span><span>${tr("95% interval", "intervalo de 95%")} ${pctTxt(a.lo)}–${pctTxt(a.hi)}</span><span>100%</span></div>
      <p>${tr(`pass^5: ${repsOk} of ${reps} scenario runs passed on every turn.`, `pass^5: ${repsOk} de ${reps} execuções de cenário passaram em todos os turnos.`)}</p></div>`;
  }).join("");
};

const buildCliff = () => {
  const pairs = [["0-1", "Gemini vs 120B"], ["0-2", "Gemini vs 20B"], ["1-2", "120B vs 20B"]];
  const cls = { large: "lg", medium: "md", small: "sm", negligible: "" };
  let html = `<thead><tr><th>${tr("Scenario", "Cenário")}</th>${pairs.map((p) => `<th>${p[1]}</th>`).join("")}</tr></thead><tbody>`;
  S.forEach((s) => {
    html += `<tr><td><code>${s}</code></td>`;
    pairs.forEach(([k]) => {
      const c = B.cliff[s][k];
      if (s === "Cancellation") { html += `<td class="cd">–<span>${tr("not compared: cancel fixed at 800 ms", "não comparado: cancelamento fixo em 800 ms")}</span></td>`; return; }
      if (c.noRetry === null || c.nA < 3 || c.nB < 3) { html += `<td class="cd">–<span>${c.nA === 0 || c.nB === 0 ? tr("no completed turns for Gemini", "nenhum turno concluído no Gemini") : tr("not enough turns", "turnos insuficientes")}</span></td>`; return; }
      const v = c.noRetry;
      const faster = v > 0 ? (k[2] === "1" ? "120B" : "20B") : v < 0 ? (k[0] === "0" ? "Gemini" : "120B") : "tie";
      html += `<td class="cd ${cls[c.magNoRetry]}">${v > 0 ? "+" : ""}${v.toFixed(2)}<span>${tr(c.magNoRetry, { large: "grande", medium: "médio", small: "pequeno", negligible: "desprezível" }[c.magNoRetry] || c.magNoRetry)}${v !== 0 ? tr(`, ${faster} faster`, `, ${faster} mais rápido`) : ""}</span></td>`;
    });
    html += "</tr>";
  });
  document.getElementById("cliff-table").innerHTML = html + "</tbody>";
};

const provStats = (m) => {
  const ok = D.filter((x) => x[DK.m] === m && x[DK.kind] === "modelDispatch" && x[DK.task] === "RanToCompletion");
  return ok;
};
const buildProvTable = () => {
  document.querySelector("#prov-table tbody").innerHTML = [0, 1, 2].map((m) => {
    const p = B.provider[m];
    return `<tr><td>${dot(m)}${MS[m]}</td><td>${p.okDispatches}</td><td>${fmtMs(p.transportP50)}</td><td>${fmtMs(p.providerP50)}</td><td>${fmtMs(p.gapP50)}</td><td>${p.faulted}</td><td>${fmt(p.retryAfterP50 / 1000)} s</td></tr>`;
  }).join("");
};

const skillPairs = (m) => {
  const out = [];
  for (let r = 1; r <= 5; r++) {
    const rows = turnsOf(m, S.indexOf("SkillSwitch")).filter((t) => t[K.rep] === r);
    const a = rows.find((t) => t[K.turn] === 1), b = rows.find((t) => t[K.turn] === 2);
    if (a && b) out.push([r, a[K.outChars], b[K.outChars]]);
  }
  return out;
};

const buildScore = () => {
  const plain = S.indexOf("PlainText");
  const cells = (f) => [0, 1, 2].map((m) => `<td>${f(m)}</td>`).join("");
  const rows = LANG === "pt" ? [
    ["Turnos que cumpriram a expectativa", (m) => { const a = B.stats[m]._all; return `<b>${a.met}/${a.n}</b> (${pctTxt(a.met / a.n, 1)})`; }],
    ["Prompt curto, tempo mediano (sem esperas)", (m) => fmtMs(B.stats[m].PlainText.p50NoRetry)],
    ["Parcela do tempo esperando rate limits", (m) => pctTxt(B.stats[m]._all.retryW / B.stats[m]._all.clientSum)],
    ["Retries", (m) => B.stats[m]._all.retries],
    ["Velocidade de saída (informada pelo provedor)", (m) => `${fmt(B.provider[m].tpsP50)} tokens/s`],
    ["Tempo de Arandu e Unity por turno (mediana)", (m) => fmtMs(B.overhead[m].localP50)],
    ["Seguiu a Skill detalhada", (m) => `${skillPairs(m).filter((p) => p[2] >= 1.5 * p[1]).length} de 5`],
    ["Principal problema", (m) => ["StructuredOutput bloqueado pela checagem de schema do adapter", "Limite de tokens por minuto: esperas longas", "Limite de tokens, uma tool call ilegível, troca de Skill quase ignorada"][m]],
  ] : [
    ["Turns that met the expectation", (m) => { const a = B.stats[m]._all; return `<b>${a.met}/${a.n}</b> (${pctTxt(a.met / a.n, 1)})`; }],
    ["Short prompt, median time (no waits)", (m) => fmtMs(B.stats[m].PlainText.p50NoRetry)],
    ["Share of time waiting for rate limits", (m) => pctTxt(B.stats[m]._all.retryW / B.stats[m]._all.clientSum)],
    ["Retries", (m) => B.stats[m]._all.retries],
    ["Output speed (provider-reported)", (m) => `${fmt(B.provider[m].tpsP50)} tokens/s`],
    ["Arandu & Unity time per turn (median)", (m) => fmtMs(B.overhead[m].localP50)],
    ["Followed the detailed skill", (m) => `${skillPairs(m).filter((p) => p[2] >= 1.5 * p[1]).length} of 5`],
    ["Main issue", (m) => ["StructuredOutput blocked by the adapter's schema check", "Token-per-minute limit: long waits", "Token limit, one unreadable tool call, skill change mostly ignored"][m]],
  ];
  void plain;
  document.querySelector("#score-table tbody").innerHTML = rows.map(([label, f]) => `<tr><td>${label}</td>${cells(f)}</tr>`).join("");
};

/* =================================================================
   Charts
   ================================================================= */
const charts = [];
const base = () => ({
  backgroundColor: "transparent",
  textStyle: { fontFamily: "Inter, system-ui, sans-serif", color: MUTED },
  animationDuration: 1400,
  animationEasing: "cubicOut",
  animationDurationUpdate: 900,
  animationEasingUpdate: "cubicInOut",
  tooltip: {
    backgroundColor: "rgba(13, 11, 38, .96)", borderColor: "rgba(125, 211, 252, .35)", borderWidth: 1,
    textStyle: { color: INK, fontSize: 13 }, padding: [10, 12],
    extraCssText: "border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.45);",
  },
});
const axisCommon = {
  axisLine: { lineStyle: { color: "rgba(167, 139, 250, .28)" } },
  axisTick: { show: false },
  axisLabel: { color: MUTED, fontSize: 12 },
  splitLine: { lineStyle: { color: "rgba(167, 139, 250, .09)" } },
  nameTextStyle: { color: FAINT, fontSize: 12 },
};
const ax = (o) => ({ ...axisCommon, ...o, axisLabel: { ...axisCommon.axisLabel, ...(o.axisLabel || {}) } });
const msAxis = (o = {}) => ax({ type: "value", axisLabel: { formatter: (v) => (v >= 1000 ? `${fmt(v / 1000, v % 1000 ? 1 : 0)} s` : `${v} ms`) }, ...o });

// Lazily initialize a chart when its container scrolls into view, so the entrance animation is seen.
const lazy = (id, build) => {
  const el = document.getElementById(id);
  if (!el) return;
  const start = () => {
    if (typeof echarts === "undefined") { el.innerHTML = `<p class="chart-note">${tr("The chart library could not load. Check the internet connection and reload.", "A biblioteca de gráficos não carregou. Verifique a conexão com a internet e recarregue.")}</p>`; return; }
    const chart = echarts.init(el, null, { renderer: "canvas" });
    charts.push(chart);
    build(chart, el);
  };
  const obs = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { obs.disconnect(); setTimeout(start, 120); }
  }, { threshold: 0.25 });
  obs.observe(el);
};
window.addEventListener("resize", () => charts.forEach((c) => c.resize()));

// Segmented controls with a sliding ink. Set up at load; charts register their handler when they start.
const segHandlers = {};
const seg = (target, fn) => { segHandlers[target] = fn; };
const segMode = (target) => { const a = document.querySelector(`.seg[data-target="${target}"] .segb.active`); return a ? a.dataset.mode : null; };
const initSegs = () => document.querySelectorAll(".seg").forEach((root) => {
  const ink = document.createElement("span"); ink.className = "ink"; root.prepend(ink);
  const btns = [...root.querySelectorAll(".segb")];
  const place = () => {
    const a = btns.find((b) => b.classList.contains("active"));
    if (!a || !a.offsetWidth) return;
    ink.style.width = `${a.offsetWidth}px`; ink.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", String(x === b)); });
    place();
    const fn = segHandlers[root.dataset.target];
    if (fn) fn(b.dataset.mode);
  }));
  window.addEventListener("resize", place); window.addEventListener("load", place);
  new IntersectionObserver(place).observe(root); place();
});

/* ---------- Box + dots renderer (custom series, value x-axis aligned to categories) ---------- */
const boxSeries = (groups, nCat, opts = {}) => {
  // groups: [{cat, m, values:[...], tips:[...]}]
  const width = opts.width || 0.22, offs = opts.offsets || [-0.27, 0, 0.27];
  const boxes = [], dots = [];
  let k = 0;
  groups.forEach((g) => {
    const x = g.cat + offs[g.m];
    if (!g.values.length) return;
    boxes.push({ value: [x, quant(g.values, 0), quant(g.values, .25), med(g.values), quant(g.values, .75), quant(g.values, 1), g.m, g.cat], id: `b${g.cat}-${g.m}` });
    g.values.forEach((v, i) => {
      dots.push({ value: [x + jit(k++) * width * 0.9, v, g.m, g.cat], tip: g.tips ? g.tips[i] : null, itemStyle: { color: MC[g.m] } });
    });
  });
  const box = {
    type: "custom", name: "box", xAxisIndex: opts.xAxisIndex || 0, z: 2,
    renderItem: (params, api) => {
      const x = api.value(0), m = api.value(6);
      const lo = api.coord([x, api.value(1)]), q1 = api.coord([x, api.value(2)]), md = api.coord([x, api.value(3)]);
      const q3 = api.coord([x, api.value(4)]), hi = api.coord([x, api.value(5)]);
      const half = (api.size([width, 0])[0]) / 2;
      const c = MC[m];
      return {
        type: "group", enterFrom: { scaleY: 0, style: { opacity: 0 } }, originX: md[0], originY: md[1],
        children: [
          { type: "line", shape: { x1: lo[0], y1: lo[1], x2: q1[0], y2: q1[1] }, style: { stroke: c, lineWidth: 1.5, opacity: .7 }, transition: ["shape"] },
          { type: "line", shape: { x1: q3[0], y1: q3[1], x2: hi[0], y2: hi[1] }, style: { stroke: c, lineWidth: 1.5, opacity: .7 }, transition: ["shape"] },
          { type: "rect", shape: { x: q1[0] - half, y: q3[1], width: half * 2, height: Math.max(2, q1[1] - q3[1]), r: 4 }, style: { fill: c + "33", stroke: c, lineWidth: 1.5 }, transition: ["shape"] },
          { type: "line", shape: { x1: md[0] - half, y1: md[1], x2: md[0] + half, y2: md[1] }, style: { stroke: "#fff", lineWidth: 2.5 }, transition: ["shape"] },
        ],
      };
    },
    data: boxes, encode: { x: 0, y: [1, 2, 3, 4, 5] }, silent: true,
    animationDelay: (i) => i * 35,
  };
  const pts = {
    type: "scatter", name: "turns", xAxisIndex: opts.xAxisIndex || 0, z: 3, symbolSize: opts.dot || 7,
    data: dots, itemStyle: { opacity: .9, borderColor: "rgba(7,6,26,.9)", borderWidth: 1 },
    emphasis: { scale: 1.8 },
    animationDelay: (i) => 300 + i * 4,
  };
  return [box, pts];
};
const catAxes = (labels, o = {}) => [
  ax({ type: "category", data: labels, boundaryGap: true, axisLabel: { interval: 0, lineHeight: 15, fontSize: small() ? 10 : 12, ...(o.label || {}) }, splitLine: { show: false } }),
  { type: "value", min: -0.5, max: labels.length - 0.5, show: false },
];

/* ---------- 1. Reliability heatmap ---------- */
lazy("c-reliability", (chart) => {
  const data = [];
  [0, 1, 2].forEach((m) => S.forEach((s, si) => {
    const st = B.stats[m][s];
    data.push({ value: [m, si, st.met / st.n, st.met, st.n, st.lo, st.hi, st.repsOk, st.reps] });
  }));
  const shade = (r) => {
    // Sequential violet ramp: low = dark, high = light.
    const stops = [[0, [42, 36, 80]], [0.5, [109, 95, 214]], [1, [196, 181, 253]]];
    let a = stops[0], b = stops[2];
    for (let i = 0; i < stops.length - 1; i++) if (r >= stops[i][0] && r <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; }
    const t = (r - a[0]) / ((b[0] - a[0]) || 1);
    const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * t));
    return `rgb(${c.join(",")})`;
  };
  chart.setOption({
    ...base(),
    grid: { left: small() ? 118 : 150, right: 16, top: 34, bottom: 10 },
    xAxis: ax({ type: "category", data: small() ? ["Gemini", "120B", "20B"] : MN, position: "top", axisLabel: { color: INK, fontSize: small() ? 10 : 13, interval: 0 }, splitLine: { show: false }, axisLine: { show: false } }),
    yAxis: ax({ type: "category", data: S, inverse: true, axisLabel: { fontFamily: "JetBrains Mono, monospace", fontSize: small() ? 10 : 12 }, axisLine: { show: false }, splitLine: { show: false } }),
    tooltip: {
      ...base().tooltip,
      formatter: (p) => {
        const [m, si, r, met, n, lo, hi, ok, reps] = p.value;
        return tr(`<b>${S[si]}</b> · ${MN[m]}<br>${met} of ${n} turns passed (${pctTxt(r)})<br>95% interval: ${pctTxt(lo)}–${pctTxt(hi)}<br>pass^5: ${ok} of ${reps} repeats fully passed<br><span style="color:${FAINT}">Click for details</span>`,
          `<b>${S[si]}</b> · ${MN[m]}<br>${met} de ${n} turnos aprovados (${pctTxt(r)})<br>intervalo de 95%: ${pctTxt(lo)}–${pctTxt(hi)}<br>pass^5: ${ok} de ${reps} repetições aprovadas por completo<br><span style="color:${FAINT}">Clique para ver detalhes</span>`);
      },
    },
    series: [{
      type: "custom", data,
      renderItem: (params, api) => {
        const m = api.value(0), si = api.value(1), r = api.value(2);
        const [cx, cy] = api.coord([m, si]);
        const [w, h] = api.size([1, 1]);
        const bw = w - 8, bh = h - 6;
        const dark = r > 0.62;
        return {
          type: "group", originX: cx, originY: cy,
          enterFrom: { scaleX: 0.1, scaleY: 0.1, style: { opacity: 0 } },
          children: [
            { type: "rect", shape: { x: cx - bw / 2, y: cy - bh / 2, width: bw, height: bh, r: 8 }, style: { fill: shade(r), stroke: "rgba(7,6,26,.9)", lineWidth: 2 } },
            { type: "text", style: { x: cx, y: cy, text: `${api.value(3)}/${api.value(4)}`, fill: dark ? "#0b0820" : INK, font: `600 ${small() ? 12 : 14}px Inter, sans-serif`, align: "center", verticalAlign: "middle" } },
          ],
        };
      },
      encode: { x: 0, y: 1 },
      animationDelay: (i) => (i % 10) * 70 + Math.floor(i / 10) * 160,
      animationDuration: 900, animationEasing: "backOut",
    }],
  });
  const detail = document.getElementById("cell-detail");
  chart.on("click", (p) => {
    const [m, si] = p.value;
    const rows = turnsOf(m, si);
    detail.innerHTML = `<h4>${dot(m)}${MN[m]} · <code>${S[si]}</code></h4><div class="turn-list">${rows.map((t, i) =>
      `<div class="turn-item" style="--i:${i}"><b>${tr("repeat", "repetição")} ${t[K.rep]}${SCEN_TXT[S[si]][2] > 1 ? ` · ${tr("turn", "turno")} ${t[K.turn]}` : ""}</b> <span class="${t[K.met] ? "ok" : "no"}">${t[K.met] ? tr("passed", "aprovado") : tr("not passed", "não aprovado")}</span> · ${t[K.status]} · ${fmtMs(t[K.client])}${t[K.retries] ? ` · ${t[K.retries]} retr${t[K.retries] > 1 ? "ies" : "y"}` : ""}${t[K.paused] ? ` · <span class="no">${tr("Unity minimized, time not used", "Unity minimizado, tempo não usado")}</span>` : ""}<br>${t[K.preview] ? `“${t[K.preview].replace(/</g, "&lt;").slice(0, 90)}”` : `<i>${tr("no answer", "sem resposta")}</i>`}</div>`).join("")}</div>`;
  });
});

/* ---------- 2. Latency box + dots ---------- */
const latencyGroups = (mode) => {
  const g = [];
  S.forEach((s, si) => [0, 1, 2].forEach((m) => {
    const rows = turnsOf(m, si).filter(timed);
    g.push({ cat: si, m, values: rows.map((t) => Math.max(50, mode === "total" ? t[K.client] : noRetry(t))),
      tips: rows.map((t) => t) });
  }));
  return g;
};
lazy("c-latency", (chart) => {
  const render = (mode) => {
    chart.setOption({
      ...base(),
      grid: { left: 62, right: 14, top: 16, bottom: 66 },
      xAxis: catAxes(S.map(camel)),
      yAxis: msAxis({ type: "log", min: 100, max: 60000, logBase: 10, name: tr("turn time (log scale)", "tempo do turno (escala log)"), nameLocation: "middle", nameGap: 48 }),
      tooltip: {
        ...base().tooltip, trigger: "item",
        formatter: (p) => {
          const t = p.data.tip; if (!t) return "";
          return `<b>${S[t[K.s]]}</b> · ${MN[t[K.m]]}<br>${tr("repeat", "repetição")} ${t[K.rep]}${t[K.turn] > 1 ? `, ${tr("turn", "turno")} ${t[K.turn]}` : ""} · ${t[K.status]}<br>total: <b>${fmtMs(t[K.client])}</b>${t[K.retry] ? `<br>${tr("rate-limit wait", "espera de rate limit")}: ${fmtMs(t[K.retry])} (${t[K.retries]} retr${t[K.retries] > 1 ? "ies" : "y"})` : ""}`;
        },
      },
      series: boxSeries(latencyGroups(mode), S.length, { xAxisIndex: 1 }),
    }, { replaceMerge: ["series"] });
  };
  render(segMode("latency") || "total");
  seg("latency", (mode) => {
    document.getElementById("lat-sub").textContent = mode === "total" ? tr("Total time the game waited", "Tempo total que o jogo esperou") : tr("Time without the rate-limit waits (what the model and network took)", "Tempo sem as esperas de rate limit (o que o modelo e a rede levaram)");
    render(mode);
  });
});

/* ---------- 3. ECDF ---------- */
lazy("c-ecdf", (chart) => {
  const series = (mode) => [0, 1, 2].map((m) => {
    const v = turnsOf(m).filter((t) => timed(t) && S[t[K.s]] !== "Cancellation").map((t) => Math.max(50, mode === "total" ? t[K.client] : noRetry(t))).sort((a, b) => a - b);
    return { type: "line", name: MN[m], step: "end", showSymbol: false, data: v.map((x, i) => [x, (i + 1) / v.length * 100]),
      lineStyle: { width: 2.2, color: MC[m] }, itemStyle: { color: MC[m] }, emphasis: { focus: "series" },
      areaStyle: { color: MC[m] + "14" }, animationDuration: 2000, animationDelay: m * 250 };
  });
  const render = (mode) => chart.setOption({
    ...base(),
    grid: { left: 50, right: 16, top: 14, bottom: 44 },
    xAxis: msAxis({ type: "log", min: 200, max: 60000, name: tr("turn time (log scale)", "tempo do turno (escala log)"), nameLocation: "middle", nameGap: 28 }),
    yAxis: ax({ type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } }),
    tooltip: { ...base().tooltip, trigger: "axis", axisPointer: { type: "line", lineStyle: { color: "rgba(125,211,252,.5)" } },
      formatter: (ps) => `${fmtMs(ps[0].value[0])}<br>${ps.map((p) => `${dot(p.seriesIndex)}${MS[p.seriesIndex]}: ${fmt(p.value[1])}% ${tr("of turns done", "dos turnos concluídos")}`).join("<br>")}` },
    series: series(mode),
  }, { replaceMerge: ["series"] });
  render(segMode("ecdf") || "total");
  seg("ecdf", render);
});

/* ---------- 4. Simple scenario medians ---------- */
lazy("c-simple", (chart) => {
  const sc = ["PlainText", "StructuredOutput", "SkillSwitch", "MultiTurnSession"];
  chart.setOption({
    ...base(),
    grid: { left: 52, right: 10, top: 26, bottom: 58 },
    xAxis: ax({ type: "category", data: sc.map(camel), axisLabel: { interval: 0, lineHeight: 15 }, splitLine: { show: false } }),
    yAxis: msAxis({}),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => `<b>${sc[p.dataIndex]}</b> · ${MN[p.seriesIndex]}<br>${tr("median", "mediana")}: ${p.value === null ? tr("no completed turns", "nenhum turno concluído") : fmtMs(p.value)}` },
    series: [0, 1, 2].map((m) => ({
      type: "bar", name: MN[m], barGap: "18%", barMaxWidth: 26,
      data: sc.map((s) => { const st = B.stats[m][s]; return st.met === 0 ? null : Math.round(st.p50NoRetry); }),
      itemStyle: { color: MC[m], borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: "top", color: MUTED, fontSize: 10, formatter: (p) => (p.value ? fmt(p.value) : "") },
      animationDelay: (i) => i * 120 + m * 60, animationEasing: "elasticOut", animationDuration: 1600,
    })),
  });
});

/* ---------- 5. Time split ---------- */
const splitSel = document.getElementById("split-scen");
splitSel.innerHTML = `<option value="_all">${tr("All scenarios", "Todos os cenários")}</option>` + S.map((s) => `<option value="${s}">${s}</option>`).join("");
lazy("c-split", (chart) => {
  let mode = segMode("split") || "share", scen = splitSel.value || "_all";
  const render = () => {
    const vals = [0, 1, 2].map((m) => {
      const st = B.stats[m][scen];
      const parts = [st.local, st.network, st.provider, st.retryW];
      const tot = parts.reduce((a, b) => a + b, 0) || 1;
      return { parts, tot };
    });
    chart.setOption({
      ...base(),
      grid: { left: small() ? 92 : 150, right: 24, top: 8, bottom: 30 },
      yAxis: ax({ type: "category", data: small() ? MS : MN, inverse: true, axisLabel: { color: INK, fontSize: small() ? 10 : 13 }, splitLine: { show: false } }),
      xAxis: ax(mode === "share"
        ? { type: "value", max: 100, axisLabel: { formatter: "{value}%" } }
        : { type: "value", max: null, axisLabel: { formatter: (v) => `${fmt(v)} s` } }),
      tooltip: { ...base().tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(167,139,250,.06)" } },
        formatter: (ps) => { const m = ps[0].dataIndex; const v = vals[m];
          return `<b>${MN[m]}</b> · ${scen === "_all" ? tr("all scenarios", "todos os cenários") : scen}<br>${v.parts.map((x, i) => `<i class="mdot" style="background:${PH[i]};border-radius:3px"></i>${PHN[i]}: ${fmt(x / 1000, 1)} s (${pctTxt(x / v.tot, 1)})`).join("<br>")}<br>total: ${fmt(v.tot / 1000, 1)} s`; } },
      series: PHN.map((n, i) => ({
        type: "bar", name: n, stack: "t", barWidth: small() ? 22 : 30,
        data: vals.map((v) => (mode === "share" ? +(v.parts[i] / v.tot * 100).toFixed(2) : +(v.parts[i] / 1000).toFixed(2))),
        itemStyle: { color: PH[i], borderColor: "rgba(17,14,46,1)", borderWidth: 2, borderRadius: i === 3 ? [0, 4, 4, 0] : 0 },
        label: { show: true, position: "inside", color: "#0b0820", fontWeight: 600, fontSize: 11,
          formatter: (p) => { const v = vals[p.dataIndex]; const sh = v.parts[i] / v.tot; return sh > (small() ? .12 : .07) ? pctTxt(sh) : ""; } },
        animationDelay: (k) => i * 260 + k * 90, animationDuration: 1100,
      })),
    }, { replaceMerge: ["series"] });
    document.getElementById("split-sub").textContent = `${scen === "_all" ? tr("All scenarios", "Todos os cenários") : scen} · ${mode === "share" ? tr("share of total turn time", "parcela do tempo total dos turnos") : tr("total seconds across all turns", "total de segundos somando todos os turnos")}`;
  };
  render();
  seg("split", (m) => { mode = m; render(); });
  splitSel.addEventListener("change", () => { scen = splitSel.value; render(); });
});

/* ---------- 6. Arandu local time per turn ---------- */
const cleanTurns = (m) => turnsOf(m).filter((t) => t[K.status] === "Completed" && t[K.retries] === 0 && !t[K.paused]);
lazy("c-overhead", (chart) => {
  const groups = [0, 1, 2].map((m) => { const r = cleanTurns(m); return { cat: m, m, values: r.map((t) => Math.max(0.5, t[K.local])), tips: r }; });
  chart.setOption({
    ...base(),
    grid: { left: 56, right: 12, top: 14, bottom: 30 },
    xAxis: catAxes(MS),
    yAxis: msAxis({ type: "log", min: 1, max: 300 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => { const t = p.data.tip; if (!t) return "";
      return `<b>${S[t[K.s]]}</b> · ${MN[t[K.m]]}<br>${tr("Arandu &amp; Unity", "Arandu e Unity")}: <b>${fmtMs(t[K.local])}</b> ${tr("of", "de")} ${fmtMs(t[K.client])} (${pctTxt(t[K.local] / t[K.client], 1)})`; } },
    series: boxSeries(groups, 3, { xAxisIndex: 1, offsets: [0, 0, 0], width: 0.5, dot: 6 }),
  });
});
lazy("c-overhead-parts", (chart) => {
  const cats = tr(["Core phases", "Unity frame wait", "Adapter work", "Submit and hand-back"], ["Fases do Core", "Espera de frame do Unity", "Trabalho do adapter", "Envio e devolução"]);
  const vals = [0, 1, 2].map((m) => {
    const r = cleanTurns(m);
    return [med(r.map((t) => t[K.queue] + t[K.prep] + t[K.context] + t[K.checkpoint])), med(r.map((t) => t[K.resume])),
      med(r.map((t) => t[K.adapterOv])), med(r.map((t) => Math.max(0, t[K.client] - t[K.elapsed])))];
  });
  chart.setOption({
    ...base(),
    grid: { left: 44, right: 10, top: 26, bottom: 44 },
    xAxis: ax({ type: "category", data: cats.map((c) => c.replace(" ", "\n")), axisLabel: { interval: 0, lineHeight: 15 }, splitLine: { show: false } }),
    yAxis: ax({ type: "value", axisLabel: { formatter: "{value} ms" } }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => `<b>${cats[p.dataIndex]}</b> · ${MN[p.seriesIndex]}<br>${tr("median", "mediana")}: ${fmt(p.value, 1)} ms<br><span style="color:${FAINT}">${tr([
      "Queue, preparation, context and checkpoint phases.", "Waiting for the next Unity frame after the HTTP call ends.",
      "Adapter and Core work around the HTTP call (encode, decode).", "Between the sample's submit/result and the run's own clock."], [
      "Fases de fila, preparação, context e checkpoint.", "Espera pelo próximo frame do Unity depois que a chamada HTTP termina.",
      "Trabalho do adapter e do Core em volta da chamada HTTP (encode, decode).", "Entre o submit/result da sample e o relógio da própria execução."])[p.dataIndex]}</span>` },
    series: [0, 1, 2].map((m) => ({
      type: "bar", name: MN[m], barMaxWidth: 22, data: vals[m].map((v) => +v.toFixed(2)),
      itemStyle: { color: MC[m], borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: "top", color: MUTED, fontSize: 10, formatter: (p) => fmt(p.value, 1) },
      animationDelay: (i) => i * 140 + m * 70, animationEasing: "elasticOut", animationDuration: 1500,
    })),
  });
});

/* ---------- 7. Session timeline with replay ---------- */
lazy("c-timeline", (chart) => {
  const pts = T.map((t, i) => ({ t, i })).sort((a, b) => a.t[K.t0] - b.t[K.t0]);
  const toItem = ({ t }) => ({
    value: [t[K.active] / 60, Math.max(50, t[K.client]) / 1000, t[K.m]],
    t, symbolSize: t[K.retries] ? 11 : 7,
    itemStyle: t[K.paused]
      ? { color: "rgba(17,14,46,1)", borderColor: "#a7a3cc", borderWidth: 1.5, opacity: .9 }
      : { color: MC[t[K.m]], borderColor: t[K.retries] ? "#ffffff" : "rgba(7,6,26,.9)", borderWidth: t[K.retries] ? 1.6 : 1, opacity: .92 },
  });
  const blocks = [0, 1, 2].map((m) => { const r = turnsOf(m); return [Math.min(...r.map((t) => t[K.active])) / 60, Math.max(...r.map((t) => t[K.active] + t[K.client] / 1000)) / 60]; });
  const pauses = [];
  pts.reduce((prevOff, { t }) => { const off = t[K.t0] - t[K.active]; if (off - prevOff > 1) pauses.push({ x: t[K.active] / 60, min: (off - prevOff) / 60 }); return off; }, 0);
  const opt = (data) => ({
    ...base(),
    grid: { left: 52, right: 16, top: 30, bottom: 44 },
    xAxis: ax({ type: "value", min: 0, max: Math.ceil(blocks[2][1]), name: tr("active minutes since the session started (pauses removed)", "minutos ativos desde o início da sessão (pausas removidas)"), nameLocation: "middle", nameGap: 28 }),
    yAxis: ax({ type: "log", min: 0.1, max: 60, axisLabel: { formatter: (v) => `${v} s` } }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => { const t = p.data.t; if (!t) return "";
      return `<b>${S[t[K.s]]}</b> · ${MN[t[K.m]]}<br>${tr("repeat", "repetição")} ${t[K.rep]}${t[K.turn] > 1 ? `, ${tr("turn", "turno")} ${t[K.turn]}` : ""} · ${fmt(t[K.active] / 60, 1)} ${tr("active min", "min ativos")}<br>${tr("turn time", "tempo do turno")}: ${fmtMs(t[K.client])}${t[K.retries] ? `<br>${tr(`waited ${fmtMs(t[K.retry])} for rate limits`, `esperou ${fmtMs(t[K.retry])} por rate limits`)}` : ""}${t[K.paused] ? `<br><span style="color:#fda4af">${tr("ran while Unity was minimized: not used in timing charts", "rodou com o Unity minimizado: fora dos gráficos de tempo")}</span>` : ""}`; } },
    series: [{
      type: "scatter", data, animationDelay: (i) => i * 6, animationDuration: 600,
      markLine: { silent: true, symbol: "none", lineStyle: { color: "rgba(167,163,204,.55)", type: [3, 4], width: 1 },
        label: { show: false },
        data: pauses.map((p) => ({ xAxis: p.x, min: p.min })) },
      markArea: { silent: true, data: blocks.map((b, m) => [{ xAxis: b[0], itemStyle: { color: MC[m] + "10" }, label: { show: true, position: "insideBottom", color: MUTED, fontSize: 11, formatter: MS[m] } }, { xAxis: b[1] }]) },
    }],
  });
  chart.setOption(opt(pts.map(toItem)));
  let timer = null;
  document.getElementById("replay").addEventListener("click", () => {
    clearInterval(timer);
    const shown = [];
    chart.setOption(opt([]), { notMerge: true });
    let k = 0;
    timer = setInterval(() => {
      for (let j = 0; j < 4 && k < pts.length; j++, k++) shown.push(toItem(pts[k]));
      chart.setOption({ series: [{ data: shown }] });
      if (k >= pts.length) clearInterval(timer);
    }, 40);
  });
});

/* ---------- 8. Rate-limit wait vs request size (Groq) ---------- */
lazy("c-tpm", (chart) => {
  const series = [1, 2].map((m) => ({
    type: "scatter", name: MN[m], symbolSize: (v) => (v[1] > 0 ? 9 : 6),
    data: turnsOf(m).filter((t) => t[K.inU] > 0).map((t) => ({ value: [t[K.inU], t[K.retry] / 1000], t })),
    itemStyle: { color: MC[m], opacity: .85, borderColor: "rgba(7,6,26,.9)", borderWidth: 1 },
    animationDelay: (i) => (m - 1) * 350 + i * 6, animationEasing: "backOut",
  }));
  chart.setOption({
    ...base(),
    grid: { left: 48, right: 16, top: 16, bottom: 44 },
    xAxis: ax({ type: "value", min: 0, name: tr("input tokens in the turn", "tokens de entrada no turno"), nameLocation: "middle", nameGap: 28, axisLabel: { formatter: (v) => (v >= 1000 ? `${v / 1000}K` : v) } }),
    yAxis: ax({ type: "value", min: 0, name: tr("rate-limit wait (s)", "espera de rate limit (s)"), nameLocation: "middle", nameGap: 32 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => { const t = p.data.t;
      return `<b>${S[t[K.s]]}</b> · ${MN[t[K.m]]}<br>${tr("repeat", "repetição")} ${t[K.rep]}${t[K.turn] > 1 ? `, ${tr("turn", "turno")} ${t[K.turn]}` : ""}<br>${fmt(t[K.inU])} ${tr("input tokens", "tokens de entrada")}<br>${tr("waited", "esperou")} ${fmt(t[K.retry] / 1000, 1)} s (${t[K.retries]} retr${t[K.retries] === 1 ? "y" : "ies"})`; } },
    series,
  });
});

/* ---------- 9. Retry-After honored ---------- */
lazy("c-honor", (chart) => {
  const pts = B.retryAfter.map(([m, s, waited, asked]) => ({ value: [asked / 1000, waited / 1000], m, s, itemStyle: { color: MC[m] } }));
  const max = Math.ceil(Math.max(...pts.map((p) => Math.max(p.value[0], p.value[1])))) + 2;
  chart.setOption({
    ...base(),
    grid: { left: 48, right: 16, top: 16, bottom: 44 },
    xAxis: ax({ type: "value", min: 0, max, name: tr("wait asked by the provider (s)", "espera pedida pelo provedor (s)"), nameLocation: "middle", nameGap: 28 }),
    yAxis: ax({ type: "value", min: 0, max, name: tr("wait done (s)", "espera feita (s)"), nameLocation: "middle", nameGap: 32 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => (p.seriesIndex ? "" : `<b>${S[p.data.s]}</b> · ${MN[p.data.m]}<br>${tr("asked", "pedido")}: ${fmt(p.value[0], 1)} s · ${tr("waited", "esperado")}: ${fmt(p.value[1], 1)} s`) },
    series: [
      { type: "scatter", data: pts, symbolSize: 9, itemStyle: { opacity: .85, borderColor: "rgba(7,6,26,.9)", borderWidth: 1 },
        animationDelay: (i) => i * 22, animationEasing: "backOut" },
      { type: "line", data: [[0, 0], [max, max]], showSymbol: false, silent: true, lineStyle: { color: "rgba(236,233,255,.35)", width: 1 }, animationDuration: 1600 },
    ],
  });
});

/* ---------- 10. Tools: model calls per turn ---------- */
lazy("c-tools", (chart) => {
  const sc = ["SingleReadTool", "ToolChain", "MutationTool"];
  chart.setOption({
    ...base(),
    grid: { left: 36, right: 8, top: 26, bottom: 58 },
    xAxis: ax({ type: "category", data: sc.map(camel), axisLabel: { interval: 0, lineHeight: 15 }, splitLine: { show: false } }),
    yAxis: ax({ type: "value", minInterval: 1 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => { const r = turnsOf(p.seriesIndex, S.indexOf(sc[p.dataIndex]));
      return `<b>${sc[p.dataIndex]}</b> · ${MN[p.seriesIndex]}<br>${tr("median model calls", "mediana de chamadas ao modelo")}: ${p.value}<br>tool calls: ${r.map((t) => t[K.reads] + t[K.muts]).join(", ")}<br>retries: ${r.reduce((a, t) => a + t[K.retries], 0)}`; } },
    series: [0, 1, 2].map((m) => ({
      type: "bar", name: MN[m], barMaxWidth: 24,
      data: sc.map((s) => med(turnsOf(m, S.indexOf(s)).map((t) => t[K.attempts]))),
      itemStyle: { color: MC[m], borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: "top", color: MUTED, fontSize: 11 },
      animationDelay: (i) => i * 160 + m * 80, animationEasing: "elasticOut", animationDuration: 1500,
    })),
  });
});

/* ---------- 11. Context pressure ---------- */
lazy("c-context", (chart) => {
  const ci = S.indexOf("ContextPressure");
  const avg = (m, key) => [1, 2, 3, 4, 5, 6, 7].map((k) => { const r = turnsOf(m, ci).filter((t) => t[K.turn] === k); return r.reduce((a, t) => a + t[key], 0) / (r.length || 1); });
  const press = { silent: true, symbol: "none", lineStyle: { color: "rgba(236,233,255,.45)", width: 1 }, label: { color: INK, formatter: tr("pressure detected", "pressão detectada"), fontSize: 11 }, data: [{ xAxis: 5 }] };
  const render = (mode) => {
    const series = mode === "hist"
      ? [0, 1, 2].map((m) => ({ type: "line", name: MN[m], data: avg(m, K.histB).map((v) => +(v / 1024).toFixed(1)), symbol: "circle", symbolSize: 7,
          lineStyle: { width: 2.2, color: MC[m] }, itemStyle: { color: MC[m] }, animationDuration: 1600, animationDelay: m * 200, markLine: m === 0 ? press : undefined }))
      : [...[0, 1, 2].map((m) => ({ type: "line", name: tr(`${MS[m]} measured input`, `${MS[m]} entrada medida`), data: avg(m, K.inU).map(Math.round), symbol: "circle", symbolSize: 7,
          lineStyle: { width: 2.2, color: MC[m] }, itemStyle: { color: MC[m] }, animationDuration: 1600, animationDelay: m * 200, markLine: m === 0 ? press : undefined })),
        { type: "line", name: tr("Arandu estimate", "estimativa do Arandu"), data: [1, 2, 3, 4, 5, 6, 7].map((k, i) => Math.round((avg(0, K.estU)[i] + avg(1, K.estU)[i] + avg(2, K.estU)[i]) / 3)),
          symbol: "diamond", symbolSize: 9, lineStyle: { width: 2.2, color: "#d9d6f5", type: [6, 4] }, itemStyle: { color: "#d9d6f5" }, animationDuration: 1600, animationDelay: 600 }];
    chart.setOption({
      ...base(),
      grid: { left: 52, right: 14, top: 22, bottom: 40 },
      xAxis: ax({ type: "category", data: ["1", "2", "3", "4", "5", "6", "7"], name: tr("turn", "turno"), nameLocation: "middle", nameGap: 26, splitLine: { show: false } }),
      yAxis: ax({ type: "value", axisLabel: { formatter: mode === "hist" ? "{value} KB" : (v) => (v >= 1000 ? `${v / 1000}K` : v) } }),
      tooltip: { ...base().tooltip, trigger: "axis", formatter: (ps) => `${tr("turn", "turno")} ${ps[0].name}<br>${ps.map((p) => `${p.marker}${p.seriesName}: ${fmt(p.value)}${mode === "hist" ? tr(" KB of history", " KB de histórico") : " tokens"}`).join("<br>")}` },
      series,
    }, { replaceMerge: ["series"] });
    document.getElementById("context-note").innerHTML = mode === "hist"
      ? tr("Average over the 5 repeats. The three lines lie on top of each other because every model receives the same messages. History grows about 4.7 KB per turn and stops growing after pressure is detected at turn 6.",
        "Média das 5 repetições. As três linhas ficam umas sobre as outras porque todos os modelos recebem as mesmas mensagens. O histórico cresce cerca de 4,7 KB por turno e para de crescer depois que a pressão é detectada no turno 6.")
      : tr("Arandu's own estimate of the request size (dashed) runs about 4–6× above the input tokens the provider measured. Turns 6–7 include the summary request, which raises Gemini's measured input.",
        "A estimativa do próprio Arandu para o tamanho do request (tracejada) fica cerca de 4–6× acima dos tokens de entrada medidos pelo provedor. Os turnos 6–7 incluem o request de resumo, o que aumenta a entrada medida do Gemini.");
  };
  render(segMode("context") || "hist");
  seg("context", render);
});

/* ---------- 12. Summary outcomes ---------- */
lazy("c-summary", (chart) => {
  const cats = tr(["Cut off (Truncated)", "Failed (rate limit)", "Completed, not accepted"], ["Cortado (Truncated)", "Falhou (rate limit)", "Concluído, não aceito"]);
  const counts = [0, 1, 2].map((m) => {
    const s = D.filter((x) => x[DK.m] === m && x[DK.kind] === "summaryDispatch");
    return [s.filter((x) => x[DK.task] === "RanToCompletion" && x[DK.finish] === "Truncated").length,
      s.filter((x) => x[DK.task] === "Faulted").length,
      s.filter((x) => x[DK.task] === "RanToCompletion" && x[DK.finish] !== "Truncated").length];
  });
  const col = [PH[0], PH[1], PH[2]];
  chart.setOption({
    ...base(),
    grid: { left: small() ? 86 : 140, right: 18, top: 30, bottom: 24 },
    legend: { top: 0, left: 0, textStyle: { color: MUTED, fontSize: 11 }, itemWidth: 12, itemHeight: 10, icon: "roundRect" },
    yAxis: ax({ type: "category", data: small() ? MS : MN, inverse: true, axisLabel: { color: INK, fontSize: small() ? 10 : 12 }, splitLine: { show: false } }),
    xAxis: ax({ type: "value", max: 10, minInterval: 1 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => `${MN[p.dataIndex]}<br>${p.seriesName}: ${p.value} ${tr("of 10 summary calls", "de 10 chamadas de resumo")}` },
    series: cats.map((c, i) => ({ type: "bar", name: c, stack: "s", barWidth: 18, data: counts.map((v) => v[i]),
      itemStyle: { color: col[i], borderColor: "rgba(17,14,46,1)", borderWidth: 2 },
      label: { show: true, color: "#0b0820", fontWeight: 600, fontSize: 11, formatter: (p) => (p.value ? p.value : "") },
      animationDelay: (k) => i * 300 + k * 100 })),
  });
});

/* ---------- 13. Skill switch dumbbells ---------- */
lazy("c-skills", (chart) => {
  const rows = [];
  [0, 1, 2].forEach((m) => skillPairs(m).forEach(([r, a, b]) => rows.push({ m, r, a, b })));
  const labels = rows.map((x) => `${["Gem", "120B", "20B"][x.m]} ${x.r}`);
  const followed = [0, 1, 2].map((m) => skillPairs(m).filter((p) => p[2] >= 1.5 * p[1]).length);
  document.getElementById("skills-note").textContent = tr(`Hollow dot: terse skill. Filled dot: detailed skill. The answer grew at least 1.5× in ${followed[0]} of 5 repeats for Gemini, ${followed[1]} of 5 for GPT-OSS 120B and ${followed[2]} of 5 for GPT-OSS 20B. The expectation only checks that both turns completed, so it does not catch this.`,
    `Ponto vazado: Skill concisa. Ponto cheio: Skill detalhada. A resposta cresceu pelo menos 1,5× em ${followed[0]} de 5 repetições no Gemini, ${followed[1]} de 5 no GPT-OSS 120B e ${followed[2]} de 5 no GPT-OSS 20B. A expectativa só confere se os dois turnos terminaram, então não pega isso.`);
  chart.setOption({
    ...base(),
    grid: { left: 44, right: 8, top: 14, bottom: 40 },
    xAxis: ax({ type: "category", data: labels, axisLabel: { interval: 0, rotate: 50, fontSize: 10 }, splitLine: { show: false } }),
    yAxis: ax({ type: "value", name: tr("characters", "caracteres"), nameTextStyle: { color: FAINT } }),
    tooltip: { ...base().tooltip, trigger: "axis", formatter: (ps) => { const x = rows[ps[0].dataIndex]; return tr(`${MN[x.m]}, repeat ${x.r}<br>terse: ${x.a} characters<br>detailed: ${x.b} characters (${fmt(x.b / x.a, 1)}×)`, `${MN[x.m]}, repetição ${x.r}<br>concisa: ${x.a} caracteres<br>detalhada: ${x.b} caracteres (${fmt(x.b / x.a, 1)}×)`); } },
    series: [
      { type: "custom", data: rows.map((x, i) => [i, x.a, x.b, x.m]), silent: true,
        renderItem: (p, api) => { const a = api.coord([api.value(0), api.value(1)]), b = api.coord([api.value(0), api.value(2)]);
          return { type: "line", shape: { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, style: { stroke: MC[api.value(3)], lineWidth: 2, opacity: .6 },
            enterFrom: { shape: { x1: a[0], y1: a[1], x2: a[0], y2: a[1] } }, transition: ["shape"] }; },
        animationDuration: 1200, animationDelay: (i) => 500 + i * 60 },
      { type: "scatter", name: tr("terse", "concisa"), data: rows.map((x) => ({ value: x.a, itemStyle: { color: "rgba(17,14,46,1)", borderColor: MC[x.m], borderWidth: 2 } })), symbolSize: 9, animationDelay: (i) => i * 50 },
      { type: "scatter", name: tr("detailed", "detalhada"), data: rows.map((x) => ({ value: x.b, itemStyle: { color: MC[x.m] } })), symbolSize: 10, animationDelay: (i) => 700 + i * 60, animationEasing: "backOut" },
    ],
  });
});

/* ---------- 14. Cancellation ---------- */
lazy("c-cancel", (chart) => {
  const ci = S.indexOf("Cancellation");
  const groups = [0, 1, 2].map((m) => { const r = turnsOf(m, ci).filter((t) => t[K.cancelToTerm] !== null); return { cat: m, m, values: r.map((t) => Math.max(1, t[K.cancelToTerm])), tips: r }; });
  chart.setOption({
    ...base(),
    grid: { left: 50, right: 12, top: 12, bottom: 28 },
    xAxis: catAxes(MS),
    yAxis: ax({ type: "value", min: 0, axisLabel: { formatter: "{value} ms" } }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => { const t = p.data.tip; return t ? `${MN[t[K.m]]}, ${tr("repeat", "repetição")} ${t[K.rep]}<br>${tr("cancel → final status", "cancelamento → status final")}: ${fmt(t[K.cancelToTerm], 1)} ms` : ""; } },
    series: boxSeries(groups, 3, { xAxisIndex: 1, offsets: [0, 0, 0], width: 0.45, dot: 9 }),
  });
});

/* ---------- 15. Output speed ---------- */
lazy("c-tps", (chart) => {
  chart.setOption({
    ...base(),
    grid: { left: small() ? 90 : 150, right: 40, top: 10, bottom: 44 },
    yAxis: ax({ type: "category", data: small() ? MS : MN, inverse: true, axisLabel: { color: INK, fontSize: small() ? 10 : 13 }, splitLine: { show: false } }),
    xAxis: ax({ type: "value", axisLabel: { formatter: "{value}" }, name: "tokens/s", nameLocation: "middle", nameGap: 22 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => `${MN[p.dataIndex]}<br>${tr("median", "mediana de")} ${fmt(p.value)} ${tr("output tokens/s", "tokens de saída/s")}<br>${B.provider[p.dataIndex].tpsN} ${tr("calls", "chamadas")}` },
    series: [{ type: "bar", barWidth: 24, data: [0, 1, 2].map((m) => ({ value: Math.round(B.provider[m].tpsP50), itemStyle: { color: MC[m], borderRadius: [0, 4, 4, 0] } })),
      label: { show: true, position: "right", color: INK, fontWeight: 600, formatter: (p) => fmt(p.value) },
      animationDelay: (i) => i * 220, animationDuration: 1800, animationEasing: "elasticOut" }],
  });
});

/* ---------- 16. HTTP vs provider processing ---------- */
lazy("c-transport", (chart) => {
  const series = [0, 1, 2].map((m) => ({
    type: "scatter", name: MN[m], symbolSize: 7,
    data: provStats(m).filter((x) => x[DK.provider] && x[DK.transport]).map((x) => [x[DK.provider], x[DK.transport], x[DK.s]]),
    itemStyle: { color: MC[m], opacity: .8, borderColor: "rgba(7,6,26,.9)", borderWidth: 1 },
    animationDelay: (i) => m * 300 + i * 8,
  }));
  series.push({ type: "line", data: [[20, 20], [20000, 20000]], showSymbol: false, silent: true, lineStyle: { color: "rgba(236,233,255,.35)", width: 1 }, animationDuration: 1400 });
  chart.setOption({
    ...base(),
    grid: { left: 54, right: 16, top: 14, bottom: 44 },
    xAxis: msAxis({ type: "log", min: 20, max: 20000, name: tr("provider processing (log)", "processamento do provedor (log)"), nameLocation: "middle", nameGap: 28 }),
    yAxis: msAxis({ type: "log", min: 50, max: 20000, name: tr("HTTP time (log)", "tempo HTTP (log)"), nameLocation: "middle", nameGap: 40 }),
    tooltip: { ...base().tooltip, trigger: "item", formatter: (p) => (p.seriesIndex > 2 ? "" : `${MN[p.seriesIndex]} · ${S[p.value[2]]}<br>${tr("provider", "provedor")}: ${fmtMs(p.value[0])}<br>HTTP: ${fmtMs(p.value[1])}<br>${tr("difference", "diferença")}: ${fmtMs(p.value[1] - p.value[0])}`) },
    series,
  });
});

/* =================================================================
   Boot
   ================================================================= */
buildLegends();
buildSetup();
buildScenarios();
buildFailTable();
buildPassRow();
buildCliff();
buildProvTable();
buildScore();
initSegs();
applyStagger();
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
pointerFx();
onScroll();
