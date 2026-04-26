/* =========================================================
   MMTS \u2014 Network dataset
   Source: mapGoogle4.js (live mmts.su)
   - pops:        official points of presence (colocation)
   - cities:      all transit cities used along routes
   - segments:    every consecutive pair along a fiber route,
                  classified by status (ready | soon)
   - paths:       the original ordered route (for waypoint tracing)
   ========================================================= */

const POPs = [
  { id: "frankfurt", name_en: "Frankfurt",  name_ru: "\u0424\u0440\u0430\u043d\u043a\u0444\u0443\u0440\u0442",      country_en: "Germany",    country_ru: "\u0413\u0435\u0440\u043c\u0430\u043d\u0438\u044f",   site: "Interxion FR2",   lat: 50.1109221, lng: 8.6821267,   status: "colo" },
  { id: "moscow",    name_en: "Moscow",     name_ru: "\u041c\u043e\u0441\u043a\u0432\u0430",         country_en: "Russia",     country_ru: "\u0420\u043e\u0441\u0441\u0438\u044f",     site: "MMTS-9, Butlerova 7", lat: 55.652715,  lng: 37.5280778,  status: "colo" },
  { id: "saratov",   name_en: "Saratov",    name_ru: "\u0421\u0430\u0440\u0430\u0442\u043e\u0432",        country_en: "Russia",     country_ru: "\u0420\u043e\u0441\u0441\u0438\u044f",     site: "B. Kazachya 6",   lat: 51.533106,  lng: 46.029828,   status: "colo" },
  { id: "voronezh",  name_en: "Voronezh",   name_ru: "\u0412\u043e\u0440\u043e\u043d\u0435\u0436",        country_en: "Russia",     country_ru: "\u0420\u043e\u0441\u0441\u0438\u044f",     site: "Voronezh site",   lat: 51.6754914, lng: 39.173863,   status: "colo" },
  { id: "ufa",       name_en: "Ufa",        name_ru: "\u0423\u0444\u0430",            country_en: "Russia",     country_ru: "\u0420\u043e\u0441\u0441\u0438\u044f",     site: "Ufa site",        lat: 54.7387621, lng: 55.9720554,  status: "colo" },
  { id: "almaty",    name_en: "Almaty",     name_ru: "\u0410\u043b\u043c\u0430\u0442\u044b",         country_en: "Kazakhstan", country_ru: "\u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d",  site: "Almaty site",     lat: 43.2171382, lng: 76.8040831,  status: "colo" }
];

/* All transit cities along ready & upcoming routes (deduped by lat/lng).
   Names taken from comments in mapGoogle4.js. */
