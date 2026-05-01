// SUMACAE v4 — Ramp × Watershed × Energía
// Monumentalidad serena, datos en vivo, identidad energética/renovable.
const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{ "theme": "light", "showFlow": true }/*EDITMODE-END*/;

const T = {
  light: {
    bg:"#F7F6F1",        // crema institucional, no blanco apple
    bgAlt:"#EFEDE3",
    surface:"#FFFFFF",
    ink:"#0E1410",       // verde negro casi
    inkSoft:"#5C6358",
    line:"#0E141014",
    sage:"#3F8F4F",      // verde vivo (saturado, luminoso)
    sageDeep:"#1F5E2D",  // verde botella profundo
    accent:"#C8FF2E",    // lima eléctrico (energía/kWh)
    cream:"#F0EBD4",     // crema cálido
    invert:"#0E1410",
  },
  dark: {
    bg:"#0E1410",
    bgAlt:"#161D17",
    surface:"#1A2218",
    ink:"#F2EFE5",
    inkSoft:"#9CA399",
    line:"#FFFFFF14",
    sage:"#7BD68B",      // verde menta luminoso para dark
    sageDeep:"#3F8F4F",
    accent:"#D8FF3D",
    cream:"#2A2F26",
    invert:"#F7F6F1",
  },
};

const F_DISPLAY = `"Fraunces", "PP Editorial", "Times New Roman", Georgia, serif`;
const F_SANS = `"Inter Tight", "Söhne", -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif`;
const F_MONO = `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace`;

// ── Reveal helper ───────────────────────────────────────────────────────────
function useReveal(threshold=0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => { const el=ref.current; if(!el) return;
    const o = new IntersectionObserver(([e])=>{ if(e.isIntersecting){ setShown(true); o.disconnect(); }},{threshold});
    o.observe(el); return ()=>o.disconnect();
  }, [threshold]);
  return [ref, shown];
}
const reveal = (s, d=0) => ({ opacity:s?1:0, transform:s?"translateY(0)":"translateY(20px)", transition:`opacity .8s cubic-bezier(.2,.7,.2,1) ${d}s, transform .8s cubic-bezier(.2,.7,.2,1) ${d}s` });

// ── Scroll position hook ────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = null; });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return y;
}

// Parallax: returns translateY for an element, based on its distance from viewport center
function useParallax(speed = 0.15) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let raf;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const vh = window.innerHeight;
          const distance = center - vh / 2;
          setOffset(-distance * speed);
        }
        raf = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [speed]);
  return [ref, offset];
}

// CountUp: animates a number from 0 to target when in view
function CountUp({ to, duration = 1800, suffix = "", prefix = "", decimals = 0, separator = "." }) {
  const [ref, shown] = useReveal(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!shown) return;
    let raf, start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, duration]);
  const formatted = decimals > 0
    ? val.toFixed(decimals).replace(".", ",")
    : Math.round(val).toLocaleString("es-ES").replace(/\./g, separator);
  return <span ref={ref} style={{ fontVariantNumeric:"tabular-nums" }}>{prefix}{formatted}{suffix}</span>;
}

