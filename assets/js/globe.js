/* =========================================================
   MMTS — 3D Globe (theme-aware)
   - Static thin parabolic arcs
   - Packets travel along the SAME parabolic curve (slerp + parabola)
     in BOTH directions
   - Smooth single-tween camera flights
   - Clean label rebuild on language change (no overlap)
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

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;
  /* globe.gl computes arc altitude as: arcAltitudeAutoScale × geodesicDistance(rad).
     We mirror that exactly so packets ride the SAME parabola the line traces. */
  const ARC_ALT_SCALE = 0.5;
  /* Each line keeps a small minimum lift even for very short hops, so packets
     are clearly off the surface for the whole journey. */
  const MIN_PEAK_ALT  = 0.12;

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

  /* --- Spherical helpers --- */
  function latLngToVec(lat, lng) {
    const φ = lat * RAD, λ = lng * RAD;
    const cosφ = Math.cos(φ);
    return [cosφ * Math.cos(λ), Math.sin(φ), cosφ * Math.sin(λ)];
  }
  function vecToLatLng(v) {
    const r = Math.hypot(v[0], v[1], v[2]);
    return { lat: Math.asin(v[1] / r) * DEG, lng: Math.atan2(v[2], v[0]) * DEG };
  }
  /* Slerp on the unit sphere — produces points along the great circle arc */
  function slerp(a, b, t) {
    let dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    dot = Math.min(1, Math.max(-1, dot));
    const ω = Math.acos(dot);
    if (ω < 1e-6) return a;
    const sinω = Math.sin(ω);
    const k1 = Math.sin((1 - t) * ω) / sinω;
    const k2 = Math.sin(t * ω) / sinω;
    return [a[0]*k1 + b[0]*k2, a[1]*k1 + b[1]*k2, a[2]*k1 + b[2]*k2];
  }
  /* Great-circle distance in radians (0..π) — matches what globe.gl uses internally */
  function gcDistRad(a, b) {
    let dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    dot = Math.min(1, Math.max(-1, dot));
    return Math.acos(dot);
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
    const arcReady = cssVar("--globe-arc")  || "#2adfc3";
    const arcSoon  = cssVar("--brand-2")    || "#29c4ff";
    const point    = cssVar("--globe-point")|| "#6ff5dd";
    const atmos    = cssVar("--globe-atmosphere") || "#2adfc3";
    const surface  = cssVar("--globe-color") || "#0d1218";
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
      .arcColor((d) => (d.status === "ready" ? arcReady : arcSoon))
      .pointColor((d) => (d.kind === "mover" ? arcReady : point));
  }

  function build(el, opts) {
    opts = opts || {};
    const lang = () => (document.documentElement.lang === "ru" ? "ru" : "en");

    function popView(p) {
      return {
        kind: "pop",
        name: lang() === "ru" ? p.name_ru : p.name_en,
        country: lang() === "ru" ? p.country_ru : p.country_en,
        site: p.site,
        lat: p.lat, lng: p.lng,
        size: 0.55, status: "colo"
      };
    }
    function cityView(c) {
      return {
        kind: "city",
        name: lang() === "ru" ? c.name_ru : c.name_en,
        lat: c.lat, lng: c.lng,
        size: 0.16, status: c.status
      };
    }

    let popsData    = POPs.map(popView);
    let cityData    = CITIES.map(cityView);
    const staticPts = () => [...cityData, ...popsData];

    /* Build movers — TWO per segment (forward + reverse), but with calm speeds and
       big phase offsets so visually you only ever see ~1-2 packets per line at once. */
    const movers = [];
    SEGMENTS.forEach((s, i) => {
      const a  = latLngToVec(s.startLat, s.startLng);
      const b  = latLngToVec(s.endLat,   s.endLng);
      const rad = gcDistRad(a, b);                              /* 0..π */
      /* Peak altitude in the SAME units globe.gl uses for arcs */
      const peakAlt = Math.max(MIN_PEAK_ALT, ARC_ALT_SCALE * rad);
      /* Slow & uniform: every packet finishes its trip in ~14-22 s.
         Longer arcs get a hair faster so packets don't crawl on continental hops. */
      const baseSpeed = 0.00065 + Math.min(0.00045, rad * 0.0005);
      movers.push({
        a, b, peakAlt, status: s.status,
        t: (i * 0.317) % 1, speed: baseSpeed
      });
      movers.push({
        a: b, b: a, peakAlt, status: s.status,
        /* Half-cycle behind so forward & reverse pass each other mid-arc */
        t: ((i * 0.317) + 0.5) % 1, speed: baseSpeed
      });
    });

    function moverPoint(m) {
      const v   = slerp(m.a, m.b, m.t);
      const ll  = vecToLatLng(v);
      /* Parabolic altitude: 4·t·(1−t)·peak — peaks at t=0.5, zero at endpoints */
      const alt = 4 * m.t * (1 - m.t) * m.peakAlt + 0.004;
      return {
        kind: "mover",
        status: m.status,
        lat: ll.lat, lng: ll.lng,
        alt, size: 0.16
      };
    }

    const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })(el)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .showGraticules(opts.showGraticules !== false)

      /* Thin static parabolic arcs */
      .arcsData(SEGMENTS)
      .arcStartLat((d) => d.startLat).arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat).arcEndLng((d) => d.endLng)
      .arcAltitudeAutoScale(ARC_ALT_SCALE)
      .arcStroke(0.16)               /* thinner */
      .arcDashLength(1).arcDashGap(0).arcDashAnimateTime(0)
      .arcsTransitionDuration(0)

      /* Cities + PoPs + moving packets, all as points */
      .pointsData([...staticPts(), ...movers.map(moverPoint)])
      .pointAltitude((d) => (d.kind === "mover" ? d.alt : 0.005))
      .pointRadius((d) => d.size)
      .pointResolution(12)

      /* PoP labels via HTML (clean, themable) */
      .htmlElementsData(popsData.slice())
      .htmlLat((d) => d.lat).htmlLng((d) => d.lng)
      .htmlAltitude(0.012)
      .htmlElement(makeLabel)

      .ringsData([])
      .ringMaxRadius(2.4).ringPropagationSpeed(1.15).ringRepeatPeriod(2400).ringAltitude(0.005);

    paint(globe);

    if (typeof globe.renderer === "function") {
      const r = globe.renderer();
      if (r && typeof r.setPixelRatio === "function") {
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      }
    }

    /* Controls — silky and predictable. Auto-rotation is OFF everywhere; the
       globe only moves when the user grabs it. */
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

    /* Animate movers via rAF — independent of pixel ratio, pauses when tab hidden */
    let animId = 0, last = performance.now();
    function tick(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (let i = 0; i < movers.length; i++) {
        movers[i].t += movers[i].speed * dt * 60; /* keep 60fps-equivalent units */
        if (movers[i].t >= 1) movers[i].t -= 1;
      }
      globe.pointsData([...staticPts(), ...movers.map(moverPoint)]);
      animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animId); animId = 0;
      } else if (!animId) {
        last = performance.now();
        animId = requestAnimationFrame(tick);
      }
    });

    /* Click → bubble city selection */
    globe.onPointClick((d) => {
      el.dispatchEvent(new CustomEvent("mmts:globe:select", { detail: d, bubbles: true }));
    });

    /* Theme + lang reactivity */
    document.addEventListener("mmts:themechange", () => paint(globe));
    document.addEventListener("mmts:langchange", () => {
      cityData = CITIES.map(cityView);
      popsData = POPs.map(popView);
      /* Force a clean rebuild of HTML labels → no DOM stacking */
      globe.htmlElementsData([]);
      requestAnimationFrame(() => globe.htmlElementsData(popsData.slice()));
      globe.pointsData([...staticPts(), ...movers.map(moverPoint)]);
    });

    /* Smooth, single-tween camera flight (no zoom-out → zoom-in pop) */
    function flyTo(targetLat, targetLng, targetAlt, duration) {
      const pov = globe.pointOfView() || {};
      const fromLat = isFinite(pov.lat) ? pov.lat : targetLat;
      const fromLng = isFinite(pov.lng) ? pov.lng : targetLng;
      const fromAlt = isFinite(pov.altitude) ? pov.altitude : 2.2;
      const dur = duration || 1600;
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

    /* Cleanup */
    el.addEventListener("mmts:globe:destroy", () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(rafId);
      ro.disconnect();
    }, { once: true });

    /* Public API */
    globe.flyTo = flyTo;
    return globe;
  }

  function makeLabel(d) {
    const el = document.createElement("div");
    el.className = "globe-html-label";
    el.textContent = d.name; /* safe — textContent escapes */
    return el;
  }

  function initHero(selector) {
    const el = document.querySelector(selector || "#globe-hero");
    if (!el) return null;
    return build(el, { enableZoom: false, altitude: 1.85, showGraticules: true });
  }
  function initInteractive(selector) {
    const el = document.querySelector(selector || "#globe-network");
    if (!el) return null;
    return build(el, { enableZoom: true, altitude: 1.6, showGraticules: true });
  }

  window.MMTS_GLOBE = { initHero, initInteractive };
})();
