/* =========================================================
   MMTS – Network side list builder
   Renders the POP / city list with safe DOM APIs (no innerHTML).
   ========================================================= */

(function () {
  if (!window.MMTS_NETWORK) return;

  const { POPs, CITIES } = window.MMTS_NETWORK;

  function buildList() {
    const list = document.getElementById("pop-list");
    if (!list) return;
    /* purge */
    while (list.firstChild) list.removeChild(list.firstChild);

    const lang = document.documentElement.lang === "ru" ? "ru" : "en";

    /* Combine: POPs first (colocation), then unique cities not already PoPs */
    const popKeys = new Set(POPs.map((p) => p.lat.toFixed(3) + "," + p.lng.toFixed(3)));
    const items = [
      ...POPs.map((p) => ({
        name: lang === "ru" ? p.name_ru : p.name_en,
        country: lang === "ru" ? p.country_ru : p.country_en,
        site: p.site,
        lat: p.lat, lng: p.lng,
        status: "colo"
      })),
      ...CITIES.filter((c) => !popKeys.has(c.lat.toFixed(3) + "," + c.lng.toFixed(3))).map((c) => ({
        name: lang === "ru" ? c.name_ru : c.name_en,
        country: "",
        site: "",
        lat: c.lat, lng: c.lng,
        status: c.status
      }))
    ];

    /* Sort: colos first, then ready, then soon – alpha within group */
    const order = { colo: 0, ready: 1, soon: 2 };
    items.sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));

    const frag = document.createDocumentFragment();
    items.forEach((it) => {
      const div = document.createElement("div");
      div.className = "pop-item";
      div.dataset.lat = String(it.lat);
      div.dataset.lng = String(it.lng);
      div.dataset.name = it.name;
      div.dataset.search = `${it.name} ${it.country} ${it.site}`.toLowerCase();

      const dot = document.createElement("span");
      dot.className = "dot dot--" + it.status;
      div.appendChild(dot);

      const middle = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "pop-item__name";
      nameEl.textContent = it.name; /* safe – textContent escapes */
      middle.appendChild(nameEl);
      if (it.country || it.site) {
        const meta = document.createElement("div");
        meta.className = "pop-item__country";
        meta.textContent = [it.site, it.country].filter(Boolean).join(" · ");
        middle.appendChild(meta);
      }
      div.appendChild(middle);

      const tag = document.createElement("span");
      tag.className = "tag";
      const tagKey =
        it.status === "colo" ? "netpage.legend.colo" :
        it.status === "ready" ? "netpage.legend.ready" : "netpage.legend.soon";
      tag.textContent = window.MMTS_I18N ? window.MMTS_I18N.t(tagKey) : it.status;
      tag.dataset.statusTag = it.status;
      div.appendChild(tag);

      frag.appendChild(div);
    });

    list.appendChild(frag);
  }

  function start() {
    buildList();
    document.addEventListener("mmts:langchange", buildList);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