const CITIES = [
  /* Europe / Western Russia (ready) */
  { name_en: "Frankfurt",   name_ru: "\u0424\u0440\u0430\u043d\u043a\u0444\u0443\u0440\u0442",   lat: 50.1109221, lng: 8.6821267,  status: "ready" },
  { name_en: "Berlin",      name_ru: "\u0411\u0435\u0440\u043b\u0438\u043d",      lat: 52.5200066, lng: 13.4049540, status: "ready" },
  { name_en: "Warsaw",      name_ru: "\u0412\u0430\u0440\u0448\u0430\u0432\u0430",     lat: 52.2296756, lng: 21.0122287, status: "ready" },
  { name_en: "Minsk",       name_ru: "\u041c\u0438\u043d\u0441\u043a",       lat: 53.9045397, lng: 27.5615244, status: "ready" },
  { name_en: "Vienna",      name_ru: "\u0412\u0435\u043d\u0430",        lat: 48.208169,  lng: 16.3387996, status: "ready" },
  { name_en: "Ko\u0161ice",      name_ru: "\u041a\u043e\u0448\u0438\u0446\u0435",      lat: 48.7163804, lng: 21.2260553, status: "ready" },
  { name_en: "Kyiv",        name_ru: "\u041a\u0438\u0435\u0432",        lat: 50.4500947, lng: 30.4883807, status: "ready" },

  /* Russia (ready) */
  { name_en: "Moscow",          name_ru: "\u041c\u043e\u0441\u043a\u0432\u0430",          lat: 55.652715,   lng: 37.5280778, status: "ready" },
  { name_en: "Tula",            name_ru: "\u0422\u0443\u043b\u0430",            lat: 54.2048157,  lng: 37.5484524, status: "ready" },
  { name_en: "Voronezh",        name_ru: "\u0412\u043e\u0440\u043e\u043d\u0435\u0436",         lat: 51.6754914,  lng: 39.173863,  status: "ready" },
  { name_en: "Saratov",         name_ru: "\u0421\u0430\u0440\u0430\u0442\u043e\u0432",         lat: 51.533106,   lng: 46.029828,  status: "ready" },
  { name_en: "Engels",          name_ru: "\u042d\u043d\u0433\u0435\u043b\u044c\u0441",         lat: 51.479954,   lng: 46.1142013, status: "ready" },
  { name_en: "Pushkino",        name_ru: "\u041f\u0443\u0448\u043a\u0438\u043d\u043e",         lat: 51.4753245,  lng: 47.0649936, status: "ready" },
  { name_en: "Klychi",          name_ru: "\u041a\u043b\u044e\u0447\u0438",           lat: 52.1680293,  lng: 47.0668463, status: "ready" },
  { name_en: "Berezove",        name_ru: "\u0411\u0435\u0440\u0451\u0437\u043e\u0432\u043e\u0435",       lat: 51.9246042,  lng: 48.3804608, status: "ready" },
  { name_en: "Syzran",          name_ru: "\u0421\u044b\u0437\u0440\u0430\u043d\u044c",         lat: 53.0982502,  lng: 48.3154781, status: "ready" },
  { name_en: "Ershov",          name_ru: "\u0415\u0440\u0448\u043e\u0432",           lat: 51.3479969,  lng: 48.2507739, status: "ready" },
  { name_en: "Samara",          name_ru: "\u0421\u0430\u043c\u0430\u0440\u0430",          lat: 53.2414836,  lng: 50.1512072, status: "ready" },
  { name_en: "Nizhny Novgorod", name_ru: "\u041d\u0438\u0436\u043d\u0438\u0439 \u041d\u043e\u0432\u0433\u043e\u0440\u043e\u0434", lat: 56.2965039,  lng: 43.9360589, status: "ready" },
  { name_en: "Kazan",           name_ru: "\u041a\u0430\u0437\u0430\u043d\u044c",          lat: 55.8304307,  lng: 49.0660806, status: "ready" },
  { name_en: "Ufa",             name_ru: "\u0423\u0444\u0430",             lat: 54.7387621,  lng: 55.9720554, status: "ready" },
  { name_en: "Chelyabinsk",     name_ru: "\u0427\u0435\u043b\u044f\u0431\u0438\u043d\u0441\u043a",       lat: 55.1644419,  lng: 61.4368431, status: "ready" },
  { name_en: "Kurgan",          name_ru: "\u041a\u0443\u0440\u0433\u0430\u043d",          lat: 55.449302,   lng: 65.244647,  status: "ready" },
  { name_en: "Ishim",           name_ru: "\u0418\u0448\u0438\u043c",            lat: 56.1146308,  lng: 69.4771245, status: "ready" },
  { name_en: "Omsk",            name_ru: "\u041e\u043c\u0441\u043a",            lat: 54.9884804,  lng: 73.3242362, status: "ready" },
  { name_en: "Novosibirsk",     name_ru: "\u041d\u043e\u0432\u043e\u0441\u0438\u0431\u0438\u0440\u0441\u043a",     lat: 55.0083526,  lng: 82.9357327, status: "ready" },
  { name_en: "Penza",           name_ru: "\u041f\u0435\u043d\u0437\u0430",           lat: 53.194546,   lng: 45.018316,  status: "ready" },
  { name_en: "Volgograd",       name_ru: "\u0412\u043e\u043b\u0433\u043e\u0433\u0440\u0430\u0434",       lat: 48.708048,   lng: 44.513303,  status: "ready" },
  { name_en: "Rostov-on-Don",   name_ru: "\u0420\u043e\u0441\u0442\u043e\u0432-\u043d\u0430-\u0414\u043e\u043d\u0443",  lat: 47.235714,   lng: 39.701505,  status: "ready" },
  { name_en: "Krasnodar",       name_ru: "\u041a\u0440\u0430\u0441\u043d\u043e\u0434\u0430\u0440",       lat: 45.039267,   lng: 38.987221,  status: "ready" },
  { name_en: "Sochi",           name_ru: "\u0421\u043e\u0447\u0438",            lat: 43.585525,   lng: 39.723062,  status: "ready" },
  { name_en: "Grozny",          name_ru: "\u0413\u0440\u043e\u0437\u043d\u044b\u0439",         lat: 43.318014,   lng: 45.698291,  status: "ready" },

  /* Kazakhstan / Central Asia (ready) */
  { name_en: "Ozinky",     name_ru: "\u041e\u0437\u0438\u043d\u043a\u0438",        lat: 51.1978445, lng: 49.698489,  status: "ready" },
  { name_en: "Uralsk",     name_ru: "\u0423\u0440\u0430\u043b\u044c\u0441\u043a",       lat: 51.2278158, lng: 51.3515238, status: "ready" },
  { name_en: "Lubenka",    name_ru: "\u041b\u0443\u0431\u0435\u043d\u043a\u0430",       lat: 50.439902,  lng: 54.1318273, status: "ready" },
  { name_en: "Karatobe",   name_ru: "\u041a\u0430\u0440\u0430\u0442\u043e\u0431\u0435",      lat: 49.691967,  lng: 53.5027771, status: "ready" },
  { name_en: "Aktobe",     name_ru: "\u0410\u043a\u0442\u043e\u0431\u0435",        lat: 50.2839286, lng: 57.1319587, status: "ready" },
  { name_en: "Kumkuduk",   name_ru: "\u041a\u0443\u043c\u043a\u0443\u0434\u0443\u043a",      lat: 50.4693022, lng: 61.2047911, status: "ready" },
  { name_en: "Kostanay",   name_ru: "\u041a\u043e\u0441\u0442\u0430\u043d\u0430\u0439",      lat: 53.232854,  lng: 63.632418,  status: "ready" },
  { name_en: "Kokshetau",  name_ru: "\u041a\u043e\u043a\u0448\u0435\u0442\u0430\u0443",      lat: 53.298888,  lng: 69.3754431, status: "ready" },
  { name_en: "Astana",     name_ru: "\u0410\u0441\u0442\u0430\u043d\u0430",        lat: 51.1605175, lng: 71.4353365, status: "ready" },
  { name_en: "Karaganda",  name_ru: "\u041a\u0430\u0440\u0430\u0433\u0430\u043d\u0434\u0430",     lat: 49.8046782, lng: 73.0743633, status: "ready" },
  { name_en: "Barshatas",  name_ru: "\u0411\u0430\u0440\u0448\u0430\u0442\u0430\u0441",      lat: 48.1665826, lng: 78.6313125, status: "ready" },
  { name_en: "Aktogai",    name_ru: "\u0410\u043a\u0442\u043e\u0433\u0430\u0439",       lat: 46.95559,   lng: 79.659933,  status: "ready" },
  { name_en: "Dostyk",     name_ru: "\u0414\u043e\u0441\u0442\u044b\u043a",        lat: 45.2579993, lng: 82.470889,  status: "ready" },
  { name_en: "Kyzylorda",  name_ru: "\u041a\u044b\u0437\u044b\u043b\u043e\u0440\u0434\u0430",     lat: 44.852916,  lng: 65.5030083, status: "ready" },
  { name_en: "Shymkent",   name_ru: "\u0428\u044b\u043c\u043a\u0435\u043d\u0442",       lat: 42.335661,  lng: 69.5855233, status: "ready" },
  { name_en: "Shu",        name_ru: "\u0428\u0443",            lat: 43.602783,  lng: 73.7607313, status: "ready" },
  { name_en: "Almaty",     name_ru: "\u0410\u043b\u043c\u0430\u0442\u044b",        lat: 43.2171382, lng: 76.8040831, status: "ready" },
  { name_en: "Bishkek",    name_ru: "\u0411\u0438\u0448\u043a\u0435\u043a",        lat: 42.8768537, lng: 74.5218215, status: "ready" },
  { name_en: "Suusamyr",   name_ru: "\u0421\u0443\u0443\u0441\u0430\u043c\u044b\u0440",      lat: 42.1818814, lng: 73.9549827, status: "ready" },
  { name_en: "Tashkent",   name_ru: "\u0422\u0430\u0448\u043a\u0435\u043d\u0442",       lat: 41.2825762, lng: 69.2093272, status: "ready" },
  { name_en: "Nurly",      name_ru: "\u041d\u0443\u0440\u043b\u044b",         lat: 43.6546585, lng: 78.5094359, status: "ready" },
  { name_en: "Charyn",     name_ru: "\u0427\u0430\u0440\u044b\u043d",         lat: 43.8616436, lng: 79.379848,  status: "ready" },
  { name_en: "Khorgos",    name_ru: "\u0425\u043e\u0440\u0433\u043e\u0441",        lat: 44.2240125, lng: 80.374474,  status: "ready" },

  /* Upcoming (preparing for sale) */
  { name_en: "Copenhagen",     name_ru: "\u041a\u043e\u043f\u0435\u043d\u0433\u0430\u0433\u0435\u043d",     lat: 55.6712474, lng: 12.4907997, status: "soon" },
  { name_en: "Stockholm",      name_ru: "\u0421\u0442\u043e\u043a\u0433\u043e\u043b\u044c\u043c",      lat: 59.3260668, lng: 17.8474654, status: "soon" },
  { name_en: "H\u00e4meenlinna",    name_ru: "\u0425\u044f\u043c\u0435\u044d\u043d\u043b\u0438\u043d\u043d\u0430",    lat: 60.9928787, lng: 24.4590243, status: "soon" },
  { name_en: "Lappeenranta",   name_ru: "\u041b\u0430\u043f\u043f\u0435\u044d\u043d\u0440\u0430\u043d\u0442\u0430",   lat: 61.0549929, lng: 28.1896628, status: "soon" },
  { name_en: "St Petersburg",  name_ru: "\u0421\u0430\u043d\u043a\u0442-\u041f\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433", lat: 59.9342616, lng: 30.2650597, status: "soon" },
  { name_en: "Riga",           name_ru: "\u0420\u0438\u0433\u0430",           lat: 56.9496291, lng: 24.0351474, status: "soon" },
  { name_en: "Volodino",       name_ru: "\u0412\u043e\u043b\u043e\u0434\u0438\u043d\u043e",       lat: 54.5575638, lng: 21.7419272, status: "soon" },
  { name_en: "Kirov",          name_ru: "\u041a\u0438\u0440\u043e\u0432",          lat: 58.5854653, lng: 49.5308458, status: "soon" },
  { name_en: "Perm",           name_ru: "\u041f\u0435\u0440\u043c\u044c",          lat: 58.0204091, lng: 56.0941953, status: "soon" },
  { name_en: "Ekaterinburg",   name_ru: "\u0415\u043a\u0430\u0442\u0435\u0440\u0438\u043d\u0431\u0443\u0440\u0433",   lat: 56.8138126, lng: 60.5148531, status: "soon" },
  { name_en: "Tyumen",         name_ru: "\u0422\u044e\u043c\u0435\u043d\u044c",         lat: 57.1740079, lng: 65.4319192, status: "soon" },
  { name_en: "Bolshie Uki",    name_ru: "\u0411\u043e\u043b\u044c\u0448\u0438\u0435 \u0423\u043a\u0438",    lat: 56.950877,  lng: 72.6305423, status: "soon" },
  { name_en: "Kapchagai",      name_ru: "\u041a\u0430\u043f\u0447\u0430\u0433\u0430\u0439",       lat: 43.8669604, lng: 77.0529258, status: "soon" },
  { name_en: "Lepsy",          name_ru: "\u041b\u0435\u043f\u0441\u044b",          lat: 46.2366732, lng: 78.9311885, status: "soon" }
];

