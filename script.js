// Arandu project site V2: motion layer and interactive views.
// Motion is always on. Animations use transform and opacity only, so the browser can run them
// on the graphics hardware of any device (with a CPU fallback). The content works without JS.
document.documentElement.classList.add("js");
const finePointer = window.matchMedia("(pointer: fine)").matches;
const small = () => window.innerWidth < 760;

/* =================================================================
   Commit data · local main branch of C:/Projects/Arandu, oldest first
   [hash, date, area, title, files, insertions, deletions, explanation]
   ================================================================= */
const COMMITS = [
  ["0bfb09d", "2026-09-29", "process", "Initialize project", 80, 8472, 0, "Creates the Unity project and the repository. This is the starting point of Arandu."],
  ["7352cae", "2026-09-29", "process", "Add Arandu project documentation and roadmap", 14, 801, 0, "First documentation set: architecture, decisions and the roadmap of the plugin."],
  ["a4c4a33", "2026-09-29", "process", "Add project README", 5, 98, 2, "Adds the README that introduces the project."],
  ["1f85b56", "2026-09-29", "process", "Add sign-off requirement for every commit", 5, 12, 3, "From here on, every commit must carry a sign-off."],
  ["ee99067", "2026-10-02", "process", "Rework project context engineering documentation", 39, 1890, 1318, "Reworks the context engineering documents that guide the coding agents: rules, state and planning."],
  ["0fc6d0a", "2026-10-13", "core", "Implement Arandu agent runtime", 233, 11609, 50, "First Arandu.Core: agent registration, request submission and the model/tool loop, with an offline test harness."],
  ["b7fd6b5", "2026-10-18", "process", "Update task planning and history context documentation", 12, 369, 185, "Updates the task planning and history records used during development."],
  ["ad4e4a8", "2026-10-18", "adapter", "Implement Model Adapter module and gemini API example implementation", 73, 2691, 93, "Adds the ModelAdapter module and the first example adapter, for the Gemini API."],
  ["5ea4c86", "2026-10-18", "core", "Implement Arandu Integration module", 88, 3290, 55, "Adds the Integration module that connects the runtime to Unity: Inspector setup, scopes and dispatch."],
  ["32d2d50", "2026-10-22", "sample", "Implement ThroneRoom sample", 308, 71013, 150, "Adds ThroneRoom, the playable sample: a 5-day reign with an AI Vizier who proposes edicts through a tool."],
  ["00f54bb", "2026-10-22", "core", "Implement compact context window feature", 69, 5115, 219, "Context compaction: fits the complete request into the budget of the selected model."],
  ["3b918a9", "2026-10-23", "core", "Fix provenance growth with opt-in bounded maintenance", 50, 2740, 167, "Stops provenance metadata from growing without limit, with an opt-in bounded maintenance."],
  ["1c30085", "2026-10-24", "core", "Add safe session retirement and concise commit messages", 18, 753, 25, "Closed sessions can be retired safely. Commit message rules also become shorter."],
  ["37c5e3b", "2026-10-24", "sample", "Add daily sessions and bounded reign history in ThroneRoom sample", 36, 2436, 146, "ThroneRoom gets a fresh session each day and a bounded history of the reign."],
  ["8ddcbc3", "2026-10-24", "sample", "Fix growing Vizier dialogue scrolling", 6, 137, 9, "Fixes the scrolling of the Vizier dialogue as it grows."],
  ["7a4815a", "2026-10-24", "perf", "Optimize bounded plugin context processing", 43, 2616, 187, "Makes the plugin's bounded context processing faster."],
  ["33103f4", "2026-10-25", "perf", "Optimize ThroneRoom context and transcript performance", 20, 1320, 147, "Makes ThroneRoom context building and the transcript faster."],
  ["91d277e", "2026-10-26", "sample", "Optimize ThroneRoom sample transcript layout", 19, 1424, 88, "Improves the transcript layout of the ThroneRoom interface."],
  ["41f39fd", "2026-11-02", "process", "Plan improvements for the plugin and samples", 20, 2661, 33, "Plans the next round of improvements for the plugin and the samples."],
  ["e8752ae", "2026-11-02", "process", "Reconcile product status and setup documentation", 7, 83, 30, "Aligns the status and setup documents with the actual product."],
  ["78f1ddd", "2026-11-02", "perf", "Isolate Unity dispatch callbacks from queue synchronization", 8, 481, 66, "Unity dispatch callbacks now run outside the queue lock."],
  ["467bd31", "2026-11-02", "perf", "Reduce scheduler scans with logical-agent workflow counts", 10, 308, 38, "The scheduler keeps per-agent workflow counts instead of scanning every session."],
  ["6c9e114", "2026-11-02", "core", "Fix host shutdown lifecycle and restored ownership", 11, 599, 91, "Makes host shutdown more robust and fixes ownership after a restore."],
  ["aab89fd", "2026-11-04", "core", "Add opt-in bounded inference retry backoff", 26, 889, 57, "Opt-in retry backoff with a cap and jitter, honoring Retry-After."],
  ["8045ee2", "2026-11-04", "perf", "Reduce repeated operation journal expiry scans", 10, 565, 46, "The operation journal skips expiry scans when nothing is due."],
  ["6860d6f", "2026-11-08", "process", "Migrate Unity Editor tooling to Unity CLI", 19, 66, 45, "Moves the Unity Editor tooling to the Unity CLI."],
  ["9ad0dc9", "2026-11-08", "adapter", "Add bounded Gemini model discovery pagination", 11, 797, 52, "Gemini model discovery reads every page of the catalog, within explicit bounds."],
  ["eb6ec79", "2026-11-08", "sample", "Enable bounded Gemini discovery in ThroneRoom", 3, 247, 1, "ThroneRoom uses the paginated Gemini model discovery."],
  ["a3d6d48", "2026-11-08", "sample", "Harden ThroneRoom setup, receipts and text rendering", 33, 5494, 581, "Safer ThroneRoom setup, receipts and text: the API key stays in memory and model text renders literally."],
  ["bbaad39", "2026-11-08", "perf", "Record local performance baseline and acceptance criteria", 4, 85, 30, "Records a local performance baseline with acceptance criteria."],
  ["1c2bfc1", "2026-11-08", "process", "Close all reviewed tasks", 46, 45, 8159, "Closes all reviewed tasks and removes their finished plans."],
  ["20a34da", "2026-11-08", "diag", "Add build-gated Arandu debug capture", 24, 1444, 16, "Debug mode: bounded reports and file capture, compiled only with ARANDU_DIAGNOSTICS."],
  ["58fb485", "2026-11-08", "adapter", "Move Gemini into ExampleAdapters", 68, 154, 74, "Moves Gemini into ExampleAdapters, apart from the plugin foundation."],
  ["68bd0ed", "2026-11-10", "adapter", "Add Groq example adapter with model discovery", 33, 1547, 4, "Groq example adapter for Chat Completions, with model discovery and a GPT-OSS 120B profile."],
  ["651dbb9", "2026-11-11", "process", "Add plugin review task plans", 13, 1543, 1, "Plans a full review of the plugin as a set of tasks."],
  ["8759b87", "2026-11-14", "perf", "Add opt-in thread-pool orchestration and async run signals", 16, 1051, 23, "Opt-in thread-pool orchestration keeps Core work off the main thread. WebGL rejects it."],
  ["412dce8", "2026-11-14", "perf", "Optimize ExecutionHost gate admission and scheduling hot path", 9, 619, 178, "Less work inside the host gate when requests are admitted and scheduled."],
  ["1db9abc", "2026-11-14", "perf", "Reuse compiled JSON schemas across runs and tool calls", 11, 550, 36, "JSON schemas are compiled once and reused across runs and tool calls."],
  ["273d544", "2026-11-14", "perf", "Reuse unchanged candidate measurements during context assembly", 5, 695, 27, "Context assembly reuses measurements when nothing changed."],
  ["3d7c666", "2026-11-14", "core", "Add tombstone retention, same-destination rebinding, and epoch closure", 22, 554, 33, "Bounded lifetime tables: request tombstones, rebinding to the same destination and closing old epochs."],
  ["ca699bc", "2026-11-14", "core", "Add unresolved operation reconciliation and opt-in gate release", 14, 727, 17, "Operations with an unknown result can be reconciled later, with an opt-in release of the mutation gate."],
  ["d932478", "2026-11-14", "core", "Harden host gate callbacks and add durable journal boundary", 14, 1113, 124, "Safer gate callbacks and an optional durable journal, flushed outside the gate."],
  ["ddcd458", "2026-11-14", "core", "Classify boundary exceptions and internal runtime faults", 12, 680, 188, "Failures are classified by phase: connector, checkpoint, context, tool or internal."],
  ["f0eb74f", "2026-11-14", "adapter", "Extract shared bounded HTTP client into Arandu.ModelAdapter", 9, 796, 389, "Gemini and Groq now share one BoundedHttpClient in Arandu.ModelAdapter."],
  ["1f71fe5", "2026-11-14", "core", "Enforce arrival-ordered fairness in MutationCoordinator", 5, 572, 54, "Mutations wait in arrival order, so later requests cannot starve earlier ones."],
  ["add533c", "2026-11-14", "core", "Extract OperationLedger and unify ContextAssembler rollback snapshots", 6, 333, 175, "Moves operation records into OperationLedger and uses one rollback snapshot for context assembly."],
  ["40de542", "2026-11-14", "core", "Fix limit identities, dispatch rollback and receipt durability", 14, 1090, 108, "Review fixes: stable limit identities, dispatch rollback and durable receipts."],
  ["b6e1efc", "2026-11-14", "process", "Rework context engineering in history records and task planning", 23, 126, 2464, "Simplifies history records and task planning for the coding agents."],
  ["521863a", "2026-11-15", "sample", "Add Groq adapter selection and retry support to ThroneRoom", 28, 2975, 278, "The player picks Gemini or Groq in ThroneRoom. Retries follow Retry-After and Groq tool_use_failed."],
  ["1915718", "2026-11-15", "process", "Add CLAUDE.md", 1, 1, 0, "Adds a CLAUDE.md file for the coding agent."],
  ["5e62495", "2026-11-15", "diag", "Extend debug diagnostics to recovery, journal and reconciliation", 8, 352, 36, "Debug mode now also records recovery, journal flushes and reconciliation."],
  ["6ac5285", "2026-11-16", "diag", "Add diagnostic-only timing to separate Arandu and provider time", 24, 1090, 26, "Diagnostic builds split each call's time between Arandu and the provider."],
  ["194ab29", "2026-11-16", "diag", "Add AdapterBenchmark diagnostics sample", 170, 14284, 2, "New AdapterBenchmark sample: the same 10 scenarios on each model, exported as CSV and JSON."],
];
const AREAS = {
  core: ["Core runtime", "#c084fc"],
  adapter: ["Adapters", "#38bdf8"],
  sample: ["Samples", "#5eead4"],
  perf: ["Performance", "#60a5fa"],
  diag: ["Diagnostics", "#f0abfc"],
  process: ["Docs & process", "#a7a3cc"],
};
const DELIVERIES = [
  ["2026-10-06", "Oct 6 update", "Context engineering and setup"],
  ["2026-10-13", "Oct 13 update", "First Core runtime"],
  ["2026-10-20", "Oct 20 update", "Adapter, Gemini and Unity integration"],
  ["2026-10-27", "Oct 27 update", "ThroneRoom and context management"],
  ["2026-11-03", "Nov 3 update", "Execution refinement"],
  ["2026-11-10", "Nov 10 update", "Debug mode, Groq and improvements"],
  ["2026-11-17", "Since Nov 10", "Performance, reliability and AdapterBenchmark"],
];
const fmt = (n) => n.toLocaleString("en-US");
const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ---------- Word mask split for headings ---------- */
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
const h1 = document.querySelector(".hero h1");
if (h1) { splitWords(h1); h1.classList.remove("anim-in"); requestAnimationFrame(() => setTimeout(() => h1.classList.add("split-in"), 200)); }

