# SUMACAE — Sitio web

Sitio institucional de SUMACAE. Stack: HTML estático + React (CDN) + Babel inline.
Sin build, sin npm install. Se sirve abriendo `SUMACAE v5.html` directamente, o publicado vía GitHub Pages.

## Estructura

- `SUMACAE v5.html` — entrada principal
- `app-v5.jsx` — app React (hero, posicionamiento, casos, proceso, CTA)
- `observatorio.jsx` — sección Observatorio CAE (datos MITECO en vivo)
- `tweaks-panel.jsx` — panel de tweaks (tema light/dark, etc.)
- `miteco-data.json` — snapshot oficial del Sistema Nacional CAE
- `scripts/fetch-miteco.js` — script Node que regenera `miteco-data.json`
- `.github/workflows/refresh-miteco.yml` — actualización automática mensual
- `uploads/` — assets subidos (logos, etc.)

## Datos MITECO automáticos

`miteco-data.json` se actualiza solo el día 5 de cada mes vía GitHub Actions.
Detalle en [scripts/README.md](scripts/README.md).

## Publicar en GitHub Pages

1. Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save
2. Espera 1-2 min. La URL será `https://<usuario>.github.io/<repo>/SUMACAE%20v5.html`

(Para tener URL más limpia, renombra `SUMACAE v5.html` → `index.html`.)
