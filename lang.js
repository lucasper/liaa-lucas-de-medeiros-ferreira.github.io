// Arandu site V7 · language switch (Eng / PT-BR) and page transitions.
// Each language is its own page (index.html / index.pt-br.html, benchmark.html / benchmark.pt-br.html),
// linked with <link rel="alternate" hreflang>. The switch and the nav are plain links, so they work without JS.
// With JS:
//  - the language choice is remembered in this browser, and switching keeps the section you were reading;
//  - the switch thumb slides to the chosen language before the page changes;
//  - links to the other pages fade the page out, and the next page fades in (styles.css, "Page transitions").
// Loaded in <head> (not deferred) so a remembered choice redirects, and the entry animation is chosen, before the page paints.
(() => {
  const KEY = "arandu-lang";
  const TKEY = "arandu-transition";
  const html = document.documentElement;
  const page = html.lang.toLowerCase().startsWith("pt") ? "pt-br" : "en";
  const store = (s) => ({
    get: (k) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { s.setItem(k, v); } catch (e) { /* private mode: links still work */ } },
    del: (k) => { try { s.removeItem(k); } catch (e) { /* ignore */ } },
  });
  let local, session;
  try { local = store(localStorage); session = store(sessionStorage); } catch (e) { local = session = store(null); }
  const alt = (lang) => {
    const l = document.querySelector(`link[rel="alternate"][data-lang="${lang}"]`);
    return l ? l.getAttribute("href") : null;
  };

  // A visitor who picked the other language before goes straight to it.
  const pref = local.get(KEY);
  if (pref && pref !== page && alt(pref)) {
    html.style.visibility = "hidden";
    location.replace(alt(pref) + location.hash);
    return;
  }

  // Entry animation: how did we get here? (set by the page we came from, read once)
  const came = session.get(TKEY);
  session.del(TKEY);
  html.dataset.enter = came || "page"; // with reduced motion, styles.css keeps only the fade

  const LEAVE_MS = 420;
  let leaving = false;

  // Fade the page out, then go. `kind` picks the exit and the next page's entry animation.
  const go = (url, kind) => {
    if (leaving) return;
    leaving = true;
    session.set(TKEY, kind);
    html.dataset.leave = kind;
    html.classList.add("is-leaving");
    setTimeout(() => { location.href = url; }, LEAVE_MS);
  };

  // Back/forward cache: a page restored from history must not stay faded out.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    html.classList.remove("is-leaving");
    delete html.dataset.leave;
    html.dataset.enter = "page";
    session.del(TKEY);
    placeThumb(false);
  });

  const currentSection = () => {
    let id = "";
    document.querySelectorAll("main section[id]").forEach((s) => {
      if (s.getBoundingClientRect().top <= 140) id = s.id;
    });
    return id;
  };

  // Sliding thumb behind the active language.
  let sw = null, thumb = null;
  const placeThumb = (animate, target) => {
    if (!sw || !thumb) return;
    const a = target || sw.querySelector("a.active");
    if (!a) return;
    if (!animate) thumb.style.transition = "none";
    thumb.style.width = `${a.offsetWidth}px`;
    thumb.style.transform = `translateX(${a.offsetLeft}px)`;
    if (!animate) { void thumb.offsetWidth; thumb.style.transition = ""; }
  };

  const isPageLink = (a, e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (!/\.html$/.test(url.pathname)) return false;
    return url.pathname !== location.pathname; // same page + hash: let the browser scroll
  };

  document.addEventListener("DOMContentLoaded", () => {
    sw = document.querySelector(".lang-switch");
    if (sw) {
      thumb = document.createElement("span");
      thumb.className = "lang-thumb";
      thumb.setAttribute("aria-hidden", "true");
      sw.prepend(thumb);
      sw.classList.add("has-thumb");
      placeThumb(false);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeThumb(false));
      window.addEventListener("resize", () => placeThumb(false));

      sw.querySelectorAll("a[data-lang]").forEach((a) => {
        a.addEventListener("click", (e) => {
          const lang = a.dataset.lang;
          local.set(KEY, lang);
          e.preventDefault();
          if (lang === page || leaving) return;
          // Slide the thumb and swap the highlight, then change the page.
          sw.querySelectorAll("a[data-lang]").forEach((x) => {
            const on = x === a;
            x.classList.toggle("active", on);
            if (on) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current");
          });
          placeThumb(true, a);
          const id = currentSection();
          // The page slides the same way as the thumb.
          const dir = a.offsetLeft > (sw.querySelector(`a[data-lang="${page}"]`) || a).offsetLeft ? "lang-next" : "lang-prev";
          go(a.getAttribute("href").split("#")[0] + (id ? `#${id}` : ""), dir);
        });
      });
    }

    // Every other link to another page of the site.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.closest(".lang-switch") || !isPageLink(a, e)) return;
      e.preventDefault();
      go(a.href, "page");
    });
  });
})();
