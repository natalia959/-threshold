"use client"
import { useState, useEffect } from "react"

const ASK_PROMPTS = [
  "What's the flooring material in the living room?",
  "How far to Erewhon?",
  "What was the last renovation?",
  "Does the main bedroom get morning light?",
  "What's the cell reception like up here?",
  "How old is the roof?",
  "Is there a guest house?",
  "What's the drive to the beach?",
  "Any history of fire risk on this lot?",
  "What are the utility costs like?",
]

const DEFAULT_PAIRINGS = [
  { name: "Eames Lounge Chair", designer: "Charles & Ray Eames", year: "1956", category: "Seating",  reason: "Chosen to face the view, not the room.", price: "$5,499", image: "" },
  { name: "Noguchi Akari 1A",   designer: "Isamu Noguchi",       year: "1951", category: "Lighting", reason: "Selected to soften the concrete at night.", price: "$390",   image: "" },
  { name: "Honed Black Slate",  designer: "Natural stone",        year: "",     category: "Material", reason: "Chosen to anchor the floor to the site.", price: "$28/sqft", image: "" },
  { name: "Linen Trousers",     designer: "Margaret Howell",      year: "",     category: "Wardrobe", reason: "Picked for mornings with no agenda.",    price: "$340",    image: "" },
]

// Subtle dark gradients used for object image placeholders
const PAIRING_PLACEHOLDERS = [
  "radial-gradient(ellipse at 55% 40%, #2a1f0e 0%, #0f0c08 100%)",
  "radial-gradient(ellipse at 40% 60%, #1a1e22 0%, #0c0e10 100%)",
  "radial-gradient(ellipse at 50% 35%, #1c1a18 0%, #0d0c0b 100%)",
  "radial-gradient(ellipse at 60% 55%, #1e1812 0%, #0e0b09 100%)",
]

// ── Editorial Ask Overlay ─────────────────────────────────────────────────────
function AskOverlay({ question, answer, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(6,6,6,0.94)",
        backdropFilter: "blur(24px) saturate(0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 48px",
        animation: "fadeIn 0.4s ease",
        cursor: "pointer",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 860, display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 64, alignItems: "start", cursor: "default" }}
      >
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: 14 }}>You asked</div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>
            {question}
          </p>
          <button
            onClick={onClose}
            style={{ marginTop: 36, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", padding: 0 }}
          >
            ← Back
          </button>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 48 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginBottom: 14 }}>The house</div>
          {!answer
            ? <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.2)", lineHeight: 1.75 }}>—</p>
            : <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.82, animation: "fadeUp 0.5s ease" }}>
                {answer}
              </p>
          }
        </div>
      </div>
    </div>
  )
}

