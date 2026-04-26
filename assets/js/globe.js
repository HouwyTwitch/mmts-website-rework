/* =========================================================
   MMTS — 3D Globe (theme-aware, optimized animation)
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

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function themeAssets() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      isLight,
      earthTexture: isLight
        ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        : "https://unpkg.com/three-globe/example/img/earth-night.jpg",
      bumpTexture: "https://unpkg.com/three-globe/example/img/earth-topology.png"
    };
  }

  function paint(globe) {
    const arcReady = cssVar("--globe-arc") || "#2adfc3";
    const arcSoon = cssVar("--brand-2") || "#29c4ff";
    const point = cssVar("--globe-point") || "#6ff5dd";
    const atmos = cssVar("--globe-atmosphere") || "#2adfc3";
    const surface = cssVar("--globe-color") || "#0d1218";
    const assets = themeAssets();

    const mat = globe.globeMaterial();
    if (mat && mat.color) mat.color.set(surface);
    if (mat && mat.emissive) mat.emissive.set(assets.isLight ? "#b2cce0" : "#0a0f15");
    if (mat) {
      mat.emissiveIntensity = assets.isLight ? 0.06 : 0.18;
      if ("shininess" in mat) mat.shininess = assets.isLight ? 0.12 : 0.55;
      mat.needsUpdate = true;
    }

    globe
      .globeImageUrl(assets.earthTexture)
      .bumpImageUrl(assets.bumpTexture)
      .atmosphereColor(atmos)
      .atmosphereAltitude(0.17)
      .arcColor((d) => (d.status === "ready" ? arcReady : arcSoon))
      .pointColor((d) => (d.kind === "mover" ? arcReady : point));
  }

  function build(el, opts) {
    opts = opts || {};
    const lang = document.documentElement.lang === "ru" ? "ru" : "en";

    const popsData = POPs.map((p) => ({
      kind: "pop",
      name: lang === "ru" ? p.name_ru : p.name_en,
      country: lang === "ru" ? p.country_ru : p.country_en,
      site: p.site,
      lat: p.lat,
      lng: p.lng,
      size: 0.65,
      status: "colo"
    }));

    const cityData = CITIES.map((c) => ({
      kind: "city",
      name: lang === "ru" ? c.name_ru : c.name_en,
      lat: c.lat,
      lng: c.lng,
      size: 0.18,
      status: c.status
    }));

    const movers = [];
    const staticPoints = () => [...cityData, ...popsData];
    const staticPaths = SEGMENTS.map((s) => ({
      status: s.status,
      points: [
        { lat: s.startLat, lng: s.startLng },
        { lat: s.endLat, lng: s.endLng }
      ]
    }));

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })(el)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .showGraticules(opts.showGraticules !== false)
      .pathsData(staticPaths)
      .pathPoints((d) => d.points)
      .pathPointLat((p) => p.lat)
      .pathPointLng((p) => p.lng)
      .pathColor((d) => (d.status === "ready" ? cssVar("--globe-arc") || "#2adfc3" : cssVar("--brand-2") || "#29c4ff"))
      .pathStroke(0.16)
      .pathDashLength(1)
      .pathDashGap(0)
      .pathDashAnimateTime(0)
      .arcsData(SEGMENTS)
      .arcStartLat((d) => d.startLat)
      .arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat)
      .arcEndLng((d) => d.endLng)
      .arcAltitudeAutoScale(0.24)
      .arcStroke(0.7)
      .arcDashLength(0.035)
      .arcDashGap(4.5)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime((d) => (d.status === "ready" ? 4200 : 6200))
      .arcsTransitionDuration(0)
      .pointsData(staticPoints())
      .pointAltitude((d) => (d.kind === "mover" ? 0.012 : 0.005))
      .pointRadius((d) => d.size)
      .pointResolution(12)
      .htmlElementsData(popsData)
      .htmlLat((d) => d.lat)
      .htmlLng((d) => d.lng)
      .htmlAltitude(0.012)
      .htmlElement((d) => {
        const el = document.createElement("div");
        el.className = "globe-html-label";
        el.textContent = d.name;
        return el;
      })
      .ringsData([])
      .ringMaxRadius(2.4)
      .ringPropagationSpeed(1.15)
      .ringRepeatPeriod(2400)
      .ringAltitude(0.005);

    paint(globe);
    if (typeof globe.renderer === "function") {
      const renderer = globe.renderer();
      if (renderer && typeof renderer.setPixelRatio === "function") {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      }
    }

    const ctrl = globe.controls();
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.08;
    ctrl.rotateSpeed = 0.42;
    ctrl.zoomSpeed = 0.5;
    ctrl.autoRotate = opts.autoRotate !== false;
    ctrl.autoRotateSpeed = opts.autoRotateSpeed || 0.35;
    ctrl.enableZoom = false;
    ctrl.enablePan = false;
    ctrl.minDistance = 0.001;
    ctrl.maxDistance = 2000;
    ctrl.zoomToCursor = true;

    ctrl.addEventListener("start", () => {
      ctrl.autoRotate = false;
    });

    globe.pointOfView({ lat: 50, lng: 50, altitude: opts.altitude || 2.2 }, 0);

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const r = e.contentRect;
        globe.width(r.width).height(r.height);
      }
    });
    ro.observe(el);

    globe.onPointClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", { detail: d, bubbles: true }));
    });
    globe.onLabelClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", { detail: d, bubbles: true }));
    });

    document.addEventListener("mmts:themechange", () => paint(globe));
    document.addEventListener("mmts:langchange", () => {
      const lang2 = document.documentElement.lang === "ru" ? "ru" : "en";
      const newPops = POPs.map((p) => ({
        kind: "pop",
        name: lang2 === "ru" ? p.name_ru : p.name_en,
        country: lang2 === "ru" ? p.country_ru : p.country_en,
        site: p.site,
        lat: p.lat,
        lng: p.lng,
        size: 0.65,
        status: "colo"
      }));
      const newCities = CITIES.map((c) => ({
        kind: "city",
        name: lang2 === "ru" ? c.name_ru : c.name_en,
        lat: c.lat,
        lng: c.lng,
        size: 0.18,
        status: c.status
      }));
      cityData.splice(0, cityData.length, ...newCities);
      popsData.splice(0, popsData.length, ...newPops);
      globe.pointsData(staticPoints());
      globe.htmlElementsData(newPops);
      globe.ringsData([]);
    });

    el.addEventListener(
      "mmts:globe:destroy",
      () => {
        ro.disconnect();
      },
      { once: true }
    );

    return globe;
  }

  function initHero(selector) {
    const el = document.querySelector(selector || "#globe-hero");
    if (!el) return null;
    return build(el, {
      autoRotate: true,
      autoRotateSpeed: 0.3,
      enableZoom: false,
      altitude: 1.72,
      showGraticules: true,
      showRings: false
    });
  }

  function initInteractive(selector) {
    const el = document.querySelector(selector || "#globe-network");
    if (!el) return null;
    return build(el, {
      autoRotate: true,
      autoRotateSpeed: 0.18,
      enableZoom: false,
      altitude: 1.15,
      showGraticules: true,
      showRings: true
    });
  }

  window.MMTS_GLOBE = { initHero, initInteractive };
})();
