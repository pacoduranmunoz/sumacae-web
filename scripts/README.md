# Datos MITECO — automatización mensual

`miteco-data.json` (raíz del proyecto) alimenta el componente **Observatorio CAE**
con cifras oficiales del Sistema Nacional de Certificados de Ahorro Energético.

## Cómo se actualiza

### Opción A — Automático (GitHub Action) ✅ recomendado

El workflow `.github/workflows/refresh-miteco.yml` corre el **día 5 de cada mes**
a las 06:00 UTC. Hace todo solo:

1. Resuelve la URL del CSV del mes vía `datos.gob.es/apidata`
2. Descarga el CSV (~4 MB, ~16k filas)
3. Lo agrega a un JSON pequeño (~3 KB) con KPIs, serie por mes, por sector y por CCAA
4. Hace commit + push si hay cambios

**Para activarlo:** sube este repo a GitHub. La Action se programa sola.
También se puede lanzar a mano desde la pestaña **Actions → Refresh MITECO data → Run workflow**.

### Opción B — Manual

Si no usas GitHub Actions, lanza el script localmente cuando quieras:

```bash
node scripts/fetch-miteco.js
```

Requiere Node 18+ (usa `fetch` nativo, sin dependencias). Sobreescribe `miteco-data.json`.

### Opción C — CSV pegado a mano

Si los endpoints del MITECO están caídos:

1. Descarga el CSV manualmente desde
   https://catalogo.datosabiertos.miteco.gob.es/catalogo/dataset/7709f44a-9b05-4bb4-bcb0-982f94eb742e
2. Súbelo al chat con el clip 📎
3. Yo regenero `miteco-data.json` desde aquí

## Estructura de `miteco-data.json`

```jsonc
{
  "meta": {
    "fuente": "MITECO · Sistema Nacional CAE",
    "dataset": "7709f44a-...",
    "snapshot": "2025-11-30",      // fecha del CSV
    "total_filas": 15897,
    "generado": "2025-...",
    "origen_csv": "https://..."
  },
  "kpis": {
    "total_gwh_solicitado": 11256.3,
    "total_solicitudes": 15897,
    "total_actuaciones": 15897,
    "ccaa_activas": 18
  },
  "serie_total":   [{"m":"nov'23","v":13,"ym":"202311"}, ...],   // acumulado mensual
  "series_sector": { "Industrial":[...], "Residencial":[...], ... },
  "meses_labels":  ["nov'23","dic'23",...],
  "por_sector_gwh":{ "Industrial":5141.5, "Residencial":3060, ... },
  "por_ccaa_gwh":  { "MAD":2156.4, "CYL":3042.8, ... },
  "ccaa_pesos":    { "MAD":0.187,  "CYL":0.264,  ... }            // % del total
}
```

## Fuentes de verdad

- **Catálogo (HTML):** https://catalogo.datosabiertos.miteco.gob.es/catalogo/dataset/7709f44a-9b05-4bb4-bcb0-982f94eb742e
- **Metadatos JSON estable:** https://datos.gob.es/apidata/catalog/distribution/dataset/e05068001-sistema-de-certificados-de-ahorro-de-energia.json
- **Panel oficial MITECO:** https://www.miteco.gob.es/es/energia/eficiencia/cae/seguimiento-del-sistema-de-cae.html
