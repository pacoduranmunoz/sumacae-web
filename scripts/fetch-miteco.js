#!/usr/bin/env node
/**
 * fetch-miteco.js — Refresca miteco-data.json con el último snapshot oficial
 *
 * Pasos:
 *   1) Llama al endpoint de datos.gob.es para obtener la URL del CSV del mes
 *   2) Descarga el CSV (~4 MB)
 *   3) Lo agrega: KPIs, serie temporal por mes, por sector, por CCAA
 *   4) Escribe miteco-data.json en la raíz del proyecto
 *
 * Uso local:   node scripts/fetch-miteco.js
 * Uso CI:      ejecutado por .github/workflows/refresh-miteco.yml el día 5 de cada mes
 *
 * Sin dependencias externas — usa fetch nativo (Node 18+).
 */

const fs = require("node:fs/promises");
const path = require("node:path");

const META_URL = "https://datos.gob.es/apidata/catalog/distribution/dataset/e05068001-sistema-de-certificados-de-ahorro-de-energia.json";

const CCAA_MAP = {
  "Madrid, Comunidad de":"MAD",
  "Castilla y León":"CYL",
  "Cataluña":"CAT",
  "Comunitat Valenciana":"VAL",
  "Castilla - La Mancha":"CLM",
  "Andalucía":"AND",
  "Rioja, La":"RIO",
  "Canarias":"CAN",
  "Galicia":"GAL",
  "País Vasco":"PVA",
  "Navarra, Comunidad Foral de":"NAV",
  "Asturias, Principado de":"AST",
  "Ceuta":"CEU",
  "Balears, Illes":"BAL",
  "Extremadura":"EXT",
  "Aragón":"ARA",
  "Murcia, Región de":"MUR",
  "Cantabria":"CNT",
};

const fmtMes = (ym) => {
  const y = ym.slice(2,4), m = parseInt(ym.slice(4,6));
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${meses[m-1]}'${y}`;
};

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.6",
  "Referer": "https://catalogo.datosabiertos.miteco.gob.es/",
};

async function fetchWithRetry(url, opts={}, tries=3) {
  let lastErr;
  for (let i=0; i<tries; i++) {
    try {
      const r = await fetch(url, { headers: BROWSER_HEADERS, ...opts });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    } catch (e) {
      lastErr = e;
      if (i < tries-1) await new Promise(res => setTimeout(res, 2000 * (i+1)));
    }
  }
  throw lastErr;
}

