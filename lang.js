// Arandu site V6 · language switch (Eng / PT-BR).
// Each language is its own page (index.html / index.pt-br.html, benchmark.html / benchmark.pt-br.html),
// linked with <link rel="alternate" hreflang>. The switch is plain links, so it works without JS.
// With JS: the choice is remembered in this browser, and switching keeps the section you were reading.
// Loaded in <head> (not deferred) so a remembered choice redirects before the page paints.
(() => {
  const KEY = "arandu-lang";
  const html = document.documentElement;
  const page = html.lang.toLowerCase().startsWith("pt") ? "pt-br" : "en";
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: links still work */ } };
  const alt = (lang) => {
    const l = document.querySelector(`link[rel="alternate"][data-lang="${lang}"]`);
    return l ? l.getAttribute("href") : null;
  };

  // A visitor who picked the other language before goes straight to it.
  const pref = read();
  if (pref && pref !== page && alt(pref)) {
    html.style.visibility = "hidden";
    location.replace(alt(pref) + location.hash);
    return;
  }

  const currentSection = () => {
    let id = "";
    document.querySelectorAll("main section[id]").forEach((s) => {
      if (s.getBoundingClientRect().top <= 140) id = s.id;
    });
    return id;
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lang-switch a[data-lang]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const lang = a.dataset.lang;
        save(lang);
        e.preventDefault();
        if (lang === page) return;
        const id = currentSection();
        location.href = a.getAttribute("href").split("#")[0] + (id ? `#${id}` : "");
      });
    });
  });
})();
