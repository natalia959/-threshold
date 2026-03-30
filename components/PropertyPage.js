"use client"
import { useState, useEffect } from "react"

const ASK_PROMPTS = [
  "Does the kitchen receive morning light?",
  "What materials define this space?",
  "How does the light move throughout the day?",
  "What makes this home architecturally significant?",
  "How does the site shape the interior experience?",
]

const DEFAULT_PAIRINGS = [
  { name: "Eames Lounge Chair", designer: "Charles & Ray Eames", year: "1956", reason: "The original resolution of comfort and steel. It never needs explaining.", price: "$5,499", image: "" },
  { name: "Noguchi Akari 1A", designer: "Isamu Noguchi", year: "1951", reason: "Light as sculpture. Never overhead. Always exactly here.", price: "$390", image: "" },
  { name: "Honed Black Slate", designer: "Natural stone", year: "", reason: "Cool underfoot. Holds the heat of the afternoon into evening.", price: "$28/sqft", image: "" },
  { name: "Linen Trousers", designer: "Margaret Howell", year: "", reason: "Made for a life with more space in it.", price: "$340", image: "" },
]
const PAIRING_LABELS = ["Furniture", "Object", "Material", "Wardrobe"]

// ── Cinematic Ask Overlay ─────────────────────────────────────────────────────
function AskOverlay({ question, answer, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(6,6,6,0.92)",
        backdropFilter: "blur(28px) saturate(0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 48px",
        animation: "fadeIn 0.45s ease",
        cursor: "pointer",
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 40 }}>
          {question}
        </div>
        <div style={{ minHeight: 80 }}>
          {!answer
            ? <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 32, color: "rgba(255,255,255,0.18)" }}>—</p>
            : <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(22px, 2.8vw, 33px)", color: "rgba(255,255,255,0.88)", lineHeight: 1.68, animation: "fadeUp 0.6s ease" }}>
                {answer}
              </p>
          }
        </div>
        <button onClick={onClose} style={{ marginTop: 56, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
          Continue exploring ↓
        </button>
      </div>
    </div>
  )
}

