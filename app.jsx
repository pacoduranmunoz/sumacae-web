// SUMACAE — rediseño top
// Sitio one-page editorial-financiero para gestión integral de CAEs.

const { useState, useEffect, useMemo, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sage",
  "heroVariant": "calculator",
  "density": "regular",
  "showCalculatorInline": true
}/*EDITMODE-END*/;

// ── Palettes ────────────────────────────────────────────────────────────────
const PALETTES = {
  sage: {
    name: "Sage editorial",
    bg: "#F4F1E8",
    surface: "#FFFFFF",
    ink: "#15170F",
    inkSoft: "#5A5C50",
    sage: "#C9D4BD",
    sageDeep: "#8FA37F",
    leaf: "#3F5A33",
    accent: "#1FCB7E",
    line: "#1517171A",
  },
  noir: {
    name: "Noir financiero",
    bg: "#0E100C",
    surface: "#16190F",
    ink: "#F2EFE2",
    inkSoft: "#9A9D88",
    sage: "#2A3322",
    sageDeep: "#7A8F65",
    leaf: "#C2D6A8",
    accent: "#A6FF3F",
    line: "#FFFFFF18",
  },
  forest: {
    name: "Bosque profundo",
    bg: "#EFEBDC",
    surface: "#FFFFFF",
    ink: "#0F1A0E",
    inkSoft: "#4A5648",
    sage: "#B8C9A7",
    sageDeep: "#5C7A4D",
    leaf: "#1F3A1B",
    accent: "#0FAE6A",
    line: "#0F1A0E1A",
  },
};

// ── Logo (recreado en SVG basado en marca actual) ───────────────────────────
function SumaCAELogo({ size = 36, palette }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Cross frame */}
        <path d="M14 4 L14 56 M4 14 L56 14" stroke={palette.ink} strokeWidth="3" strokeLinecap="square" />
        {/* Leaf */}
        <path d="M28 6 C36 6 44 14 44 24 C44 30 38 36 30 36 C28 36 26 35 26 33 C26 25 28 14 28 6 Z"
              fill={palette.sageDeep} />
        <path d="M28 8 C30 18 32 28 32 34" stroke={palette.leaf} strokeWidth="1.2" opacity=".5" />
      </svg>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 800, fontSize: size * 0.5, lineHeight: 0.95, letterSpacing: "-0.02em" }}>
        <span style={{ color: palette.ink }}>suma</span>
        <span style={{ color: palette.sageDeep }}>CAE</span>
      </div>
    </div>
  );
}

// ── Top nav ────────────────────────────────────────────────────────────────
function Nav({ palette }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const items = [
    ["Qué es un CAE", "#cae"],
    ["Proceso", "#proceso"],
    ["Actuaciones", "#actuaciones"],
    ["Casos", "#casos"],
    ["FAQ", "#faq"],
  ];
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "14px 32px",
      background: scrolled ? `${palette.bg}EE` : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? `1px solid ${palette.line}` : "1px solid transparent",
      transition: "background .3s, border-color .3s, backdrop-filter .3s",
    }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 32 }}>
        <a href="#top" style={{ textDecoration: "none" }}><SumaCAELogo size={32} palette={palette} /></a>
        <nav style={{ display: "flex", gap: 28, marginLeft: "auto" }}>
          {items.map(([label, href]) => (
            <a key={href} href={href} style={{
              color: palette.ink, textDecoration: "none",
              fontSize: 13, letterSpacing: "0.01em", fontWeight: 500,
              opacity: 0.78,
            }}>{label}</a>
          ))}
        </nav>
        <a href="#contacto" style={{
          background: palette.ink, color: palette.bg,
          padding: "10px 18px", borderRadius: 999,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 8,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          Hablar con asesor
          <span style={{ fontSize: 14 }}>→</span>
        </a>
      </div>
    </header>
  );
}