// Release the entrance animation so later transforms (parallax, tilt) can apply.
document.querySelectorAll(".anim-in").forEach((el) => el.addEventListener("animationend", (e) => {
  if (e.target !== el) return;
  el.style.opacity = "1"; el.classList.remove("anim-in");
}));

/* ---------- Stagger delays ---------- */
document.querySelectorAll(".stagger").forEach((group) => {
  [...group.children].forEach((el, i) => el.style.setProperty("--sd", `${i * 110}ms`));
});
document.querySelectorAll(".stats .stat").forEach((el, i) => el.style.setProperty("--sd", `${i * 110}ms`));
document.querySelectorAll(".scenarios span").forEach((el, i) => el.style.setProperty("--i", i));

/* ---------- Count up ---------- */
const countUp = (el) => {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = Number(el.dataset.count);
  const dur = 1500 + Math.min(target, 500);
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 4))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- Reveal on scroll ---------- */
const onVisible = (el) => {
  el.classList.add("visible");
  el.querySelectorAll("[data-count]").forEach(countUp);
  if (el.matches("[data-count]")) countUp(el);
  const sd = parseInt(getComputedStyle(el).getPropertyValue("--sd")) || 0;
  setTimeout(() => el.classList.add("settled"), 1200 + sd);
};
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { onVisible(e.target); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
const observeReveals = (root = document) => root.querySelectorAll(".reveal, .kingdom").forEach((el) => io.observe(el));
observeReveals();

/* ---------- Scroll driven: progress, top bar, links, timeline, parallax ---------- */
const topbar = document.querySelector(".topbar");
const bar = document.querySelector(".scroll-progress i");
const links = [...document.querySelectorAll(".nav a")];
const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
const timeline = document.querySelector(".timeline");
const tlLine = document.querySelector(".tl-line i");
const heroCopy = document.querySelector(".hero-copy");
const heroTerm = document.querySelector(".terminal");
const orbs = [...document.querySelectorAll(".bg-orbs")];
let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  topbar.classList.toggle("scrolled", y > 10);
  let current = -1;
  sections.forEach((s, i) => { if (s && s.offsetTop <= y + 130) current = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === current));
  if (timeline && tlLine && timeline.offsetParent) {
    const r = timeline.getBoundingClientRect();
    const p = (window.innerHeight * 0.6 - r.top) / r.height;
    tlLine.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  if (y < window.innerHeight * 1.2) {
    if (heroCopy) heroCopy.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
    if (heroTerm && !heroTerm.matches(":hover")) heroTerm.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
  }
  orbs.forEach((o) => { o.style.transform = `translate3d(0, ${-y * 0.06}px, 0)`; });
};
window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));

