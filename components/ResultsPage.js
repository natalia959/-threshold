"use client"
import { useState, useEffect } from "react"
import PropertyPage from "./PropertyPage"

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
    }, 20)
    return () => clearInterval(interval)
  }, [text])

  return <span>{displayed}{displayed.length < (text?.length || 0) && <span style={{ display: "inline-block", width: 1, height: "0.85em", background: "rgba(255,255,255,0.4)", marginLeft: 1, verticalAlign: "text-bottom", animation: "blink 0.8s step-end infinite" }} />}</span>
}

function PropertyCard({ item, size, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const property = item?.property
  const height = size === "large" ? 480 : size === "small" ? 300 : 380

  if (!property) return null

  return (
    <div
      onClick={() => onSelect && onSelect(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: "hidden", position: "relative",
        background: "#1a1a20", cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.5)" : "0 2px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ height, position: "relative", background: "#1a1a20" }}>
        {(property.hero_photo || property.image) && (
          <img src={property.hero_photo || property.image} alt={property.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{property.location}</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 3 }}>{property.name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{property.architect} · {property.year}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{property.price}</div>
        </div>
      </div>
      {item.reason && (
        <div style={{ padding: "12px 18px", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{item.reason}</div>
        </div>
      )}
    </div>
  )
}

function SkeletonCard({ size }) {
  const height = size === "large" ? 480 : 300
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: "#1a1a1a", animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ height }} />
      <div style={{ padding: "14px 18px" }}>
        <div style={{ height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 8, width: "70%" }} />
        <div style={{ height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  )
}

const IDEA_FILTERS = ["Solitude","Gathering","Light as Material","Garden as Architecture","Indoors Dissolved","Work and Make"]
const LANDSCAPE_FILTERS = ["Coastal","Desert","Urban","Mountain"]

export default function ResultsPage({ query, results, searching, onSearch, onBack, onSignUp, onSignIn, user, searchValue, setSearchValue }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])
  const [focused, setFocused] = useState(false)

  if (selectedProperty) {
    const allProperties = [
      ...(results?.matched || []).map(m => m.property),
      ...(results?.alsoLove || []).map(m => m.property),
    ].filter(Boolean)
    return <PropertyPage property={selectedProperty} allProperties={allProperties} onBack={() => setSelectedProperty(null)} />
  }

  const toggleFilter = f => setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "16px 32px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24, zIndex: 50, background: "rgba(12,12,12,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "#fff", textAlign: "left" }}>
          <span style={{ fontFamily: "var(--font-logo), sans-serif", fontWeight: 500, letterSpacing: "0.04em", color: "#F7F4EC" }}>THRESHOLD</span>
        </button>
        <div style={{ position: "relative", background: "rgba(255,255,255,0.07)", borderRadius: 50, display: "flex", alignItems: "center", padding: "0 18px", width: 420 }}>
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === "Enter" && searchValue.trim() && onSearch(searchValue)}
            placeholder="Search Threshold..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff", padding: "14px 0" }}
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <button onClick={user ? () => window.location.href="/dashboard" : onSignIn} style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "9px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {user ? "My Portal" : "Sign In"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 80px" }}>

        {/* Query headline */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Results for</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>"{query}"</h1>
          {results?.interpretation && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 600 }}>
              <AnimatedText text={results.interpretation} />
            </p>
          )}
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 48, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...IDEA_FILTERS, ...LANDSCAPE_FILTERS].map(f => (
              <button key={f} onClick={() => toggleFilter(f)} style={{
                background: activeFilters.includes(f) ? "rgba(255,255,255,0.15)" : "transparent",
                border: `1px solid ${activeFilters.includes(f) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                borderRadius: 40, padding: "7px 16px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: activeFilters.includes(f) ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Matched results */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>
            {searching ? "Searching..." : `${results?.matched?.length || 0} properties matched`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 16 }}>
            {searching ? (
              <><SkeletonCard size="large" /><SkeletonCard size="small" /><SkeletonCard size="small" /></>
            ) : (results?.matched || []).map((item, i) => (
              <div key={item.id || i} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 80}ms` }}>
                <PropertyCard item={item} size={i === 0 ? "large" : "small"} onSelect={setSelectedProperty} />
              </div>
            ))}
          </div>
        </div>

        {/* You may also love */}
        {(searching || (results?.alsoLove?.length > 0)) && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#fff", marginBottom: 6 }}>You may also love</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Properties from the collection worth considering</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 16 }}>
              {searching ? (
                <><SkeletonCard size="small" /><SkeletonCard size="large" /><SkeletonCard size="small" /></>
              ) : (results?.alsoLove || []).map((item, i) => (
                <div key={item.id || i} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${(i + 3) * 80}ms` }}>
                  <PropertyCard item={item} size={i === 1 ? "large" : "small"} onSelect={setSelectedProperty} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}