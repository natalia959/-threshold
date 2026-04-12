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
  const [displayedInsight, setDisplayedInsight] = useState("")
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
    fetch("/api/furniture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property, searchQuery }) })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.suggestions) && d.suggestions.length) setPairings(d.suggestions) })
      .catch(() => {})
  }, [property?.id])

  // Typewriter effect: step displayedInsight toward insight one char at a time
  useEffect(() => {
    if (insight.length <= displayedInsight.length) return
    const t = setTimeout(() => {
      setDisplayedInsight(insight.slice(0, displayedInsight.length + 1))
    }, 18)
    return () => clearTimeout(t)
  }, [insight, displayedInsight])

  // Auto-stream: why this house, then a follow-up question
  useEffect(() => {
    if (!property?.id) return
    setInsight("")
    setDisplayedInsight("")
    setFollowUp("")
    setInsightDone(false)
    const editorial = [property.significance, property.editorial].filter(Boolean).join(" ").slice(0, 300)
    const prompt = searchQuery
      ? `You're a warm, knowledgeable guide — like a friend who knows this house intimately. The visitor was looking for: "${searchQuery}". Without repeating any of this existing description: "${editorial}" — in 2 sentences tell them something specific and personal about why ${property.name} would actually feel right for them. Think about light, texture, morning routines, the sensation of arriving. Make it feel like insider knowledge. Then on a new line write one short, natural follow-up question (starting with "And " or "Would " or "Does ") — the kind a good friend would ask.`
      : `You're a warm, knowledgeable guide — like a friend who knows this house intimately. Without repeating any of this existing description: "${editorial}" — in 2 sentences tell them something specific and personal about what it's actually like to live in ${property.name}. Think about light at different hours, the materiality underfoot, the feeling of the place. Then on a new line write one short, natural follow-up question that invites them to imagine themselves there.`
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

  const galleryPhotos = photos.slice(1).length > 0
    ? photos.slice(1)
    : [null, null, null]

  const tags = [...(property.idea_tags || []), property.landscape_tag].filter(Boolean)
  const editorialParagraphs = typeof property.editorial === "string"
    ? property.editorial.split(/\n\n+/).filter(Boolean)
    : Array.isArray(property.editorial) ? property.editorial : []
  const displayPairings = (pairings || DEFAULT_PAIRINGS).slice(0, 10)
  const related = (allProperties || []).filter(p => p.id !== property.id).slice(0, 3)

  return (
    <div style={{ background: "#131313", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scrollPulse { 0%,100%{opacity:0.18;transform:scaleY(1)} 50%{opacity:0.45;transform:scaleY(1.18)} }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      {askOverlay && <AskOverlay question={askOverlay.question} answer={askOverlay.answer} onClose={() => setAskOverlay(null)} />}

      {/* ═══ NAV ═════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#131313",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 52,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="/" style={{ display: "block", lineHeight: 0 }}>
            <img src="/threshold-logo.png" alt="Threshold" style={{ height: 29, width: "auto", display: "block" }} />
          </a>
          <a
            href="/explore"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "#F7F4EC", fontWeight: 600, textTransform: "uppercase", textDecoration: "none" }}
          >Explore</a>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setSaved(s => !s)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 40, padding: "6px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: saved ? "#F7F4EC" : "rgba(255,255,255,0.36)", transition: "all 0.2s" }}>
            {saved ? "Saved ✦" : "Save Estate"}
          </button>
          <button style={{ background: "#F7F4EC", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "7px 22px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500 }}>
            Request a Tour
          </button>
        </div>
      </nav>

      {/* ═══ MAIN 3-COLUMN ═══════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 196px", alignItems: "start" }}>

        {/* LEFT ─ all text, scrolls with page, text pushed to bottom */}
        <div style={{ padding: "75vh 36px 80px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Location */}
          {property.location && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.42)", textTransform: "uppercase", marginBottom: 16 }}>{property.location}</div>
          )}

          {/* Name */}
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(16px, 1.4vw, 22px)", fontWeight: 400, color: "#F7F4EC", lineHeight: 1.18, marginBottom: 12, letterSpacing: "-0.01em" }}>{property.name}</h1>

          {/* Architect · Year */}
          {property.architect && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.48)", marginBottom: 6 }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </div>
          )}

          {/* Price */}
          {property.price && (
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "rgba(255,255,255,0.42)", marginBottom: 24 }}>{property.price}</div>
          )}

          {/* Scale */}
          {(property.bedrooms || property.sqft) && (
            <div style={{ marginBottom: 24 }}>
              {property.bedrooms && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.44)" }}>{property.bedrooms} bed · {property.bathrooms} bath</div>}
              {property.sqft && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 12 }}>{Number(property.sqft).toLocaleString()} sqft{property.lot_size ? ` · ${property.lot_size}` : ""}</div>}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ marginBottom: 36, display: "flex", flexWrap: "wrap", gap: "5px 12px" }}>
              {tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.13em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>{tag}</span>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 36 }} />

          {/* Significance */}
          {property.significance && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: 24 }}>
              {property.significance}
            </p>
          )}

          {/* Editorial */}
          {editorialParagraphs.map((para, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.78, marginBottom: 14 }}>{para}</p>
          ))}

          {/* Architect context */}
          {property.architect_context && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>The Architect</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.78 }}>{property.architect_context}</p>
            </div>
          )}

          {/* Site context */}
          {property.site_context && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>The Site</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.78 }}>{property.site_context}</p>
            </div>
          )}

          {/* Sticky block: insight + ask + CTA */}
          <div style={{ position: "sticky", top: 52 }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "44px 0 32px" }} />

          {/* Why this house — streaming typewriter */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 12 }}>
              Why this house
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.72 }}>
              {displayedInsight}
              {displayedInsight.length < insight.length && insight && (
                <span style={{ display: "inline-block", width: 1, height: "0.85em", background: "rgba(255,255,255,0.38)", marginLeft: 2, verticalAlign: "middle", animation: "scrollPulse 1s ease-in-out infinite" }} />
              )}
              {!insight && <span style={{ color: "rgba(255,255,255,0.1)" }}>—</span>}
            </p>
          </div>

          {/* Follow-up question */}
          {followUp && (
            <div style={{ marginBottom: 32, animation: "fadeUp 0.6s ease both" }}>
              <button onClick={() => { setAskValue(followUp); setAskFocused(true) }}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.24)", lineHeight: 1.65, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.52)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.24)"}
                >{followUp}</p>
              </button>
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: 22 }} />

          {/* Ask the House */}
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 12 }}>
            Ask the House
          </div>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, position: "relative", marginBottom: 10 }}>
            {!askValue && !askFocused && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.16)", opacity: promptVisible ? 1 : 0, transition: "opacity 0.38s ease", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {ASK_PROMPTS[promptIdx]}
              </div>
            )}
            <input
              value={askValue}
              onChange={e => setAskValue(e.target.value)}
              onFocus={() => setAskFocused(true)}
              onBlur={() => setAskFocused(false)}
              onKeyDown={e => e.key === "Enter" && askValue.trim() && handleAsk()}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#fff" }}
            />
          </div>
          {askValue && (
            <button onClick={handleAsk}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.26)", textTransform: "uppercase", padding: 0, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.26)"}
            >Ask →</button>
          )}

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 44 }}>
            <button style={{ padding: "11px 0", background: "#F7F4EC", color: "#0c0c0c", border: "none", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer" }}>Request a Tour</button>
            <button onClick={() => setSaved(s => !s)} style={{ padding: "11px 0", background: "none", color: saved ? "#F7F4EC" : "rgba(255,255,255,0.36)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s" }}>
              {saved ? "Saved ✦" : "Save Estate"}
            </button>
          </div>
          </div>{/* end sticky block */}
        </div>

        {/* CENTER ─ hero image then gallery, scrolls with page */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Hero */}
          {photos[0]
            ? <img src={photos[0]} alt={property.name} style={{ width: "100%", display: "block", height: "calc(100vh - 52px)", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "calc(100vh - 52px)", background: "#1a1a20" }} />
          }
          {/* Gallery */}
          {galleryPhotos.map((photo, i) =>
            photo
              ? <img key={i} src={photo} alt="" style={{ width: "100%", display: "block", height: "auto", marginTop: 12 }} />
              : <div key={i} style={{ width: "100%", aspectRatio: "3/2", marginTop: 3, background: `radial-gradient(ellipse at ${40 + i * 15}% ${50 + i * 10}%, #1e1a14 0%, #0c0b09 100%)` }} />
          )}
        </div>

        {/* RIGHT ─ object thumbnails, sticky + independently scrollable */}
        <div style={{
          position: "sticky", top: 52,
          maxHeight: "calc(100vh - 52px)", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 24px",
        }}>
          {displayPairings.map((item, i) => (
            <div key={i} style={{ position: "relative", overflow: "hidden", borderRadius: 2 }}
              onMouseEnter={e => e.currentTarget.querySelector(".obj-overlay").style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.querySelector(".obj-overlay").style.opacity = "0"}
            >
              {/* Thumbnail — portrait rectangle */}
              <div style={{ width: "100%", aspectRatio: "3/4", background: PAIRING_PLACEHOLDERS[i % 4], overflow: "hidden" }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }} />}
              </div>
              {/* Hover overlay */}
              <div className="obj-overlay" style={{
                position: "absolute", inset: 0,
                background: "rgba(10,9,8,0.88)",
                backdropFilter: "blur(4px)",
                opacity: 0,
                transition: "opacity 0.22s ease",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                padding: "10px 10px 12px",
              }}>
                {item.designer && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginBottom: 2 }}>{item.designer}</div>
                )}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.2, marginBottom: 3 }}>{item.name}</div>
                {item.reason && (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 10, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ═══ CONTINUE EXPLORING ═══════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px 120px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 60 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "rgba(255,255,255,0.38)", marginBottom: 40 }}>
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