// ── Related card ──────────────────────────────────────────────────────────────
function RelatedCard({ property }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={`/property/${property.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderRadius: 10, overflow: "hidden", background: "#111", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.25s ease" }}
      >
        <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
          {property.hero_photo
            ? <img src={property.hero_photo} alt={property.name} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.7s ease" }} />
            : <div style={{ width: "100%", height: "100%", background: "#1a1814" }} />
          }
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
export default function PropertyPage({ property, allProperties = [], onBack, searchQuery = "" }) {
  const [askValue, setAskValue]         = useState("")
  const [promptIdx, setPromptIdx]       = useState(0)
  const [promptVisible, setPromptVisible] = useState(true)
  const [askFocused, setAskFocused]     = useState(false)
  const [askOverlay, setAskOverlay]     = useState(null)
  const [pairings, setPairings]         = useState(null)
  const [saved, setSaved]               = useState(false)
  const [insight, setInsight]           = useState("")
  const [insightDone, setInsightDone]   = useState(false)
  const [followUp, setFollowUp]         = useState("")

  useEffect(() => {
    if (askFocused) return
    const t = setInterval(() => {
      setPromptVisible(false)
      setTimeout(() => { setPromptIdx(i => (i + 1) % ASK_PROMPTS.length); setPromptVisible(true) }, 380)
    }, 4800)
    return () => clearInterval(t)
  }, [askFocused])

  useEffect(() => {
    if (!property?.id) return
    // Use manually curated items if they exist, otherwise call AI
    if (Array.isArray(property.in_residence) && property.in_residence.length > 0) {
      setPairings(property.in_residence)
      return
    }
    fetch("/api/furniture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property }) })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.suggestions) && d.suggestions.length) setPairings(d.suggestions) })
      .catch(() => {})
  }, [property?.id])

  // Auto-stream: why this house, then a follow-up question
  useEffect(() => {
    if (!property?.id) return
    const prompt = searchQuery
      ? `The visitor searched for: "${searchQuery}". In 2 sentences explain specifically why ${property.name} by ${property.architect} is the best match for what they're looking for — connect their search directly to what this house offers. Be specific and evocative. Then on a new line write one short conversational follow-up question (starting with "And " or "Would " or "Does ") to keep the conversation going.`
      : `In 2 sentences explain what makes ${property.name} emotionally and architecturally compelling — be specific and evocative, not generic. Then on a new line write one short follow-up question (starting with "And " or "Would ") that invites the visitor to explore further.`
    fetch("/api/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: prompt, propertyId: property.id, history: [] }),
    }).then(async res => {
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setInsight(full)
      }
      // Extract follow-up question (last line starting with And/Would/Does)
      const lines = full.split("\n").map(l => l.trim()).filter(Boolean)
      const q = lines.findLast?.(l => /^(And |Would |Does |What )/i.test(l)) || ""
      const body = q ? full.slice(0, full.lastIndexOf(q)).trim() : full
      setInsight(body)
      setFollowUp(q)
      setInsightDone(true)
    }).catch(() => {})
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

  // Gallery photos = everything after the hero (index 1+)
  const galleryPhotos = photos.slice(1).length > 0
    ? photos.slice(1)
    : [null, null, null] // show 3 placeholders if no extra photos

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
              <button
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 40, padding: "9px 22px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.07em", color: "rgba(255,255,255,0.38)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)" }}
              >
                Join Threshold Reserved →
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.9)", margin: "0 auto", animation: "scrollPulse 2.4s ease-in-out infinite", transformOrigin: "top" }} />
        </div>
      </section>

      {/* ═══ THEMES ══════════════════════════════════════════════════════════ */}
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

      {/* ═══ EDITORIAL ════════════════════════════════════════════════════════ */}
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

          {/* Right: editorial narrative + context */}
          <div>
            {property.significance && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(21px, 2vw, 27px)", fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.58, marginBottom: 36 }}>
                {property.significance}
              </p>
            )}
            {editorialParagraphs.map((para, i) => (
              <p key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "rgba(255,255,255,0.44)", lineHeight: 1.84, marginBottom: 22 }}>{para}</p>
            ))}
            {property.architect_context && (
              <div style={{ marginTop: 44 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 18 }}>The Architect</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.84 }}>{property.architect_context}</p>
              </div>
            )}
            {property.site_context && (
              <div style={{ marginTop: 36 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 18 }}>The Site</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.84 }}>{property.site_context}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ THREE-COLUMN: INSIGHT | GALLERY | IN RESIDENCE ═════════════════ */}
      <section style={{ margin: "80px 0 0", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "275px 1fr 275px", gap: "0 40px", alignItems: "start" }}>

          {/* LEFT — Animated insight + Ask the House */}
          <div style={{ position: "sticky", top: 80 }}>

            {/* Why this house */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 14 }}>
                Why this house
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
                {insight}
                {!insightDone && insight && (
                  <span style={{ display: "inline-block", width: 1, height: "0.9em", background: "rgba(255,255,255,0.4)", marginLeft: 2, verticalAlign: "middle", animation: "scrollPulse 1s ease-in-out infinite" }} />
                )}
                {!insight && (
                  <span style={{ color: "rgba(255,255,255,0.12)" }}>—</span>
                )}
              </p>
            </div>

            {/* Follow-up question — appears after streaming, clickable */}
            {followUp && (
              <div style={{ marginBottom: 36, animation: "fadeUp 0.6s ease both" }}>
                <button
                  onClick={() => { setAskValue(followUp); setAskFocused(true) }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                >
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.28)", lineHeight: 1.65, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
                  >
                    {followUp}
                  </p>
                </button>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: 24 }} />

            {/* Ask the House input */}
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.17)", textTransform: "uppercase", marginBottom: 14 }}>
              Ask the House
            </div>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.11)", paddingBottom: 12, position: "relative", marginBottom: 10 }}>
              {!askValue && !askFocused && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.17)", opacity: promptVisible ? 1 : 0, transition: "opacity 0.38s ease", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ASK_PROMPTS[promptIdx]}
                </div>
              )}
              <input
                value={askValue}
                onChange={e => setAskValue(e.target.value)}
                onFocus={() => setAskFocused(true)}
                onBlur={() => setAskFocused(false)}
                onKeyDown={e => e.key === "Enter" && askValue.trim() && handleAsk()}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#fff" }}
              />
            </div>
            {askValue && (
              <button onClick={handleAsk}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
              >Ask →</button>
            )}
          </div>

          {/* CENTER — Gallery photos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {galleryPhotos.map((photo, i) =>
              photo
                ? <div key={i} style={{ width: "100%", overflow: "hidden" }}>
                    <img src={photo} alt="" style={{ width: "100%", display: "block", aspectRatio: "3/2", objectFit: "cover" }} />
                  </div>
                : <div key={i} style={{ width: "100%", aspectRatio: "3/2", background: `radial-gradient(ellipse at ${40 + i * 15}% ${50 + i * 10}%, #1e1a14 0%, #0c0b09 100%)` }} />
            )}
          </div>

          {/* RIGHT — In Residence objects */}
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 40, maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}>
            {displayPairings.map((item, i) => (
              <div key={i}>
                {/* Object image */}
                <div style={{
                  width: "100%",
                  aspectRatio: "5/4",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: PAIRING_PLACEHOLDERS[i % 4],
                  marginBottom: 14,
                  position: "relative",
                }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(240,235,225,0.03) 0%, transparent 60%)" }} />
                  }
                </div>

                {/* Designer */}
                {item.designer && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 3 }}>
                    {item.designer}
                  </div>
                )}

                {/* Category */}
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.13)", textTransform: "uppercase", marginBottom: 10 }}>
                  {item.category}
                </div>

                {/* Name */}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,0.72)", lineHeight: 1.2, marginBottom: 8 }}>
                  {item.name}
                </div>

                {/* Why it belongs */}
                {item.reason && (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.28)", lineHeight: 1.65, marginBottom: 10 }}>
                    {item.reason}
                  </p>
                )}

                {/* Price + link */}
                {item.price && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{item.price}</span>
                    {item.url && item.url !== "#" && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.18)"}
                      >View →</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ THRESHOLD RESERVED CTA ══════════════════════════════════════════ */}
      <section style={{ margin: "96px 48px 0", borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