// ── Related card ──────────────────────────────────────────────────────────────
function RelatedCard({ property }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={`/property/${property.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ borderRadius: 10, overflow: "hidden", background: "#111", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.25s ease, box-shadow 0.25s ease", boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.55)" : "none" }}>
        <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
          {property.hero_photo && <img src={property.hero_photo} alt={property.name} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.7s ease" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{property.location}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 18px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "#fff", lineHeight: 1.2, marginBottom: 3 }}>{property.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{property.architect}{property.year ? ` · ${property.year}` : ""}</div>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PropertyPage({ property, allProperties = [], onBack }) {
  const [askValue, setAskValue] = useState("")
  const [promptIdx, setPromptIdx] = useState(0)
  const [promptVisible, setPromptVisible] = useState(true)
  const [askOverlay, setAskOverlay] = useState(null)
  const [pairings, setPairings] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setPromptVisible(false)
      setTimeout(() => { setPromptIdx(i => (i + 1) % ASK_PROMPTS.length); setPromptVisible(true) }, 380)
    }, 4800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!property?.id) return
    fetch("/api/furniture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property }) })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.suggestions) && d.suggestions.length) setPairings(d.suggestions) })
      .catch(() => {})
  }, [property?.id])

  const handleAsk = async () => {
    const q = askValue.trim()
    if (!q) return
    setAskValue("")
    setAskOverlay({ question: q, answer: "" })
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, propertyId: property.id, history: [] }),
      })
      if (!res.body) throw new Error()
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const data = await res.json()
        setAskOverlay(prev => ({ ...prev, answer: data.response || "" }))
      } else {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          setAskOverlay(prev => ({ ...prev, answer: full }))
        }
      }
    } catch {
      setAskOverlay(prev => ({ ...prev, answer: "The house is quiet right now." }))
    }
  }

  if (!property) return null

  const rawPhotos = (property.photos || []).filter(Boolean)
  const photos = property.hero_photo && !rawPhotos.includes(property.hero_photo)
    ? [property.hero_photo, ...rawPhotos]
    : rawPhotos.length ? rawPhotos : [property.hero_photo].filter(Boolean)

  const tags = [...(property.idea_tags || []), property.landscape_tag].filter(Boolean)
  const editorialParagraphs = typeof property.editorial === "string"
    ? property.editorial.split(/\n\n+/).filter(Boolean)
    : Array.isArray(property.editorial) ? property.editorial : []
  const displayPairings = (pairings || DEFAULT_PAIRINGS).slice(0, 4)
  const related = (allProperties || []).filter(p => p.id !== property.id).slice(0, 3)

  return (
    <div style={{ background: "#0c0c0c", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scrollPulse { 0%,100%{opacity:0.18;transform:scaleY(1)} 50%{opacity:0.45;transform:scaleY(1.18)} }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      {askOverlay && <AskOverlay question={askOverlay.question} answer={askOverlay.answer} onClose={() => setAskOverlay(null)} />}

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {photos[0]
          ? <img src={photos[0]} alt={property.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, background: "#1a1a20" }} />
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,6,6,0.96) 0%, rgba(6,6,6,0.2) 38%, transparent 62%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6,6,6,0.38) 0%, transparent 20%)" }} />

        <nav style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <button onClick={onBack || (() => window.history.back())} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ fontFamily: "var(--font-logo), sans-serif", fontWeight: 500, letterSpacing: "0.04em", fontSize: 14, color: "#F7F4EC" }}>THRESHOLD</span>
          </button>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setSaved(s => !s)} style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 40, padding: "8px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: saved ? "#F7F4EC" : "rgba(255,255,255,0.48)", transition: "all 0.2s" }}>
              {saved ? "Saved ✦" : "Save Estate"}
            </button>
            <button style={{ background: "#F7F4EC", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "9px 24px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500 }}>
              Request a Tour
            </button>
          </div>
        </nav>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 48px 52px", animation: "fadeUp 0.9s ease 0.15s both" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
            <div style={{ maxWidth: 720 }}>
              {property.location && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.36)", textTransform: "uppercase", marginBottom: 16 }}>{property.location}</div>}
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 300, color: "#F7F4EC", lineHeight: 1.0, marginBottom: 14 }}>{property.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                {property.architect && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.36)" }}>{property.architect}{property.year ? ` · ${property.year}` : ""}</span>}
                {property.price && <>
                  <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.16)", display: "inline-block" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.48)", fontWeight: 500 }}>{property.price}</span>
                </>}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.22)", marginBottom: 10, lineHeight: 1.5 }}>Private materials available</p>
              <button style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 40, padding: "9px 22px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.07em", color: "rgba(255,255,255,0.38)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)" }}>
                Join Threshold Reserved →
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.9)", margin: "0 auto", animation: "scrollPulse 2.4s ease-in-out infinite", transformOrigin: "top" }} />
        </div>
      </section>

      {/* ═══ THEMES — inline whisper ══════════════════════════════════════════ */}
      {tags.length > 0 && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 48px 0" }}>
          {tags.map((tag, i) => (
            <span key={tag}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{tag}</span>
              {i < tags.length - 1 && <span style={{ margin: "0 14px", color: "rgba(255,255,255,0.1)", fontSize: 10 }}>·</span>}
            </span>
          ))}
        </div>
      )}

      {/* ═══ EDITORIAL STORY ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 48px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0 72px" }}>

          {/* Left: sticky metadata */}
          <div>
            <div style={{ position: "sticky", top: 48 }}>
              {property.architect && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Architect</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.62)" }}>{property.architect}</div>
                  {property.year && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 4 }}>{property.year}</div>}
                </div>
              )}
              {property.location && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Location</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.62)", lineHeight: 1.4 }}>{property.location}</div>
                </div>
              )}
              {(property.bedrooms || property.sqft) && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Scale</div>
                  {property.bedrooms && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.62)" }}>{property.bedrooms} bed · {property.bathrooms} bath</div>}
                  {property.sqft && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 4 }}>{Number(property.sqft).toLocaleString()} sqft</div>}
                  {property.lot_size && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2 }}>{property.lot_size}</div>}
                </div>
              )}
              {property.price && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Price</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "rgba(255,255,255,0.62)" }}>{property.price}</div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button style={{ padding: "10px 0", background: "#F7F4EC", color: "#0c0c0c", border: "none", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.07em", cursor: "pointer" }}>Request a Tour</button>
                <button onClick={() => setSaved(s => !s)} style={{ padding: "10px 0", background: "none", color: saved ? "#F7F4EC" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.07em", cursor: "pointer", transition: "all 0.2s" }}>
                  {saved ? "Saved ✦" : "Save Estate"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: editorial narrative */}
          <div>
            {property.significance && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(21px, 2vw, 27px)", fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.58, marginBottom: 36 }}>
                {property.significance}
              </p>
            )}
            {editorialParagraphs.map((para, i) => (
              <p key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "rgba(255,255,255,0.44)", lineHeight: 1.84, marginBottom: 22 }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PHOTO BREAK — full bleed ═════════════════════════════════════════ */}
      {photos.length > 1 && (
        <section style={{ marginTop: 80 }}>
          <div style={{ display: "grid", gridTemplateColumns: photos.length >= 3 ? "1.4fr 1fr" : "1fr", gap: 3 }}>
            <div style={{ height: 580, overflow: "hidden" }}>
              <img src={photos[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {photos[2] && <div style={{ height: 580, overflow: "hidden" }}><img src={photos[2]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
          </div>
        </section>
      )}

      {/* ═══ ARCHITECT & SITE CONTEXT ═════════════════════════════════════════ */}
      {(property.architect_context || property.site_context) && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0 72px" }}>
            <div />
            <div>
              {property.architect_context && (
                <div style={{ marginBottom: 44 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 18 }}>The Architect</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.84 }}>{property.architect_context}</p>
                </div>
              )}
              {property.site_context && (
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 18 }}>The Site</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.84 }}>{property.site_context}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ MORE PHOTOS ══════════════════════════════════════════════════════ */}
      {photos.length > 3 && (
        <section style={{ padding: "80px 48px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
            {photos.slice(3, 6).map((photo, i) => (
              <div key={i} style={{ height: 340, overflow: "hidden" }}>
                <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ THRESHOLD RESERVED CTA ═══════════════════════════════════════════ */}
      <section style={{ margin: "80px 48px 0", borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photos[1] && <img src={photos[1]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.18) saturate(0.3)", transform: "scale(1.04)" }} />}
        <div style={{ position: "absolute", inset: 0, background: photos[1] ? "rgba(6,6,6,0.62)" : "#0e0e0e" }} />
        <div style={{ position: "relative", textAlign: "center", padding: "64px 48px", maxWidth: 560 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.24em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 22 }}>Threshold Reserved</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 300, color: "#F7F4EC", lineHeight: 1.38, marginBottom: 14 }}>
            Access full architectural details,<br />private materials, and deeper context.
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.28)", marginBottom: 36, lineHeight: 1.65 }}>
            A private membership for those who take architecture seriously.
          </p>
          <button style={{ background: "#F7F4EC", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "12px 36px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.04em" }}>
            Join Threshold Reserved
          </button>
        </div>
      </section>

      {/* ═══ ASK THE HOUSE ════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 48px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0 72px", alignItems: "start" }}>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Understand</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.42)", lineHeight: 1.25 }}>Ask the<br />House</div>
          </div>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.26)", lineHeight: 1.7, marginBottom: 36 }}>
              Quiet architectural intelligence. What would you like to understand about this space?
            </p>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.11)", paddingBottom: 16, display: "flex", alignItems: "flex-end", gap: 20 }}>
              <div style={{ flex: 1, position: "relative" }}>
                {!askValue && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: "rgba(255,255,255,0.17)", opacity: promptVisible ? 1 : 0, transform: promptVisible ? "translateY(0)" : "translateY(-4px)", transition: "opacity 0.38s ease, transform 0.38s ease", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ASK_PROMPTS[promptIdx]}
                  </div>
                )}
                <input
                  value={askValue}
                  onChange={e => setAskValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askValue.trim() && handleAsk()}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "#fff" }}
                />
              </div>
              {askValue && (
                <button onClick={handleAsk}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", flexShrink: 0, paddingBottom: 2, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}>
                  Ask →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IN RESIDENCE ═════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 48px 0" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 72 }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0 72px" }}>
            <div>
              <div style={{ position: "sticky", top: 48 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 10 }}>Curated</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.42)", lineHeight: 1.25 }}>In<br />Residence</div>
              </div>
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.26)", lineHeight: 1.7, marginBottom: 56 }}>
                Objects, materials, and pieces that belong in the world of this home.
              </p>
              <div>
                {displayPairings.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "68px 1fr", gap: 28, alignItems: "start", paddingBottom: i < displayPairings.length - 1 ? 48 : 0, marginBottom: i < displayPairings.length - 1 ? 48 : 0, borderBottom: i < displayPairings.length - 1 ? "1px solid rgba(255,255,255,0.055)" : "none" }}>
                    <div style={{ width: 68, height: 68, borderRadius: 6, overflow: "hidden", background: ["#1c1c22","#1e201c","#1c201e","#201a1c"][i % 4], flexShrink: 0 }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 8 }}>{item.category || PAIRING_LABELS[i % 4]}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, color: "rgba(255,255,255,0.72)", marginBottom: 5 }}>{item.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>{item.designer}{item.year ? ` · ${item.year}` : ""}</div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.36)", lineHeight: 1.72 }}>{item.reason}</p>
                      {item.price && (
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{item.price}</span>
                          {item.url && item.url !== "#" && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.18)"}
                            >View →</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTINUE EXPLORING ═══════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 48px 120px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 72 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, color: "rgba(255,255,255,0.45)", marginBottom: 44 }}>
              You may also be drawn to
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {related.map(p => <RelatedCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
