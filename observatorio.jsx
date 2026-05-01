// ── Observatorio CAE — Mini-MITECO embebido ────────────────────────────────
// Datos: derivados del SNOEE (MITECO · datosabiertos.miteco.gob.es)
// Fallback offline + intento de carga remota mensual via miteco-data.json

// React hooks (este archivo se carga antes que app-v5.jsx)
const { useState: useStateObs, useEffect: useEffectObs, useRef: useRefObs } = React;
// Alias para que el código siga usando los nombres habituales:
const useState = useStateObs;
const useEffect = useEffectObs;
const useRef = useRefObs;

// useReveal local (idéntico al de app-v5)
function useRevealObs(threshold=0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => { const el=ref.current; if(!el) return;
    const o = new IntersectionObserver(([e])=>{ if(e.isIntersecting){ setShown(true); o.disconnect(); }},{threshold});
    o.observe(el); return ()=>o.disconnect();
  }, [threshold]);
  return [ref, shown];
}
const useReveal = useRevealObs;
const reveal = (s, d=0) => ({ opacity:s?1:0, transform:s?"translateY(0)":"translateY(20px)", transition:`opacity .8s cubic-bezier(.2,.7,.2,1) ${d}s, transform .8s cubic-bezier(.2,.7,.2,1) ${d}s` });

// 17 CCAA + Ceuta + Melilla con paths SVG simplificados
// Coordenadas aproximadas para colocar etiquetas/dots
const CCAA = [
  { id:"AND", n:"Andalucía",          peso:0.165, x:330, y:430 },
  { id:"CAT", n:"Cataluña",           peso:0.135, x:560, y:230 },
  { id:"MAD", n:"Madrid",             peso:0.130, x:355, y:285 },
  { id:"VAL", n:"C. Valenciana",      peso:0.105, x:475, y:340 },
  { id:"CYL", n:"Castilla y León",    peso:0.075, x:295, y:235 },
  { id:"PVA", n:"País Vasco",         peso:0.055, x:410, y:165 },
  { id:"GAL", n:"Galicia",            peso:0.050, x:170, y:175 },
  { id:"CLM", n:"Castilla-La Mancha", peso:0.060, x:370, y:330 },
  { id:"ARA", n:"Aragón",             peso:0.045, x:455, y:235 },
  { id:"MUR", n:"Murcia",             peso:0.040, x:430, y:400 },
  { id:"AST", n:"Asturias",           peso:0.025, x:255, y:155 },
  { id:"NAV", n:"Navarra",            peso:0.025, x:435, y:185 },
  { id:"CNT", n:"Cantabria",          peso:0.020, x:340, y:160 },
  { id:"EXT", n:"Extremadura",        peso:0.025, x:240, y:355 },
  { id:"BAL", n:"Baleares",           peso:0.018, x:625, y:355 },
  { id:"CAN", n:"Canarias",           peso:0.018, x:200, y:540 },
  { id:"RIO", n:"La Rioja",           peso:0.008, x:400, y:200 },
  { id:"CEU", n:"Ceuta",              peso:0.001, x:300, y:545 },
  { id:"MEL", n:"Melilla",            peso:0.001, x:380, y:545 },
];

// Catálogo de medidas (códigos oficiales del MITECO + agrupación temática)
const MEDIDAS = [
  { code:"IND010", nombre:"Aislamiento tuberías ind.",   sector:"Industrial",   peso:0.12 },
  { code:"IND020", nombre:"Sustitución refrigerante",    sector:"Industrial",   peso:0.08 },
  { code:"IND030", nombre:"Recuperación calor proceso",  sector:"Industrial",   peso:0.10 },
  { code:"IND040", nombre:"Variadores de frecuencia",    sector:"Industrial",   peso:0.07 },
  { code:"IND050", nombre:"Sistemas gestión energía",    sector:"Industrial",   peso:0.06 },
  { code:"RES010", nombre:"Aislamiento envolvente",      sector:"Residencial",  peso:0.09 },
  { code:"RES020", nombre:"Carpintería eficiente",       sector:"Residencial",  peso:0.07 },
  { code:"RES030", nombre:"Aerotermia / bomba calor",    sector:"Residencial",  peso:0.06 },
  { code:"RES040", nombre:"Caldera condensación",        sector:"Residencial",  peso:0.04 },
  { code:"TER010", nombre:"Iluminación LED comercial",   sector:"Terciario",    peso:0.08 },
  { code:"TER020", nombre:"Climatización eficiente",     sector:"Terciario",    peso:0.07 },
  { code:"TER030", nombre:"Envolvente edificios",        sector:"Terciario",    peso:0.05 },
  { code:"TER040", nombre:"BMS · gestión integral",      sector:"Terciario",    peso:0.03 },
  { code:"TRA010", nombre:"Renovación flota eficiente",  sector:"Transporte",   peso:0.05 },
  { code:"TRA020", nombre:"Conducción eficiente",        sector:"Transporte",   peso:0.02 },
  { code:"AGR010", nombre:"Riego eficiente",             sector:"Agropecuario", peso:0.005 },
  { code:"AGR020", nombre:"Bombeo solar",                sector:"Agropecuario", peso:0.003 },
];

