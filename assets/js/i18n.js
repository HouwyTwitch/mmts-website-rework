/* =========================================================
   MMTS — i18n
   Default lang: RU. If system lang isn't Russian → EN.
   Override via ?lang=, localStorage, or .lang-toggle button.
   ========================================================= */

const I18N = {
  ru: {
    "meta.title.home":     "MMTS — Магистральные сети связи",
    "meta.title.network":  "Сеть — MMTS",
    "meta.title.services": "Услуги операторам — MMTS",
    "meta.title.software": "Software — MMTS",
    "meta.title.contacts": "Контакты — MMTS",
    "meta.desc.home":      "Магистральный оператор связи: IP-транзит, Ethernet & VPN, ёмкости, строительство ВОЛС, размещение оборудования.",

    "nav.home":     "Главная",
    "nav.network":  "Сеть",
    "nav.services": "Услуги",
    "nav.software": "Software",
    "nav.contacts": "Контакты",
    "nav.lookingglass": "Looking Glass",

    "common.learnMore":     "Подробнее",
    "common.contactUs":     "Связаться",
    "common.exploreNetwork":"Посмотреть сеть",
    "common.send":          "Отправить",
    "common.theme.toggle":  "Сменить тему",
    "common.menu":          "Меню",
    "common.close":         "Закрыть",
    "common.coming":        "В процессе",
    "common.ready":         "В продаже",
    "common.colo":          "Колокация",

    /* Hero (home) */
    "hero.eyebrow":   "Магистральный оператор • с 2008",
    "hero.title.1":   "Соединяем",
    "hero.title.2":   "страны",
    "hero.title.3":   "магистральной сетью",
    "hero.lead":      "MMTS — частная компания, провайдер магистральной связи и программного обеспечения. Головной офис: Саратов, Россия.",
    "hero.cta.primary":   "Наши услуги",
    "hero.cta.secondary": "Карта сети",
    "hero.metric.1.value":"15+",
    "hero.metric.1.label":"лет в эксплуатации",
    "hero.metric.2.value":"40+",
    "hero.metric.2.label":"точек присутствия",
    "hero.metric.3.value":"3",
    "hero.metric.3.label":"страны на магистрали",
    "hero.metric.4.value":"99.99%",
    "hero.metric.4.label":"целевой SLA",

    /* Services overview */
    "services.eyebrow":  "Услуги",
    "services.title":    "Что мы продаём",
    "services.sub":      "От выделенного канала между ЦОД-ами до глобального IP-транзита — всё на нашей оптике, своим железом.",

    "svc.iptransit.title": "IP-транзит",
    "svc.iptransit.text":  "BGP IPv4/IPv6, премиум-аплинки, защита от DDoS, NOC 24×7. Стабильные маршруты до Tier-1.",
    "svc.ethernet.title":  "Ethernet & VPN",
    "svc.ethernet.text":   "L2/L3 каналы между офисами и ЦОД, MPLS, гарантированная полоса, SLA до 99.99%.",
    "svc.capacity.title":  "Магистральные ёмкости",
    "svc.capacity.text":   "Lambda и dark fiber на собственной DWDM. От 10G до 400G на длинной волне.",
    "svc.fiber.title":     "Строительство ВОЛС",
    "svc.fiber.text":      "Проектирование, прокладка, муфтование. Сдаём «под ключ» с измерениями и паспортом линии.",
    "svc.colocation.title":"Размещение",
    "svc.colocation.text": "Юниты, стойки, кросс-коннекты в наших узлах. Резерв по питанию и охлаждению.",
    "svc.lookingglass.title":"Looking Glass",
    "svc.lookingglass.text":"Прозрачная диагностика — ping, traceroute и BGP-сводка прямо из нашей сети.",

    /* Network teaser */
    "net.eyebrow": "География",
    "net.title":   "Опорная сеть от Европы до Центральной Азии",
    "net.sub":     "Маршруты построены так, чтобы пакет шёл коротко и предсказуемо. Каждая точка — наш узел.",
    "net.cta":     "Открыть карту сети",

    /* Network page */
    "netpage.title":  "Карта сети",
    "netpage.sub":    "Точки присутствия и магистральные сегменты MMTS. Кликните по маркеру или городу справа.",
    "netpage.legend.ready": "В продаже",
    "netpage.legend.soon":  "Готовится к продаже",
    "netpage.legend.colo":  "Колокация",
    "netpage.list":   "Города и узлы",
    "netpage.search": "Поиск города…",
    "netpage.empty":  "Ничего не найдено",

    /* Services page */
    "spage.title": "Услуги операторам и бизнесу",
    "spage.sub":   "Линейка магистральных сервисов MMTS. Подключение в любой нашей точке присутствия — за дни, не недели.",
    "spage.cta":   "Запросить расчёт",

    /* Software page */
    "soft.eyebrow": "Software",
    "soft.title":   "Программное обеспечение",
    "soft.sub":     "Оптические усилители играют важную роль при связи между дата-центрами на больших расстояниях. Мы разработали и внедрили ПО для российских усилителей передачи сигнала с короткой задержкой.",
    "soft.docs.title": "Документы и загрузки",
    "soft.body":  "Вопросы по работе программного обеспечения можно направлять на noc@mmts.su.",
    "soft.doc.1": "Инструкция по программированию",
    "soft.doc.2": "Описание функциональных характеристик",
    "soft.doc.3": "Руководство оператора",
    "soft.doc.4": "Сведения о стоимости ПО и лицензии",
    "soft.doc.5": "Экземпляр ПО",
    

    /* Contacts page */
    "ctc.title":     "Связаться с MMTS",
    "ctc.sub":       "NOC работает 24×7. Коммерческий отдел — пн-пт, 8:00-17:00 (UTC+4).",
    "ctc.noc":       "NOC (24×7)",
    "ctc.sales":     "Коммерческий отдел",
    "ctc.office":    "Офис",
    "ctc.officeAddr":"г. Саратов, 410012, ул. Большая Казачья, 6",
    "ctc.callback":  "Заказ обратного звонка",
    "ctc.form.name": "Ваше имя",
    "ctc.form.email":"E-mail",
    "ctc.form.subject":"Тема",
    "ctc.form.message":"Сообщение",
    "ctc.sent":      "Спасибо! Мы свяжемся с вами в течение часа.",

    /* CTA banner */
    "cta.title":  "Готовы посчитать ваш канал?",
    "cta.sub":    "Оставьте заявку — соберём предложение по вашему сценарию: маршрут, скорость, SLA, сроки.",
    "cta.button": "Запросить предложение",

    /* Footer */
    "ftr.about":      "О компании",
    "ftr.aboutText":  "MMTS LLC — независимый магистральный оператор, штаб-квартира в Саратове.",
    "ftr.services":   "Услуги",
    "ftr.company":    "Компания",
    "ftr.connect":    "Контакты",
    "ftr.copy":       "© 2008–2026 ООО «МТТС». Все права защищены.",

    /* Globe */
    "globe.connections": "магистральных сегментов",
    "globe.points":      "точек присутствия",
    "globe.cta":         "Перетащите глобус — это интерактивная сеть"
  },

  en: {
    "meta.title.home":     "MMTS — Backbone Carrier",
    "meta.title.network":  "Network — MMTS",
    "meta.title.services": "Services — MMTS",
    "meta.title.software": "Software — MMTS",
    "meta.title.contacts": "Contacts — MMTS",
    "meta.desc.home":      "Backbone carrier: IP transit, Ethernet & VPN, capacity, fiber construction, colocation.",

    "nav.home":     "Home",
    "nav.network":  "Network",
    "nav.services": "Services",
    "nav.software": "Software",
    "nav.contacts": "Contacts",
    "nav.lookingglass": "Looking Glass",

    "common.learnMore":     "Learn more",
    "common.contactUs":     "Contact us",
    "common.exploreNetwork":"Explore network",
    "common.send":          "Send",
    "common.theme.toggle":  "Toggle theme",
    "common.menu":          "Menu",
    "common.close":         "Close",
    "common.coming":        "Coming soon",
    "common.ready":         "Ready for sale",
    "common.colo":          "Colocation",

    "hero.eyebrow":   "Backbone operator · since 2008",
    "hero.title.1":   "Connecting",
    "hero.title.2":   "countries",
    "hero.title.3":   "with backbone connectivity",
    "hero.lead":      "MMTS LLC is a private software and backbone provider headquartered in Saratov, Russia.",
    "hero.cta.primary":   "Our services",
    "hero.cta.secondary": "Network map",
    "hero.metric.1.value":"15+",
    "hero.metric.1.label":"years in operation",
    "hero.metric.2.value":"40+",
    "hero.metric.2.label":"points of presence",
    "hero.metric.3.value":"3",
    "hero.metric.3.label":"countries on backbone",
    "hero.metric.4.value":"99.99%",
    "hero.metric.4.label":"target SLA",

    "services.eyebrow":  "Services",
    "services.title":    "What we sell",
    "services.sub":      "From a dedicated link between data centers to global IP transit — all on our fiber, with our gear.",

    "svc.iptransit.title": "IP Transit",
    "svc.iptransit.text":  "BGP IPv4/IPv6, premium upstreams, DDoS mitigation, 24×7 NOC. Stable routes to Tier-1.",
    "svc.ethernet.title":  "Ethernet & VPN",
    "svc.ethernet.text":   "L2/L3 links between offices and DCs, MPLS, guaranteed bandwidth, SLA up to 99.99%.",
    "svc.capacity.title":  "Backbone capacity",
    "svc.capacity.text":   "Lambdas and dark fiber on our own DWDM. 10G to 400G per wavelength.",
    "svc.fiber.title":     "Fiber construction",
    "svc.fiber.text":      "Design, deployment, splicing. Turn-key delivery with measurements and link passport.",
    "svc.colocation.title":"Colocation",
    "svc.colocation.text": "Units, racks, cross-connects in our nodes. Power and cooling redundancy.",
    "svc.lookingglass.title":"Looking Glass",
    "svc.lookingglass.text":"Transparent diagnostics — ping, traceroute and BGP summary straight from our network.",

    "net.eyebrow": "Geography",
    "net.title":   "Backbone from Europe to Central Asia",
    "net.sub":     "Routes are engineered for short, predictable paths. Every dot is our node.",
    "net.cta":     "Open network map",

    "netpage.title":  "Network map",
    "netpage.sub":    "MMTS points of presence and backbone segments. Click a marker or a city on the right.",
    "netpage.legend.ready": "Ready for sale",
    "netpage.legend.soon":  "Preparing for sale",
    "netpage.legend.colo":  "Colocation",
    "netpage.list":   "Cities & nodes",
    "netpage.search": "Search city…",
    "netpage.empty":  "Nothing found",

    "spage.title": "Services for carriers and business",
    "spage.sub":   "MMTS backbone services. Provisioning at any of our PoPs — in days, not weeks.",
    "spage.cta":   "Request a quote",

    "soft.eyebrow": "Software",
    "soft.title":   "Software",
    "soft.sub":     "Optical amplifiers play a major role for long-distance inter-DC links. MMTS developed and deployed software for Russian amplifiers to deliver low-latency signal transmission over hundreds of kilometers.",
    "soft.docs.title": "Documents & downloads",
    "soft.body":  "For software-related questions, contact noc@mmts.su.",
    "soft.doc.1": "Programming guide",
    "soft.doc.2": "Functional specifications",
    "soft.doc.3": "Operator manual",
    "soft.doc.4": "Software pricing and license",
    "soft.doc.5": "Software package",
    

    "ctc.title":     "Get in touch",
    "ctc.sub":       "NOC is on duty 24×7. Sales — Mon-Fri, 8:00-17:00 (UTC+4).",
    "ctc.noc":       "NOC (24×7)",
    "ctc.sales":     "Sales",
    "ctc.office":    "Office",
    "ctc.officeAddr":"6 B. Kazachya street, Saratov 410012, Russia",
    "ctc.callback":  "Request a callback",
    "ctc.form.name": "Your name",
    "ctc.form.email":"E-mail",
    "ctc.form.subject":"Subject",
    "ctc.form.message":"Message",
    "ctc.sent":      "Thank you! We'll get back to you within an hour.",

    "cta.title":  "Ready to size up your link?",
    "cta.sub":    "Tell us your route, capacity and SLA — we'll come back with a proposal.",
    "cta.button": "Request a proposal",

    "ftr.about":      "About",
    "ftr.aboutText":  "MMTS LLC — independent backbone carrier, headquartered in Saratov.",
    "ftr.services":   "Services",
    "ftr.company":    "Company",
    "ftr.connect":    "Contacts",
    "ftr.copy":       "© 2008–2026 MMTS LLC. All rights reserved.",

    "globe.connections": "backbone segments",
    "globe.points":      "points of presence",
    "globe.cta":         "Drag the globe — this is the live network"
  }
};

