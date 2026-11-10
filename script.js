// Arandu project site: small progressive enhancements. The page works without JS.
document.documentElement.classList.add("js");

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal, .kingdom, .measure");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// Active nav link
const links = [...document.querySelectorAll(".nav a")];
const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
const onScroll = () => {
  const y = window.scrollY + 120;
  let current = -1;
  sections.forEach((s, i) => { if (s && s.offsetTop <= y) current = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === current));
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
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

// Hero flow animation
const steps = document.querySelectorAll(".flow-steps li");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  steps.forEach((s) => s.classList.add("on"));
} else {
  let i = 0;
  const tick = () => {
    steps.forEach((s, k) => s.classList.toggle("on", k <= i));
    i = (i + 1) % (steps.length + 1);
  };
  tick();
  setInterval(tick, 1300);
}

// Core concepts
const concepts = {
  agent: ["Agent", "An agent has its own configuration and permissions. Several independent agents can run in the same game, each with separate sessions."],
  session: ["Session", "A session keeps the ordered interactions of an agent. Switching models keeps the permitted history; a new-agent request starts a fresh conversation."],
  skill: ["Skill", "A skill provides authored task instructions. In ThroneRoom, the Vizier switches from a scheming skill to an honest one after the scouts report."],
  tool: ["Tool", "A tool exposes a narrow C# operation. The model can only propose a tool call; the game validates it and applies the effect."],
  context: ["Context", "Context supplies authorized game information to the agent, such as the kingdom state or a verified scout report."],
  adapter: ["Adapter", "An adapter connects Arandu to a model backend. Gemini and Groq are supplied examples; developers can derive from ModelAdapterBase for any other backend."],
};
const panel = document.getElementById("concept-panel");
document.querySelectorAll(".concept").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".concept").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const [title, text] = concepts[btn.dataset.key];
    panel.innerHTML = `<h4>${title}</h4><p>${text}</p>`;
  });
});

// Timeline filters
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
  });
});
