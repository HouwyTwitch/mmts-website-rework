/* =========================================================
   MMTS — Page progress bars + preloader
   - Top scroll progress bar (window scroll)
   - Top page-load progress bar (NProgress-like)
   - Full-screen preloader hidden when DOM is interactive
   ========================================================= */

(function () {
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  /* --- 1) Preloader (blocks paint until DOM is ready) --- */
  function buildPreloader() {
    const wrap = el("div", "preloader");
    wrap.setAttribute("aria-hidden", "true");
    const inner = el("div", "preloader__inner");
    const logo  = el("div", "preloader__logo");
    const bar   = el("div", "preloader__bar");
    inner.appendChild(logo);
    inner.appendChild(bar);
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    return wrap;
  }

  /* --- 2) Top page-load progress (incremental) --- */
  function buildPageProgress() {
    const wrap = el("div", "page-progress");
    const fill = el("div", "page-progress__fill");
    wrap.appendChild(fill);
    document.body.appendChild(wrap);
    let value = 0;
    let timer = null;
    const set = (v) => {
      value = Math.max(0, Math.min(1, v));
      fill.style.width = (value * 100) + "%";
      wrap.classList.toggle("is-active", value > 0 && value < 1);
    };
    const start = () => {
      set(0.08);
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (value >= 0.92) return;
        set(value + (0.92 - value) * 0.08);
      }, 220);
    };
    const done = () => {
      if (timer) { clearInterval(timer); timer = null; }
      set(1);
      setTimeout(() => { wrap.classList.remove("is-active"); fill.style.width = "0"; value = 0; }, 380);
    };
    return { start, done, set };
  }

  /* --- 3) Scroll progress bar --- */
  function buildScrollProgress() {
    const wrap = el("div", "scroll-progress");
    wrap.setAttribute("aria-hidden", "true");
    const fill = el("div", "scroll-progress__fill");
    wrap.appendChild(fill);
    document.body.appendChild(wrap);
    let raf = 0;
    function update() {
      raf = 0;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      fill.style.width = (p * 100) + "%";
    }
    window.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---- Boot ---- */
  function boot() {
    buildScrollProgress();
    const pageBar = buildPageProgress();
    const preloader = buildPreloader();

    /* Reveal site quickly, but show preloader at least one frame for smoothness */
    const hidePreloader = () => {
      requestAnimationFrame(() => {
        preloader.classList.add("is-done");
        setTimeout(() => preloader.remove(), 600);
      });
    };
    if (document.readyState === "complete") {
      hidePreloader();
    } else {
      window.addEventListener("load", hidePreloader, { once: true });
    }

    /* Hook into internal-link clicks → start the page-load bar */
    pageBar.start();
    if (document.readyState === "complete") pageBar.done();
    else window.addEventListener("load", () => pageBar.done(), { once: true });

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest && e.target.closest("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (!/\.html?$/i.test(url.pathname) && url.pathname !== "/") return;
        pageBar.start();
      } catch (err) { /* ignore */ }
    });

    window.addEventListener("pageshow", () => pageBar.done());

    window.MMTS_PROGRESS = pageBar;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
