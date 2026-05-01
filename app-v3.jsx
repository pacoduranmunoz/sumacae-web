// SUMACAE v3 — Apple-inspired
// Calma, monumentalidad, scroll storytelling, mucho aire.
const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{ "theme": "light" }/*EDITMODE-END*/;

const THEMES = {
  light: { bg:"#FBFBFD", bgAlt:"#F5F5F7", surface:"#FFFFFF", ink:"#1D1D1F", inkSoft:"#6E6E73", line:"#0000000F", accent:"#5C7A4D", accentSoft:"#C9D4BD", invert:"#000000" },
  dark:  { bg:"#000000", bgAlt:"#0B0B0C", surface:"#161617", ink:"#F5F5F7", inkSoft:"#86868B", line:"#FFFFFF14", accent:"#A8C490", accentSoft:"#3A4A30", invert:"#FFFFFF" },
};

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`;

// ── Logo ────────────────────────────────────────────────────────────────────
function Logo({ height = 28 }) {
  return <img src="assets/sumacae-logo.png" alt="sumaCAE" style={{ height, display:"block", width:"auto" }} />;
}

// ── Apple-style nav ─────────────────────────────────────────────────────────
function Nav({ t }) {
  const items = [["Qué es un CAE", "#cae"], ["Proceso", "#proceso"], ["Mercado", "#mercado"], ["Casos", "#casos"], ["Soporte", "#faq"]];
  return (
    <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:t.bg+"CC", backdropFilter:"saturate(180%) blur(20px)", WebkitBackdropFilter:"saturate(180%) blur(20px)", borderBottom:`1px solid ${t.line}`, height:48 }}>
      <div style={{ maxWidth:1024, margin:"0 auto", padding:"0 22px", height:"100%", display:"flex", alignItems:"center", gap:0 }}>
        <a href="#top" style={{ display:"flex", alignItems:"center", marginRight:"auto" }}><Logo height={22} /></a>
        <nav style={{ display:"flex", gap:0 }}>
          {items.map(([l,h]) => (
            <a key={h} href={h} style={{ color:t.ink, opacity:0.85, textDecoration:"none", fontSize:12, fontFamily:SF, fontWeight:400, padding:"0 10px", whiteSpace:"nowrap" }}>{l}</a>
          ))}
        </nav>
        <a href="#contacto" style={{ marginLeft:14, color:t.ink, opacity:0.85, fontSize:12, fontFamily:SF, fontWeight:400, textDecoration:"none", whiteSpace:"nowrap" }}>Contacto</a>
      </div>
    </header>
  );
}

// ── Reveal hook ─────────────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, shown];
}

const reveal = (shown, delay = 0) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? "translateY(0)" : "translateY(24px)",
  transition: `opacity .9s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s`,
});

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ t }) {
  const [ref, shown] = useReveal();
  return (
    <section id="top" ref={ref} style={{ background:t.bg, color:t.ink, paddingTop:96, paddingBottom:24, textAlign:"center", overflow:"hidden" }}>
      <div style={{ ...reveal(shown, 0.05), fontSize:14, fontFamily:SF, color:t.accent, fontWeight:500, letterSpacing:"-0.01em", marginBottom:8 }}>
        sumaCAE · Nuevo
      </div>
      <h1 style={{ ...reveal(shown, 0.15), fontFamily:SF, fontWeight:600, fontSize:"clamp(40px, 7vw, 96px)", lineHeight:1.05, letterSpacing:"-0.045em", margin:"0 auto 16px", maxWidth:1100, padding:"0 22px" }}>
        Monetiza<br/>tu eficiencia energética.
      </h1>
      <p style={{ ...reveal(shown, 0.25), fontFamily:SF, fontSize:"clamp(20px, 2.4vw, 28px)", fontWeight:400, lineHeight:1.2, color:t.ink, opacity:0.85, margin:"0 auto 28px", maxWidth:760, padding:"0 22px", letterSpacing:"-0.01em" }}>
        Cada kilovatio que ahorras, certificado por el Estado y vendido al mejor precio del mercado.
      </p>
      <div style={{ ...reveal(shown, 0.35), display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap", marginBottom:64 }}>
        <a href="#contacto" style={{ background:"#0071E3", color:"#FFFFFF", padding:"12px 22px", borderRadius:980, textDecoration:"none", fontSize:17, fontFamily:SF, fontWeight:400 }}>Empezar ahora</a>
        <a href="#proceso" style={{ color:"#0071E3", textDecoration:"none", fontSize:17, fontFamily:SF, fontWeight:400, display:"inline-flex", alignItems:"center", gap:4 }}>
          Ver cómo funciona <span style={{ fontSize:13 }}>›</span>
        </a>
      </div>

      {/* Hero device-style visual */}
      <div style={{ ...reveal(shown, 0.45), maxWidth:1024, margin:"0 auto", padding:"0 22px" }}>
        <HeroVisual t={t} />
      </div>
    </section>
  );
}

function HeroVisual({ t }) {
  // Apple-style "device frame" — minimalist dashboard mock
  const [pct, setPct] = useState(0);
  useEffect(() => { let raf, start; const animate = (ts) => { if(!start) start = ts; const p = Math.min(1, (ts-start)/1800); setPct(p); if(p<1) raf = requestAnimationFrame(animate); }; raf = requestAnimationFrame(animate); return () => cancelAnimationFrame(raf); }, []);
  const eased = 1 - Math.pow(1 - pct, 3);
  const liquidacion = Math.round(17716 * eased);
  return (
    <div style={{ background:t.bgAlt, borderRadius:24, overflow:"hidden", aspectRatio:"16/9", position:"relative", boxShadow:"0 30px 60px -30px rgba(0,0,0,0.15)" }}>
      <div style={{ position:"absolute", inset:0, padding:"clamp(24px, 4vw, 56px)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"clamp(11px, 1vw, 13px)", color:t.inkSoft, fontFamily:SF }}>Liquidación · Hotel 4* · Málaga</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"clamp(11px, 1vw, 13px)", color:t.accent, fontFamily:SF }}>
            <span style={{ width:8, height:8, borderRadius:99, background:t.accent }} />Verificado
          </div>
        </div>
        <div>
          <div style={{ fontSize:"clamp(13px, 1.2vw, 15px)", color:t.inkSoft, fontFamily:SF, marginBottom:8 }}>412 MWh ahorrados · Aerotermia + envolvente</div>
          <div style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(64px, 10vw, 140px)", lineHeight:0.95, letterSpacing:"-0.04em", color:t.ink, fontVariantNumeric:"tabular-nums" }}>
            {liquidacion.toLocaleString("es-ES")} <span style={{ color:t.accent }}>€</span>
          </div>
          <div style={{ fontSize:"clamp(13px, 1.2vw, 15px)", color:t.inkSoft, fontFamily:SF, marginTop:8 }}>Liquidado el 14 marzo 2026 · 5 días desde subasta</div>
        </div>
      </div>
    </div>
  );
}

// ── Big stat tile (Apple-style with two rows) ──────────────────────────────
function StatRow({ t }) {
  const [ref, shown] = useReveal(0.2);
  const items = [
    { big:"+12,4 M€", small:"liquidados a clientes en 2025" },
    { big:"340+", small:"operaciones cerradas" },
    { big:"97%", small:"tasa de aprobación verificación" },
    { big:"48 h", small:"análisis previo gratuito" },
  ];
  return (
    <section ref={ref} style={{ background:t.bg, padding:"clamp(60px, 8vw, 120px) 22px" }}>
      <div style={{ maxWidth:1024, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"clamp(8px, 1vw, 16px)" }}>
        {items.map((it, i) => (
          <div key={i} style={{ ...reveal(shown, 0.05*i), background:t.bgAlt, borderRadius:24, padding:"clamp(28px, 3.5vw, 56px)", aspectRatio:"3/2", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <div style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(40px, 6vw, 80px)", lineHeight:1, letterSpacing:"-0.04em", color:t.ink, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{it.big}</div>
            <div style={{ marginTop:16, fontFamily:SF, fontSize:"clamp(15px, 1.4vw, 19px)", color:t.inkSoft, lineHeight:1.3, letterSpacing:"-0.005em" }}>{it.small}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── ¿Qué es un CAE? ─────────────────────────────────────────────────────────
function QueEsCAE({ t }) {
  const [ref, shown] = useReveal();
  return (
    <section id="cae" ref={ref} style={{ background:t.bgAlt, padding:"clamp(80px, 12vw, 180px) 22px", textAlign:"center" }}>
      <div style={{ maxWidth:880, margin:"0 auto" }}>
        <div style={{ ...reveal(shown, 0), fontFamily:SF, fontSize:14, color:t.accent, fontWeight:500, marginBottom:8 }}>El activo</div>
        <h2 style={{ ...reveal(shown, 0.1), fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 5.5vw, 80px)", lineHeight:1.05, letterSpacing:"-0.04em", color:t.ink, margin:"0 0 32px" }}>
          Un CAE no es una subvención.<br/>
          <span style={{ color:t.inkSoft }}>Es un activo financiero del Estado.</span>
        </h2>
        <p style={{ ...reveal(shown, 0.2), fontFamily:SF, fontSize:"clamp(19px, 1.7vw, 24px)", lineHeight:1.4, color:t.ink, opacity:0.85, margin:"0 auto 64px", maxWidth:720, letterSpacing:"-0.01em" }}>
          El Real Decreto 36/2023 creó el Certificado de Ahorro Energético: cada MWh que ahorras se convierte en un activo transmisible, registrado en el Sistema Nacional, con vigencia de 20 años. Las comercializadoras de energía están obligadas por ley a comprarlos. Tú vendes. Ellas cumplen. Todo el mundo gana.
        </p>

        <div style={{ ...reveal(shown, 0.3), display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:1, background:t.line, borderRadius:24, overflow:"hidden", textAlign:"left" }}>
          {[
            { k:"1 MWh", l:"= 1 CAE", d:"Cada megavatio-hora ahorrado equivale a un certificado oficial." },
            { k:"20 años", l:"de vigencia", d:"Reconocido por el Sistema Nacional de Certificados de Ahorro." },
            { k:"100%", l:"compatible", d:"Acumulable con subvenciones IDAE y Next Generation EU." },
          ].map((it, i) => (
            <div key={i} style={{ background:t.bg, padding:"clamp(28px, 3vw, 48px)" }}>
              <div style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 4vw, 56px)", lineHeight:1, letterSpacing:"-0.03em", color:t.accent }}>{it.k}</div>
              <div style={{ fontFamily:SF, fontSize:"clamp(13px, 1.1vw, 15px)", color:t.inkSoft, marginTop:6 }}>{it.l}</div>
              <div style={{ fontFamily:SF, fontSize:"clamp(14px, 1.2vw, 16px)", color:t.ink, marginTop:20, lineHeight:1.4, opacity:0.8 }}>{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Proceso ─ Apple-style stacked cards ────────────────────────────────────
function Proceso({ t }) {
  const pasos = [
    { n:"01", title:"Análisis", time:"48 horas", desc:"Auditamos tu actuación con metodología M&V IPMVP. Estimamos el CAE potencial y te mandamos un informe firmado. Sin coste, sin compromiso.", color:t.accentSoft },
    { n:"02", title:"Mandato", time:"5 días", desc:"Firmas mandato exclusivo por vía electrónica. Activamos al verificador acreditado por ENAC y abrimos expediente con tu comunidad autónoma.", color:t.bgAlt },
    { n:"03", title:"Verificación", time:"3-5 semanas", desc:"Visita técnica, mediciones in-situ, contraste con baseline. Documentación enviada al organismo competente para emisión.", color:t.accentSoft },
    { n:"04", title:"Liquidación", time:"5 días", desc:"Tu CAE oficial llega registrado. Lo subastamos entre comercializadoras obligadas. Aceptas la mejor oferta. Recibes el ingreso vía SEPA.", color:t.bgAlt },
  ];
  return (
    <section id="proceso" style={{ background:t.bg, padding:"clamp(80px, 12vw, 180px) 22px", textAlign:"center" }}>
      <div style={{ maxWidth:1024, margin:"0 auto" }}>
        <div style={{ fontFamily:SF, fontSize:14, color:t.accent, fontWeight:500, marginBottom:8 }}>El proceso</div>
        <h2 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 5.5vw, 80px)", lineHeight:1.05, letterSpacing:"-0.04em", color:t.ink, margin:"0 0 16px" }}>
          Tú firmas dos veces.<br/>
          <span style={{ color:t.inkSoft }}>Nosotros, el resto.</span>
        </h2>
        <p style={{ fontFamily:SF, fontSize:"clamp(17px, 1.5vw, 21px)", color:t.inkSoft, margin:"0 auto 64px", maxWidth:600 }}>
          Cuatro fases. Tres a cinco meses. Comunicación semanal todo el camino.
        </p>
        <div style={{ display:"grid", gap:16 }}>
          {pasos.map((p, i) => <ProcesoCard key={p.n} p={p} i={i} t={t} />)}
        </div>
      </div>
    </section>
  );
}

function ProcesoCard({ p, i, t }) {
  const [ref, shown] = useReveal(0.15);
  return (
    <div ref={ref} style={{ ...reveal(shown, 0), background:p.color, borderRadius:24, padding:"clamp(36px, 5vw, 72px)", textAlign:"left", display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"clamp(20px, 3vw, 48px)", alignItems:"center" }}>
      <div style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(48px, 6vw, 96px)", lineHeight:1, letterSpacing:"-0.04em", color:t.ink, fontVariantNumeric:"tabular-nums", opacity:0.4 }}>
        {p.n}
      </div>
      <div>
        <div style={{ fontFamily:SF, fontSize:13, color:t.accent, fontWeight:500, marginBottom:4 }}>{p.time}</div>
        <h3 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(28px, 3vw, 44px)", lineHeight:1.05, letterSpacing:"-0.025em", color:t.ink, margin:"0 0 12px" }}>{p.title}</h3>
        <p style={{ fontFamily:SF, fontSize:"clamp(15px, 1.3vw, 17px)", lineHeight:1.5, color:t.ink, opacity:0.85, margin:0, maxWidth:540 }}>{p.desc}</p>
      </div>
      <div style={{ width:48, height:48, borderRadius:99, background:t.ink, color:t.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
        ›
      </div>
    </div>
  );
}

// ── Mercado ─ Apple-style chart hero ───────────────────────────────────────
function Mercado({ t }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(x=>x+1), 1500); return () => clearInterval(id); }, []);
  const series = useMemo(() => {
    const arr = []; let v = 39;
    for (let i = 0; i < 60; i++) { v += Math.sin(i*0.4 + tick*0.05)*0.4 + (Math.random()-0.5)*0.25; arr.push(v); }
    return arr;
  }, [tick]);
  const min = Math.min(...series), max = Math.max(...series);
  const path = series.map((y, i) => `${i===0?"M":"L"} ${(i/(series.length-1))*100} ${100 - ((y-min)/(max-min))*100}`).join(" ");
  const area = path + ` L 100 100 L 0 100 Z`;
  const last = series[series.length-1];
  return (
    <section id="mercado" style={{ background:t.invert, color:t.invert==="#000000" ? "#F5F5F7" : "#1D1D1F", padding:"clamp(80px, 12vw, 180px) 22px" }}>
      <div style={{ maxWidth:1024, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontFamily:SF, fontSize:14, color:"#A8C490", fontWeight:500, marginBottom:8 }}>Mercado en vivo</div>
        <h2 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 5.5vw, 80px)", lineHeight:1.05, letterSpacing:"-0.04em", margin:"0 0 16px", color: t.invert==="#000000"?"#F5F5F7":"#1D1D1F" }}>
          El precio del CAE,<br/>
          <span style={{ opacity:0.6 }}>en tiempo real.</span>
        </h2>
        <p style={{ fontFamily:SF, fontSize:"clamp(17px, 1.5vw, 21px)", color:"#86868B", margin:"0 auto 56px", maxWidth:640 }}>
          Subasta abierta entre 14 comercializadoras obligadas. El mercado fluctúa. Nosotros vendemos cuando conviene.
        </p>

        <div style={{ background: t.invert==="#000000" ? "#0B0B0C" : "#F5F5F7", borderRadius:24, padding:"clamp(32px, 4vw, 64px)", textAlign:"left" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:24, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontFamily:SF, fontSize:13, color:"#86868B" }}>CAE Index · 60 sesiones</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, marginTop:8 }}>
                <span style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(48px, 6vw, 80px)", lineHeight:1, letterSpacing:"-0.04em", fontVariantNumeric:"tabular-nums", color: t.invert==="#000000"?"#F5F5F7":"#1D1D1F" }}>
                  {last.toFixed(2)}
                </span>
                <span style={{ fontFamily:SF, fontSize:18, color:"#A8C490" }}>€/MWh</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:SF, fontSize:14, color:"#A8C490" }}>
              <span style={{ width:8, height:8, borderRadius:99, background:"#A8C490", animation:"pulse 1.4s infinite" }} />
              En vivo
            </div>
          </div>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width:"100%", height:280, display:"block" }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8C490" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#A8C490" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#g)" />
            <path d={path} fill="none" stroke="#A8C490" strokeWidth="0.4" />
          </svg>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16, fontFamily:SF, fontSize:12, color:"#86868B" }}>
            <span>Min {min.toFixed(2)} €</span>
            <span>Hoy · {new Date().toLocaleDateString("es-ES")}</span>
            <span>Max {max.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Casos ─ Apple-style hero card grid ─────────────────────────────────────
function Casos({ t }) {
  const casos = [
    { sector:"Industria", proyecto:"Recuperación de calor", mwh:1840, eur:79120, ubic:"Burgos", tone:"dark" },
    { sector:"Hotelero", proyecto:"Aerotermia · 4* costa", mwh:412, eur:17716, ubic:"Málaga", tone:"sage" },
    { sector:"Residencial", proyecto:"SATE · 84 viviendas", mwh:286, eur:12298, ubic:"Madrid", tone:"light" },
    { sector:"Logística", proyecto:"LED + variadores", mwh:528, eur:22704, ubic:"Zaragoza", tone:"cream" },
  ];
  return (
    <section id="casos" style={{ background:t.bgAlt, padding:"clamp(80px, 12vw, 180px) 22px" }}>
      <div style={{ maxWidth:1024, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{ fontFamily:SF, fontSize:14, color:t.accent, fontWeight:500, marginBottom:8 }}>Operaciones reales</div>
          <h2 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 5.5vw, 80px)", lineHeight:1.05, letterSpacing:"-0.04em", color:t.ink, margin:0 }}>
            Dinero cobrado.<br/>
            <span style={{ color:t.inkSoft }}>Por clientes reales.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16 }}>
          {casos.map((c, i) => <CasoCard key={i} c={c} t={t} />)}
        </div>
      </div>
    </section>
  );
}

function CasoCard({ c, t }) {
  const [ref, shown] = useReveal(0.2);
  const tones = {
    dark:  { bg:"#1D1D1F", ink:"#F5F5F7", soft:"#86868B", accent:"#A8C490" },
    sage:  { bg:"#5C7A4D", ink:"#FFFFFF", soft:"#FFFFFFB3", accent:"#FFFFFF" },
    light: { bg:"#FFFFFF", ink:"#1D1D1F", soft:"#6E6E73", accent:"#5C7A4D" },
    cream: { bg:"#F0EDE0", ink:"#1D1D1F", soft:"#6E6E73", accent:"#5C7A4D" },
  };
  const tt = tones[c.tone];
  return (
    <div ref={ref} style={{ ...reveal(shown), background:tt.bg, color:tt.ink, borderRadius:24, padding:"clamp(32px, 3.5vw, 56px)", aspectRatio:"4/3", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div>
        <div style={{ fontFamily:SF, fontSize:13, color:tt.accent, fontWeight:500, letterSpacing:"-0.005em" }}>{c.sector}</div>
        <h3 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(24px, 2.6vw, 36px)", lineHeight:1.1, letterSpacing:"-0.025em", margin:"8px 0 0", color:tt.ink, maxWidth:360 }}>{c.proyecto}</h3>
        <div style={{ fontFamily:SF, fontSize:14, color:tt.soft, marginTop:6 }}>{c.ubic}</div>
      </div>
      <div>
        <div style={{ fontFamily:SF, fontSize:13, color:tt.soft, marginBottom:6 }}>{c.mwh.toLocaleString("es-ES")} MWh certificados</div>
        <div style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(40px, 5vw, 72px)", lineHeight:1, letterSpacing:"-0.04em", color:tt.ink, fontVariantNumeric:"tabular-nums" }}>
          {c.eur.toLocaleString("es-ES")} <span style={{ color:tt.accent }}>€</span>
        </div>
      </div>
    </div>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ({ t }) {
  const faqs = [
    { q:"¿Cuánto tarda el proceso?", a:"Entre 3 y 5 meses desde la firma del mandato hasta el ingreso. Te mantenemos informado semanalmente." },
    { q:"¿Es compatible con subvenciones IDAE o Next Generation?", a:"Sí, en la mayoría de programas. La normativa permite acumular CAE con ayudas siempre que la suma no supere el coste subvencionable. Lo validamos en el análisis previo sin coste." },
    { q:"¿Qué pasa si la verificación falla?", a:"Repetimos sin coste. Modelo 100% éxito: si no cobras, no facturamos. 340+ operaciones con tasa de aprobación del 97%." },
    { q:"Mi obra es de hace dos años, ¿sigue siendo elegible?", a:"Si finalizó después del 1 de enero de 2023 y tienes la documentación técnica, sí. Recuperamos retroactivamente con frecuencia." },
    { q:"¿Cómo se fija el precio?", a:"Subasta entre las 14 comercializadoras obligadas. A marzo de 2026 oscila entre 38 y 58 €/MWh según tipo de actuación. Cerramos cuando la oferta justifica vender." },
  ];
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" style={{ background:t.bg, padding:"clamp(80px, 12vw, 180px) 22px" }}>
      <div style={{ maxWidth:880, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{ fontFamily:SF, fontSize:14, color:t.accent, fontWeight:500, marginBottom:8 }}>Soporte</div>
          <h2 style={{ fontFamily:SF, fontWeight:600, fontSize:"clamp(36px, 5.5vw, 80px)", lineHeight:1.05, letterSpacing:"-0.04em", color:t.ink, margin:0 }}>
            Preguntas frecuentes.
          </h2>
        </div>
        <div>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderTop:`1px solid ${t.line}`, ...(i===faqs.length-1?{borderBottom:`1px solid ${t.line}`}:{}) }}>
              <button onClick={()=>setOpen(open===i?-1:i)} style={{ width:"100%", background:"none", border:"none", textAlign:"left", padding:"24px 4px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, color:t.ink, fontFamily:SF }}>
                <span style={{ fontSize:"clamp(18px, 1.8vw, 22px)", fontWeight:500, letterSpacing:"-0.015em" }}>{f.q}</span>
                <span style={{ width:30, height:30, borderRadius:99, border:`1px solid ${t.line}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:16, transform:open===i?"rotate(45deg)":"none", transition:"transform .3s", flexShrink:0, color:t.ink }}>+</span>
              </button>
              <div style={{ maxHeight:open===i?400:0, overflow:"hidden", transition:"max-height .4s ease" }}>
                <div style={{ paddingBottom:24, fontSize:"clamp(15px, 1.3vw, 17px)", lineHeight:1.5, color:t.inkSoft, fontFamily:SF, maxWidth:680 }}>
                  {f.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA gigante ─────────────────────────────────────────────────────────────
function FinalCTA({ t }) {
  const [ref, shown] = useReveal(0.2);
  return (
    <section id="contacto" ref={ref} style={{ background:t.bgAlt, padding:"clamp(100px, 14vw, 200px) 22px", textAlign:"center" }}>
      <div style={{ maxWidth:1024, margin:"0 auto" }}>
        <h2 style={{ ...reveal(shown), fontFamily:SF, fontWeight:600, fontSize:"clamp(48px, 9vw, 144px)", lineHeight:1.0, letterSpacing:"-0.045em", color:t.ink, margin:"0 0 24px" }}>
          ¿Empezamos?
        </h2>
        <p style={{ ...reveal(shown, 0.1), fontFamily:SF, fontSize:"clamp(19px, 1.7vw, 24px)", color:t.inkSoft, margin:"0 auto 40px", maxWidth:640, letterSpacing:"-0.01em" }}>
          Análisis previo gratuito en 48 horas. Sin compromiso. Si no cobras, no nos pagas.
        </p>
        <div style={{ ...reveal(shown, 0.2), display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="#" style={{ background:"#0071E3", color:"#FFFFFF", padding:"14px 28px", borderRadius:980, textDecoration:"none", fontSize:17, fontFamily:SF, fontWeight:400 }}>Solicitar análisis</a>
          <a href="tel:" style={{ color:"#0071E3", textDecoration:"none", fontSize:17, fontFamily:SF, fontWeight:400, display:"inline-flex", alignItems:"center", gap:4 }}>
            Hablar con un asesor <span style={{ fontSize:13 }}>›</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer({ t }) {
  const cols = [
    { h:"Servicios", l:["Análisis previo", "Verificación CAE", "Liquidación", "Auditoría energética"] },
    { h:"Aprende",   l:["Qué es un CAE", "Mercado", "Casos", "Blog"] },
    { h:"Empresa",   l:["Sobre nosotros", "Equipo", "Carreras", "Prensa"] },
    { h:"Soporte",   l:["Contacto", "FAQ", "Estado del servicio"] },
    { h:"Legal",     l:["Privacidad", "Cookies", "Aviso legal"] },
  ];
  return (
    <footer style={{ background:t.bg, color:t.inkSoft, padding:"40px 22px 24px", borderTop:`1px solid ${t.line}`, fontFamily:SF, fontSize:12 }}>
      <div style={{ maxWidth:1024, margin:"0 auto" }}>
        <div style={{ paddingBottom:16, borderBottom:`1px solid ${t.line}`, fontSize:12, lineHeight:1.5 }}>
          sumaCAE — Gestión integral de Certificados de Ahorro Energético al amparo del Real Decreto 36/2023. Verificación realizada por organismo acreditado por ENAC. Inscritos en el Sistema Nacional de Certificados de Ahorro Energético del MITECO.
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:24, padding:"32px 0", fontSize:12 }}>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ color:t.ink, fontWeight:600, marginBottom:12 }}>{c.h}</div>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10 }}>
                {c.l.map(it => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${t.line}`, paddingTop:20, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16, fontSize:12 }}>
          <span>Copyright © 2026 sumaCAE S.L. Todos los derechos reservados.</span>
          <span>Madrid · Barcelona · Bilbao · España</span>
        </div>
      </div>
    </footer>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = THEMES[tw.theme] || THEMES.light;
  return (
    <div style={{ background:t.bg, color:t.ink, fontFamily:SF, minHeight:"100vh" }}>
      <Nav t={t} />
      <Hero t={t} />
      <StatRow t={t} />
      <QueEsCAE t={t} />
      <Proceso t={t} />
      <Mercado t={t} />
      <Casos t={t} />
      <FAQ t={t} />
      <FinalCTA t={t} />
      <Footer t={t} />
      <TweaksPanel title="Tweaks · sumaCAE">
        <TweakSection label="Tema" />
        <TweakRadio label="Modo" value={tw.theme}
          options={[{ value:"light", label:"Claro" }, { value:"dark", label:"Oscuro" }]}
          onChange={(v)=>setTweak("theme", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
