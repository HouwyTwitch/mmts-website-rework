/* =========================================================
   MMTS – main bindings
   - sticky nav scroll state
   - mobile burger menu
   - reveal-on-scroll
   - seamless page transitions (View Transitions API + JS fallback)
   - safe DOM helpers (no innerHTML on user input)
   ========================================================= */

(function () {
  /* ---------- Helpers ---------- */
  const qs  = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* HTML-escape any user-provided string before rendering */
  const escape = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  window.MMTS_ESCAPE = escape;

  /* ---------- Sticky nav ---------- */
  function bindNavScroll() {
    const nav = qs(".nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Burger menu ---------- */
  function bindBurger() {
    const btn = qs(".nav__burger");
    const links = qs(".nav__links");
    if (!btn || !links) return;
    btn.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    qsa(".nav__link", links).forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("is-open"))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") links.classList.remove("is-open");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function bindReveal() {
    if (!("IntersectionObserver" in window)) {
      qsa(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    qsa(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Year in footer ---------- */
  function bindYear() {
    qsa("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Mark active nav link ---------- */
  function markActive() {
    const here = location.pathname.split("/").pop() || "index.html";
    qsa(".nav__link").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href === here || (href === "index.html" && (here === "" || here === "/"))) {
        a.classList.add("is-active");
      }
    });
  }

  /* ---------- Seamless page transitions ----------
     Uses View Transitions API where available, otherwise a JS curtain.
     Only intercepts same-origin internal links. */
  function bindTransitions() {
    /* Skip if user prefers reduced motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isInternal = (a) => {
      if (!(a instanceof HTMLAnchorElement)) return false;
      if (a.target && a.target !== "_self") return false;
      if (a.hasAttribute("download")) return false;
      if (a.dataset.noTransition !== undefined) return false;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return false;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return false;
        if (!/\.html?$/i.test(url.pathname) && url.pathname !== "/") return false;
        return true;
      } catch (e) { return false; }
    };

    const supportsVT = "startViewTransition" in document;

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a");
      if (!isInternal(a)) return;
      const url = a.href;

      if (supportsVT) {
        e.preventDefault();
        document.startViewTransition(() => { location.href = url; });
        return;
      }

      e.preventDefault();
      const mask = ensureMask();
      mask.classList.remove("is-in");
      mask.classList.add("is-out");
      setTimeout(() => { location.href = url; }, 360);
    });

    /* Reveal on enter (JS fallback) */
    if (!supportsVT) {
      window.addEventListener("pageshow", () => {
        const mask = ensureMask();
        mask.classList.remove("is-out");
        mask.classList.add("is-in");
      });
    }

    function ensureMask() {
      let m = qs(".page-mask");
      if (!m) {
        m = document.createElement("div");
        m.className = "page-mask";
        document.body.appendChild(m);
      }
      return m;
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    bindNavScroll();
    bindBurger();
    bindReveal();
    bindYear();
    markActive();
    bindTransitions();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
