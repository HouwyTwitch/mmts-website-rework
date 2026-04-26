/* =========================================================
   MMTS — 3D Globe (theme-aware, parabolic arcs)
   Uses globe.gl (UMD) — already loaded from CDN by the page.
   Renders MMTS POPs + transit cities + animated arcs.
   ========================================================= */

(function () {
  if (!window.MMTS_NETWORK) {
    console.warn("[mmts:globe] dataset missing");
    return;
  }
  if (typeof Globe !== "function") {
    console.warn("[mmts:globe] Globe lib not available");
    return;
  }

  const { POPs, CITIES, SEGMENTS } = window.MMTS_NETWORK;

  /* Colors driven by CSS variables — they change with the theme. */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function paint(globe) {
    const arcReady = cssVar("--globe-arc") || "#2adfc3";
    const arcSoon  = cssVar("--brand-2")   || "#29c4ff";
    const point    = cssVar("--globe-point") || "#6ff5dd";
    const atmos    = cssVar("--globe-atmosphere") || "#2adfc3";
    const surface  = cssVar("--globe-color") || "#0d1218";
    const isLight  = document.documentElement.getAttribute("data-theme") === "light";

    /* Mutate the existing material's THREE.Color objects via .set(hex)
       so we don't depend on a globally-exposed THREE constructor. */
    const mat = globe.globeMaterial();
    if (mat && mat.color) mat.color.set(surface);
    if (mat && mat.emissive) mat.emissive.set(isLight ? "#a8c4dc" : "#0a0f15");
    if (mat) {
      mat.emissiveIntensity = isLight ? 0.05 : 0.18;
      if ("shininess" in mat) mat.shininess = isLight ? 0.2 : 0.6;
      mat.needsUpdate = true;
    }

    globe
      .atmosphereColor(atmos)
      .atmosphereAltitude(0.2)
      .arcColor((d) => (d.status === "ready" ? arcReady : arcSoon))
      .pointColor(() => point)
      .ringColor(() => (t) => `rgba(${hex2rgb(arcReady)}, ${1 - t})`);
  }

  function hex2rgb(hex) {
    const h = hex.replace("#", "").trim();
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  function build(el, opts) {
    opts = opts || {};
    const lang = document.documentElement.lang === "ru" ? "ru" : "en";

    /* Build dataset for globe.gl */
    const popsData = POPs.map((p) => ({
      name: lang === "ru" ? p.name_ru : p.name_en,
      country: lang === "ru" ? p.country_ru : p.country_en,
      site: p.site,
      lat: p.lat, lng: p.lng,
      size: 0.65, status: "colo"
    }));
    const cityData = CITIES.map((c) => ({
      name: lang === "ru" ? c.name_ru : c.name_en,
      lat: c.lat, lng: c.lng,
      size: 0.18, status: c.status
    }));

    const labelData = popsData; // labels only on official PoPs to avoid clutter

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })(el)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .showGraticules(opts.showGraticules !== false)

      /* Arcs — magic parabolic "arches" between consecutive cities */
      .arcsData(SEGMENTS)
      .arcStartLat((d) => d.startLat).arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat).arcEndLng((d) => d.endLng)
      .arcAltitudeAutoScale(0.35)
      .arcStroke(0.35)
      .arcDashLength(0.5)
      .arcDashGap(2.4)
      .arcDashAnimateTime((d) => (d.status === "ready" ? 4500 : 7000))
      .arcsTransitionDuration(0)

      /* Points — small dots at every transit city + bigger at PoPs */
      .pointsData([...cityData, ...popsData])
      .pointAltitude(0.005)
      .pointRadius((d) => d.size)
      .pointResolution(8)

      /* Labels for PoPs */
      .labelsData(labelData)
      .labelLat((d) => d.lat).labelLng((d) => d.lng)
      .labelText((d) => d.name)
      .labelSize(0.55)
      .labelDotRadius(0.35)
      .labelColor(() => cssVar("--fg") || "#fff")
      .labelResolution(2)
      .labelAltitude(0.012)

      /* Pulsing rings at PoPs */
      .ringsData(popsData)
      .ringMaxRadius(2.5)
      .ringPropagationSpeed(1.2)
      .ringRepeatPeriod(2200)
      .ringAltitude(0.005);

    paint(globe);

    /* Auto-rotate */
    if (opts.autoRotate !== false) {
      const ctrl = globe.controls();
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = opts.autoRotateSpeed || 0.45;
      ctrl.enableZoom = !!opts.enableZoom;
      ctrl.enablePan = false;
      ctrl.minDistance = 200;
      ctrl.maxDistance = 600;
    }

    /* Initial camera focus on Eurasia */
    globe.pointOfView({ lat: 50, lng: 50, altitude: opts.altitude || 2.2 }, 0);

    /* Resize observer keeps the canvas fluid */
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const r = e.contentRect;
        globe.width(r.width).height(r.height);
      }
    });
    ro.observe(el);

    /* Click → bubble city selection */
    globe.onPointClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", { detail: d, bubbles: true }));
    });
    globe.onLabelClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", { detail: d, bubbles: true }));
    });

    /* Re-paint on theme change; rebuild labels on lang change */
    document.addEventListener("mmts:themechange", () => paint(globe));
    document.addEventListener("mmts:langchange", () => {
      const lang2 = document.documentElement.lang === "ru" ? "ru" : "en";
      const newPops = POPs.map((p) => ({
        name: lang2 === "ru" ? p.name_ru : p.name_en,
        country: lang2 === "ru" ? p.country_ru : p.country_en,
        site: p.site, lat: p.lat, lng: p.lng, size: 0.65, status: "colo"
      }));
      const newCities = CITIES.map((c) => ({
        name: lang2 === "ru" ? c.name_ru : c.name_en,
        lat: c.lat, lng: c.lng, size: 0.18, status: c.status
      }));
      globe.pointsData([...newCities, ...newPops]);
      globe.labelsData(newPops);
      globe.ringsData(newPops);
    });

    return globe;
  }

  /* Public init helpers */
  function initHero(selector) {
    const el = document.querySelector(selector || "#globe-hero");
    if (!el) return null;
    return build(el, {
      autoRotate: true,
      autoRotateSpeed: 0.4,
      enableZoom: false,
      altitude: 2.1,
      showGraticules: true
    });
  }

  function initInteractive(selector) {
    const el = document.querySelector(selector || "#globe-network");
    if (!el) return null;
    return build(el, {
      autoRotate: true,
      autoRotateSpeed: 0.25,
      enableZoom: true,
      altitude: 2.4,
      showGraticules: true
    });
  }

  window.MMTS_GLOBE = { initHero, initInteractive };
})();