async function main() {
  let csv, csvUrl, source;

  try {
    console.log("→ Resolviendo URL del CSV vía datos.gob.es...");
    const meta = await (await fetchWithRetry(META_URL)).json();
    const items = meta?.result?.items || [];
    if (!items.length) throw new Error("metadata vacía");
    csvUrl = items[0].accessURL;
    console.log("  CSV:", csvUrl);
  } catch (e) {
    console.warn(`⚠ Metadata datos.gob.es falló (${e.message}).`);
  }

  if (csvUrl) {
    try {
      console.log("→ Descargando CSV (con retries)...");
      csv = await (await fetchWithRetry(csvUrl)).text();
      console.log(`  ${(csv.length/1024).toFixed(1)} KB · remoto OK`);
      source = "remote";
    } catch (e) {
      console.warn(`⚠ CSV remoto falló (${e.message}). Cayendo al CSV bundled.`);
    }
  }

  if (!csv) {
    const fallback = path.resolve(__dirname, "..", "uploads", "miteco-cae.csv");
    csv = await fs.readFile(fallback, "utf8");
    console.log(`  ${(csv.length/1024).toFixed(1)} KB · fallback local`);
    source = "fallback-local";
  }

  // Snapshot del nombre del fichero (yyyymmdd al inicio); si no hay URL, usa hoy
  const m = csvUrl ? /(\d{4})(\d{2})(\d{2})-/.exec(csvUrl) : null;
  const snapshot = m ? `${m[1]}-${m[2]}-${m[3]}` : new Date().toISOString().slice(0,10);

  console.log("→ Parseando filas...");
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  const rows = lines.slice(1).map(line => {
    const c = line.split(";");
    return {
      anio: parseInt(c[3])||null,
      ahorro: parseFloat(c[4])||0,    // kWh
      ccaa: c[5],
      fecha: c[11],                   // yyyymmdd
      estado: c[13],
      sector: c[14],
    };
  });
  console.log(`  ${rows.length} filas`);

  // KPIs
  const totalGWh = rows.reduce((s,r)=>s+r.ahorro,0)/1e6;
  const ccaaActivas = new Set(rows.map(r=>r.ccaa).filter(c=>c && CCAA_MAP[c])).size;

  // Por sector (GWh)
  const bySector = {};
  for(const r of rows){
    if(!r.sector) continue;
    bySector[r.sector] = (bySector[r.sector]||0) + r.ahorro/1e6;
  }

  // Por CCAA (GWh)
  const byCCAA = {};
  for(const r of rows){
    const id = CCAA_MAP[r.ccaa];
    if(!id) continue;
    byCCAA[id] = (byCCAA[id]||0) + r.ahorro/1e6;
  }
  const totalCCAA = Object.values(byCCAA).reduce((a,b)=>a+b,0);
  const ccaaPesos = Object.fromEntries(
    Object.entries(byCCAA).map(([k,v])=>[k, Math.round((v/totalCCAA)*1000)/1000])
  );

  // Por mes (GWh)
  const byMonth = {};
  for(const r of rows){
    if(!r.fecha || r.fecha.length < 6) continue;
    const ym = r.fecha.slice(0,6);
    byMonth[ym] = (byMonth[ym]||0) + r.ahorro/1e6;
  }
  const mesesOrdenados = Object.keys(byMonth).sort();

  // Total acumulado por mes
  let acc = 0;
  const totalSerie = mesesOrdenados.map(ym => {
    acc += byMonth[ym];
    return { m: fmtMes(ym), v: Math.round(acc*10)/10, ym };
  });

  // Por sector × mes (acumulado)
  const sectorSeries = {};
  for(const sect of Object.keys(bySector)){
    let a = 0;
    sectorSeries[sect] = mesesOrdenados.map(ym => {
      const monthSectorVal = rows
        .filter(r => r.sector === sect && r.fecha?.slice(0,6) === ym)
        .reduce((s,r)=>s+r.ahorro/1e6, 0);
      a += monthSectorVal;
      return Math.round(a*10)/10;
    });
  }

  const out = {
    meta: {
      fuente: "MITECO · Sistema Nacional CAE",
      dataset: "7709f44a-9b05-4bb4-bcb0-982f94eb742e",
      snapshot,
      total_filas: rows.length,
      generado: new Date().toISOString(),
      origen_csv: csvUrl || "uploads/miteco-cae.csv (bundled)",
      source,
    },
    kpis: {
      total_gwh_solicitado: Math.round(totalGWh*10)/10,
      total_solicitudes: rows.length,
      total_actuaciones: rows.length,
      ccaa_activas: ccaaActivas,
    },
    serie_total: totalSerie,
    series_sector: sectorSeries,
    meses_labels: mesesOrdenados.map(fmtMes),
    por_sector_gwh: Object.fromEntries(Object.entries(bySector).map(([k,v])=>[k, Math.round(v*10)/10])),
    por_ccaa_gwh: Object.fromEntries(Object.entries(byCCAA).map(([k,v])=>[k, Math.round(v*10)/10])),
    ccaa_pesos: ccaaPesos,
  };

  const outPath = path.resolve(__dirname, "..", "miteco-data.json");
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`✓ ${outPath} actualizado`);
  console.log(`  ${out.kpis.total_gwh_solicitado} GWh · ${out.kpis.total_solicitudes} solicitudes · ${out.kpis.ccaa_activas} CCAA`);
  console.log(`  snapshot: ${snapshot}`);
}

main().catch(err => {
  console.error("✗ Error:", err.message);
  process.exit(1);
});
