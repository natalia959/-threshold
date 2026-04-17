"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import PropertyPage from "./PropertyPage"

// ── Streaming interpretation text ─────────────────────────────────────────
function AnimatedText({ text }) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    if (!text) { setDisplayed(""); return }
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 18)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span>
      {displayed}
      {displayed.length < (text?.length || 0) && (
        <span style={{ display: "inline-block", width: 1, height: "0.85em", background: "rgba(255,255,255,0.3)", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 0.8s step-end infinite" }} />
      )}
    </span>
  )
}

// ── Derive relevant tags from returned properties ─────────────────────────
function getRelevantTags(results) {
  const counts = {}
  const all = [...(results?.matched || []), ...(results?.alsoLove || [])]
  all.forEach(item => {
    const p = item?.property
    if (!p) return
    ;(p.idea_tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    if (p.landscape_tag) counts[p.landscape_tag] = (counts[p.landscape_tag] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)
}

// ── Pick the best hero image for a result item ────────────────────────────
function resolveHeroImage(item) {
  const property = item?.property
  if (!property) return null
  if (item.heroPhotoIndex != null && property.photos?.[item.heroPhotoIndex]) {
    return property.photos[item.heroPhotoIndex]
  }
  return property.hero_photo || property.image || null
}

// ── Single large result card (1 result or first featured) ─────────────────
function HeroCard({ item, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const property = item?.property
  if (!property) return null
  const heroImage = resolveHeroImage(item)

  return (
    <div
      onClick={() => onSelect(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        cursor: "pointer", background: "#111",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.6)" : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ position: "relative", height: 560 }}>
        {heroImage && (
          <img
            src={heroImage}
            alt={property.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.025)" : "scale(1)",
              transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: 24, right: 24, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
          {property.location}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 36px" }}>
          {item.reason && (
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.6, maxWidth: 520 }}>
              {item.reason}
            </div>
          )}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 8 }}>
            {property.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </span>
            {property.price && (
              <>
                <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)", display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                  {property.price}
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 32, right: 36,
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }}>View →</div>
      </div>
    </div>
  )
}

// ── Standard editorial card ────────────────────────────────────────────────
function EditorialCard({ item, onSelect, tall = false }) {
  const [hovered, setHovered] = useState(false)
  const property = item?.property
  if (!property) return null
  const imgH = tall ? 480 : 340
  const heroImage = resolveHeroImage(item)

  return (
    <div
      onClick={() => onSelect(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "#111",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.5)" : "0 2px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ position: "relative", height: imgH }}>
        {heroImage && (
          <img
            src={heroImage}
            alt={property.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 52%)" }} />
        <div style={{ position: "absolute", top: 16, right: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
          {property.location}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 22px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#fff", lineHeight: 1.15, marginBottom: 5 }}>
            {property.name}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            {property.architect}{property.year ? ` · ${property.year}` : ""}
            {property.price && <span style={{ marginLeft: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{property.price}</span>}
          </div>
        </div>
      </div>
      {item.reason && (
        <div style={{ padding: "14px 22px 18px", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>
            {item.reason}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Skeleton states ────────────────────────────────────────────────────────
function SkeletonHero() {
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "#141414", height: 560, animation: "pulse 1.6s ease-in-out infinite" }} />
  )
}
function SkeletonCard({ height = 340 }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: "#141414", animation: "pulse 1.6s ease-in-out infinite" }}>
      <div style={{ height }} />
      <div style={{ padding: "16px 22px" }}>
        <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 4, width: "65%", marginBottom: 8 }} />
        <div style={{ height: 10, background: "rgba(255,255,255,0.03)", borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ResultsPage({ query, results, searching, onSearch, onBack, onSignUp, onSignIn, user, searchValue, setSearchValue }) {
  const [activeFilters, setActiveFilters] = useState([])
  const [focused, setFocused] = useState(false)
  const router = useRouter()

  const selectProperty = (property) => {
    const url = query ? `/${property.id}?q=${encodeURIComponent(query)}` : `/${property.id}`
    router.push(url)
  }

  const toggleFilter = f => setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  const relevantTags = results ? getRelevantTags(results) : []

  // Filter matched by active tags
  const matched = (results?.matched || []).filter(item => {
    if (!activeFilters.length) return true
    const p = item?.property
    if (!p) return false
    const tags = [...(p.idea_tags || []), p.landscape_tag].filter(Boolean)
    return activeFilters.some(f => tags.includes(f))
  })

  const alsoLove = results?.alsoLove || []
  const hasResults = matched.length > 0

  // Format query as editorial headline
  const headline = query ? query.charAt(0).toUpperCase() + query.slice(1) : ""

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.25} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "grid", gridTemplateColumns: "180px 1fr 180px",
        alignItems: "center", gap: 24,
        padding: "0 40px", height: 60,
        background: "rgba(12,12,12,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
          <img src="/threshold-logo.png" alt="Threshold" style={{ height: 44, width: "auto", display: "block" }} />
        </button>
        <div style={{ position: "relative", background: "rgba(255,255,255,0.06)", borderRadius: 50, display: "flex", alignItems: "center", padding: "0 18px", height: 38 }}>
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === "Enter" && searchValue.trim() && onSearch(searchValue)}
            placeholder="Search Threshold..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff" }}
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <button onClick={user ? () => window.location.href = "/dashboard" : onSignIn} style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "8px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {user ? "My Portal" : "Sign In"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "100px 48px 100px" }}>

        {/* ── Editorial header ── */}
        <div style={{ marginBottom: 56, animation: "fadeUp 0.5s ease" }}>

          {/* Query as headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 5vw, 68px)",
            fontWeight: 300, lineHeight: 1.05,
            color: "#fff", marginBottom: 20,
          }}>
            {searching ? <span style={{ opacity: 0.4 }}>{headline}</span> : headline}
          </h1>

          {/* Interpretive line */}
          {(searching || results?.interpretation) && (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "clamp(17px, 1.6vw, 21px)",
              color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 580,
              marginBottom: relevantTags.length ? 36 : 0,
            }}>
              {searching && !results?.interpretation
                ? <span style={{ opacity: 0.4 }}>Interpreting your search…</span>
                : <AnimatedText text={results?.interpretation} />
              }
            </p>
          )}

          {/* Refine this perspective */}
          {relevantTags.length > 0 && (
            <div style={{ animation: "fadeIn 0.6s ease 0.4s both" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 12 }}>
                Refine this perspective
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {relevantTags.map(tag => {
                  const active = activeFilters.includes(tag)
                  return (
                    <button key={tag} onClick={() => toggleFilter(tag)} style={{
                      background: active ? "rgba(255,255,255,0.1)" : "transparent",
                      border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 40, padding: "6px 16px", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                      color: active ? "#fff" : "rgba(255,255,255,0.4)",
                      transition: "all 0.2s",
                    }}>{tag}</button>
                  )
                })}
                {activeFilters.length > 0 && (
                  <button onClick={() => setActiveFilters([])} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", padding: "6px 8px", letterSpacing: "0.04em" }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 52 }} />

        {/* ── Primary results ── */}
        {searching ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SkeletonHero />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SkeletonCard height={340} />
              <SkeletonCard height={340} />
            </div>
          </div>
        ) : matched.length === 0 ? (
          <div style={{ paddingTop: 40, paddingBottom: 40 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
              Nothing in the current collection matches exactly —<br />
              try broadening your search or exploring a related theme.
            </p>
          </div>
        ) : matched.length === 1 ? (
          // Single result: full-width hero treatment
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <HeroCard item={matched[0]} onSelect={selectProperty} />
          </div>
        ) : matched.length === 2 ? (
          // Two results: even split
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "fadeUp 0.5s ease" }}>
            <EditorialCard item={matched[0]} onSelect={selectProperty} tall />
            <EditorialCard item={matched[1]} onSelect={selectProperty} tall />
          </div>
        ) : (
          // 3+ results: hero first, then grid below
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.5s ease" }}>
            <HeroCard item={matched[0]} onSelect={selectProperty} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {matched.slice(1).map((item, i) => (
                <div key={item.id || i} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 80}ms` }}>
                  <EditorialCard item={item} onSelect={selectProperty} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── You may also be drawn to ── */}
        {!searching && alsoLove.length > 0 && (
          <div style={{ marginTop: 96, animation: "fadeIn 0.6s ease 0.5s both" }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 36 }} />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                You may also be drawn to
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>
                Adjacent perspectives from the collection
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {alsoLove.map((item, i) => (
                <div key={item.id || i} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60}ms` }}>
                  <EditorialCard item={item} onSelect={selectProperty} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