/* ---------- Typed motto ---------- */
const typed = document.querySelector(".typed");
if (typed) {
  const words = typed.dataset.words.split("|");
  let w = 0, c = 0, del = false;
  const type = () => {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    let wait = del ? 28 : 55;
    if (!del && c === word.length) { del = true; wait = 1600; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
    c += del ? -1 : 1;
    setTimeout(type, wait);
  };
  setTimeout(type, 1100);
}

/* ---------- Terminal flow ---------- */
const termSteps = [...document.querySelectorAll("#term li")];
const termBar = document.querySelector(".term-bar i");
{
  let i = 0;
  const tick = () => {
    termSteps.forEach((s, k) => { s.classList.toggle("on", k <= i); s.classList.toggle("now", k === i); });
    termBar.style.width = `${Math.min(i + 1, termSteps.length) / termSteps.length * 100}%`;
    i = (i + 1) % (termSteps.length + 1);
  };
  tick();
  setInterval(tick, 1400);
}

/* ---------- Loop diagram and pipeline highlight ---------- */
const cycle = (selector, ms) => {
  const nodes = [...document.querySelectorAll(selector)];
  if (!nodes.length) return;
  let k = 0;
  setInterval(() => {
    nodes.forEach((n, j) => n.classList.toggle("lit", j === k));
    k = (k + 1) % nodes.length;
  }, ms);
};
cycle(".loop .node", 700);
cycle(".pipeline .pstage", 900);

/* ---------- Hero network canvas (pre-rendered glow sprites, no per-frame blur) ---------- */
const canvas = document.getElementById("net");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const colors = ["192,132,252", "96,165,250", "56,189,248", "167,139,250"];
  const sprites = colors.map((c) => {
    const s = document.createElement("canvas"); s.width = s.height = 32;
    const g = s.getContext("2d"); const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.18, `rgba(${c},1)`); grd.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32); return s;
  });
  let w, h, pts, dpr, running = true;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130, LINK2 = LINK * LINK;
  const init = () => {
    dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(small() ? 38 : 80, (w * h) / 15000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
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
          ctx.strokeStyle = `rgba(${colors[a.c]},${(1 - d2 / LINK2) * .4})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const mx = a.x - mouse.x, my = a.y - mouse.y, m2 = mx * mx + my * my;
      if (m2 < 40000) {
        ctx.strokeStyle = `rgba(56,189,248,${(1 - m2 / 40000) * .6})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
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

/* ---------- Pointer effects: smoothed glow, spotlight, tilt, magnetic ---------- */
if (finePointer) {
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
  }, { passive: true });

  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest(".spot");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });

  const tiltEls = document.querySelectorAll(".terminal, .card, .front, .ms, .problem, .feat, .status-col, .measure, .stat");
  tiltEls.forEach((el) => {
    const max = el.classList.contains("terminal") ? 7 : 5;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translate3d(0, -6px, 0)`;
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
}

/* ---------- Core concepts ---------- */
const concepts = {
  agent: ["Agent", "An agent has its own configuration and permissions. Several independent agents can run in the same game, each with separate sessions."],
  session: ["Session", "A session keeps the ordered interactions of an agent. Switching models keeps the permitted history; a new-agent request starts a fresh conversation."],
  skill: ["Skill", "A skill provides authored task instructions for an agent and can narrow its limits. The game can switch the skill between requests when the situation changes."],
  tool: ["Tool", "A tool exposes a narrow C# operation. The model can only propose a tool call; the game validates it and applies the effect."],
  context: ["Context", "Context supplies authorized game information to the agent, such as the current game state or facts the player has unlocked. The game decides what each agent may see."],
  adapter: ["Adapter", "An adapter connects Arandu to a model backend. Gemini and Groq are supplied examples and share a bounded HTTP client; developers can derive from ModelAdapterBase for any other backend."],
};
const panel = document.getElementById("concept-panel");
document.querySelectorAll(".concept").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".concept").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const [title, text] = concepts[btn.dataset.key];
    panel.classList.remove("swap"); void panel.offsetWidth;
    panel.innerHTML = `<h4>${title}</h4><p>${text}</p>`;
    panel.classList.add("swap");
  });
});

/* ---------- Segmented controls (sample tabs and progress views) ---------- */
const segmented = (btnSel, inkSel, onPick) => {
  const btns = [...document.querySelectorAll(btnSel)];
  const ink = document.querySelector(inkSel);
  const place = () => {
    const a = btns.find((b) => b.classList.contains("active"));
    if (!a || !ink || !a.offsetWidth) return;
    ink.style.width = `${a.offsetWidth}px`;
    ink.style.transform = `translateX(${a.offsetLeft - 5}px)`;
  };
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((s) => { s.classList.toggle("active", s === b); s.setAttribute("aria-selected", String(s === b)); });
    onPick(b); place();
  }));
  window.addEventListener("resize", place);
  window.addEventListener("load", place);
  new IntersectionObserver(place).observe(ink);
  place();
};
segmented(".stab", ".stab-ink", (t) => {
  document.querySelectorAll(".spanel").forEach((p) => p.classList.toggle("active", p.id === `tab-${t.dataset.tab}`));
  document.querySelectorAll(".spanel.active [data-count]").forEach(countUp);
});

/* ---------- Delivery timeline filters ---------- */
const items = document.querySelectorAll(".tl");
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    items.forEach((it) => {
      const show = f === "all" || it.dataset.cat === f || it.classList.contains("tl-next");
      it.classList.toggle("hidden", !show);
      if (show) it.classList.add("visible");
    });
    onScroll();
  });
});

/* =================================================================
   Commit view
   ================================================================= */
const buildCommitView = () => {
  const ins = COMMITS.reduce((s, c) => s + c[5], 0);
  const del = COMMITS.reduce((s, c) => s + c[6], 0);
  const days = new Set(COMMITS.map((c) => c[1])).size;
  document.getElementById("cstats").innerHTML = `
    <div class="cstat"><b data-count="${COMMITS.length}">0</b><span>commits on main</span></div>
    <div class="cstat"><b data-count="${days}">0</b><span>active days, Sep 29 to Nov 16</span></div>
    <div class="cstat"><b class="add">+<span data-count="${ins}">0</span></b><span>lines added</span></div>
    <div class="cstat"><b class="del">−<span data-count="${del}">0</span></b><span>lines removed</span></div>`;

  // Activity chart: one column per day
  const start = new Date("2026-09-29T12:00:00"), end = new Date("2026-11-16T12:00:00");
  const perDay = {};
  COMMITS.forEach((c) => { (perDay[c[1]] = perDay[c[1]] || []).push(c); });
  const maxDay = Math.max(...Object.values(perDay).map((a) => a.length));
  const act = document.getElementById("activity");
  const axis = document.getElementById("activity-axis");
  const tip = document.getElementById("act-tip");
  const totalDays = Math.round((end - start) / 864e5) + 1;
  const deliveryDays = new Set(DELIVERIES.map((d) => d[0]));
  for (let k = 0; k < totalDays; k++) {
    const d = new Date(start.getTime() + k * 864e5);
    const iso = d.toISOString().slice(0, 10);
    const list = perDay[iso] || [];
    const col = document.createElement("div");
    col.className = "aday" + (list.length ? " has" : "") + (deliveryDays.has(iso) ? " mark" : "");
    col.style.setProperty("--k", k);
    col.innerHTML = `<i style="--h:${list.length ? Math.max(8, list.length / maxDay * 100) : 3}%"></i>`;
    const label = `${fmtDate(iso)} · ${list.length} commit${list.length === 1 ? "" : "s"}${deliveryDays.has(iso) ? " · class update" : ""}`;
    col.addEventListener("pointerenter", () => {
      tip.textContent = label;
      document.querySelectorAll(".crow").forEach((r) => r.classList.toggle("hl-row", r.dataset.date === iso));
    });
    col.addEventListener("click", () => {
      const row = document.querySelector(`.crow[data-date="${iso}"]:not(.hide)`);
      if (row) { row.scrollIntoView({ behavior: "smooth", block: "center" }); row.classList.add("open"); }
    });
    act.appendChild(col);
    if (deliveryDays.has(iso)) {
      const s = document.createElement("span");
      s.style.left = `${(k + .5) / totalDays * 100}%`;
      s.textContent = fmtDate(iso);
      axis.appendChild(s);
    }
  }
  act.addEventListener("pointerleave", () => { tip.textContent = "Hover a day"; });
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { act.classList.add("go"); o.disconnect(); } }, { threshold: .3 }).observe(act);

  // Area filters
  const counts = {};
  COMMITS.forEach((c) => { counts[c[2]] = (counts[c[2]] || 0) + 1; });
  const cf = document.getElementById("cfilters");
  cf.innerHTML = `<button class="cchip active" data-cat="all">All <em>${COMMITS.length}</em></button>` +
    Object.entries(AREAS).map(([k, [name, color]]) => `<button class="cchip" data-cat="${k}" style="--c:${color}">${name} <em>${counts[k] || 0}</em></button>`).join("");

  // Grouped log
  const maxChurn = Math.log10(Math.max(...COMMITS.map((c) => c[5] + c[6])) + 1);
  const groups = DELIVERIES.map((d, i) => ({ d, i, list: [] }));
  COMMITS.forEach((c) => {
    const g = groups.find((x) => c[1] <= x.d[0]) || groups[groups.length - 1];
    g.list.push(c);
  });
  const glog = document.getElementById("glog");
  groups.slice().reverse().forEach((g) => {
    if (!g.list.length) return;
    const gi = g.list.reduce((s, c) => s + c[5], 0), gd = g.list.reduce((s, c) => s + c[6], 0);
    const first = fmtDate(g.list[0][1]), last = fmtDate(g.list[g.list.length - 1][1]);
    const sec = document.createElement("div");
    sec.className = "ggroup";
    sec.innerHTML = `
      <span class="gline" aria-hidden="true"><i></i></span>
      <div class="ghead"><h3>${g.d[1]}</h3><span>${g.d[2]}</span><span>${g.list.length} commit${g.list.length === 1 ? "" : "s"} · ${first === last ? first : `${first} – ${last}`}</span><span class="gchurn"><b>+${fmt(gi)}</b> <i>−${fmt(gd)}</i></span></div>`;
    g.list.slice().reverse().forEach((c) => {
      const [hash, date, area, title, files, a, d, text] = c;
      const [areaName, color] = AREAS[area];
      const churn = Math.log10(a + d + 1) / maxChurn * 100;
      const aw = a + d ? churn * a / (a + d) : 0, dw = a + d ? churn * d / (a + d) : 0;
      const row = document.createElement("div");
      row.className = "crow";
      row.dataset.cat = area; row.dataset.date = date;
      row.style.setProperty("--c", color);
      row.innerHTML = `
        <button class="cbtn" aria-expanded="false">
          <span class="chash">${hash}</span>
          <span class="cdate">${fmtDate(date)}</span>
          <span class="ctitle">${title}</span>
          <span class="cside"><span class="ccat">${areaName}</span><span class="cchurn" title="+${fmt(a)} / −${fmt(d)} lines"><span class="a" style="--a:${aw}%"></span><span class="d" style="--d:${dw}%"></span></span></span>
        </button>
        <div class="cmore"><div>
          <p>${text}</p>
          <div class="cmeta"><span>${date}</span><span>${files} file${files === 1 ? "" : "s"} changed</span><span class="plus">+${fmt(a)}</span><span class="minus">−${fmt(d)}</span></div>
        </div></div>`;
      const btn = row.querySelector(".cbtn");
      btn.addEventListener("click", () => {
        const open = row.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
      sec.appendChild(row);
    });
    glog.appendChild(sec);
  });

  // Row entrance, staggered per batch
  const rowIO = new IntersectionObserver((entries) => {
    let n = 0;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      setTimeout(() => el.classList.add("in"), n++ * 60);
      if (el.classList.contains("ggroup")) el.classList.add("in");
      rowIO.unobserve(el);
    });
  }, { threshold: .1, rootMargin: "0px 0px -30px 0px" });
  glog.querySelectorAll(".crow, .ggroup").forEach((el) => rowIO.observe(el));

  // Filtering
  cf.querySelectorAll(".cchip").forEach((chip) => chip.addEventListener("click", () => {
    cf.querySelectorAll(".cchip").forEach((c) => c.classList.toggle("active", c === chip));
    const f = chip.dataset.cat;
    glog.querySelectorAll(".crow").forEach((r) => {
      const show = f === "all" || r.dataset.cat === f;
      r.classList.toggle("hide", !show);
      if (show) { r.classList.remove("in"); requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add("in"))); }
    });
    glog.querySelectorAll(".ggroup").forEach((g) => g.classList.toggle("empty", !g.querySelector(".crow:not(.hide)")));
    act.querySelectorAll(".aday").forEach((col) => col.classList.remove("hl"));
    if (f !== "all") {
      const dates = new Set(COMMITS.filter((c) => c[2] === f).map((c) => c[1]));
      act.querySelectorAll(".aday").forEach((col, k) => {
        const iso = new Date(start.getTime() + k * 864e5).toISOString().slice(0, 10);
        col.classList.toggle("hl", dates.has(iso));
      });
    }
  }));
};
buildCommitView();

segmented(".vbtn", ".vink", (b) => {
  document.querySelectorAll(".pview").forEach((p) => p.classList.toggle("active", p.id === `view-${b.dataset.view}`));
  const view = document.getElementById(`view-${b.dataset.view}`);
  view.querySelectorAll("[data-count]").forEach(countUp);
  view.querySelectorAll(".reveal:not(.visible)").forEach(onVisible);
  onScroll();
});