// Reveal text word by word
function WordReveal({ children, delay = 0, gap = 0.04, style }) {
  const [ref, shown] = useReveal(0.3);
  const words = String(children).split(/(\s+)/);
  return (
    <span ref={ref} style={style}>
      {words.map((w, i) => /\s+/.test(w) ? w : (
        <span key={i} style={{ display:"inline-block", opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(0.5em)", transition: `opacity .65s cubic-bezier(.2,.7,.2,1) ${delay + i*gap}s, transform .65s cubic-bezier(.2,.7,.2,1) ${delay + i*gap}s` }}>{w}</span>
      ))}
    </span>
  );
}

// ── Logo ────────────────────────────────────────────────────────────────────
function Logo({ height=24 }) {
  return <img src="assets/sumacae-logo.png" alt="sumaCAE" style={{ height, display:"block", width:"auto" }} />;
}

// ── Top ticker (subtle, energético) ─────────────────────────────────────────
function Ticker({ t }) {
  const items = [
    "CAE Index 42,18 €/MWh", "+1,3% sesión", "14 comercializadoras activas",
    "Subasta abierta · cierre 19:00", "RD 36/2023 vigente", "MITECO · registro nacional",
    "Hoy: 2.840 MWh negociados", "Verificación ENAC",
  ];
  return (
    <div style={{ background:t.invert, color:t.invert==="#0E1410"?"#F2EFE5":"#0E1410", borderBottom:`1px solid ${t.line}`, fontSize:11, fontFamily:F_MONO, height:28, display:"flex", alignItems:"center", overflow:"hidden", letterSpacing:"0.04em", textTransform:"uppercase", position:"fixed", top:0, left:0, right:0, zIndex:60 }}>
      <div style={{ display:"flex", whiteSpace:"nowrap", animation:"tick 60s linear infinite" }}>
        {[...items, ...items, ...items].map((it,i)=>(
          <span key={i} style={{ padding:"0 24px", display:"inline-flex", alignItems:"center", gap:8 }}>
            <span style={{ width:5, height:5, borderRadius:99, background:i%4===0?t.accent:t.sage }}/>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ t }) {
  const items = [["Qué es","que-es"],["Cómo funciona","proceso"],["Mercado","mercado"],["Casos","casos"]];
  const [active, setActive] = useState("top");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["top", ...items.map(([,h])=>h)];
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        // Activate the section whose top is closest to the nav line
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.6, 1] }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleNav = (e, hash) => {
    e.preventDefault();
    const el = document.getElementById(hash);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", "#"+hash);
  };

  return (
    <header style={{ position:"fixed", top:28, left:0, right:0, zIndex:55, background: scrolled ? t.bg+"F2" : t.bg+"CC", backdropFilter:"saturate(180%) blur(14px)", WebkitBackdropFilter:"saturate(180%) blur(14px)", borderBottom: scrolled ? `1px solid ${t.line}` : "1px solid transparent", transition:"background .35s ease, border-color .35s ease" }}>
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"14px 28px", display:"flex", alignItems:"center", gap:24 }}>
        <a href="#top" onClick={(e)=>handleNav(e,"top")} style={{ display:"flex", alignItems:"center", marginRight:"auto" }}><Logo height={26} /></a>
        <nav style={{ display:"flex", gap:4, alignItems:"center" }}>
          {items.map(([l,h])=>{
            const isActive = active===h;
            return (
              <a key={h} href={"#"+h} onClick={(e)=>handleNav(e,h)} style={{ position:"relative", color:isActive?t.ink:t.inkSoft, textDecoration:"none", fontSize:14, fontFamily:F_SANS, fontWeight:500, letterSpacing:"-0.005em", padding:"8px 14px", borderRadius:99, transition:"color .3s ease, background .3s ease", background: isActive ? t.line : "transparent" }}>
                {l}
                {isActive && <span style={{ position:"absolute", left:14, right:14, bottom:4, height:2, background:t.sage, borderRadius:2 }}/>}
              </a>
            );
          })}
        </nav>
        <a href="#login" style={{ color:t.inkSoft, textDecoration:"none", fontSize:14, fontFamily:F_SANS, fontWeight:500, padding:"8px 4px" }}>Acceder</a>
        <a href="#contacto" onClick={(e)=>handleNav(e,"contacto")} style={{ background:t.ink, color:t.bg, padding:"10px 18px", borderRadius:99, textDecoration:"none", fontSize:14, fontFamily:F_SANS, fontWeight:500, whiteSpace:"nowrap" }}>
          Análisis gratuito →
        </a>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ t }) {
  const [ref, shown] = useReveal();
  const y = useScrollY();
  const heroFade = Math.max(0, 1 - y / 600);
  return (
    <section id="top" ref={ref} style={{ background:t.bg, color:t.ink, paddingTop:160, paddingBottom:60, position:"relative", overflow:"hidden" }}>
      {/* Grid background sutil con parallax lento */}
      <div aria-hidden style={{ position:"absolute", inset:0, opacity:0.4 * heroFade, backgroundImage:`linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px)`, backgroundSize:"80px 80px", pointerEvents:"none", transform:`translateY(${y * 0.25}px)`, willChange:"transform" }} />
      {/* Halo sage sutil de fondo */}
      <div aria-hidden style={{ position:"absolute", left:"-20%", top:"10%", width:"60%", height:"70%", borderRadius:"50%", background:`radial-gradient(circle, ${t.sage}22 0%, transparent 60%)`, pointerEvents:"none", filter:"blur(40px)", transform:`translate(${y*0.08}px, ${y*-0.12}px)`, willChange:"transform" }} />

      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 28px", position:"relative" }}>
        {/* Section meta + posicionamiento */}
        <div style={{ ...reveal(shown, 0), display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            <span style={{ width:32, height:1, background:t.sage }}/>
            §01 — La energía que no consumes vale dinero
          </div>
          <span style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"5px 11px", border:`1px solid ${t.sage}`, borderRadius:99, background:`${t.sage}10`, fontFamily:F_MONO, fontSize:10, color:t.sageDeep, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:500 }}>
            <span style={{ width:5, height:5, borderRadius:99, background:t.sage }}/>
            Agregador independiente · B2B
          </span>
        </div>

        <h1 style={{ ...reveal(shown, 0.05), fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(56px, 9vw, 168px)", lineHeight:0.92, letterSpacing:"-0.04em", margin:"0 0 36px", maxWidth:1100, transform: shown ? `translateY(${y * -0.05}px)` : "translateY(20px)", willChange:"transform" }}>
          La eficiencia<br/>
          <span style={{ fontStyle:"italic", color:t.sage }}>que ya hiciste,</span><br/>
          ahora paga.
        </h1>

        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:60, alignItems:"end", marginTop:48 }}>
          <p style={{ ...reveal(shown, 0.15), fontFamily:F_SANS, fontSize:"clamp(18px, 1.6vw, 22px)", lineHeight:1.45, color:t.ink, opacity:0.85, margin:0, maxWidth:580, letterSpacing:"-0.01em" }}>
            Agregador independiente de CAE para empresas. Convertimos la eficiencia energética de industria, terciario y patrimonio en certificados negociables ante las comercializadoras obligadas. <strong style={{fontWeight:600, color:t.ink}}>Solo operaciones B2B</strong> — sin tratar con particulares.
          </p>
          <div style={{ ...reveal(shown, 0.25), display:"flex", flexDirection:"column", gap:14, alignItems:"flex-start" }}>
            <a href="#contacto" style={{ background:t.accent, color:t.ink, padding:"16px 24px", borderRadius:99, textDecoration:"none", fontSize:15, fontFamily:F_SANS, fontWeight:600, letterSpacing:"-0.01em", display:"inline-flex", alignItems:"center", gap:8 }}>
              Calcular mi CAE <span>→</span>
            </a>
            <a href="#proceso" style={{ color:t.ink, textDecoration:"none", fontSize:14, fontFamily:F_SANS, fontWeight:500 }}>
              Ver cómo funciona el proceso ↓
            </a>
          </div>
        </div>

        {/* Energy flow diagram */}
        <FlowDiagram t={t} shown={shown} />
      </div>
    </section>
  );
}

// ── Energy flow: kWh → CAE → € ─────────────────────────────────────────────
function FlowDiagram({ t, shown }) {
  const [pct, setPct] = useState(0);
  useEffect(()=>{ if(!shown) return; let raf, st;
    const a=(ts)=>{ if(!st) st=ts; const p=Math.min(1,(ts-st)/2400); setPct(p); if(p<1) raf=requestAnimationFrame(a); };
    raf=requestAnimationFrame(a); return ()=>cancelAnimationFrame(raf);
  },[shown]);
  const eased = 1 - Math.pow(1-pct, 3);
  const kwh = Math.round(412000 * eased);
  const cae = Math.round(412 * eased);
  const eur = Math.round(17716 * eased);

  return (
    <div style={{ ...reveal(shown, 0.35), marginTop:96, padding:"40px 0", borderTop:`1px solid ${t.line}`, borderBottom:`1px solid ${t.line}` }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto 1fr", gap:24, alignItems:"center" }}>
        <FlowStep t={t} icon="zap" label="Energía ahorrada" value={`${kwh.toLocaleString("es-ES")} kWh`} sub="medido y verificado" />
        <FlowArrow t={t} active={pct>0.3} />
        <FlowStep t={t} icon="cert" label="CAE certificados" value={`${cae.toLocaleString("es-ES")} CAE`} sub="emitidos por el Estado" highlight />
        <FlowArrow t={t} active={pct>0.7} />
        <FlowStep t={t} icon="cash" label="Liquidación" value={`${eur.toLocaleString("es-ES")} €`} sub="ingresado vía SEPA" accent />
      </div>
      <div style={{ marginTop:20, display:"flex", justifyContent:"space-between", fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>
        <span>Caso real · Hotel 4* Málaga · Aerotermia + envolvente</span>
        <span>Liquidación 14 mar 2026</span>
      </div>
    </div>
  );
}
function FlowStep({ t, icon, label, value, sub, highlight, accent }) {
  return (
    <div style={{ padding:24, background: highlight?t.cream : accent?t.sage : "transparent", color: accent?"#FFFFFF":t.ink, borderRadius:14, border: !highlight&&!accent?`1px solid ${t.line}`:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, fontFamily:F_MONO, fontSize:10, color:accent?"#FFFFFFCC":t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>
        <FlowIcon name={icon} color={accent?"#FFFFFF":t.sage} /> {label}
      </div>
      <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(28px, 3vw, 44px)", lineHeight:1, letterSpacing:"-0.025em", color: accent?"#FFFFFF":t.ink, fontVariantNumeric:"tabular-nums" }}>{value}</div>
      <div style={{ marginTop:8, fontFamily:F_SANS, fontSize:13, color:accent?"#FFFFFFCC":t.inkSoft }}>{sub}</div>
    </div>
  );
}
function FlowArrow({ t, active }) {
  return (
    <div style={{ width:40, display:"flex", alignItems:"center", justifyContent:"center", color: active?t.sage:t.line, transition:"color .6s" }}>
      <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
        <path d="M0 6 H34 M28 1 L34 6 L28 11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
  );
}
function FlowIcon({ name, color }) {
  const props = { width:14, height:14, fill:"none", stroke:color, strokeWidth:1.5 };
  if (name==="zap") return <svg viewBox="0 0 24 24" {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
  if (name==="cert") return <svg viewBox="0 0 24 24" {...props}><rect x="3" y="4" width="18" height="14" rx="1"/><path d="M7 9h10M7 13h6"/><circle cx="17" cy="18" r="3" fill={color}/></svg>;
  if (name==="cash") return <svg viewBox="0 0 24 24" {...props}><rect x="2" y="6" width="20" height="12" rx="1"/><circle cx="12" cy="12" r="3"/></svg>;
  return null;
}

// ── Big stats ───────────────────────────────────────────────────────────────
function Stats({ t }) {
  const [ref, shown] = useReveal(0.2);
  const items = [
    { k:<><CountUp to={12.4} decimals={1} /> M€</>, l:"liquidados a clientes", sub:"acumulado 2024-2025" },
    { k:<><CountUp to={340} />+</>, l:"operaciones cerradas", sub:"sin un solo impago" },
    { k:<><CountUp to={97} />%</>, l:"tasa de aprobación", sub:"vs. 71% media sector" },
    { k:<><CountUp to={48} /> h</>, l:"análisis previo", sub:"gratuito y sin compromiso" },
  ];
  return (
    <section ref={ref} style={{ background:t.bg, padding:"100px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div style={{ ...reveal(shown), display:"flex", alignItems:"baseline", gap:24, marginBottom:48, flexWrap:"wrap" }}>
          <span style={{ fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>§02 — Track record</span>
          <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(32px, 4vw, 56px)", lineHeight:1.05, letterSpacing:"-0.03em", margin:0 }}>
            La <span style={{ fontStyle:"italic", color:t.sage }}>evidencia</span>, no la promesa.
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:0, borderTop:`1px solid ${t.ink}` }}>
          {items.map((it,i)=>(
            <div key={i} style={{ ...reveal(shown, 0.05*i), padding:"40px 24px 32px", borderRight: i<3?`1px solid ${t.line}`:"none" }}>
              <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(48px, 6vw, 88px)", lineHeight:0.95, letterSpacing:"-0.04em", color:t.ink, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{it.k}</div>
              <div style={{ marginTop:20, fontFamily:F_SANS, fontSize:15, fontWeight:500, color:t.ink, letterSpacing:"-0.005em" }}>{it.l}</div>
              <div style={{ marginTop:4, fontFamily:F_SANS, fontSize:13, color:t.inkSoft }}>{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Posicionamiento: qué somos / qué no somos ───────────────────────────────
function Posicionamiento({ t }) {
  const [ref, shown] = useReveal(0.15);
  const somos = [
    { k:"Agregador independiente",  d:"Empaquetamos los ahorros de varios clientes y los presentamos al SNOEE como una sola operación." },
    { k:"100 % B2B",                 d:"Industria, terciario, hostelería, retail y patrimonio inmobiliario. Mínimo 100 MWh/año de ahorro." },
    { k:"Mandato exclusivo",         d:"Operamos en nombre del cliente vía mandato firmado. Tú titular del CAE; nosotros, gestores." },
    { k:"Cobro a éxito",             d:"Sin fee de entrada. Honorarios solo cuando la comercializadora ingresa la liquidación." },
  ];
  const noSomos = [
    { k:"No somos sujeto delegado",  d:"Trabajamos con sujetos delegados acreditados; no figuramos como tales en el registro MITECO." },
    { k:"No somos verificador",      d:"La verificación la firma una entidad acreditada por ENAC e independiente. Nunca nosotros." },
    { k:"No somos comercializadora", d:"No vendemos luz ni gas. No somos sujeto obligado del SNOEE." },
    { k:"No tratamos con particulares", d:"Vivienda unifamiliar suelta o autoconsumo doméstico no es nuestro perímetro." },
  ];
  return (
    <section id="posicionamiento" ref={ref} style={{ background:t.bgAlt, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ ...reveal(shown), display:"grid", gridTemplateColumns:"1fr auto", gap:32, alignItems:"end", marginBottom:64, paddingBottom:24, borderBottom:`1px solid ${t.line}` }}>
          <div>
            <span style={{ display:"block", fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:24 }}>§02·ter — Posicionamiento</span>
            <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 5vw, 80px)", lineHeight:1, letterSpacing:"-0.035em", margin:0, maxWidth:1000 }}>
              Hacemos una cosa,<br/>
              <span style={{ fontStyle:"italic", color:t.sage }}>y la hacemos bien.</span>
            </h2>
          </div>
          <p style={{ fontFamily:F_SANS, fontSize:15, color:t.inkSoft, lineHeight:1.5, margin:0, maxWidth:340, letterSpacing:"-0.005em" }}>
            En un mercado nuevo donde cada actor se reinventa, nosotros aclaramos desde el inicio dónde encajamos y dónde no.
          </p>
        </div>

        {/* Two columns */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, border:`1px solid ${t.line}`, borderRadius:14, overflow:"hidden", background:t.bg }}>
          {/* SOMOS */}
          <div style={{ ...reveal(shown, 0.1), padding:"40px 36px", borderRight:`1px solid ${t.line}`, background:`${t.sage}08` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <span style={{ width:24, height:24, borderRadius:99, background:t.sage, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6 L5 9 L10 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{ fontFamily:F_MONO, fontSize:11, color:t.sageDeep, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>Lo que somos</span>
            </div>
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:24 }}>
              {somos.map((it,i)=>(
                <li key={i} style={{ ...reveal(shown, 0.15 + i*0.05), paddingBottom:24, borderBottom: i<somos.length-1 ? `1px solid ${t.line}` : "none" }}>
                  <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(22px, 2vw, 28px)", lineHeight:1.15, letterSpacing:"-0.02em", color:t.ink, marginBottom:8 }}>
                    {it.k}
                  </div>
                  <div style={{ fontFamily:F_SANS, fontSize:14, color:t.inkSoft, lineHeight:1.55, letterSpacing:"-0.005em" }}>
                    {it.d}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* NO SOMOS */}
          <div style={{ ...reveal(shown, 0.2), padding:"40px 36px", background:t.bg }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <span style={{ width:24, height:24, borderRadius:99, border:`1.5px solid ${t.inkSoft}`, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2 L8 8 M8 2 L2 8" stroke={t.inkSoft} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <span style={{ fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>Lo que no somos</span>
            </div>
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:24 }}>
              {noSomos.map((it,i)=>(
                <li key={i} style={{ ...reveal(shown, 0.25 + i*0.05), paddingBottom:24, borderBottom: i<noSomos.length-1 ? `1px solid ${t.line}` : "none" }}>
                  <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(22px, 2vw, 28px)", lineHeight:1.15, letterSpacing:"-0.02em", color:t.ink, marginBottom:8, opacity:0.92 }}>
                    {it.k}
                  </div>
                  <div style={{ fontFamily:F_SANS, fontSize:14, color:t.inkSoft, lineHeight:1.55, letterSpacing:"-0.005em" }}>
                    {it.d}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Diagrama de actores */}
        <div style={{ ...reveal(shown, 0.4), marginTop:64, padding:"36px 40px", background:t.bg, border:`1px solid ${t.line}`, borderRadius:14 }}>
          <div style={{ fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:28 }}>
            Cadena de valor del SNOEE — dónde estamos
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto 1fr auto 1fr", gap:18, alignItems:"center" }}>
            {[
              { l:"Cliente B2B", s:"Industria · terciario · patrimonio", us:false },
              { l:"SUMACAE", s:"Agregador · gestor del expediente", us:true },
              { l:"Sujeto delegado + ENAC", s:"Verificación independiente", us:false },
              { l:"Comercializadora obligada", s:"Compra el CAE · paga al cliente", us:false },
            ].map((a,i,arr)=>(
              <React.Fragment key={i}>
                <div style={{ padding:"18px 16px", border: a.us ? `1.5px solid ${t.sage}` : `1px solid ${t.line}`, borderRadius:10, background: a.us ? `${t.sage}10` : "transparent", textAlign:"center", position:"relative" }}>
                  {a.us && (
                    <span style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", padding:"2px 8px", background:t.sage, color:"#FFFFFF", fontFamily:F_MONO, fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:99, fontWeight:600 }}>nosotros</span>
                  )}
                  <div style={{ fontFamily:F_DISPLAY, fontWeight:400, fontSize:16, lineHeight:1.2, color:t.ink, letterSpacing:"-0.01em", marginBottom:4 }}>{a.l}</div>
                  <div style={{ fontFamily:F_SANS, fontSize:11, color:t.inkSoft, lineHeight:1.4 }}>{a.s}</div>
                </div>
                {i<arr.length-1 && (
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none" style={{ color:t.inkSoft }}>
                    <path d="M0 5 H16 M12 1 L16 5 L12 9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sección Observatorio CAE — definida en observatorio.jsx ─────────────────
// El componente <Observatorio/> se carga vía window globals (ver observatorio.jsx).


// ── ¿Qué es un CAE? — Watershed-style explainer ────────────────────────────
function QueEs({ t }) {
  const [ref, shown] = useReveal(0.15);
  return (
    <section id="que-es" ref={ref} style={{ background:t.bgAlt, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:80 }}>
        <div>
          <div style={{ ...reveal(shown), fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:24 }}>§03 — El activo</div>
          <h2 style={{ ...reveal(shown, 0.1), fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 5vw, 84px)", lineHeight:1, letterSpacing:"-0.035em", margin:"0 0 32px" }}>
            Un megavatio<br/>
            <span style={{ fontStyle:"italic", color:t.sage }}>ahorrado</span><br/>
            es un activo.
          </h2>
          <p style={{ ...reveal(shown, 0.2), fontFamily:F_SANS, fontSize:17, lineHeight:1.55, color:t.ink, opacity:0.85, maxWidth:480, margin:0 }}>
            El Real Decreto 36/2023 transpuso la Directiva europea de eficiencia energética. Cada MWh ahorrado se convierte en un CAE: registrado en el Sistema Nacional, con vigencia de 20 años, transmisible. Las comercializadoras tienen una <em>obligación legal anual</em> de presentar CAE al Estado. Si no llegan, multa. Por eso compran. Por eso pagáis vosotros.
          </p>
        </div>
        <div style={{ ...reveal(shown, 0.3), display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { k:"1 MWh = 1 CAE", d:"Por cada megavatio-hora final ahorrado, el Estado emite un certificado nominal." },
            { k:"20 años de vigencia", d:"Una vez emitido, el CAE puede transmitirse o retenerse hasta 20 años naturales." },
            { k:"Compatible con ayudas", d:"Acumulable con IDAE, Next Generation EU, deducciones IRPF y bonificaciones IBI." },
            { k:"Mercado obligado", d:"14 comercializadoras de luz y gas tienen obligación legal anual cuantitativa de adquirir CAE." },
          ].map((it,i)=>(
            <div key={i} style={{ background:t.surface, border:`1px solid ${t.line}`, borderRadius:14, padding:"24px 28px", display:"grid", gridTemplateColumns:"auto 1fr", gap:24, alignItems:"start" }}>
              <div style={{ fontFamily:F_MONO, fontSize:11, color:t.sage, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4, whiteSpace:"nowrap" }}>0{i+1}</div>
              <div>
                <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:24, color:t.ink, letterSpacing:"-0.02em", marginBottom:6 }}>{it.k}</div>
                <div style={{ fontFamily:F_SANS, fontSize:14, color:t.inkSoft, lineHeight:1.5 }}>{it.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Proceso — Ramp-style numbered hero rows ────────────────────────────────
function Proceso({ t }) {
  const pasos = [
    { n:"01", title:"Auditoría energética", time:"48 h · gratis", desc:"Auditamos tu actuación con metodología M&V IPMVP. Recibes informe firmado con CAE potencial estimado y precio orientativo. Sin compromiso.", icons:["⚡","📐"] },
    { n:"02", title:"Mandato y verificación", time:"3-5 sem", desc:"Firmas mandato exclusivo. Activamos verificador acreditado por ENAC. Visita técnica, mediciones in-situ, contraste con baseline normalizado.", icons:["🔍","✓"] },
    { n:"03", title:"Emisión oficial", time:"2-4 sem", desc:"Documentación al organismo competente de tu Comunidad Autónoma. CAE emitido en el Sistema Nacional MITECO con tu titularidad.", icons:["📜","🏛"] },
    { n:"04", title:"Subasta y liquidación", time:"5 días", desc:"Subastamos entre las 14 comercializadoras obligadas. Aceptas la mejor oferta. Recibes el ingreso vía SEPA. Cobramos por éxito, no antes.", icons:["📈","€"] },
  ];
  return (
    <section id="proceso" style={{ background:t.bg, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto", display:"grid", gridTemplateColumns:"380px 1fr", gap:80, alignItems:"start" }}>
        <div style={{ position:"sticky", top:120, alignSelf:"start" }}>
          <span style={{ display:"block", fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:24 }}>§04 — Cómo funciona</span>
          <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 4.5vw, 72px)", lineHeight:1, letterSpacing:"-0.035em", margin:"0 0 24px" }}>
            Cuatro firmas tuyas.<br/>
            <span style={{ fontStyle:"italic", color:t.sage }}>Tres meses al cobro.</span>
          </h2>
          <p style={{ fontFamily:F_SANS, fontSize:15, lineHeight:1.55, color:t.inkSoft, margin:0, maxWidth:340 }}>
            De la auditoría al ingreso bancario en menos de 90 días naturales. Cada paso, documentado.
          </p>
        </div>
        <div>
          {pasos.map((p,i)=> <ProcesoRow key={p.n} p={p} i={i} t={t} last={i===pasos.length-1} />)}
        </div>
      </div>
    </section>
  );
}
function ProcesoRow({ p, i, t, last }) {
  const [ref, shown] = useReveal(0.2);
  return (
    <div ref={ref} style={{ ...reveal(shown), display:"grid", gridTemplateColumns:"80px 1fr 100px", gap:32, padding:"40px 0", borderTop:`1px solid ${t.line}`, ...(last?{borderBottom:`1px solid ${t.line}`}:{}), alignItems:"start" }}>
      <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:64, lineHeight:0.9, color:t.sage, letterSpacing:"-0.04em" }}>{p.n}</div>
      <div>
        <h3 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:36, lineHeight:1.05, letterSpacing:"-0.025em", color:t.ink, margin:"0 0 6px" }}>{p.title}</h3>
        <div style={{ fontFamily:F_MONO, fontSize:11, color:t.sage, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>{p.time}</div>
        <p style={{ fontFamily:F_SANS, fontSize:16, lineHeight:1.55, color:t.ink, opacity:0.85, margin:0 }}>{p.desc}</p>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:8 }}>
        <div style={{ width:48, height:48, borderRadius:99, border:`1px solid ${t.ink}`, display:"flex", alignItems:"center", justifyContent:"center", color:t.ink, fontSize:18 }}>→</div>
      </div>
    </div>
  );
}

// ── Mercado en vivo ─────────────────────────────────────────────────────────
function Mercado({ t }) {
  const [tick, setTick] = useState(0);
  useEffect(()=>{ const id=setInterval(()=>setTick(x=>x+1), 1500); return ()=>clearInterval(id); }, []);
  const series = useMemo(()=>{ const arr=[]; let v=39;
    for (let i=0;i<80;i++){ v += Math.sin(i*0.3+tick*0.05)*0.4 + (Math.random()-0.5)*0.3; arr.push(v); }
    return arr;
  }, [tick]);
  const min=Math.min(...series), max=Math.max(...series);
  const path = series.map((y,i)=>`${i===0?"M":"L"} ${(i/(series.length-1))*100} ${100-((y-min)/(max-min))*100}`).join(" ");
  const last = series[series.length-1];

  return (
    <section id="mercado" style={{ background:t.invert, color:t.invert==="#0E1410"?"#F2EFE5":"#0E1410", padding:"140px 28px" }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:24, marginBottom:48, flexWrap:"wrap" }}>
          <span style={{ fontFamily:F_MONO, fontSize:11, color:"#9CA399", letterSpacing:"0.08em", textTransform:"uppercase" }}>§05 — Mercado en vivo</span>
          <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 5vw, 80px)", lineHeight:1, letterSpacing:"-0.035em", margin:0 }}>
            El precio del CAE,<br/>
            <span style={{ fontStyle:"italic", color:"#A8C490" }}>fluctuando ahora.</span>
          </h2>
        </div>

        <div style={{ background:"#161D17", border:"1px solid #FFFFFF14", borderRadius:14, padding:48, display:"grid", gridTemplateColumns:"1fr 1fr", gap:48 }}>
          <div>
            <div style={{ fontFamily:F_MONO, fontSize:11, color:"#9CA399", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>CAE Index · Spot · €/MWh</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
              <span style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:96, lineHeight:0.9, letterSpacing:"-0.04em", color:"#F2EFE5", fontVariantNumeric:"tabular-nums" }}>{last.toFixed(2)}</span>
              <span style={{ fontFamily:F_MONO, fontSize:14, color:"#D4FF3D" }}>+1,3%</span>
            </div>
            <div style={{ display:"flex", gap:24, marginTop:32, fontFamily:F_MONO, fontSize:11, color:"#9CA399", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              <div><div style={{ marginBottom:4 }}>Mín 60d</div><div style={{ fontFamily:F_DISPLAY, fontSize:22, color:"#F2EFE5" }}>{min.toFixed(2)}</div></div>
              <div><div style={{ marginBottom:4 }}>Máx 60d</div><div style={{ fontFamily:F_DISPLAY, fontSize:22, color:"#F2EFE5" }}>{max.toFixed(2)}</div></div>
              <div><div style={{ marginBottom:4 }}>Volumen hoy</div><div style={{ fontFamily:F_DISPLAY, fontSize:22, color:"#F2EFE5" }}>2.840 MWh</div></div>
            </div>
          </div>
          <div>
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width:"100%", height:200, display:"block" }}>
              <defs>
                <linearGradient id="gv4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A8C490" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#A8C490" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={path+` L 100 100 L 0 100 Z`} fill="url(#gv4)"/>
              <path d={path} fill="none" stroke="#A8C490" strokeWidth="0.4"/>
            </svg>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontFamily:F_MONO, fontSize:10, color:"#9CA399", letterSpacing:"0.06em" }}>
              <span>HACE 60 SESIONES</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:99, background:"#D4FF3D", animation:"pulse 1.4s infinite" }}/>EN VIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Casos ───────────────────────────────────────────────────────────────────
function Casos({ t }) {
  const casos = [
    { sector:"Industria · Burgos",    titulo:"Recuperación de calor en línea de pintura",  mwh:1840, eur:79120, tone:"sage", tipo:"REC-04" },
    { sector:"Hotelero · Málaga",     titulo:"Aerotermia + envolvente · 4* costa",         mwh:412,  eur:17716, tone:"cream", tipo:"CLI-12" },
    { sector:"Residencial · Madrid",  titulo:"Rehabilitación SATE · 84 viviendas",         mwh:286,  eur:12298, tone:"dark",  tipo:"ENV-08" },
    { sector:"Logística · Zaragoza",  titulo:"LED + variadores en almacén regulado frío",  mwh:528,  eur:22704, tone:"light", tipo:"ILU-03" },
  ];
  return (
    <section id="casos" style={{ background:t.bg, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:24, marginBottom:48, flexWrap:"wrap" }}>
          <span style={{ fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>§06 — Operaciones reales</span>
          <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 5vw, 80px)", lineHeight:1, letterSpacing:"-0.035em", margin:0 }}>
            Cifras cobradas,<br/>
            <span style={{ fontStyle:"italic", color:t.sage }}>no proyectadas.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16 }}>
          {casos.map((c,i)=> <CasoCard key={i} c={c} t={t} />)}
        </div>
      </div>
    </section>
  );
}
function CasoCard({ c, t }) {
  const [ref, shown] = useReveal(0.2);
  const tones = {
    sage:  { bg:t.sage, ink:"#FFFFFF", soft:"#FFFFFFB3", accent:t.accent },
    cream: { bg:t.cream, ink:t.ink, soft:t.inkSoft, accent:t.sage },
    dark:  { bg:t.invert, ink:t.invert==="#0E1410"?"#F2EFE5":"#0E1410", soft:"#9CA399", accent:t.accent },
    light: { bg:t.surface, ink:t.ink, soft:t.inkSoft, accent:t.sage },
  };
  const tt = tones[c.tone];
  return (
    <div ref={ref} style={{ ...reveal(shown), background:tt.bg, color:tt.ink, borderRadius:14, padding:40, aspectRatio:"5/4", display:"flex", flexDirection:"column", justifyContent:"space-between", border:c.tone==="light"?`1px solid ${t.line}`:"none" }}>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", fontFamily:F_MONO, fontSize:11, color:tt.soft, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          <span>{c.sector}</span>
          <span>{c.tipo}</span>
        </div>
        <h3 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:32, lineHeight:1.1, letterSpacing:"-0.025em", color:tt.ink, margin:"24px 0 0", maxWidth:380 }}>{c.titulo}</h3>
      </div>
      <div>
        <div style={{ fontFamily:F_MONO, fontSize:11, color:tt.soft, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>{c.mwh.toLocaleString("es-ES")} MWh certificados</div>
        <div style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:64, lineHeight:0.9, letterSpacing:"-0.04em", color:tt.ink, fontVariantNumeric:"tabular-nums" }}>
          {c.eur.toLocaleString("es-ES")} <span style={{ color:tt.accent }}>€</span>
        </div>
      </div>
    </div>
  );
}

// ── Sectores ────────────────────────────────────────────────────────────────
function Sectores({ t }) {
  const cats = [
    { k:"Envolvente térmica", desc:"SATE, ventanas, cubiertas, aislamiento", mwh:"40-180" },
    { k:"Climatización", desc:"Aerotermia, geotermia, recuperadores", mwh:"30-220" },
    { k:"Iluminación LED", desc:"Industrial, oficinas, alumbrado público", mwh:"20-120" },
    { k:"Procesos industriales", desc:"Variadores, recuperación calor, automatización", mwh:"100-2.400" },
    { k:"Renovables térmicas", desc:"Solar térmica, biomasa, redes calor", mwh:"60-400" },
    { k:"Movilidad eléctrica", desc:"Flotas, recarga, renovación parque", mwh:"15-90" },
  ];
  return (
    <section style={{ background:t.bgAlt, padding:"140px 28px", borderTop:`1px solid ${t.line}` }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:24, marginBottom:48, flexWrap:"wrap" }}>
          <span style={{ fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.08em", textTransform:"uppercase" }}>§07 — Actuaciones elegibles</span>
          <h2 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(40px, 5vw, 80px)", lineHeight:1, letterSpacing:"-0.035em", margin:0 }}>
            Si ahorra energía,<br/>
            <span style={{ fontStyle:"italic", color:t.sage }}>genera CAE.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", borderTop:`1px solid ${t.ink}` }}>
          {cats.map((c,i)=>(
            <div key={i} style={{ padding:32, borderRight:i%3<2?`1px solid ${t.line}`:"none", borderBottom: i<3?`1px solid ${t.line}`:"none" }}>
              <div style={{ fontFamily:F_MONO, fontSize:11, color:t.sage, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:24 }}>0{i+1}</div>
              <h3 style={{ fontFamily:F_DISPLAY, fontWeight:340, fontSize:28, lineHeight:1.1, letterSpacing:"-0.025em", color:t.ink, margin:"0 0 8px" }}>{c.k}</h3>
              <p style={{ fontFamily:F_SANS, fontSize:14, color:t.inkSoft, margin:"0 0 24px", lineHeight:1.5 }}>{c.desc}</p>
              <div style={{ paddingTop:16, borderTop:`1px solid ${t.line}`, display:"flex", justifyContent:"space-between", fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                <span>Rango típico</span>
                <span style={{ color:t.ink }}>{c.mwh} MWh</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ───────────────────────────────────────────────────────────────
function FinalCTA({ t }) {
  const [ref, shown] = useReveal(0.2);
  return (
    <section id="contacto" ref={ref} style={{ background:t.invert, color:t.invert==="#0E1410"?"#F2EFE5":"#0E1410", padding:"180px 28px", position:"relative", overflow:"hidden" }}>
      <div aria-hidden style={{ position:"absolute", inset:0, opacity:0.06, backgroundImage:`linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)`, backgroundSize:"80px 80px" }} />
      <div style={{ maxWidth:1240, margin:"0 auto", position:"relative" }}>
        <div style={{ ...reveal(shown), fontFamily:F_MONO, fontSize:11, color:"#A8C490", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:32 }}>§08 — Empezar</div>
        <h2 style={{ ...reveal(shown, 0.1), fontFamily:F_DISPLAY, fontWeight:340, fontSize:"clamp(56px, 9vw, 168px)", lineHeight:0.9, letterSpacing:"-0.04em", margin:"0 0 48px", maxWidth:1100 }}>
          Tu eficiencia<br/>
          <span style={{ fontStyle:"italic", color:"#A8C490" }}>ya es dinero.</span><br/>
          Vamos a cobrarla.
        </h2>
        <div style={{ ...reveal(shown, 0.2), display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"end" }}>
          <p style={{ fontFamily:F_SANS, fontSize:18, lineHeight:1.5, color:"#9CA399", margin:0, maxWidth:520 }}>
            Análisis previo gratuito en 48 horas. Sin coste, sin compromiso, sin letra pequeña. Si la operación no se cierra, no facturamos.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14, alignItems:"flex-start" }}>
            <a href="#" style={{ background:"#D4FF3D", color:"#0E1410", padding:"18px 28px", borderRadius:99, textDecoration:"none", fontSize:16, fontFamily:F_SANS, fontWeight:600, letterSpacing:"-0.01em" }}>
              Calcular mi CAE potencial →
            </a>
            <a href="tel:" style={{ color:"#F2EFE5", textDecoration:"none", fontSize:14, fontFamily:F_SANS, fontWeight:500, opacity:0.85 }}>
              O hablar con asesor: +34 91 000 00 00
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer({ t }) {
  return (
    <footer style={{ background:t.bg, color:t.inkSoft, padding:"60px 28px 32px", borderTop:`1px solid ${t.line}`, fontFamily:F_SANS, fontSize:13 }}>
      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr repeat(4, 1fr)", gap:48, paddingBottom:48, borderBottom:`1px solid ${t.line}` }}>
          <div>
            <Logo height={28} />
            <p style={{ marginTop:20, fontSize:13, lineHeight:1.5, color:t.inkSoft, maxWidth:300 }}>
              Gestión integral de Certificados de Ahorro Energético al amparo del RD 36/2023. Verificación ENAC. Inscritos MITECO.
            </p>
          </div>
          {[
            { h:"Producto", l:["Auditoría energética","Verificación CAE","Subasta y liquidación","Calculadora"] },
            { h:"Aprende",  l:["Qué es un CAE","RD 36/2023","Mercado","Casos"] },
            { h:"Empresa",  l:["Sobre nosotros","Equipo","Carreras","Prensa"] },
            { h:"Legal",    l:["Privacidad","Cookies","Aviso legal"] },
          ].map(c=>(
            <div key={c.h}>
              <div style={{ fontFamily:F_MONO, fontSize:11, color:t.ink, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>{c.h}</div>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10 }}>
                {c.l.map(it=> <li key={it} style={{ fontSize:13 }}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16, fontFamily:F_MONO, fontSize:11, color:t.inkSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          <span>© 2026 SUMACAE S.L.</span>
          <span>Madrid · Barcelona · Bilbao</span>
          <span>RD 36/2023 · ENAC · MITECO</span>
        </div>
      </div>
    </footer>
  );
}

// ── Scroll progress bar ────────────────────────────────────────────────────
function ScrollProgress({ t }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop || window.scrollY) / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position:"fixed", top:28, left:0, right:0, height:2, zIndex:60, pointerEvents:"none" }}>
      <div style={{ height:"100%", width:`${pct*100}%`, background:t.sage, transition:"width .12s linear" }}/>
    </div>
  );
}

// ── Side rail navigation ───────────────────────────────────────────────────
function SideRail({ t }) {
  const sections = [
    { id:"top",     label:"Inicio",       num:"01" },
    { id:"observatorio",  label:"Observatorio",  num:"02·bis" },
    { id:"que-es",  label:"Qué es",       num:"03" },
    { id:"proceso", label:"Proceso",      num:"04" },
    { id:"mercado", label:"Mercado",      num:"05" },
    { id:"casos",   label:"Casos",        num:"06" },
    { id:"contacto",label:"Contacto",     num:"08" },
  ];
  const [active, setActive] = useState("top");
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const els = sections.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.6, 1] }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", "#"+id);
  };

  return (
    <div style={{ position:"fixed", right:24, top:"50%", transform:"translateY(-50%)", zIndex:50, display:"flex", flexDirection:"column", gap:6, padding:"14px 12px", background:t.bg+"D9", backdropFilter:"saturate(180%) blur(14px)", WebkitBackdropFilter:"saturate(180%) blur(14px)", borderRadius:99, border:`1px solid ${t.line}` }}>
      {sections.map((s) => {
        const isActive = active === s.id;
        const isHover = hover === s.id;
        return (
          <button key={s.id} onClick={()=>go(s.id)} onMouseEnter={()=>setHover(s.id)} onMouseLeave={()=>setHover(null)}
            aria-label={`Ir a ${s.label}`}
            style={{ position:"relative", appearance:"none", border:"none", background:"transparent", padding:"6px 4px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ display:"block", width: isActive ? 8 : 6, height: isActive ? 8 : 6, borderRadius:99, background: isActive ? t.sage : (isHover ? t.ink : t.inkSoft), opacity: isActive ? 1 : (isHover ? 1 : 0.45), transition:"all .25s ease" }}/>
            {isHover && (
              <span style={{ position:"absolute", right:"calc(100% + 12px)", top:"50%", transform:"translateY(-50%)", whiteSpace:"nowrap", background:t.ink, color:t.bg, padding:"6px 12px", borderRadius:99, fontSize:11, fontFamily:F_MONO, letterSpacing:"0.06em", textTransform:"uppercase", pointerEvents:"none" }}>
                <span style={{ opacity:0.5, marginRight:6 }}>§{s.num}</span>{s.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = T[tw.theme] || T.light;
  return (
    <div style={{ background:t.bg, color:t.ink, fontFamily:F_SANS, minHeight:"100vh" }}>
      <Ticker t={t} />
      <ScrollProgress t={t} />
      <Nav t={t} />
      <SideRail t={t} />
      <Hero t={t} />
      <Stats t={t} />
      <Posicionamiento t={t} />
      <Observatorio t={t} />
      <QueEs t={t} />
      <Proceso t={t} />
      <Mercado t={t} />
      <Casos t={t} />
      <Sectores t={t} />
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
