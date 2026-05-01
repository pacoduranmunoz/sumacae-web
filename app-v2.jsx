// SUMACAE v2 — disruptive, interactive, terminal-meets-editorial
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "acid",
  "intensity": "high"
}/*EDITMODE-END*/;

const PALETTES = {
  acid: { name: "Acid noir", bg: "#0A0B08", surface: "#101208", ink: "#F4F2E8", inkSoft: "#8E9080", line: "#FFFFFF14", accent: "#C6FF3D", accent2: "#FF5722", glow: "#C6FF3D40" },
  voltage: { name: "Voltage", bg: "#06080F", surface: "#0C0F1A", ink: "#F0F4FF", inkSoft: "#7A8298", line: "#FFFFFF14", accent: "#3DFFE0", accent2: "#FF3DAA", glow: "#3DFFE040" },
  solar: { name: "Solar", bg: "#0F0A06", surface: "#1A1208", ink: "#FFF5E8", inkSoft: "#A09080", line: "#FFFFFF14", accent: "#FFD43D", accent2: "#FF6B3D", glow: "#FFD43D40" },
};

// ── Custom cursor ──────────────────────────────────────────────────────────
function CustomCursor({ palette }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    let x=0, y=0, rx=0, ry=0;
    const onMove = (e) => { x = e.clientX; y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px,${y}px)`;
      const t = e.target;
      setHover(!!(t && (t.tagName === "BUTTON" || t.tagName === "A" || t.closest && (t.closest("button") || t.closest("a")))));
    };
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    const r = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(r); };
  }, []);
  return (
    <React.Fragment>
      <div ref={dotRef} style={{ position:"fixed", top:0, left:0, width:6, height:6, marginLeft:-3, marginTop:-3, background:palette.accent, borderRadius:0, zIndex:9999, pointerEvents:"none", mixBlendMode:"difference" }} />
      <div ref={ringRef} style={{ position:"fixed", top:0, left:0, width:hover?56:32, height:hover?56:32, marginLeft:hover?-28:-16, marginTop:hover?-28:-16, border:`1px solid ${palette.accent}`, borderRadius:0, zIndex:9998, pointerEvents:"none", transition:"width .25s, height .25s, margin .25s", transform:"translate(0,0)" }} />
    </React.Fragment>
  );
}

// ── Logo (mark) ────────────────────────────────────────────────────────────
function Mark({ size = 36, palette }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M14 4 L14 56 M4 14 L56 14" stroke={palette.ink} strokeWidth="3" />
        <path d="M28 6 C36 6 44 14 44 24 C44 30 38 36 30 36 C28 36 26 35 26 33 C26 25 28 14 28 6 Z" fill={palette.accent} />
      </svg>
      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:size*0.4, letterSpacing:"-0.01em", color:palette.ink }}>
        suma<span style={{ color: palette.accent }}>CAE</span>
      </div>
    </div>
  );
}

// ── Top ticker (live market) ───────────────────────────────────────────────
function Ticker({ palette }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1800); return () => clearInterval(id); }, []);
  const items = [
    { sym: "CAE/AERO", base: 43.20 }, { sym: "CAE/PV", base: 38.80 }, { sym: "CAE/LED", base: 41.50 },
    { sym: "CAE/SATE", base: 46.10 }, { sym: "CAE/BIO", base: 39.40 }, { sym: "CAE/HVAC", base: 44.70 },
    { sym: "FNEE-IDX", base: 100.0 }, { sym: "VOLUMEN-MWh", base: 18342 },
  ];
  const data = items.map((it, i) => {
    const noise = Math.sin(tick * 0.7 + i) * 0.3 + Math.cos(tick * 0.3 + i*1.7) * 0.2;
    const v = it.base * (1 + noise * 0.012);
    const d = noise * 0.012 * 100;
    return { ...it, v, d };
  });
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:51, background:palette.bg, borderBottom:`1px solid ${palette.line}`, fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, overflow:"hidden", height:32 }}>
      <div style={{ display:"flex", gap:32, padding:"9px 24px", whiteSpace:"nowrap", animation:"tickerScroll 60s linear infinite" }}>
        {[...data, ...data, ...data].map((it, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={{ color:palette.inkSoft }}>{it.sym}</span>
            <span style={{ color:palette.ink, fontVariantNumeric:"tabular-nums" }}>{it.v < 1000 ? it.v.toFixed(2) : Math.round(it.v).toLocaleString("es-ES")}</span>
            <span style={{ color: it.d >= 0 ? palette.accent : palette.accent2, fontVariantNumeric:"tabular-nums" }}>{it.d >= 0 ? "▲" : "▼"} {Math.abs(it.d).toFixed(2)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ palette }) {
  const items = [["01", "QUÉ ES", "#cae"], ["02", "PROCESO", "#proceso"], ["03", "MERCADO", "#mercado"], ["04", "CASOS", "#casos"], ["05", "FAQ", "#faq"]];
  return (
    <nav style={{ position:"fixed", top:32, left:0, right:0, zIndex:50, padding:"16px 24px", background:`${palette.bg}F2`, backdropFilter:"blur(10px)", borderBottom:`1px solid ${palette.line}` }}>
      <div style={{ maxWidth:1480, margin:"0 auto", display:"flex", alignItems:"center", gap:24 }}>
        <a href="#top" style={{ textDecoration:"none" }}><Mark size={32} palette={palette} /></a>
        <div style={{ display:"flex", gap:4, marginLeft:"auto", fontFamily:"'JetBrains Mono', monospace", fontSize:11 }}>
          {items.map(([n, l, h]) => (
            <a key={h} href={h} style={{ color:palette.ink, textDecoration:"none", padding:"8px 14px", border:`1px solid transparent`, display:"inline-flex", gap:8, alignItems:"center", whiteSpace:"nowrap" }}
               onMouseEnter={e => e.currentTarget.style.borderColor = palette.line}
               onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
              <span style={{ color:palette.inkSoft }}>{n}</span><span>{l}</span>
            </a>
          ))}
        </div>
        <a href="#contacto" style={{ background:palette.accent, color:palette.bg, padding:"10px 18px", textDecoration:"none", fontFamily:"'JetBrains Mono', monospace", fontSize:11, fontWeight:700, letterSpacing:"0.06em", display:"inline-flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}>
          [→] EMPEZAR
        </a>
      </div>
    </nav>
  );
}

// ── HERO ─ Disruptive split ────────────────────────────────────────────────
function Hero({ palette }) {
  const [mwh, setMwh] = useState(120);
  const [precio, setPrecio] = useState(43.20);
  const liquidacion = Math.round(mwh * precio);
  const neto = Math.round(liquidacion * 0.93);
  const [glitch, setGlitch] = useState(0);
  useEffect(() => { const id = setInterval(() => setGlitch(g => g+1), 80); return () => clearInterval(id); }, []);

  return (
    <section id="top" style={{ position:"relative", minHeight:"100vh", paddingTop:140, paddingBottom:60, background:palette.bg, color:palette.ink, overflow:"hidden" }}>
      {/* Grid backdrop */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${palette.line} 1px, transparent 1px), linear-gradient(90deg, ${palette.line} 1px, transparent 1px)`, backgroundSize:"80px 80px", maskImage:"radial-gradient(ellipse at top, black 30%, transparent 80%)", WebkitMaskImage:"radial-gradient(ellipse at top, black 30%, transparent 80%)" }} />

      <div style={{ position:"relative", maxWidth:1480, margin:"0 auto", padding:"0 24px" }}>
        {/* Top meta bar */}
        <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, marginBottom:48, paddingBottom:16, borderBottom:`1px solid ${palette.line}` }}>
          <span>[ES_ES] / SISTEMA_CAE / RD_36-2023 / ACTIVO</span>
          <span>SESIÓN: {new Date().toLocaleString("es-ES", { hour:"2-digit", minute:"2-digit" })} CET</span>
          <span style={{ color:palette.accent }}>● MERCADO ABIERTO · {Math.floor(Math.random()*30+45)} ofertas</span>
        </div>

        {/* MEGA TYPE */}
        <h1 style={{ fontFamily:"'Fraunces', Georgia, serif", fontWeight:300, fontSize:"clamp(56px, 11vw, 180px)", lineHeight:0.96, letterSpacing:"-0.045em", margin:0 }}>
          Tus kilovatios<br/>
          <em style={{ fontStyle:"italic", color:palette.accent, fontWeight:300, textShadow: glitch%50===0 ? `2px 0 ${palette.accent2}` : "none" }}>vendidos</em><br/>
          <span style={{ color:palette.inkSoft }}>al mejor postor.</span>
        </h1>

        {/* Bottom row: blurb + LIVE calc */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:60, marginTop:64, alignItems:"end" }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:16, letterSpacing:"0.16em" }}>// MANIFIESTO_001</div>
            <p style={{ fontSize:20, lineHeight:1.45, color:palette.ink, margin:0, maxWidth:580, fontFamily:"'Fraunces', serif" }}>
              Cada vatio que ahorras es un activo financiero registrado por el Estado. Lo medimos, lo verificamos, lo vendemos a comercializadoras obligadas. Tú firmas dos veces. Cobras una. <em style={{ color:palette.accent }}>El resto es nuestro problema.</em>
            </p>
            <div style={{ display:"flex", gap:14, marginTop:32, flexWrap:"wrap" }}>
              <a href="#contacto" style={{ background:palette.accent, color:palette.bg, padding:"18px 28px", fontFamily:"'JetBrains Mono', monospace", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:12 }}>
                <span style={{ width:8, height:8, background:palette.bg, animation:"pulse 1.2s infinite" }} />
                INICIAR_OPERACIÓN
              </a>
              <a href="#proceso" style={{ color:palette.ink, padding:"18px 28px", fontFamily:"'JetBrains Mono', monospace", fontSize:12, fontWeight:600, letterSpacing:"0.08em", textDecoration:"none", border:`1px solid ${palette.line}`, display:"inline-flex", alignItems:"center", gap:12 }}>
                VER_PROCESO →
              </a>
            </div>
          </div>

          {/* MINI LIVE TICKER WIDGET */}
          <div style={{ border:`1px solid ${palette.line}`, background:palette.surface, padding:0, fontFamily:"'JetBrains Mono', monospace" }}>
            <div style={{ borderBottom:`1px solid ${palette.line}`, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:10, color:palette.inkSoft, letterSpacing:"0.12em" }}>
              <span>SIM_CAE.LIVE</span>
              <span style={{ color:palette.accent, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6, height:6, background:palette.accent, borderRadius:99, boxShadow:`0 0 8px ${palette.accent}` }} />REAL-TIME
              </span>
            </div>
            <div style={{ padding:"24px 20px" }}>
              <SliderRowMono label="MWh ahorrados/año" value={mwh} setValue={setMwh} min={10} max={2000} unit="MWh" palette={palette} />
              <SliderRowMono label="Precio CAE" value={precio} setValue={setPrecio} min={32} max={58} step={0.1} unit="€/MWh" palette={palette} />
              <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${palette.line}` }}>
                <div style={{ fontSize:10, color:palette.inkSoft, letterSpacing:"0.16em", marginBottom:6 }}>NETO_AL_CLIENTE</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontFamily:"'Fraunces', serif", fontSize:56, fontWeight:300, color:palette.accent, letterSpacing:"-0.03em", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
                    {neto.toLocaleString("es-ES")}
                  </span>
                  <span style={{ fontSize:18, color:palette.accent }}>€</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:10, color:palette.inkSoft }}>
                  <span>BRUTO {liquidacion.toLocaleString("es-ES")} €</span>
                  <span>FEE 7.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Massive stats row */}
        <div style={{ marginTop:96, display:"grid", gridTemplateColumns:"repeat(4, 1fr)", borderTop:`1px solid ${palette.line}`, borderBottom:`1px solid ${palette.line}` }}>
          {[ ["+12,4 M€", "LIQUIDADO_2025"], ["340+", "OPERACIONES"], ["97%", "TASA_APROBACIÓN"], ["48h", "ANÁLISIS_PREVIO"] ].map(([n, l], i) => (
            <div key={l} style={{ padding:"32px 24px", borderRight: i<3 ? `1px solid ${palette.line}` : "none" }}>
              <div style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(36px, 5vw, 72px)", lineHeight:1, letterSpacing:"-0.03em", color:palette.ink, whiteSpace:"nowrap" }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:palette.inkSoft, marginTop:14, letterSpacing:"0.16em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SliderRowMono({ label, value, setValue, min, max, step=1, unit, palette }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:10, color:palette.inkSoft, letterSpacing:"0.1em" }}>
        <span>{label.toUpperCase()}</span>
        <span style={{ color:palette.ink, fontVariantNumeric:"tabular-nums" }}>{(typeof value === "number" ? value : 0).toLocaleString("es-ES", { maximumFractionDigits: step<1 ? 1 : 0 })} {unit}</span>
      </div>
      <div style={{ position:"relative", height:24 }}>
        <div style={{ position:"absolute", top:11, left:0, right:0, height:2, background:palette.line }} />
        <div style={{ position:"absolute", top:11, left:0, height:2, width:`${pct}%`, background:palette.accent }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>setValue(+e.target.value)} style={{ position:"absolute", inset:0, width:"100%", opacity:0, cursor:"pointer" }} />
        <div style={{ position:"absolute", top:6, left:`calc(${pct}% - 6px)`, width:12, height:12, background:palette.accent, pointerEvents:"none", boxShadow:`0 0 12px ${palette.accent}` }} />
      </div>
    </div>
  );
}

// ── ¿Qué es un CAE? ─ Anatomy reveal ───────────────────────────────────────
function AnatomyCAE({ palette }) {
  const [hover, setHover] = useState(null);
  const parts = [
    { id: "tipo", x: 14, y: 18, w: 22, h: 8, label: "TIPO_ACTUACIÓN", val: "AEROTERMIA_BCH" },
    { id: "mwh", x: 56, y: 26, w: 30, h: 12, label: "AHORRO_VERIFICADO", val: "412 MWh/año" },
    { id: "ccaa", x: 14, y: 36, w: 30, h: 8, label: "EMITIDO_POR", val: "JUNTA DE ANDALUCÍA" },
    { id: "fecha", x: 56, y: 44, w: 30, h: 8, label: "FECHA_EMISIÓN", val: "14 / 03 / 2026" },
    { id: "vigencia", x: 14, y: 56, w: 36, h: 8, label: "VIGENCIA", val: "20 AÑOS · 2046" },
    { id: "valor", x: 14, y: 72, w: 72, h: 14, label: "VALOR_MERCADO", val: "≈ 17.716 €" },
  ];
  return (
    <section id="cae" style={{ background:palette.bg, color:palette.ink, padding:"160px 24px", borderTop:`1px solid ${palette.line}`, position:"relative", overflow:"hidden" }}>
      <div style={{ maxWidth:1480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:80, flexWrap:"wrap", gap:32 }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// SECCIÓN_01 / FUNDAMENTOS</div>
            <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 7vw, 120px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:0, maxWidth:1100 }}>
              Anatomía<br/>de un <em style={{ fontStyle:"italic", color:palette.accent }}>CAE</em>.
            </h2>
          </div>
          <p style={{ fontSize:15, lineHeight:1.6, color:palette.inkSoft, maxWidth:340, fontFamily:"'JetBrains Mono', monospace" }}>
            // Pasa el cursor sobre cada campo para entender qué define el valor de tu certificado.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:64, alignItems:"start" }}>
          {/* Diagram */}
          <div style={{ position:"relative", aspectRatio:"5/4", border:`1px solid ${palette.line}`, background:palette.surface }}>
            <svg viewBox="0 0 100 90" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
              <text x="6" y="9" fontSize="2.6" fontFamily="JetBrains Mono" fill={palette.ink} fontWeight="700">CAE — ES2026.0341</text>
              <text x="94" y="9" textAnchor="end" fontSize="2" fontFamily="JetBrains Mono" fill={palette.inkSoft} opacity="0.5">REG. NACIONAL · MITECO</text>
              <line x1="6" y1="11" x2="94" y2="11" stroke={palette.line} strokeWidth="0.2" />
              {/* Document watermark — bottom strip below all fields */}
              <text x="50" y="88" textAnchor="middle" fontSize="2" fontFamily="JetBrains Mono" fill={palette.inkSoft} opacity="0.25" letterSpacing="0.18">CERTIFICADO DE AHORRO ENERGÉTICO · ESPAÑA · 2026</text>
              {parts.map(p => {
                const isHover = hover === p.id;
                return (
                  <g key={p.id} onMouseEnter={()=>setHover(p.id)} onMouseLeave={()=>setHover(null)} style={{ cursor:"pointer" }}>
                    <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={isHover?palette.accent:palette.line} strokeWidth={isHover?"0.3":"0.15"} />
                    <text x={p.x+1} y={p.y+2.5} fontSize="1.4" fontFamily="JetBrains Mono" fill={palette.inkSoft}>{p.label}</text>
                    <text x={p.x+1} y={p.y+p.h-1.5} fontSize={p.id==="valor"?"3.6":"2.4"} fontFamily={p.id==="valor"?"Fraunces":"JetBrains Mono"} fontWeight={p.id==="valor"?"300":"600"} fill={isHover?palette.accent:palette.ink}>{p.val}</text>
                  </g>
                );
              })}
              {/* QR placeholder */}
              <rect x="82" y="72" width="14" height="14" fill={palette.ink} />
              <rect x="84" y="74" width="3" height="3" fill={palette.bg} />
              <rect x="91" y="74" width="3" height="3" fill={palette.bg} />
              <rect x="84" y="81" width="3" height="3" fill={palette.bg} />
              <rect x="88" y="77" width="1.5" height="1.5" fill={palette.bg} />
              <rect x="90" y="80" width="1.5" height="1.5" fill={palette.bg} />
              <rect x="92" y="82" width="1" height="1" fill={palette.bg} />
            </svg>
          </div>

          {/* Right column: definitions list */}
          <div>
            <p style={{ fontSize:24, lineHeight:1.4, color:palette.ink, fontFamily:"'Fraunces', serif", fontWeight:300, margin:"0 0 32px 0", letterSpacing:"-0.01em" }}>
              Un <span style={{ color:palette.accent }}>CAE</span> es un activo emitido por el Estado que certifica un MWh ahorrado. Se compra. Se vende. Y a diferencia de una subvención, no caduca rápido y no tributa como ingreso extraordinario.
            </p>
            <div style={{ display:"grid", gap:16, fontFamily:"'JetBrains Mono', monospace", fontSize:12 }}>
              {[ ["RD 36/2023", "Marco legal vigente"], ["FNEE", "Fondo Nacional de Eficiencia"], ["VERIFICADOR_ENAC", "Auditor independiente"], ["SUJETO_OBLIGADO", "Comprador final (comercializadoras)"] ].map(([k, v]) => (
                <div key={k} style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:24, padding:"14px 0", borderBottom:`1px solid ${palette.line}` }}>
                  <span style={{ color:palette.accent, letterSpacing:"0.08em" }}>{k}</span>
                  <span style={{ color:palette.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Proceso interactivo ─ Animated path ────────────────────────────────────
function ProcesoInteractivo({ palette }) {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep(s => (s+1)%5), 3200); return () => clearInterval(id); }, []);
  const pasos = [
    { n:"01", title:"ANÁLISIS", time:"48h", desc:"Auditamos tu actuación con factor de elegibilidad por sector. Modelamos el CAE estimado bajo metodología M&V IPMVP.", out:"INFORME_PRELIMINAR.PDF" },
    { n:"02", title:"MANDATO", time:"5 DÍAS", desc:"Firma electrónica del mandato exclusivo. Activamos al verificador acreditado por ENAC y abrimos expediente en CCAA.", out:"MANDATO_ELEC.SIG" },
    { n:"03", title:"VERIFICACIÓN", time:"3-5 SEM", desc:"Visita técnica, mediciones in-situ, contraste con baseline. Documentación al organismo competente de la comunidad autónoma.", out:"DICTAMEN_M&V.PDF" },
    { n:"04", title:"EMISIÓN", time:"30-60 D", desc:"La CCAA inscribe tu CAE en el registro nacional con código único. Te llega el certificado oficial a tu nombre.", out:"CAE_OFICIAL.XML" },
    { n:"05", title:"LIQUIDACIÓN", time:"5 DÍAS", desc:"Subastamos tu CAE entre Sujetos Obligados. Cuando aceptas la mejor oferta, transferimos el neto a tu cuenta.", out:"PAGO_SEPA" },
  ];
  return (
    <section id="proceso" style={{ background:palette.surface, color:palette.ink, padding:"160px 24px", borderTop:`1px solid ${palette.line}`, position:"relative" }}>
      <div style={{ maxWidth:1480, margin:"0 auto" }}>
        <div style={{ marginBottom:80 }}>
          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// SECCIÓN_02 / OPERATIVA</div>
          <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 7vw, 120px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:0, maxWidth:1300 }}>
            5 estados.<br/>De la <em style={{ fontStyle:"italic", color:palette.accent }}>obra</em> al <em style={{ fontStyle:"italic", color:palette.accent }}>ingreso</em>.
          </h2>
        </div>

        {/* Stepper rail */}
        <div style={{ position:"relative", marginBottom:64 }}>
          <div style={{ height:1, background:palette.line, position:"absolute", left:0, right:0, top:"50%" }} />
          <div style={{ height:1, background:palette.accent, position:"absolute", left:0, top:"50%", width:`${(step/4)*100}%`, boxShadow:`0 0 12px ${palette.accent}`, transition:"width .8s" }} />
          <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
            {pasos.map((p, i) => (
              <button key={p.n} onClick={()=>setStep(i)} style={{ background:i<=step?palette.accent:palette.bg, color:i<=step?palette.bg:palette.ink, border:`1px solid ${i<=step?palette.accent:palette.line}`, width:48, height:48, fontFamily:"'JetBrains Mono', monospace", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .4s", boxShadow:i===step?`0 0 24px ${palette.accent}80`:"none" }}>
                {p.n}
              </button>
            ))}
          </div>
        </div>

        {/* Active step detail */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:64, minHeight:280 }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, letterSpacing:"0.16em", marginBottom:12 }}>{pasos[step].time}</div>
            <h3 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 6vw, 88px)", letterSpacing:"-0.03em", lineHeight:0.95, margin:"0 0 24px 0" }}>
              {pasos[step].title}
            </h3>
            <div style={{ display:"inline-flex", gap:8, alignItems:"center", padding:"8px 12px", border:`1px solid ${palette.accent}`, fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent }}>
              [OUT] {pasos[step].out}
            </div>
          </div>
          <div>
            <p style={{ fontSize:22, lineHeight:1.5, fontFamily:"'Fraunces', serif", fontWeight:300, color:palette.ink, margin:0, letterSpacing:"-0.01em" }}>
              {pasos[step].desc}
            </p>
            <div style={{ marginTop:40, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:1, background:palette.line }}>
              {[ ["Tu input", step===0?"Datos obra":step===1?"Firma":step===2?"Acceso técnico":step===3?"Esperar":"Aceptar oferta"], ["Nuestro trabajo", step===0?"Modelado":step===1?"Coord. ENAC":step===2?"Auditoría":step===3?"Trámite CCAA":"Subasta"], ["Tu coste", step===4?"7% éxito":"0 €"] ].map(([k,v], i) => (
                <div key={i} style={{ background:palette.surface, padding:"20px 16px" }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:palette.inkSoft, letterSpacing:"0.12em", marginBottom:10 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize:15, color:palette.ink, fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── MERCADO ─ live chart + bid book ────────────────────────────────────────
function MercadoLive({ palette }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1500); return () => clearInterval(id); }, []);
  // Generate price series
  const series = useMemo(() => {
    const n = 60;
    const arr = [];
    let v = 43;
    for (let i = 0; i < n; i++) {
      v += (Math.sin(i*0.4 + tick*0.1) * 0.4) + (Math.random()-0.5)*0.3;
      arr.push(v);
    }
    return arr;
  }, [tick]);
  const min = Math.min(...series), max = Math.max(...series);
  const path = series.map((y, i) => {
    const x = (i / (series.length-1)) * 100;
    const ny = 100 - ((y - min) / (max - min)) * 100;
    return `${i===0?"M":"L"} ${x} ${ny}`;
  }).join(" ");
  const area = path + ` L 100 100 L 0 100 Z`;

  const bids = [
    { sym:"AERO", side:"BUY", price:43.80, vol:1240, by:"NATURGY" },
    { sym:"PV", side:"SELL", price:39.10, vol:480, by:"IBERDROLA" },
    { sym:"LED", side:"BUY", price:42.20, vol:2100, by:"REPSOL" },
    { sym:"SATE", side:"BUY", price:46.80, vol:340, by:"ENDESA" },
    { sym:"HVAC", side:"SELL", price:44.50, vol:920, by:"TOTALENERGIES" },
  ].map(b => ({ ...b, price: b.price + Math.sin(tick*0.3 + b.vol)*0.3 }));

  return (
    <section id="mercado" style={{ background:palette.bg, color:palette.ink, padding:"160px 24px", borderTop:`1px solid ${palette.line}` }}>
      <div style={{ maxWidth:1480, margin:"0 auto" }}>
        <div style={{ marginBottom:80, display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:32, alignItems:"end" }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// SECCIÓN_03 / MERCADO_LIVE</div>
            <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 7vw, 120px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:0 }}>
              No es una <em style={{ fontStyle:"italic", color:palette.accent }}>subvención</em>.<br/>
              Es un <em style={{ fontStyle:"italic", color:palette.accent }}>mercado</em>.
            </h2>
          </div>
          <p style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, lineHeight:1.6, color:palette.inkSoft, margin:0 }}>
            // Operamos un libro de órdenes con 14 Sujetos Obligados activos. Tu CAE se subasta hasta cerrar al mejor precio del cierre semanal.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:1, background:palette.line, border:`1px solid ${palette.line}` }}>
          {/* Chart */}
          <div style={{ background:palette.surface, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:24, fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, letterSpacing:"0.1em" }}>
              <span>CAE_INDEX · 60 SESIONES</span>
              <span style={{ color:palette.accent, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6, height:6, background:palette.accent, borderRadius:99, animation:"pulse 1.2s infinite" }} />LIVE
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:24 }}>
              <span style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:80, letterSpacing:"-0.03em", lineHeight:1, color:palette.accent, fontVariantNumeric:"tabular-nums" }}>
                {series[series.length-1].toFixed(2)}
              </span>
              <span style={{ fontSize:14, color:palette.accent, fontFamily:"'JetBrains Mono', monospace" }}>
                ▲ {((series[series.length-1] - series[0])/series[0]*100).toFixed(2)}% / 60d
              </span>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, marginLeft:"auto" }}>EUR/MWh</span>
            </div>
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width:"100%", height:240, display:"block" }}>
              {/* grid */}
              {[15,30,45].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={palette.line} strokeWidth="0.1" />)}
              <path d={area} fill={palette.glow} />
              <path d={path} fill="none" stroke={palette.accent} strokeWidth="0.3" />
              <circle cx="100" cy={100 - ((series[series.length-1]-min)/(max-min))*100} r="0.8" fill={palette.accent}>
                <animate attributeName="r" values="0.8;1.6;0.8" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:16, fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:palette.inkSoft }}>
              <span>HACE 60 SES.</span><span>HOY · {new Date().toLocaleDateString("es-ES")}</span>
            </div>
          </div>

          {/* Order book */}
          <div style={{ background:palette.surface, padding:32 }}>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, letterSpacing:"0.1em", marginBottom:20 }}>ORDER_BOOK · TOP 5</div>
            <div style={{ display:"grid", gridTemplateColumns:"0.6fr 0.6fr 1fr 0.8fr 1fr", gap:8, fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:palette.inkSoft, padding:"8px 0", borderBottom:`1px solid ${palette.line}`, letterSpacing:"0.08em" }}>
              <span>SYM</span><span>SIDE</span><span style={{ textAlign:"right" }}>PX</span><span style={{ textAlign:"right" }}>VOL</span><span>BY</span>
            </div>
            {bids.map((b, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"0.6fr 0.6fr 1fr 0.8fr 1fr", gap:8, padding:"14px 0", borderBottom:`1px solid ${palette.line}`, fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:palette.ink, alignItems:"center" }}>
                <span style={{ fontWeight:600 }}>{b.sym}</span>
                <span style={{ color:b.side==="BUY"?palette.accent:palette.accent2, fontWeight:600 }}>{b.side}</span>
                <span style={{ textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{b.price.toFixed(2)}</span>
                <span style={{ textAlign:"right", fontVariantNumeric:"tabular-nums", color:palette.inkSoft }}>{b.vol.toLocaleString("es-ES")}</span>
                <span style={{ color:palette.inkSoft, fontSize:10 }}>{b.by}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Casos ─ filterable terminal ────────────────────────────────────────────
function Casos({ palette }) {
  const all = [
    { sector:"INDUSTRIA", proyecto:"Recuperación calor planta cárnica", mwh:1840, eur:79120, ubic:"Burgos", year:"25" },
    { sector:"HOTELERO", proyecto:"Aerotermia + envolvente · 4* costa", mwh:412, eur:17716, ubic:"Málaga", year:"25" },
    { sector:"RESIDENCIAL", proyecto:"SATE + ventanas · 84 viviendas", mwh:286, eur:12298, ubic:"Madrid", year:"26" },
    { sector:"LOGÍSTICA", proyecto:"LED + variadores · centro 22.000m²", mwh:528, eur:22704, ubic:"Zaragoza", year:"25" },
    { sector:"INDUSTRIA", proyecto:"Aire comprimido + IE5 · planta auto", mwh:2240, eur:96320, ubic:"Valencia", year:"25" },
    { sector:"RETAIL", proyecto:"Climatización VRF · cadena 14 tiendas", mwh:680, eur:29240, ubic:"Cataluña", year:"26" },
    { sector:"HOTELERO", proyecto:"Bomba calor + solar térmica · 5*", mwh:920, eur:39560, ubic:"Baleares", year:"26" },
    { sector:"INDUSTRIA", proyecto:"Hornos eficientes · cerámica Castellón", mwh:3120, eur:134160, ubic:"Castellón", year:"25" },
  ];
  const sectors = ["TODOS", ...Array.from(new Set(all.map(a => a.sector)))];
  const [f, setF] = useState("TODOS");
  const filtered = f === "TODOS" ? all : all.filter(a => a.sector === f);
  const total = filtered.reduce((s, x) => s + x.eur, 0);
  return (
    <section id="casos" style={{ background:palette.surface, color:palette.ink, padding:"160px 24px", borderTop:`1px solid ${palette.line}` }}>
      <div style={{ maxWidth:1480, margin:"0 auto" }}>
        <div style={{ marginBottom:64 }}>
          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// SECCIÓN_04 / OPERACIONES_REALES</div>
          <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 7vw, 120px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:0 }}>
            <em style={{ fontStyle:"italic", color:palette.accent }}>€</em> reales,<br/>cobrados.
          </h2>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:32, flexWrap:"wrap" }}>
          {sectors.map(s => (
            <button key={s} onClick={()=>setF(s)} style={{ background:f===s?palette.accent:"transparent", color:f===s?palette.bg:palette.ink, border:`1px solid ${f===s?palette.accent:palette.line}`, padding:"8px 14px", fontFamily:"'JetBrains Mono', monospace", fontSize:11, fontWeight:600, letterSpacing:"0.08em", cursor:"pointer", whiteSpace:"nowrap" }}>
              {s}
            </button>
          ))}
          <div style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.inkSoft, padding:"8px 0", letterSpacing:"0.08em" }}>
            {filtered.length} OPS · {total.toLocaleString("es-ES")} €
          </div>
        </div>

        <div style={{ border:`1px solid ${palette.line}`, fontFamily:"'JetBrains Mono', monospace" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 2.6fr 1fr 1.2fr 1fr 0.6fr", gap:16, padding:"14px 24px", background:palette.bg, fontSize:10, color:palette.inkSoft, letterSpacing:"0.16em" }}>
            <span>SECTOR</span><span>PROYECTO</span><span style={{ textAlign:"right" }}>MWh</span><span style={{ textAlign:"right" }}>LIQUIDACIÓN</span><span>UBICACIÓN</span><span style={{ textAlign:"right" }}>YR</span>
          </div>
          {filtered.map((c, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1.2fr 2.6fr 1fr 1.2fr 1fr 0.6fr", gap:16, padding:"22px 24px", borderTop:`1px solid ${palette.line}`, fontSize:13, alignItems:"center", transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=palette.bg}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ color:palette.accent, fontWeight:600, fontSize:11, letterSpacing:"0.08em" }}>{c.sector}</span>
              <span style={{ fontFamily:"'Fraunces', serif", fontSize:18, fontWeight:400, letterSpacing:"-0.01em" }}>{c.proyecto}</span>
              <span style={{ textAlign:"right", color:palette.inkSoft, fontVariantNumeric:"tabular-nums" }}>{c.mwh.toLocaleString("es-ES")}</span>
              <span style={{ textAlign:"right", fontVariantNumeric:"tabular-nums", fontWeight:600, color:palette.ink }}>{c.eur.toLocaleString("es-ES")} €</span>
              <span style={{ color:palette.inkSoft }}>{c.ubic}</span>
              <span style={{ textAlign:"right", color:palette.inkSoft, fontVariantNumeric:"tabular-nums" }}>'{c.year}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────
function FAQ({ palette }) {
  const faqs = [
    { q:"¿Cuánto tarda de principio a fin?", a:"3 a 5 meses. Análisis previo (48h), mandato (5 días), verificación ENAC (3-5 semanas), emisión por CCAA (30-60 días), liquidación (5 días). Mantenemos comunicación semanal todo el camino." },
    { q:"¿Compatible con subvenciones IDAE / Next Generation?", a:"Sí, en la mayoría de programas. La normativa permite acumular CAE con ayudas siempre que la suma no supere el coste subvencionable. Lo validamos en el análisis previo sin coste." },
    { q:"¿Qué pasa si la verificación falla?", a:"Repetimos sin coste adicional. Modelo 100% éxito: si no cobras, no facturamos. 340+ operaciones con tasa de aprobación del 97%." },
    { q:"Mi obra es de hace 2 años, ¿sigue siendo elegible?", a:"Si finalizó después del 1 de enero de 2023 y tienes la documentación técnica, sí. Recuperamos retroactivamente con frecuencia." },
    { q:"¿Cómo se fija el precio del CAE?", a:"Subasta entre Sujetos Obligados (comercializadoras de energía). A marzo de 2026 oscila entre 38-58 €/MWh según tipo de actuación. Cerramos cuando la oferta justifica vender." },
    { q:"¿Quién tributa qué?", a:"El CAE es ingreso ordinario sujeto a IVA si eres sujeto pasivo. No es subvención, así que no hay regla de minimis. Tu asesor fiscal lo trata como cualquier ingreso por servicios." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" style={{ background:palette.bg, color:palette.ink, padding:"160px 24px", borderTop:`1px solid ${palette.line}` }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:64 }}>
          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// SECCIÓN_05 / DUDAS</div>
          <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(48px, 7vw, 120px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:0 }}>
            Las preguntas <em style={{ fontStyle:"italic", color:palette.accent }}>incómodas</em>.
          </h2>
        </div>
        <div style={{ borderTop:`1px solid ${palette.line}` }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom:`1px solid ${palette.line}` }}>
              <button onClick={()=>setOpen(open===i?-1:i)} style={{ width:"100%", background:"none", border:"none", textAlign:"left", padding:"32px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:24, color:palette.ink }}>
                <div style={{ display:"flex", alignItems:"center", gap:24, flex:1 }}>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, letterSpacing:"0.1em" }}>{String(i+1).padStart(2, "0")}</span>
                  <span style={{ fontFamily:"'Fraunces', serif", fontSize:"clamp(20px, 2.4vw, 32px)", fontWeight:400, letterSpacing:"-0.015em", flex:1 }}>{f.q}</span>
                </div>
                <span style={{ width:36, height:36, border:`1px solid ${palette.accent}`, color:palette.accent, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"transform .25s", transform:open===i?"rotate(45deg)":"none", flexShrink:0 }}>+</span>
              </button>
              {open===i && (
                <div style={{ paddingBottom:32, paddingLeft:60, fontSize:17, lineHeight:1.6, color:palette.inkSoft, fontFamily:"'Fraunces', serif", fontWeight:300, maxWidth:780 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA + Footer ───────────────────────────────────────────────────────────
function CTAFooter({ palette }) {
  return (
    <section id="contacto" style={{ background:palette.bg, color:palette.ink, padding:"160px 24px 32px", borderTop:`1px solid ${palette.line}` }}>
      <div style={{ maxWidth:1480, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:64, paddingBottom:96, borderBottom:`1px solid ${palette.line}` }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:palette.accent, marginBottom:24, letterSpacing:"0.16em" }}>// EMPEZAR</div>
            <h2 style={{ fontFamily:"'Fraunces', serif", fontWeight:300, fontSize:"clamp(56px, 9vw, 160px)", lineHeight:0.88, letterSpacing:"-0.045em", margin:0 }}>
              ¿Tienes una obra?<br/>
              <em style={{ fontStyle:"italic", color:palette.accent }}>Pongámosla a trabajar.</em>
            </h2>
            <p style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, lineHeight:1.6, color:palette.inkSoft, margin:"40px 0 0 0", maxWidth:540 }}>
              // Análisis previo gratuito en 48h. Sin compromiso. Sin letra pequeña. Si no cobras, no nos pagas.
            </p>
          </div>
          <form onSubmit={e=>e.preventDefault()} style={{ display:"flex", flexDirection:"column", gap:24, fontFamily:"'JetBrains Mono', monospace" }}>
            {[ ["EMPRESA", "Razón social"], ["EMAIL", "tu@empresa.com"], ["ACTUACIÓN", "ej. aerotermia, LED"] ].map(([l, p]) => (
              <label key={l} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <span style={{ fontSize:10, color:palette.inkSoft, letterSpacing:"0.16em" }}>{l}</span>
                <input placeholder={p} style={{ background:"transparent", border:"none", borderBottom:`1px solid ${palette.line}`, padding:"12px 0", fontSize:16, color:palette.ink, outline:"none", fontFamily:"'Fraunces', serif" }}
                  onFocus={e=>e.target.style.borderColor=palette.accent}
                  onBlur={e=>e.target.style.borderColor=palette.line} />
              </label>
            ))}
            <button type="submit" style={{ marginTop:16, background:palette.accent, color:palette.bg, border:"none", padding:"20px", fontFamily:"'JetBrains Mono', monospace", fontSize:12, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:12 }}>
              <span style={{ width:8, height:8, background:palette.bg, animation:"pulse 1.2s infinite" }} />ENVIAR_SOLICITUD →
            </button>
          </form>
        </div>

        <div style={{ paddingTop:48, display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, alignItems:"start", fontFamily:"'JetBrains Mono', monospace", fontSize:12 }}>
          <Mark size={36} palette={palette} />
          {[ ["SERVICIOS", ["Análisis previo", "Verificación", "Liquidación", "Auditoría"]], ["EMPRESA", ["Sobre", "Equipo", "Casos", "Prensa"]], ["LEGAL", ["Aviso", "Privacidad", "Cookies"]] ].map(([h, l]) => (
            <div key={h}>
              <div style={{ fontSize:10, color:palette.inkSoft, letterSpacing:"0.16em", marginBottom:16 }}>{h}</div>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10 }}>
                {l.map(it => <li key={it} style={{ color:palette.ink }}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop:64, paddingTop:24, borderTop:`1px solid ${palette.line}`, display:"flex", justifyContent:"space-between", fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:palette.inkSoft, letterSpacing:"0.08em" }}>
          <span>© 2026 SUMACAE · MADRID · BARCELONA · BILBAO</span>
          <span>RD 36/2023 · ENAC · MITECO</span>
        </div>
      </div>
    </section>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.acid;
  return (
    <div style={{ background:palette.bg, color:palette.ink, fontFamily:"'Inter', system-ui, sans-serif", cursor:"none" }}>
      <CustomCursor palette={palette} />
      <Ticker palette={palette} />
      <Nav palette={palette} />
      <Hero palette={palette} />
      <AnatomyCAE palette={palette} />
      <ProcesoInteractivo palette={palette} />
      <MercadoLive palette={palette} />
      <Casos palette={palette} />
      <FAQ palette={palette} />
      <CTAFooter palette={palette} />

      <TweaksPanel title="Tweaks · sumaCAE v2">
        <TweakSection label="Paleta" />
        <TweakRadio label="Tema" value={t.palette}
          options={[
            { value: "acid", label: "Acid" },
            { value: "voltage", label: "Voltage" },
            { value: "solar", label: "Solar" },
          ]}
          onChange={(v) => setTweak("palette", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