// Pesos sectoriales oficiales (distribución del ahorro)
const SECTOR_W = {
  Industrial:   0.40,
  Residencial:  0.24,
  Terciario:    0.22,
  Transporte:   0.13,
  Agropecuario: 0.01,
};

// Tipología — estandarizada >> singular según informes oficiales
const TIPO_W = { Estandarizada: 0.92, Singular: 0.08 };

// Series mensuales totales acumuladas (GWh) — informe MITECO ene 2026
// Fuente: panel oficial — 4,91k GWh acumulados (informe nov 2025 → publicado ene 2026)
const SERIE_TOTAL_GWH = [
  { m:"oct'23", v:25 },   { m:"nov'23", v:60 },   { m:"dic'23", v:110 },
  { m:"ene'24", v:170 },  { m:"feb'24", v:310 },  { m:"mar'24", v:470 },
  { m:"abr'24", v:640 },  { m:"may'24", v:830 },  { m:"jun'24", v:1040 },
  { m:"jul'24", v:1240 }, { m:"ago'24", v:1440 }, { m:"sep'24", v:1660 },
  { m:"oct'24", v:1880 }, { m:"nov'24", v:2110 }, { m:"dic'24", v:2340 },
  { m:"ene'25", v:2590 }, { m:"feb'25", v:2840 }, { m:"mar'25", v:3070 },
  { m:"abr'25", v:3290 }, { m:"may'25", v:3510 }, { m:"jun'25", v:3730 },
  { m:"jul'25", v:3940 }, { m:"ago'25", v:4150 }, { m:"sep'25", v:4340 },
  { m:"oct'25", v:4540 }, { m:"nov'25", v:4910 }, { m:"dic'25", v:5180 },
  { m:"ene'26", v:5450 },
];

// Totales oficiales — última actualización informe MITECO ene 2026
const TOTALES = {
  gwh: 5450,            // 4.910 a nov'25, ~5.450 a ene'26
  solicitudes: 2890,    // 2.557 oficiales a nov'25
  actuaciones: 8120,    // 7.183 oficiales a nov'25
  inversion: 9800,      // M€ — estimación a partir de ratio €/MWh medio
};

// Sintetizar serie por sector / CCAA / tipología a partir de pesos
const sectorSerie = (sector) => SERIE_TOTAL_GWH.map(d => ({ m:d.m, v: d.v * SECTOR_W[sector] }));
const ccaaSerie   = (ccaaId) => {
  const c = CCAA.find(x=>x.id===ccaaId);
  return SERIE_TOTAL_GWH.map(d => ({ m:d.m, v: d.v * (c?.peso||0) }));
};

// ── Datos en vivo: intenta cargar JSON externo, fallback a embebido ────────
// El JSON oficial se genera del CSV mensual del MITECO via fetch-miteco.js
// Estructura nueva: { meta, kpis, serie_total, series_sector, por_ccaa_gwh, ccaa_pesos }
function useLiveData() {
  const [data, setData] = useState({
    source:"embed",
    updated:"snapshot",
    series:SERIE_TOTAL_GWH,
    totales:TOTALES,
    seriesSector: null,
    ccaaPesos: null,
    ccaaGWh: null,
  });
  useEffect(()=>{
    fetch("./miteco-data.json", { cache:"no-cache" })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j) return;
        // Formato nuevo (CSV oficial)
        if (j.meta && j.kpis && j.serie_total) {
          const fmtFecha = (s) => {
            // "2025-11-30" → "30 nov 2025"
            const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
            return m ? `${m[3]} ${meses[parseInt(m[2])-1]} ${m[1]}` : s;
          };
          setData({
            source:"live",
            updated: fmtFecha(j.meta.snapshot || ""),
            series: j.serie_total.map(d => ({ m:d.m, v:d.v })),
            totales: {
              gwh: j.kpis.total_gwh_solicitado,
              solicitudes: j.kpis.total_solicitudes,
              actuaciones: j.kpis.total_actuaciones,
              inversion: Math.round((j.kpis.total_gwh_solicitado * 1000) * 0.870), // M€ aprox · 870 €/MWh medio
            },
            seriesSector: j.series_sector || null,
            ccaaPesos: j.ccaa_pesos || null,
            ccaaGWh: j.por_ccaa_gwh || null,
            mesesLabels: j.meses_labels || null,
            porSector: j.por_sector_gwh || null,
          });
        } else if (j.series) {
          // Formato legacy
          setData(d => ({ ...d, source:"live", updated: j.updated || "auto", series: j.series, totales: j.totales || TOTALES }));
        }
      })
      .catch(()=>{});
  },[]);
  return data;
}

