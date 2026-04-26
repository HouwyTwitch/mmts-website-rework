/* =========================================================
   MMTS – Theme
   Default: system preference. Override via localStorage / button.
   This script is loaded SYNCHRONOUSLY in <head> to avoid FOUC.
   ========================================================= */

(function () {
  const KEY = "mmts:theme";
  const root = document.documentElement;

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function applyTheme(theme, opts) {
    const save = !(opts && opts.save === false);
    if (theme !== "dark" && theme !== "light") theme = systemTheme();
    root.setAttribute("data-theme", theme);
    if (save) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent("mmts:themechange", { detail: { theme } }));
  }

  /* Apply IMMEDIATELY (no DOMContentLoaded) – kills FOUC */
  applyTheme(getStored() || systemTheme(), { save: false });

  /* Follow system theme if user hasn't picked one */
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!getStored()) applyTheme(e.matches ? "dark" : "light", { save: false });
    });
  }

  /* Bind buttons after DOM is ready */
  function bindButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        btn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindButtons);
  } else {
    bindButtons();
  }

  window.MMTS_THEME = { applyTheme, systemTheme };
})();
