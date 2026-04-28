/* =========================================================
   MMTS – 3D Globe (theme-aware)
   - Static thin parabolic arcs
   - "Packets" = a short bright dash that travels along the SAME arc
     curve via globe.gl's built-in arcDash animation. This guarantees
     packets fly along the parabola in 3D, never along the surface.
   - Bidirectional: two comet entries per segment (one each way).
   - Lang change rewrites text on existing label DOM nodes (no overlap).
   - No auto-rotation. Globe only moves on user input.
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
  const BORDER_DATA_URL  = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  const LABELS_DATA_URL  = "https://cdn.jsdelivr.net/npm/world-countries@4/countries.json";
  const UKRAINE_NAMES    = new Set(["ukraine", "украина"]);
  const UKRAINE_CCN3     = "804";
  /* Must match globe.gl's arcAltitudeAutoScale call below – this scale
     also controls the apex of the parabola the comet rides. */
  const ARC_ALT_SCALE = 0.5;

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

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function lerpLngDeg(a, b, t) {
    let d = b - a;
    if (d >  180) d -= 360;
    if (d < -180) d += 360;
    let out = a + d * t;
    while (out >  180) out -= 360;
    while (out < -180) out += 360;
    return out;
  }

  function paint(globe) {
    const arcReady = "#ff4d6a";
    const arcSoon  = "#ffb547";
    const point    = cssVar("--globe-point")|| "#6ff5dd";
    const atmos    = cssVar("--globe-atmosphere") || "#2adfc3";
    const surface  = cssVar("--globe-color") || "#0d1218";
    const border   = cssVar("--globe-graticule") || "rgba(255,255,255,0.2)";
    const assets   = themeAssets();

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
      .polygonCapColor(() => "rgba(0,0,0,0)")
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(() => border)
      .arcColor((d) => {
        if (d.role === "comet") {
          /* brighter, almost-white tint for the "packet" so it pops on the line */
          return d.status === "ready" ? "#f4fffb" : "#dcf0ff";
        }
        return d.status === "ready" ? arcReady : arcSoon;
      })
      .pointColor(() => point);
  }

  async function loadCountryBorders() {
    if (!window.topojson || typeof window.topojson.feature !== "function") return [];
    try {
      const res = await fetch(BORDER_DATA_URL, { cache: "force-cache" });
      if (!res.ok) return [];
      const topo = await res.json();
      const features = window.topojson.feature(topo, topo.objects.countries).features || [];
      return features.filter((f) => {
        const p = f?.properties || {};
        const name = String(p.ADMIN || p.NAME || p.name || p.NAME_LONG || "").trim().toLowerCase();
        return !UKRAINE_NAMES.has(name);
      });
    } catch (_err) {
      return [];
    }
  }

  async function loadCountryLabels() {
    try {
      const res = await fetch(LABELS_DATA_URL, { cache: "force-cache" });
      if (!res.ok) return [];
      const list = await res.json();
      return list
        .filter((c) => c.ccn3 !== UKRAINE_CCN3 && Array.isArray(c.latlng) && c.latlng.length === 2)
        .map((c) => ({
          lat: c.latlng[0],
          lng: c.latlng[1],
          name_en: c.name.common,
          name_ru: (c.translations && c.translations.rus && c.translations.rus.common) || c.name.common
        }));
    } catch (_err) {
      return [];
    }
  }

  async function build(el, opts) {
    opts = opts || {};
    const lang = () => (document.documentElement.lang === "ru" ? "ru" : "en");

    /* ---- POP + transit cities (static dots on surface) ---- */
    const popsView = POPs.map((p) => ({
      kind: "pop",
      ru: p.name_ru, en: p.name_en, country_ru: p.country_ru, country_en: p.country_en,
      site: p.site, lat: p.lat, lng: p.lng, size: 0.55, status: "colo"
    }));
    const cityView = CITIES.map((c) => ({
      kind: "city",
      ru: c.name_ru, en: c.name_en, lat: c.lat, lng: c.lng,
      size: 0.16, status: c.status
    }));

    /* ---- Arcs: 1 static line + 2 comets (forward + reverse) per segment.
            globe.gl renders each arc as an extruded TubeGeometry along a
            CatmullRom curve through start → midAtAltitude → end, so the
            visible dash automatically rides the parabola in 3D space. ---- */
    const arcsRendered = [];
    SEGMENTS.forEach((s, i) => {
      arcsRendered.push({
        role: "line",
        startLat: s.startLat, startLng: s.startLng,
        endLat:   s.endLat,   endLng:   s.endLng,
        status: s.status, _id: `${i}:l`
      });
      /* forward comet */
      arcsRendered.push({
        role: "comet",
        startLat: s.startLat, startLng: s.startLng,
        endLat:   s.endLat,   endLng:   s.endLng,
        status: s.status, _id: `${i}:f`,
        phase: (i * 0.317) % 1
      });
      /* reverse comet – start/end swapped, half-cycle offset */
      arcsRendered.push({
        role: "comet",
        startLat: s.endLat,   startLng: s.endLng,
        endLat:   s.startLat, endLng:   s.startLng,
        status: s.status, _id: `${i}:r`,
        phase: ((i * 0.317) + 0.5) % 1
      });
    });

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })(el)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .showGraticules(opts.showGraticules !== false)

      /* === ARCS LAYER (lines + traveling packets) === */
      .arcsData(arcsRendered)
      .arcStartLat((d) => d.startLat).arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat).arcEndLng((d) => d.endLng)
      .arcAltitudeAutoScale(ARC_ALT_SCALE)
      /* Lines: thin steady stroke. Comets: thicker so the "ball" reads. */
      .arcStroke((d) => (d.role === "comet" ? 0.7 : 0.18))
      /* Lines: full dash (solid). Comets: tiny dash with big gap → one
         visible bright segment per cycle, looking like a packet. */
      .arcDashLength((d) => (d.role === "comet" ? 0.04 : 1))
      .arcDashGap((d)    => (d.role === "comet" ? 4    : 0))
      /* Stagger comet phases so packets on neighbouring lines don't sync */
      .arcDashInitialGap((d) => (d.role === "comet" ? d.phase * 4 : 0))
      /* Slow, calm travel – one full cycle ~14s (long arcs feel similar
         to short arcs because dash is parameterised in arc-length units) */
      .arcDashAnimateTime((d) => (d.role === "comet" ? 14000 : 0))
      .arcsTransitionDuration(0)

      /* === STATIC POINTS for cities + PoPs (surface dots) === */
      .pointsMerge(false)
      .pointsData([...cityView, ...popsView])
      .pointAltitude(0.005)
      .pointRadius((d) => d.size)
      .pointResolution(12)
      .pointLabel((d) => {
        const isRu = lang() === "ru";
        const name = isRu ? d.ru : d.en;
        const country = isRu ? d.country_ru : d.country_en;
        return country ? `${name}\n${country}` : name;
      })

      /* === HTML LABELS for PoPs + country names === */
      .htmlElementsData(popsView)
      .htmlLat((d) => d.lat).htmlLng((d) => d.lng)
      .htmlAltitude((d) => d.kind === "pop" ? 0.012 : 0.003)
      .htmlElement((d) => {
        const node = document.createElement("div");
        if (d.kind === "pop") {
          node.className = "globe-html-label";
          node.textContent = lang() === "ru" ? d.ru : d.en;
        } else {
          node.className = "globe-html-country-label";
          node.textContent = lang() === "ru" ? d.name_ru : d.name_en;
        }
        /* Store the live DOM node back on the datum so we can rewrite text
           on language change WITHOUT touching the data binding (which would
           cause three-globe to spawn duplicate elements). */
        d._domEl = node;
        return node;
      })

      .ringsData([]);

    const [borderFeatures, countryLabels] = await Promise.all([
      loadCountryBorders(),
      loadCountryLabels()
    ]);

    if (borderFeatures.length) {
      globe
        .polygonsData(borderFeatures)
        .polygonAltitude(0.0012)
        .polygonsTransitionDuration(0);
    }

    if (countryLabels.length) {
      globe.htmlElementsData([...popsView, ...countryLabels]);
    }

    paint(globe);

    if (typeof globe.renderer === "function") {
      const r = globe.renderer();
      if (r && typeof r.setPixelRatio === "function") {
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      }
    }

    /* Controls – auto-rotate disabled everywhere. */
    const ctrl = globe.controls();
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.09;
    ctrl.rotateSpeed = 0.42;
    ctrl.zoomSpeed = 0.55;
    ctrl.autoRotate = false;
    ctrl.autoRotateSpeed = 0;
    ctrl.enableZoom = !!opts.enableZoom;
    ctrl.enablePan = false;
    ctrl.minDistance = 105;
    ctrl.maxDistance = 800;

    /* Initial camera */
    globe.pointOfView({ lat: 50, lng: 50, altitude: opts.altitude || 2.2 }, 0);

    /* Resize observer (debounced via rAF) */
    let rafId = 0, lastW = 0, lastH = 0;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.round(e.contentRect.width);
        const h = Math.round(e.contentRect.height);
        if (w === lastW && h === lastH) return;
        lastW = w; lastH = h;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => globe.width(w).height(h));
      }
    });
    ro.observe(el);

    /* Click → bubble city selection (only the static city/pop points). */
    globe.onPointClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", {
        detail: { ...d, name: lang() === "ru" ? d.ru : d.en },
        bubbles: true
      }));
    });

    /* Theme reactivity – repaint colors; HTML country labels adapt via CSS. */
    document.addEventListener("mmts:themechange", () => { paint(globe); });

    /* Language reactivity – rewrite text on the LIVE label nodes; do not
       touch htmlElementsData, otherwise three-globe spawns duplicates. */
    document.addEventListener("mmts:langchange", () => {
      const cur = lang();
      popsView.forEach((p) => {
        if (p._domEl) p._domEl.textContent = cur === "ru" ? p.ru : p.en;
      });
      countryLabels.forEach((c) => {
        if (c._domEl) c._domEl.textContent = cur === "ru" ? c.name_ru : c.name_en;
      });
    });

    /* Single smooth ease-in-out tween – no zoom-out → zoom-in pop. */
    function flyTo(targetLat, targetLng, targetAlt, duration) {
      const pov = globe.pointOfView() || {};
      const fromLat = isFinite(pov.lat) ? pov.lat : targetLat;
      const fromLng = isFinite(pov.lng) ? pov.lng : targetLng;
      const fromAlt = isFinite(pov.altitude) ? pov.altitude : 2.2;
      const dur = duration || 1700;
      const start = performance.now();
      function step(now) {
        const tt = Math.min(1, (now - start) / dur);
        const e = easeInOutCubic(tt);
        globe.pointOfView({
          lat: fromLat + (targetLat - fromLat) * e,
          lng: lerpLngDeg(fromLng, targetLng, e),
          altitude: fromAlt + (targetAlt - fromAlt) * e
        }, 0);
        if (tt < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    el.addEventListener("mmts:globe:destroy", () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    }, { once: true });

    globe.flyTo = flyTo;
    return globe;
  }

  async function initHero(selector) {
    const el = document.querySelector(selector || "#globe-hero");
    if (!el) return null;
    return build(el, { enableZoom: false, altitude: 1.85, showGraticules: true });
  }
  async function initInteractive(selector) {
    const el = document.querySelector(selector || "#globe-network");
    if (!el) return null;
    return build(el, { enableZoom: true, altitude: 1.6, showGraticules: true });
  }

  window.MMTS_GLOBE = { initHero, initInteractive };
})();