/* ---------- Detection / persistence ---------- */
function detectLang() {
  const url = new URL(location.href);
  const q = url.searchParams.get("lang");
  if (q && I18N[q]) return q;
  const stored = localStorage.getItem("mmts:lang");
  if (stored && I18N[stored]) return stored;
  const sys = (navigator.language || "en").toLowerCase();
  return sys.startsWith("ru") ? "ru" : "en";
}

function setLang(lang, { save = true } = {}) {
  if (!I18N[lang]) lang = "ru";
  document.documentElement.lang = lang;
  if (save) localStorage.setItem("mmts:lang", lang);
  applyLang(lang);
  document.dispatchEvent(new CustomEvent("mmts:langchange", { detail: { lang } }));
}

function t(key, lang) {
  lang = lang || document.documentElement.lang || detectLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function applyLang(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key, lang);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    /* format: "attr:key,attr2:key2" */
    const map = el.getAttribute("data-i18n-attr").split(",");
    map.forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key, lang));
    });
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    el.innerHTML = t(key, lang);
  });
  // Title from <title data-i18n="...">
  const titleEl = document.querySelector("title[data-i18n]");
  if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"), lang);
  // Description meta
  const descEl = document.querySelector('meta[name="description"][data-i18n]');
  if (descEl) descEl.setAttribute("content", t(descEl.getAttribute("data-i18n"), lang));
  // Toggle button states
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.lang === lang);
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = detectLang();
  setLang(lang, { save: false });
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
});

window.MMTS_I18N = { setLang, t, detectLang };