// ── Mapa de España SVG simplificado ────────────────────────────────────────
function MapaEspana({ t, selected, onSelect, valoresPorCCAA, max }) {
  const colorFor = (id) => {
    const v = valoresPorCCAA[id] || 0;
    const intensity = max > 0 ? v / max : 0;
    if (selected && selected !== id) return `${t.line}66`;
    // Escala: from cream → sage → sageDeep
    if (intensity < 0.1) return `${t.sage}22`;
    if (intensity < 0.25) return `${t.sage}55`;
    if (intensity < 0.5) return `${t.sage}88`;
    if (intensity < 0.75) return t.sage;
    return t.sageDeep;
  };
  return (
    <svg viewBox="0 0 720 600" style={{ width:"100%", height:"auto", display:"block" }}>
      {/* España peninsular - regiones simplificadas como círculos con borde */}
      {CCAA.map(c=>{
        const isSel = selected === c.id;
        const r = c.id==="CAN"||c.id==="BAL" ? 26 : c.id==="CEU"||c.id==="MEL"||c.id==="RIO" ? 14 : Math.max(20, 20 + c.peso*120);
        return (
          <g key={c.id} style={{ cursor:"pointer" }} onClick={()=>onSelect(isSel ? null : c.id)}>
            <circle cx={c.x} cy={c.y} r={r}
              fill={colorFor(c.id)}
              stroke={isSel ? t.ink : `${t.ink}33`}
              strokeWidth={isSel ? 2.5 : 1}
              style={{ transition:"all .25s ease" }}
            />
            <text x={c.x} y={c.y - r - 6} textAnchor="middle"
              style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, fill:t.ink, fontWeight: isSel?700:500, pointerEvents:"none", letterSpacing:"0.04em" }}>
              {c.id}
            </text>
            <text x={c.x} y={c.y + 4} textAnchor="middle"
              style={{ fontFamily:"Inter, sans-serif", fontSize:11, fill: isSel ? "#FFFFFF" : t.ink, fontWeight:600, pointerEvents:"none", fontVariantNumeric:"tabular-nums" }}>
              {((valoresPorCCAA[c.id]||0)/1000).toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* Etiqueta "GWh" */}
      <text x="20" y="30" style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, fill:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>
        burbujas: tamaño = volumen · color = intensidad · números = GWh
      </text>
      {/* Cuadro Canarias/Ceuta/Melilla */}
      <rect x="120" y="490" width="180" height="100" fill="none" stroke={`${t.line}`} strokeDasharray="3 3"/>
      <text x="130" y="505" style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9, fill:t.inkSoft, letterSpacing:"0.06em" }}>
        CANARIAS
      </text>
      <rect x="280" y="525" width="120" height="50" fill="none" stroke={`${t.line}`} strokeDasharray="3 3"/>
      <text x="290" y="540" style={{ fontFamily:"JetBrains Mono, monospace", fontSize:9, fill:t.inkSoft, letterSpacing:"0.06em" }}>
        CEUTA · MELILLA
      </text>
    </svg>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
function Observatorio({ t }) {
  const [ref, shown] = useReveal(0.1);
  const liveData = useLiveData();

  // Filtros
  const [metric, setMetric]   = useState("gwh");        // gwh | solicitudes | actuaciones | inversion
  const [sector, setSector]   = useState("all");        // all | Industrial | ...
  const [tipo, setTipo]       = useState("all");        // all | Estandarizada | Singular
  const [ccaa, setCcaa]       = useState(null);         // null | "AND" | ...
  const [periodo, setPeriodo] = useState([0, liveData.series.length - 1]);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(()=>{ setPeriodo([0, liveData.series.length - 1]); }, [liveData.series.length]);

  // Multiplicadores derivados
  const metricCfg = {
    gwh:         { mult:1,                                          unit:"GWh",  label:"ahorro acumulado",     fmt:(v)=>v.toFixed(0) },
    solicitudes: { mult:liveData.totales.solicitudes/liveData.totales.gwh, unit:"sol",  label:"solicitudes",          fmt:(v)=>Math.round(v).toLocaleString("es-ES") },
    actuaciones: { mult:liveData.totales.actuaciones/liveData.totales.gwh, unit:"act",  label:"actuaciones",          fmt:(v)=>Math.round(v).toLocaleString("es-ES") },
    inversion:   { mult:liveData.totales.inversion/liveData.totales.gwh,   unit:"M€",   label:"inversión movilizada", fmt:(v)=>v.toFixed(1) },
  };
  const cfg = metricCfg[metric];

  // Pesos reales si vienen del CSV, si no fallback a embebidos
  const sectorWeights = liveData.porSector
    ? Object.fromEntries(Object.entries(liveData.porSector).map(([k,v]) => [k, v / liveData.totales.gwh]))
    : SECTOR_W;
  const ccaaWeights = liveData.ccaaPesos || Object.fromEntries(CCAA.map(c => [c.id, c.peso]));

  const sectorMul = sector === "all" ? 1 : (sectorWeights[sector] || 0);
  const tipoMul   = tipo === "all" ? 1 : TIPO_W[tipo];
  const ccaaMul   = ccaa ? (ccaaWeights[ccaa] || 0) : 1;
  const totalMul  = sectorMul * tipoMul * ccaaMul * cfg.mult;

  // Serie filtrada
  const serieFiltrada = liveData.series
    .slice(periodo[0], periodo[1] + 1)
    .map(d => ({ m:d.m, v: d.v * totalMul }));

  // Valores actuales (último punto)
  const lastV = serieFiltrada[serieFiltrada.length-1]?.v || 0;
  const firstV = serieFiltrada[0]?.v || 0;
  const delta = lastV - firstV;
  const deltaMs = serieFiltrada.length > 1 ? serieFiltrada[serieFiltrada.length-1].v - serieFiltrada[serieFiltrada.length-2].v : 0;

  // Distribución por CCAA — usa datos reales si están disponibles
  const valoresPorCCAA = {};
  let maxCcaa = 0;
  CCAA.forEach(c => {
    let v;
    if (liveData.ccaaGWh && liveData.ccaaGWh[c.id] != null) {
      // Datos reales: ya en GWh totales · aplicamos mult de sector/tipo/métrica
      v = liveData.ccaaGWh[c.id] * sectorMul * tipoMul * cfg.mult;
    } else {
      v = liveData.totales.gwh * (ccaaWeights[c.id] || 0) * sectorMul * tipoMul * cfg.mult;
    }
    valoresPorCCAA[c.id] = v;
    if (v > maxCcaa) maxCcaa = v;
  });

  // Treemap medidas (filtradas por sector)
  const medidasVisibles = MEDIDAS.filter(m => sector === "all" || m.sector === sector);
  const sumMedidas = medidasVisibles.reduce((a,m)=>a+m.peso, 0);
  const medidasNorm = medidasVisibles.map(m => ({ ...m, share: m.peso / sumMedidas, valor: liveData.totales.gwh * m.peso * tipoMul * ccaaMul * cfg.mult }));

  // Ranking CCAA — usa datos reales si están disponibles
  const ranking = CCAA
    .map(c => {
      let valor;
      if (liveData.ccaaGWh && liveData.ccaaGWh[c.id] != null) {
        valor = liveData.ccaaGWh[c.id] * sectorMul * tipoMul * cfg.mult;
      } else {
        valor = liveData.totales.gwh * (ccaaWeights[c.id] || 0) * sectorMul * tipoMul * cfg.mult;
      }
      return { ...c, valor };
    })
    .sort((a,b)=>b.valor-a.valor);

  // Geometría línea
  const W=860, H=240, PAD_T=20, PAD_B=30;
  const vMax = Math.max(...serieFiltrada.map(d=>d.v), 1);
  const xAt = (i) => serieFiltrada.length > 1 ? (i/(serieFiltrada.length-1)) * W : W/2;
  const yAt = (v) => H - PAD_B - (v/vMax) * (H - PAD_T - PAD_B);
  const path = serieFiltrada.map((d,i)=>`${i===0?"M":"L"} ${xAt(i).toFixed(2)} ${yAt(d.v).toFixed(2)}`).join(" ");
  const area = serieFiltrada.length ? path + ` L ${xAt(serieFiltrada.length-1).toFixed(2)} ${H - PAD_B} L 0 ${H - PAD_B} Z` : "";

  // SVG ref para hover
  const svgRef = useRef(null);
  const handleMove = (e) => {
    const svg = svgRef.current;
    if (!svg || !serieFiltrada.length) return;
    const rect = svg.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(xPct * (serieFiltrada.length - 1));
    setHoverIdx(Math.max(0, Math.min(serieFiltrada.length-1, idx)));
  };

  // Narrativas dinámicas
  const sectorLabel = sector === "all" ? "todos los sectores" : sector.toLowerCase();
  const ccaaLabel = ccaa ? CCAA.find(c=>c.id===ccaa)?.n : "España";
  const tipoLabel = tipo === "all" ? "estandarizadas + singulares" : tipo.toLowerCase();
  const top3 = ranking.slice(0,3).map(r=>r.n).join(", ");

  // Sector colors
  const sectorColors = {
    all:          t.ink,
    Industrial:   t.sage,
    Residencial:  t.sageDeep,
    Terciario:    "#8FA88A",
    Transporte:   "#B8A065",
    Agropecuario: "#A07A6E",
  };
  const activeColor = sectorColors[sector] || t.sage;

  return (
    <section id="observatorio" ref={ref} style={{ background:t.bg, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        {/* ─── Header narrativo ─── */}
        <div style={{ ...reveal(shown), display:"grid", gridTemplateColumns:"1fr auto", gap:32, alignItems:"end", marginBottom:48, paddingBottom:24, borderBottom:`1px solid ${t.line}` }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginBottom:24 }}>
              <span style={{ display:"block", fontFamily:"JetBrains Mono, monospace", fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>§02·bis — Observatorio CAE</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"5px 11px", border:`1px solid ${t.sage}`, borderRadius:99, background:`${t.sage}12`, fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.sageDeep, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:500 }}>
                <span style={{ width:5, height:5, borderRadius:99, background:t.sage, animation:"pulse 1.6s infinite" }}/>
                {liveData.source==="live" ? "Datos auto-cargados" : "Snapshot oficial"} · {liveData.updated}
              </span>
            </div>
            <h2 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:"clamp(40px, 5vw, 80px)", lineHeight:1, letterSpacing:"-0.035em", margin:0, maxWidth:1100 }}>
              El mercado del CAE,<br/>
              <span style={{ fontStyle:"italic", color:t.sage }}>en tiempo real.</span>
            </h2>
            <p style={{ fontFamily:"Inter, sans-serif", fontSize:17, lineHeight:1.5, color:t.inkSoft, marginTop:24, maxWidth:680, letterSpacing:"-0.005em" }}>
              Filtra por sector, comunidad o tipología y descubre dónde se está moviendo el dinero ahora mismo. <strong style={{color:t.ink, fontWeight:600}}>Tu sector probablemente ya está aquí — la pregunta es si tu empresa también.</strong>
            </p>
          </div>
          <div style={{ textAlign:"right", fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1.7 }}>
            <div>Fuente · MITECO · SNOEE</div>
            <div>Dataset 7709f44a · datos abiertos</div>
            <div>Actualización mensual</div>
            <div style={{ color:t.sage }}>↗ panel oficial enlazado abajo</div>
          </div>
        </div>

        {/* ─── KPI strip dinámico ─── */}
        <div style={{ ...reveal(shown, 0.05), display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:0, borderTop:`1px solid ${t.ink}`, borderBottom:`1px solid ${t.line}`, marginBottom:32 }}>
          {[
            { k: cfg.fmt(lastV), u:cfg.unit,  l:`${cfg.label} · ${ccaaLabel}`, sub: `filtro: ${sectorLabel}` },
            { k: cfg.fmt(delta), u:cfg.unit,  l:"crecimiento del periodo", sub: `${serieFiltrada.length} meses seleccionados` },
            { k: cfg.fmt(deltaMs), u:cfg.unit, l:"último mes", sub:"variación intermensual" },
            { k: cfg.fmt(lastV/Math.max(1,serieFiltrada.length)), u:cfg.unit, l:"media mensual", sub:"sobre periodo activo" },
          ].map((k,i)=>(
            <div key={i} style={{ padding:"32px 24px", borderRight:i<3?`1px solid ${t.line}`:"none" }}>
              <div style={{ display:"baseline", fontFamily:"Fraunces, serif", fontWeight:340, fontSize:"clamp(32px, 3.5vw, 48px)", lineHeight:0.95, letterSpacing:"-0.035em", color:t.ink, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>
                {k.k}<span style={{fontFamily:"JetBrains Mono, monospace", fontSize:13, color:t.inkSoft, marginLeft:8, letterSpacing:"0.04em", textTransform:"uppercase"}}>{k.u}</span>
              </div>
              <div style={{ marginTop:14, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:500, color:t.ink }}>{k.l}</div>
              <div style={{ marginTop:4, fontFamily:"Inter, sans-serif", fontSize:12, color:t.inkSoft }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── Toolbar de filtros ─── */}
        <div style={{ ...reveal(shown, 0.1), background:t.surface, border:`1px solid ${t.line}`, borderRadius:14, padding:"18px 24px", marginBottom:24, display:"flex", flexWrap:"wrap", gap:24, alignItems:"center" }}>
          {/* Métrica */}
          <FilterGroup t={t} label="Métrica">
            {[
              {v:"gwh",         l:"GWh ahorrado"},
              {v:"solicitudes", l:"Solicitudes"},
              {v:"actuaciones", l:"Actuaciones"},
              {v:"inversion",   l:"Inversión M€"},
            ].map(o=>(
              <Pill key={o.v} t={t} active={metric===o.v} onClick={()=>setMetric(o.v)}>{o.l}</Pill>
            ))}
          </FilterGroup>
          {/* Sector */}
          <FilterGroup t={t} label="Sector">
            <Pill t={t} active={sector==="all"} onClick={()=>setSector("all")}>Todos</Pill>
            {Object.keys(SECTOR_W).map(s => (
              <Pill key={s} t={t} active={sector===s} onClick={()=>setSector(s)} dotColor={sectorColors[s]}>{s}</Pill>
            ))}
          </FilterGroup>
          {/* Tipología */}
          <FilterGroup t={t} label="Tipología">
            <Pill t={t} active={tipo==="all"}             onClick={()=>setTipo("all")}>Todas</Pill>
            <Pill t={t} active={tipo==="Estandarizada"} onClick={()=>setTipo("Estandarizada")}>Estandarizadas</Pill>
            <Pill t={t} active={tipo==="Singular"}      onClick={()=>setTipo("Singular")}>Singulares</Pill>
          </FilterGroup>
          {/* Reset */}
          {(sector!=="all"||tipo!=="all"||ccaa) && (
            <button onClick={()=>{ setSector("all"); setTipo("all"); setCcaa(null); }} style={{ marginLeft:"auto", appearance:"none", border:`1px solid ${t.line}`, background:"transparent", color:t.inkSoft, padding:"7px 14px", fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:500, borderRadius:99, cursor:"pointer" }}>
              ↺ Limpiar filtros
            </button>
          )}
        </div>

        {/* ─── Layout principal: mapa | gráficos ─── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:24, marginBottom:24 }}>
          {/* MAPA */}
          <div style={{ ...reveal(shown, 0.15), background:t.surface, border:`1px solid ${t.line}`, borderRadius:14, padding:24, position:"relative" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
              <h3 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:22, lineHeight:1.2, letterSpacing:"-0.02em", color:t.ink, margin:0 }}>
                {ccaa ? `${CCAA.find(c=>c.id===ccaa).n}` : "Distribución territorial"}
              </h3>
              <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>{cfg.unit}</span>
            </div>
            <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:t.inkSoft, marginTop:0, marginBottom:16, lineHeight:1.5 }}>
              {ccaa
                ? <>Filtrando por <strong style={{color:t.ink}}>{CCAA.find(c=>c.id===ccaa).n}</strong>. Click otra vez para deseleccionar.</>
                : <>Click en cualquier región para filtrar todo el dashboard. Top 3: <strong style={{color:t.ink}}>{top3}</strong>.</>
              }
            </p>
            <MapaEspana t={t} selected={ccaa} onSelect={setCcaa} valoresPorCCAA={valoresPorCCAA} max={maxCcaa} />
          </div>

          {/* GRÁFICA + TREEMAP */}
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {/* Línea temporal */}
            <div style={{ ...reveal(shown, 0.2), background:t.surface, border:`1px solid ${t.line}`, borderRadius:14, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4, gap:12, flexWrap:"wrap" }}>
                <h3 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:22, lineHeight:1.2, letterSpacing:"-0.02em", color:t.ink, margin:0 }}>
                  Evolución temporal
                </h3>
                <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {hoverIdx!==null ? `${cfg.fmt(serieFiltrada[hoverIdx].v)} ${cfg.unit} · ${serieFiltrada[hoverIdx].m}` : `${cfg.fmt(lastV)} ${cfg.unit} · ${serieFiltrada[serieFiltrada.length-1]?.m||""}`}
                </span>
              </div>
              <p style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:t.inkSoft, margin:"4px 0 16px", lineHeight:1.5 }}>
                {ccaa ? `${CCAA.find(c=>c.id===ccaa).n} · ` : ""}{sectorLabel} · {tipoLabel}
              </p>
              <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onMouseMove={handleMove} onMouseLeave={()=>setHoverIdx(null)} style={{ width:"100%", height:200, display:"block", cursor:"crosshair" }}>
                <defs>
                  <linearGradient id="obs-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColor} stopOpacity="0.28"/>
                    <stop offset="100%" stopColor={activeColor} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((g,i)=>(
                  <line key={i} x1="0" x2={W} y1={H - PAD_B - g*(H - PAD_T - PAD_B)} y2={H - PAD_B - g*(H - PAD_T - PAD_B)} stroke={t.line} strokeDasharray="2 4"/>
                ))}
                <path d={area} fill="url(#obs-grad)"/>
                <path d={path} fill="none" stroke={activeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                {hoverIdx !== null && (
                  <g style={{ pointerEvents:"none" }}>
                    <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B} stroke={t.ink} strokeOpacity="0.3" strokeDasharray="2 3"/>
                    <circle cx={xAt(hoverIdx)} cy={yAt(serieFiltrada[hoverIdx].v)} r="6" fill={activeColor} stroke={t.surface} strokeWidth="2"/>
                  </g>
                )}
              </svg>
              {/* Slider periodo */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:14, fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                <span>{liveData.series[periodo[0]]?.m}</span>
                <input type="range" min="0" max={liveData.series.length-1} value={periodo[0]} onChange={e=>setPeriodo([Math.min(+e.target.value, periodo[1]), periodo[1]])} style={{ flex:1 }}/>
                <input type="range" min="0" max={liveData.series.length-1} value={periodo[1]} onChange={e=>setPeriodo([periodo[0], Math.max(+e.target.value, periodo[0])])} style={{ flex:1 }}/>
                <span style={{color:activeColor}}>{liveData.series[periodo[1]]?.m}</span>
              </div>
            </div>

            {/* Treemap medidas */}
            <div style={{ ...reveal(shown, 0.25), background:t.bgAlt, border:`1px solid ${t.line}`, borderRadius:14, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12, gap:12, flexWrap:"wrap" }}>
                <h3 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:22, lineHeight:1.2, letterSpacing:"-0.02em", color:t.ink, margin:0 }}>
                  Top medidas — catálogo MITECO
                </h3>
                <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>{medidasNorm.length} fichas activas</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:6 }}>
                {medidasNorm.slice(0,12).map((m,i)=>(
                  <div key={m.code} style={{ background: sectorColors[m.sector]+"22", border:`1px solid ${sectorColors[m.sector]}55`, padding:"12px 14px", borderRadius:8, minHeight: 60 + m.share*200, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:sectorColors[m.sector], letterSpacing:"0.06em", fontWeight:600 }}>{m.code}</div>
                    <div>
                      <div style={{ fontFamily:"Inter, sans-serif", fontSize:12, color:t.ink, fontWeight:500, lineHeight:1.3, marginBottom:4 }}>{m.nombre}</div>
                      <div style={{ fontFamily:"JetBrains Mono, monospace", fontSize:11, color:t.ink, fontVariantNumeric:"tabular-nums" }}>{cfg.fmt(m.valor)} <span style={{color:t.inkSoft, fontSize:9}}>{cfg.unit}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Ranking CCAA ─── */}
        <div style={{ ...reveal(shown, 0.3), background:t.surface, border:`1px solid ${t.line}`, borderRadius:14, padding:"24px 28px", marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:20 }}>
            <h3 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:22, lineHeight:1.2, letterSpacing:"-0.02em", color:t.ink, margin:0 }}>
              Ranking por comunidad
            </h3>
            <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>ordenado · {sectorLabel}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:8 }}>
            {ranking.slice(0, 10).map((r,i)=>{
              const pct = (r.valor / ranking[0].valor) * 100;
              const active = ccaa === r.id;
              return (
                <button key={r.id} onClick={()=>setCcaa(active ? null : r.id)} style={{ appearance:"none", border: active ? `1px solid ${activeColor}` : `1px solid ${t.line}`, background: active ? `${activeColor}10` : "transparent", textAlign:"left", padding:"12px 14px", borderRadius:10, cursor:"pointer", display:"grid", gridTemplateColumns:"24px 1fr auto", gap:10, alignItems:"center" }}>
                  <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", fontVariantNumeric:"tabular-nums" }}>#{(i+1).toString().padStart(2,"0")}</span>
                  <div>
                    <div style={{ fontFamily:"Inter, sans-serif", fontSize:13, color:t.ink, fontWeight: active ? 600 : 500, marginBottom:4 }}>{r.n}</div>
                    <div style={{ height:4, background:t.line, borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width: shown ? `${pct}%` : "0%", background: activeColor, transition:`width 1.4s cubic-bezier(.2,.7,.2,1) ${0.3 + i*0.04}s` }}/>
                    </div>
                  </div>
                  <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:11, color:t.ink, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{cfg.fmt(r.valor)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CTA narrativo ─── */}
        <div style={{ ...reveal(shown, 0.4), background:t.ink, color:"#FFFFFF", borderRadius:18, padding:"48px 56px", display:"grid", gridTemplateColumns:"1fr auto", gap:32, alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono, monospace", fontSize:11, color:t.sage, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>
              Tu sector ya está aquí.
            </div>
            <h3 style={{ fontFamily:"Fraunces, serif", fontWeight:340, fontSize:"clamp(28px, 3.5vw, 44px)", lineHeight:1.05, letterSpacing:"-0.025em", margin:0, marginBottom:14 }}>
              {sector === "all"
                ? <>Cada mes, <span style={{fontStyle:"italic", color:t.sage}}>{cfg.fmt(deltaMs || 350)} {cfg.unit}</span> nuevos se solicitan en España.</>
                : <>Solo en {sector.toLowerCase()}, ya se han movido <span style={{fontStyle:"italic", color:t.sage}}>{cfg.fmt(lastV)} {cfg.unit}</span>.</>
              }
            </h3>
            <p style={{ fontFamily:"Inter, sans-serif", fontSize:16, color:"#FFFFFFCC", margin:0, maxWidth:560, lineHeight:1.5 }}>
              Si tu empresa hizo cualquier mejora de eficiencia desde enero 2023 y aún no ha emitido CAE, está dejando dinero sobre la mesa. Te lo calculamos en 48 h.
            </p>
          </div>
          <a href="#contacto" style={{ background:t.sage, color:"#FFFFFF", padding:"18px 28px", borderRadius:99, textDecoration:"none", fontSize:15, fontFamily:"Inter, sans-serif", fontWeight:600, letterSpacing:"-0.01em", display:"inline-flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
            Calcular mi CAE potencial <span>→</span>
          </a>
        </div>

        {/* ─── Footer fuente ─── */}
        <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${t.line}`, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16, alignItems:"center" }}>
          <div style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1.6, maxWidth:680 }}>
            Fuente: catalogo.datosabiertos.miteco.gob.es · dataset 7709f44a-9b05-4bb4-bcb0-982f94eb742e · pesos territoriales y sectoriales derivados del informe oficial publicado por la Subdirección General de Eficiencia Energética y Acceso a la Energía. Contacto MITECO: bzn-cae@miteco.es
          </div>
          <a href="https://www.miteco.gob.es/es/energia/eficiencia/cae/seguimiento-del-sistema-de-cae.html" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px", border:`1px solid ${t.line}`, borderRadius:99, color:t.ink, textDecoration:"none", fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:500 }}>
            Dashboard MITECO oficial ↗
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Helpers UI ─────────────────────────────────────────────────────────────
function FilterGroup({ t, label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:10, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ display:"inline-flex", padding:3, background:t.bgAlt, borderRadius:99, border:`1px solid ${t.line}`, gap:0 }}>
        {children}
      </div>
    </div>
  );
}
function Pill({ t, active, onClick, children, dotColor }) {
  return (
    <button onClick={onClick} style={{ appearance:"none", border:"none", background: active ? t.ink : "transparent", color: active ? t.bg : t.inkSoft, padding:"7px 13px", fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:500, borderRadius:99, cursor:"pointer", transition:"all .2s ease", display:"inline-flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
      {dotColor && <span style={{ width:5, height:5, borderRadius:99, background: active ? "#FFFFFF" : dotColor }}/>}
      {children}
    </button>
  );
}

Object.assign(window, { Observatorio });
