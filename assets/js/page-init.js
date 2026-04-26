/* =========================================================
   MMTS — Per-page bootstrapping
   Reads data-page from its own <script> tag and starts the
   appropriate widgets (globe, contact form, etc.).
   ========================================================= */

(function () {
  const me = document.currentScript;
  const page = me ? me.getAttribute("data-page") : null;

  function start() {
    if (!window.MMTS_GLOBE) return; /* globe lib not on this page */

    if (page === "home") {
      if (typeof Globe === "function") {
        window.MMTS_GLOBE.initHero("#globe-hero");
      }
    }

    if (page === "network") {
      if (typeof Globe === "function") {
        const globe = window.MMTS_GLOBE.initInteractive("#globe-network");
        if (!globe) return;

        /* Side-list filtering & focus */
        const list = document.getElementById("pop-list");
        const search = document.getElementById("pop-search");
        const empty = document.getElementById("pop-empty");

        function filter() {
          const q = (search.value || "").trim().toLowerCase();
          let visible = 0;
          list.querySelectorAll(".pop-item").forEach((el) => {
            const txt = (el.dataset.search || "").toLowerCase();
            const show = !q || txt.includes(q);
            el.style.display = show ? "" : "none";
            if (show) visible++;
          });
          empty.style.display = visible === 0 ? "" : "none";
        }
        if (search) search.addEventListener("input", filter);

        function normalizeLng(lng) {
          let out = lng;
          while (out > 180) out -= 360;
          while (out < -180) out += 360;
          return out;
        }

        function midLng(a, b) {
          const a1 = normalizeLng(a);
          const b1 = normalizeLng(b);
          let d = b1 - a1;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          return normalizeLng(a1 + d / 2);
        }

        function focusCity(lat, lng) {
          const pov = globe.pointOfView() || {};
          const curLat = isFinite(pov.lat) ? pov.lat : lat;
          const curLng = isFinite(pov.lng) ? pov.lng : lng;
          const curAlt = isFinite(pov.altitude) ? pov.altitude : 1.2;
          const endAlt = Math.max(0.32, Math.min(curAlt, 2.6));
          const travelAlt = Math.min(Math.max(endAlt + 0.45, 0.78), 2.9);

          globe.pointOfView(
            { lat: (curLat + lat) / 2, lng: midLng(curLng, lng), altitude: travelAlt },
            520
          );
          window.setTimeout(() => {
            globe.pointOfView({ lat, lng, altitude: endAlt }, 900);
          }, 280);
        }

        list.addEventListener("click", (e) => {
          const item = e.target.closest(".pop-item");
          if (!item) return;
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          if (!isFinite(lat) || !isFinite(lng)) return;
          focusCity(lat, lng);
        });

        document.addEventListener("mmts:globe:select", (e) => {
          const d = e.detail || {};
          if (!d.name) return;
          const found = list.querySelector(`[data-name="${CSS.escape(d.name)}"]`);
          if (found) {
            list.querySelectorAll(".pop-item").forEach((x) => x.classList.remove("is-active"));
            found.classList.add("is-active");
            found.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });

        /* Re-filter on language change (text changed under us) */
        document.addEventListener("mmts:langchange", () => filter());
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