// ── Marquee number ticker ──────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "", duration = 900 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let raf, start, observed = false;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !observed) {
        observed = true;
        const animate = (ts) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(value * eased);
          if (p < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => { if (raf) cancelAnimationFrame(raf); obs.disconnect(); };
  }, [value, duration]);
  return (
    <span ref={ref}>
      {prefix}{v.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// ── Hero — calculadora CAE ─────────────────────────────────────────────────
function HeroCalculator({ palette }) {
  const [actuacion, setActuacion] = useState("aerotermia");
  const [ahorro, setAhorro] = useState(85); // MWh/año
  const [precio, setPrecio] = useState(43); // €/MWh

  const tipos = [
    { id: "aerotermia", label: "Aerotermia", factor: 1.0, base: 85 },
    { id: "fotovoltaica", label: "Fotovoltaica autoconsumo", factor: 0.85, base: 60 },
    { id: "envolvente", label: "Aislamiento envolvente", factor: 1.2, base: 45 },
    { id: "iluminacion", label: "Iluminación LED", factor: 0.7, base: 30 },
    { id: "climatizacion", label: "Climatización industrial", factor: 1.4, base: 250 },
  ];

  const monetizacion = useMemo(() => Math.round(ahorro * precio), [ahorro, precio]);
  const actActiva = tipos.find(t => t.id === actuacion);

  return (
    <section id="top" style={{
      position: "relative",
      minHeight: "100vh",
      paddingTop: 110,
      paddingBottom: 60,
      background: palette.bg,
      overflow: "hidden",
    }}>
      {/* big leaf decoration */}
      <svg viewBox="0 0 600 800" style={{
        position: "absolute", right: -120, top: 60, width: 720, height: 960,
        opacity: 0.55, pointerEvents: "none",
      }}>
        <path d="M280 40 C440 40 560 200 560 380 C560 540 440 700 280 700 C240 700 200 680 200 640 C200 480 240 220 280 40 Z"
              fill={palette.sage} />
        <path d="M280 40 C300 220 320 460 320 660" stroke={palette.sageDeep} strokeWidth="2" opacity="0.5" fill="none" />
      </svg>

      <div style={{ position: "relative", maxWidth: 1360, margin: "0 auto", padding: "0 32px",
                    display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "center" }}>
        {/* LEFT — copy */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: `${palette.surface}`, border: `1px solid ${palette.line}`,
            padding: "8px 14px 8px 10px", borderRadius: 999,
            fontSize: 12, color: palette.inkSoft, fontWeight: 500,
            marginBottom: 28,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: palette.accent, boxShadow: `0 0 0 3px ${palette.accent}33` }} />
            Sistema CAE · Real Decreto 36/2023 · activo desde 2024
          </div>

          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 400,
            fontSize: "clamp(44px, 5.8vw, 92px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: palette.ink,
            margin: "0 0 36px 0",
            textWrap: "balance",
          }}>
            Tu eficiencia<br/>
            energética,<br/>
            <em style={{ fontStyle: "italic", color: palette.sageDeep, fontWeight: 300, display: "inline-block", paddingBottom: "0.12em" }}>
              convertida en caja.
            </em>
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.5, color: palette.inkSoft,
            maxWidth: 520, margin: "0 0 36px 0",
          }}>
            Gestionamos el ciclo completo de Certificados de Ahorro Energético: medimos tu actuación,
            la verificamos con organismo acreditado y la liquidamos al mejor precio del mercado.
            Tú cobras. Nosotros nos encargamos del papel.
          </p>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#contacto" style={{
              background: palette.ink, color: palette.bg,
              padding: "16px 26px", borderRadius: 999,
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}>
              Calcular mi CAE
              <span>→</span>
            </a>
            <a href="#proceso" style={{
              color: palette.ink, textDecoration: "none",
              fontSize: 15, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 8px",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 999,
                border: `1.5px solid ${palette.ink}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12,
              }}>▶</span>
              Ver el proceso · 4 pasos
            </a>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1, marginTop: 56,
            background: palette.line,
            border: `1px solid ${palette.line}`,
          }}>
            {[
              ["+12 M€", "liquidados a clientes"],
              ["340+", "actuaciones gestionadas"],
              ["43 €", "precio medio por MWh"],
            ].map(([n, l]) => (
              <div key={l} style={{ background: palette.bg, padding: "20px 18px" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px, 2.2vw, 32px)", fontWeight: 500, letterSpacing: "-0.02em", color: palette.ink, whiteSpace: "nowrap" }}>{n}</div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 4, letterSpacing: "0.02em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — calculadora */}
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.line}`,
          borderRadius: 4,
          padding: 32,
          boxShadow: `0 30px 80px -40px ${palette.ink}30`,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: palette.sageDeep, textTransform: "uppercase" }}>
              Calculadora · estimación
            </div>
            <div style={{ fontSize: 11, color: palette.inkSoft, fontVariantNumeric: "tabular-nums" }}>v2.4 · mar 2026</div>
          </div>

          <label style={{ display: "block", fontSize: 12, color: palette.inkSoft, marginBottom: 8, letterSpacing: "0.02em" }}>
            Tipo de actuación
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
            {tipos.map(t => (
              <button key={t.id} onClick={() => { setActuacion(t.id); setAhorro(t.base); }}
                style={{
                  padding: "8px 12px", fontSize: 12, fontWeight: 500,
                  border: `1px solid ${actuacion === t.id ? palette.ink : palette.line}`,
                  background: actuacion === t.id ? palette.ink : "transparent",
                  color: actuacion === t.id ? palette.bg : palette.ink,
                  borderRadius: 999, cursor: "pointer",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <SliderRow label="Ahorro energético verificado" value={ahorro} setValue={setAhorro} min={5} max={500} unit=" MWh/año" palette={palette} />
          <SliderRow label="Precio CAE en mercado" value={precio} setValue={setPrecio} min={28} max={62} unit=" €/MWh" palette={palette} />

          <div style={{
            marginTop: 28, paddingTop: 24,
            borderTop: `1px solid ${palette.line}`,
          }}>
            <div style={{ fontSize: 11, color: palette.inkSoft, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
              Liquidación estimada
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{
                fontFamily: "'Fraunces', serif", fontWeight: 400,
                fontSize: 64, lineHeight: 1, letterSpacing: "-0.03em", color: palette.ink,
                fontVariantNumeric: "tabular-nums",
              }}>
                {monetizacion.toLocaleString("es-ES")}
              </div>
              <div style={{ fontSize: 24, color: palette.sageDeep, fontWeight: 500 }}>€</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: palette.inkSoft }}>
              <span>≈ {(monetizacion * 0.93).toFixed(0)} € netos al cliente</span>
              <span>SUMACAE 7% éxito</span>
            </div>
          </div>

          <button style={{
            width: "100%", marginTop: 22,
            background: palette.accent, color: palette.ink,
            border: "none", padding: "14px",
            fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
            borderRadius: 999, cursor: "pointer",
          }}>
            Solicitar oferta vinculante →
          </button>
        </div>
      </div>
    </section>
  );
}

function SliderRow({ label, value, setValue, min, max, unit, palette }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: palette.inkSoft, letterSpacing: "0.02em" }}>{label}</span>
        <span style={{
          fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500,
          color: palette.ink, fontVariantNumeric: "tabular-nums",
        }}>
          {value.toLocaleString("es-ES")}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: palette.line, borderRadius: 999 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: palette.ink, borderRadius: 999 }} />
        <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(+e.target.value)}
          style={{
            position: "absolute", inset: -10, width: "calc(100% + 20px)",
            opacity: 0, cursor: "pointer",
          }} />
        <div style={{
          position: "absolute", top: -6, left: `calc(${pct}% - 8px)`,
          width: 16, height: 16, borderRadius: 999,
          background: palette.bg, border: `2px solid ${palette.ink}`,
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

// ── ¿Qué es un CAE? — sección editorial ────────────────────────────────────
function QueEsCAE({ palette }) {
  return (
    <section id="cae" style={{ background: palette.surface, padding: "120px 32px", borderTop: `1px solid ${palette.line}` }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, marginBottom: 80 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 16 }}>
              01 — Fundamentos
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 400,
              fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 1.0, letterSpacing: "-0.03em",
              color: palette.ink, margin: 0,
            }}>
              Qué es,<br/>en serio,<br/>un CAE.
            </h2>
          </div>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 22, lineHeight: 1.45, color: palette.ink, fontWeight: 400, margin: "0 0 24px 0", letterSpacing: "-0.005em" }}>
              Un <strong style={{ fontWeight: 600 }}>Certificado de Ahorro Energético</strong> es un documento oficial
              emitido por una comunidad autónoma que reconoce, en MWh, el ahorro derivado de una
              actuación de eficiencia energética. Y a diferencia de una subvención, el CAE es un activo
              transmisible: <em style={{ color: palette.sageDeep }}>se compra, se vende, se monetiza.</em>
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: palette.inkSoft, margin: 0 }}>
              Lo creó el Real Decreto 36/2023 transponiendo la Directiva 2012/27/UE. Las empresas
              comercializadoras de energía (Sujetos Obligados) deben justificar ahorros cada año o pagar
              al FNEE. Para evitarlo, compran CAEs. Esa demanda es el motor de tu monetización.
            </p>
          </div>
        </div>

        {/* dato grande */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: `1px solid ${palette.ink}`, borderBottom: `1px solid ${palette.ink}`,
        }}>
          {[
            ["1 CAE", "= 1 MWh ahorrado"],
            ["20 años", "vida útil reconocida"],
            ["3 a 5", "meses del proyecto al cobro"],
            ["100%", "compatible con subvenciones IDAE"],
          ].map(([n, l], i) => (
            <div key={i} style={{
              padding: "32px 28px",
              borderRight: i < 3 ? `1px solid ${palette.ink}` : "none",
            }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 56, lineHeight: 1, letterSpacing: "-0.03em", color: palette.ink }}>
                {n}
              </div>
              <div style={{ fontSize: 13, color: palette.inkSoft, marginTop: 12, lineHeight: 1.4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Proceso ─────────────────────────────────────────────────────────────────
function Proceso({ palette }) {
  const pasos = [
    { n: "01", title: "Análisis previo", time: "48h", desc: "Revisamos tu actuación, validamos elegibilidad y proyectamos el CAE estimado. Sin compromiso, sin coste.", icon: "M" },
    { n: "02", title: "Acuerdo y verificación", time: "2-4 semanas", desc: "Firmamos mandato. Coordinamos al Verificador acreditado por ENAC y preparamos toda la documentación técnica.", icon: "V" },
    { n: "03", title: "Emisión por la CCAA", time: "30-60 días", desc: "La comunidad autónoma emite el CAE en el registro nacional. Te enviamos el documento oficial a tu nombre.", icon: "E" },
    { n: "04", title: "Liquidación", time: "5 días", desc: "Negociamos con Sujetos Obligados. Cuando cerramos precio, transferimos el cobro neto a tu cuenta.", icon: "€" },
  ];
  return (
    <section id="proceso" style={{ background: palette.bg, padding: "120px 32px", borderTop: `1px solid ${palette.line}` }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 64, gap: 40, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 16 }}>
              02 — Cómo trabajamos
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 400,
              fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.03em",
              color: palette.ink, margin: 0, maxWidth: 720,
            }}>
              Cuatro pasos. <em style={{ color: palette.sageDeep, fontStyle: "italic" }}>De la obra al ingreso.</em>
            </h2>
          </div>
          <div style={{ fontSize: 13, color: palette.inkSoft, maxWidth: 360 }}>
            Diseñamos el flujo para que tú solo tengas que firmar dos veces. Todo lo demás —técnico,
            legal, comercial— corre por nuestra cuenta.
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 1, background: palette.line }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {pasos.map((p, i) => (
              <div key={p.n} style={{ position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 999,
                  background: palette.bg, border: `2px solid ${palette.ink}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", marginBottom: 28,
                  fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, color: palette.ink,
                }}>
                  {i === 3 ? (
                    <span style={{ color: palette.sageDeep }}>€</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em" }}>{p.n}</span>
                  )}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
                  color: palette.accent === "#A6FF3F" ? palette.leaf : palette.accent,
                  textTransform: "uppercase", marginBottom: 10,
                  background: palette.accent === "#A6FF3F" ? palette.accent : "transparent",
                  padding: palette.accent === "#A6FF3F" ? "3px 8px" : 0,
                  display: "inline-block", borderRadius: 4,
                }}>
                  {p.time}
                </div>
                <h3 style={{
                  fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26, lineHeight: 1.05,
                  letterSpacing: "-0.02em", color: palette.ink, margin: "0 0 12px 0",
                }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: palette.inkSoft, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Actuaciones elegibles ──────────────────────────────────────────────────
function Actuaciones({ palette }) {
  const cats = [
    { id: "industria", title: "Industria", desc: "Procesos productivos, calderas, motores, recuperación de calor.", items: ["Variadores de frecuencia", "Recuperación calor residual", "Aire comprimido", "Hornos eficientes", "Motores IE4/IE5"] },
    { id: "edificios", title: "Edificios y terciario", desc: "Hoteles, oficinas, retail, hospitales, residencias.", items: ["Aerotermia", "Climatización VRF", "Aislamiento envolvente", "Iluminación LED", "Control climático"] },
    { id: "residencial", title: "Residencial", desc: "Viviendas unifamiliares y comunidades de propietarios.", items: ["Bombas de calor", "Caldera biomasa", "Ventanas alta eficiencia", "Aislamiento SATE", "Domótica energética"] },
    { id: "transporte", title: "Transporte", desc: "Flotas eléctricas, infraestructura de recarga, modal shift.", items: ["Vehículos eléctricos flota", "Infraestructura recarga", "Sistemas telemetría", "Optimización rutas", "Conducción eficiente"] },
  ];
  const [active, setActive] = useState("industria");
  const cat = cats.find(c => c.id === active);

  return (
    <section id="actuaciones" style={{ background: palette.surface, padding: "120px 32px", borderTop: `1px solid ${palette.line}` }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 16 }}>
            03 — Qué es elegible
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 400,
            fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.03em",
            color: palette.ink, margin: 0, maxWidth: 900,
          }}>
            Más de <em style={{ color: palette.sageDeep, fontStyle: "italic" }}>180 actuaciones</em> tipificadas
            por el Ministerio. Si tu obra ahorra energía, probablemente es CAE.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${palette.ink}` }}>
            {cats.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} style={{
                background: "none", border: "none", textAlign: "left",
                padding: "24px 0", borderBottom: `1px solid ${active === c.id ? palette.ink : palette.line}`,
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                color: palette.ink,
              }}>
                <span style={{
                  fontFamily: "'Fraunces', serif", fontSize: active === c.id ? 38 : 28,
                  fontWeight: 400, letterSpacing: "-0.02em",
                  color: active === c.id ? palette.ink : palette.inkSoft,
                  transition: "all .25s",
                }}>
                  {c.title}
                </span>
                <span style={{
                  fontSize: 18, color: active === c.id ? palette.sageDeep : palette.line,
                  transition: "all .25s",
                }}>
                  {active === c.id ? "●" : "○"}
                </span>
              </button>
            ))}
          </div>

          <div style={{
            background: palette.bg, padding: 44, borderRadius: 4,
            border: `1px solid ${palette.line}`, position: "relative", overflow: "hidden",
          }}>
            <svg viewBox="0 0 200 200" style={{ position: "absolute", top: -40, right: -40, width: 220, opacity: 0.4 }}>
              <path d="M100 10 C150 10 190 50 190 100 C190 140 160 180 110 180 C100 180 95 175 95 165 C95 110 100 60 100 10 Z" fill={palette.sage} />
            </svg>
            <h3 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 36,
              letterSpacing: "-0.02em", color: palette.ink, margin: "0 0 12px 0",
            }}>
              {cat.title}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.inkSoft, margin: "0 0 32px 0", maxWidth: 480 }}>
              {cat.desc}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {cat.items.map(it => (
                <li key={it} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, color: palette.ink, fontWeight: 500,
                  padding: "12px 14px", background: palette.surface,
                  border: `1px solid ${palette.line}`, borderRadius: 999,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: palette.sageDeep, flexShrink: 0 }} />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Casos ──────────────────────────────────────────────────────────────────
function Casos({ palette }) {
  const casos = [
    { sector: "Industria alimentaria", proyecto: "Recuperación de calor en planta cárnica", mwh: 1840, eur: 79120, ubic: "Burgos", year: "2025" },
    { sector: "Hotelero", proyecto: "Aerotermia + envolvente · 4* costa", mwh: 412, eur: 17716, ubic: "Málaga", year: "2025" },
    { sector: "Comunidad propietarios", proyecto: "SATE + ventanas · bloque 84 viviendas", mwh: 286, eur: 12298, ubic: "Madrid", year: "2026" },
    { sector: "Logística", proyecto: "LED + variadores en centro 22.000 m²", mwh: 528, eur: 22704, ubic: "Zaragoza", year: "2025" },
  ];
  return (
    <section id="casos" style={{ background: palette.bg, padding: "120px 32px", borderTop: `1px solid ${palette.line}` }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ marginBottom: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 16 }}>
              04 — Casos liquidados
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 400,
              fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.03em",
              color: palette.ink, margin: 0,
            }}>
              Dinero <em style={{ color: palette.sageDeep, fontStyle: "italic" }}>real</em>,<br/>
              cobrado por clientes reales.
            </h2>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: palette.inkSoft, margin: 0, maxWidth: 460, justifySelf: "end" }}>
            Una muestra anonimizada de operaciones cerradas en los últimos 12 meses. Cifras netas
            tras comisión. Auditadas por verificador acreditado por ENAC.
          </p>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.ink}`, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.4fr 2fr 1fr 1.1fr 1fr 0.7fr", gap: 20,
            background: palette.ink, color: palette.bg,
            padding: "14px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
          }}>
            <span>Sector</span><span>Proyecto</span><span style={{ textAlign: "right" }}>MWh CAE</span>
            <span style={{ textAlign: "right" }}>Liquidación</span><span>Ubicación</span><span style={{ textAlign: "right" }}>Año</span>
          </div>
          {casos.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1.4fr 2fr 1fr 1.1fr 1fr 0.7fr", gap: 20,
              padding: "24px", alignItems: "center",
              borderBottom: i < casos.length - 1 ? `1px solid ${palette.line}` : "none",
              fontSize: 14, color: palette.ink,
            }}>
              <span style={{ fontWeight: 500 }}>{c.sector}</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, letterSpacing: "-0.01em" }}>{c.proyecto}</span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: palette.inkSoft }}>{c.mwh.toLocaleString("es-ES")}</span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {c.eur.toLocaleString("es-ES")} €
              </span>
              <span style={{ color: palette.inkSoft }}>{c.ubic}</span>
              <span style={{ textAlign: "right", color: palette.inkSoft, fontVariantNumeric: "tabular-nums" }}>{c.year}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: palette.inkSoft }}>
          <span>Mostrando 4 de 340+ operaciones · datos a marzo 2026</span>
          <a href="#" style={{ color: palette.ink, textDecoration: "none", fontWeight: 600, borderBottom: `1px solid ${palette.ink}`, paddingBottom: 2 }}>
            Solicitar dossier completo →
          </a>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ({ palette }) {
  const faqs = [
    { q: "¿Cuánto tarda el proceso de principio a fin?", a: "Entre 3 y 5 meses desde la firma del mandato hasta el ingreso. La fase más larga es la emisión por la CCAA (30-60 días). Mantenemos comunicación semanal contigo todo el camino." },
    { q: "¿Es compatible con subvenciones IDAE, Next Generation, etc.?", a: "Sí, en la mayoría de programas. La normativa permite acumular CAE con ayudas siempre que la suma no supere el coste subvencionable. Lo validamos en el análisis previo." },
    { q: "¿Qué pasa si la verificación falla?", a: "Repetimos sin coste adicional. Nuestro modelo es 100% éxito: si no cobras, no facturamos. Llevamos 340+ operaciones con tasa de aprobación del 97%." },
    { q: "¿Mi actuación es de hace 2 años, ¿sigue siendo elegible?", a: "Si finalizó después del 1 de enero de 2023 y tienes la documentación técnica, sí. Recuperamos retroactivamente con frecuencia." },
    { q: "¿Cómo se fija el precio del CAE?", a: "Lo determina la oferta-demanda entre Sujetos Obligados. A marzo de 2026 oscila entre 38-58 €/MWh. Cerramos precio cuando la oferta justifica vender." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" style={{ background: palette.surface, padding: "120px 32px", borderTop: `1px solid ${palette.line}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 16 }}>
            05 — Dudas frecuentes
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 400,
            fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.03em",
            color: palette.ink, margin: 0,
          }}>
            Respuestas <em style={{ color: palette.sageDeep, fontStyle: "italic" }}>directas</em>.
          </h2>
        </div>
        <div style={{ borderTop: `1px solid ${palette.ink}` }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${palette.line}` }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width: "100%", background: "none", border: "none", textAlign: "left",
                padding: "28px 0", cursor: "pointer", display: "flex",
                justifyContent: "space-between", alignItems: "center", gap: 24,
                color: palette.ink,
              }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, letterSpacing: "-0.015em", flex: 1 }}>
                  {f.q}
                </span>
                <span style={{
                  width: 32, height: 32, borderRadius: 999,
                  border: `1.5px solid ${palette.ink}`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, transition: "transform .25s",
                  transform: open === i ? "rotate(45deg)" : "none",
                  flexShrink: 0,
                }}>+</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 28, fontSize: 16, lineHeight: 1.6, color: palette.inkSoft, maxWidth: 760 }}>
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
    <section id="contacto" style={{ background: palette.ink, color: palette.bg, padding: "120px 32px 40px" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 80, paddingBottom: 80, borderBottom: `1px solid ${palette.bg}22` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: palette.sageDeep, textTransform: "uppercase", marginBottom: 24 }}>
              Empezar
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontWeight: 300,
              fontSize: "clamp(48px, 6vw, 96px)", lineHeight: 0.96, letterSpacing: "-0.035em",
              color: palette.bg, margin: 0,
            }}>
              ¿Tienes una<br/>
              actuación?<br/>
              <em style={{ color: palette.accent, fontStyle: "italic" }}>Pongámosla a trabajar.</em>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: `${palette.bg}AA`, margin: "32px 0 0 0", maxWidth: 540 }}>
              Análisis previo gratuito en 48h. Sin compromiso, sin letra pequeña.
              Si no cobras, no nos pagas.
            </p>
          </div>
          <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={(e) => e.preventDefault()}>
            {[
              { label: "Empresa", placeholder: "Razón social o autónomo" },
              { label: "Email profesional", placeholder: "tu@empresa.com" },
              { label: "Tipo de actuación", placeholder: "Ej. aerotermia, LED industrial..." },
            ].map(f => (
              <label key={f.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, color: `${palette.bg}99`, letterSpacing: "0.16em", textTransform: "uppercase" }}>{f.label}</span>
                <input placeholder={f.placeholder} style={{
                  background: "transparent", border: "none",
                  borderBottom: `1px solid ${palette.bg}44`,
                  padding: "10px 0", fontSize: 16, color: palette.bg,
                  outline: "none",
                }} />
              </label>
            ))}
            <button type="submit" style={{
              marginTop: 16, background: palette.accent, color: palette.ink,
              border: "none", padding: "18px", fontSize: 15, fontWeight: 700,
              letterSpacing: "0.01em", borderRadius: 999, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              Solicitar análisis gratuito →
            </button>
          </form>
        </div>

        <div style={{ paddingTop: 40, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, alignItems: "start" }}>
          <SumaCAELogo size={36} palette={{ ...palette, ink: palette.bg, sageDeep: palette.accent }} />
          {[
            { h: "Servicios", l: ["Análisis previo", "Verificación CAE", "Liquidación", "Auditoría energética"] },
            { h: "Empresa", l: ["Sobre nosotros", "Equipo", "Casos", "Prensa"] },
            { h: "Legal", l: ["Aviso legal", "Privacidad", "Cookies", "Compliance"] },
          ].map(c => (
            <div key={c.h}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", color: `${palette.bg}77`, textTransform: "uppercase", marginBottom: 16 }}>
                {c.h}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {c.l.map(it => <li key={it} style={{ fontSize: 14, color: palette.bg }}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${palette.bg}22`,
                      display: "flex", justifyContent: "space-between", fontSize: 12, color: `${palette.bg}77` }}>
          <span>© 2026 sumaCAE · Gestión integral de Certificados de Ahorro Energético</span>
          <span>Madrid · Barcelona · Bilbao</span>
        </div>
      </div>
    </section>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.sage;

  return (
    <div style={{ background: palette.bg, color: palette.ink, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>
      <Nav palette={palette} />
      <HeroCalculator palette={palette} />
      <QueEsCAE palette={palette} />
      <Proceso palette={palette} />
      <Actuaciones palette={palette} />
      <Casos palette={palette} />
      <FAQ palette={palette} />
      <CTAFooter palette={palette} />

      <TweaksPanel title="Tweaks · sumaCAE">
        <TweakSection label="Paleta" />
        <TweakRadio label="Tema" value={t.palette}
          options={[
            { value: "sage", label: "Sage" },
            { value: "noir", label: "Noir" },
            { value: "forest", label: "Bosque" },
          ]}
          onChange={(v) => setTweak("palette", v)} />
        <TweakSection label="Información" />
        <div style={{ fontSize: 11, color: "#5A5C50", padding: "4px 10px 8px", lineHeight: 1.5 }}>
          Activa <em>Tweaks</em> en la barra superior para cambiar paleta y variantes.
        </div>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