/* Original ordered routes (mirrors the polylines in mapGoogle4.js).
   Status: "ready" = currently for sale, "soon" = preparing for sale */
const PATHS = [
  /* flightPath1 \u2014 Frankfurt \u2192 Novosibirsk */
  { status: "ready", waypoints: [
    [50.1109221, 8.6821267], [52.5200066, 13.4049540], [52.2296756, 21.0122287],
    [53.9045397, 27.5615244], [55.652715, 37.5280778], [56.2965039, 43.9360589],
    [55.8304307, 49.0660806], [54.7387621, 55.9720554], [55.1644419, 61.4368431],
    [55.449302, 65.244647], [56.1146308, 69.4771245], [54.9884804, 73.3242362],
    [55.0083526, 82.9357327]
  ]},
  /* flightPath2 \u2014 Frankfurt \u2192 Vienna \u2192 Kyiv \u2192 Voronezh \u2192 Aktobe \u2192 Astana \u2192 Dostyk */
  { status: "ready", waypoints: [
    [50.1109221, 8.6821267], [48.208169, 16.3387996], [48.7163804, 21.2260553],
    [50.4500947, 30.4883807], [51.6754914, 39.173863], [51.533106, 46.029828],
    [53.0982502, 48.3154781], [53.2414836, 50.1512072], [54.7387621, 55.9720554],
    [53.2414836, 50.1512072], [53.0982502, 48.3154781], [51.533106, 46.029828],
    [51.6754914, 39.173863], [54.2048157, 37.5484524], [55.652715, 37.5280778],
    [54.2048157, 37.5484524], [51.6754914, 39.173863], [51.533106, 46.029828],
    [51.479954, 46.1142013], [51.4753245, 47.0649936], [51.3479969, 48.2507739],
    [51.1978445, 49.698489], [51.2278158, 51.3515238], [49.691967, 53.5027771],
    [50.2839286, 57.1319587], [50.4693022, 61.2047911], [53.232854, 63.632418],
    [53.298888, 69.3754431], [51.1605175, 71.4353365], [49.8046782, 73.0743633],
    [48.1665826, 78.6313125], [46.95559, 79.659933], [45.2579993, 82.470889]
  ]},
  /* flightPath3 \u2014 Saratov \u2192 Tashkent / Almaty / Khorgos */
  { status: "ready", waypoints: [
    [51.533106, 46.029828], [52.1680293, 47.0668463], [51.9246042, 48.3804608],
    [51.1978445, 49.698489], [51.2278158, 51.3515238], [50.439902, 54.1318273],
    [50.2839286, 57.1319587], [44.852916, 65.5030083], [42.335661, 69.5855233],
    [43.602783, 73.7607313], [43.2171382, 76.8040831], [42.8768537, 74.5218215],
    [42.1818814, 73.9549827], [41.2825762, 69.2093272], [42.1818814, 73.9549827],
    [42.8768537, 74.5218215], [43.2171382, 76.8040831], [43.6546585, 78.5094359],
    [43.8616436, 79.379848], [44.2240125, 80.374474]
  ]},
  /* flightPath4 \u2014 Frankfurt \u2192 Copenhagen \u2192 Stockholm \u2192 Helsinki \u2192 St Petersburg \u2192 Moscow */
  { status: "soon", waypoints: [
    [50.1109221, 8.6821267], [55.6712474, 12.4907997], [59.3260668, 17.8474654],
    [60.9928787, 24.4590243], [61.0549929, 28.1896628], [59.9342616, 30.2650597],
    [55.652715, 37.5280778]
  ]},
  /* flightPath5 \u2014 Moscow \u2192 Riga \u2192 Warsaw */
  { status: "soon", waypoints: [
    [55.652715, 37.5280778], [56.9496291, 24.0351474],
    [54.5575638, 21.7419272], [52.2296756, 21.0122287]
  ]},
  /* flightPath6 \u2014 Nizhny Novgorod \u2192 Kirov \u2192 Perm \u2192 Ekaterinburg \u2192 Chelyabinsk \u2192 Tyumen \u2192 Omsk */
  { status: "soon", waypoints: [
    [56.2965039, 43.9360589], [58.5854653, 49.5308458], [58.0204091, 56.0941953],
    [56.8138126, 60.5148531], [55.1521496, 61.2684899], [56.8138126, 60.5148531],
    [57.1740079, 65.4319192], [55.449302, 65.244647], [57.1740079, 65.4319192],
    [56.950877, 72.6305423], [54.9884804, 73.3242362]
  ]},
  /* flightPath7 \u2014 Almaty \u2192 Aktogai */
  { status: "soon", waypoints: [
    [43.2171382, 76.8040831], [43.8669604, 77.0529258],
    [46.2366732, 78.9311885], [46.95559, 79.659933]
  ]},
  /* flightPath8 \u2014 Frankfurt \u2192 Voronezh \u2192 Penza \u2192 Saratov (international transit from reference map) */
  { status: "ready", waypoints: [
    [50.1109221, 8.6821267], [51.6754914, 39.173863],
    [53.194546, 45.018316], [51.533106, 46.029828]
  ]},
  /* flightPath9 \u2014 Saratov \u2192 Volgograd \u2192 Rostov-on-Don \u2192 Krasnodar \u2192 Sochi \u2192 Grozny */
  { status: "ready", waypoints: [
    [51.533106, 46.029828], [48.708048, 44.513303], [47.235714, 39.701505],
    [45.039267, 38.987221], [43.585525, 39.723062], [43.318014, 45.698291]
  ]}
];

/* Derived: pairwise segments from PATHS \u2014 fed straight to globe.gl as arcs */
const SEGMENTS = (function () {
  const out = [];
  PATHS.forEach((path) => {
    for (let i = 0; i < path.waypoints.length - 1; i++) {
      const a = path.waypoints[i];
      const b = path.waypoints[i + 1];
      if (a[0] === b[0] && a[1] === b[1]) continue;
      out.push({
        startLat: a[0], startLng: a[1],
        endLat:   b[0], endLng:   b[1],
        status: path.status
      });
    }
  });
  return out;
})();

window.MMTS_NETWORK = { POPs, CITIES, PATHS, SEGMENTS };
