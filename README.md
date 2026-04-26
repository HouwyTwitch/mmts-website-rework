# MMTS – website (v2)

Static, framework-free redesign of [mmts.su](https://mmts.su).

## Highlights

- **Dark / Light theme.** Default = system preference. Persists via `localStorage`. Sync-applied in `<head>` to avoid FOUC.
- **RU / EN i18n.** Default = Russian (or English if system lang isn't Russian). Switchable in nav. All strings live in `assets/js/i18n.js`.
- **3D globe** (`globe.gl` over Three.js) on the homepage and `/network`. Real MMTS POPs and backbone routes; arcs animate, theme-aware colors.
- **Seamless page transitions** via View Transitions API (with JS fallback curtain).
- **Mobile-ready** – `clamp()` typography, burger nav, touch-friendly targets, decorative hero globe doesn't intercept scroll.
- **Security-first**:
  - Strict CSP (meta + server header), `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self' mailto:`.
  - HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` lockdown, COOP/CORP.
  - No `innerHTML` for any dynamic data – only `textContent` / DOM APIs.
  - Contact form is mailto-based (no server endpoint to attack); inputs are length-capped, regex-allowlisted, and reject `<>`.
  - External CDN limited to `cdn.jsdelivr.net` only.
  - `.htaccess`, `_headers`, `robots.txt`, `.well-known/security.txt`, `sitemap.xml` included.

## Layout

```
.
├── index.html          # home (3D globe hero)
├── network.html        # interactive 3D globe + searchable POP list
├── services.html       # service catalogue
├── software.html       # in-house software
├── contacts.html       # contacts + secured callback form
├── assets/
│   ├── css/style.css   # design system + themes + animations
│   ├── js/
│   │   ├── theme.js          # sync-applied (no FOUC)
│   │   ├── i18n.js           # RU/EN strings + auto-detect
│   │   ├── main.js           # nav, reveal, page transitions, escape()
│   │   ├── globe.js          # globe.gl wrapper, theme-aware
│   │   ├── network-list.js   # safe DOM POP list builder
│   │   ├── contacts.js       # validated mailto form
│   │   └── page-init.js      # per-page bootstrap
│   └── data/network.js # POPs + routes from mapGoogle4.js
├── .htaccess           # Apache hardening
├── _headers            # Netlify / Cloudflare hardening
├── robots.txt
├── sitemap.xml
└── .well-known/security.txt
```

## Development

It's plain HTML – open `index.html` directly, or serve with anything:

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```

## Deploy notes

- After deploy, run an SRI generator against the CDN URL once and add `integrity="sha384-…"` on the `globe.gl` script tag for full lock-down.
- Submit `https://mmts.su/sitemap.xml` to Yandex Webmaster / Google Search Console.
