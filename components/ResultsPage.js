"use client"
import { useState, useEffect, useRef } from "react"
import ThresholdMark from "./ThresholdMark"
import PropertyPage from "./PropertyPage"

const IDEA_FILTERS = ["Solitude","Gathering","Light as Material","Garden as Architecture","Indoors Dissolved","Work and Make"]
const LANDSCAPE_FILTERS = ["Coastal","Desert","Urban","Mountain"]

function InsightBar({ property }) {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)

  const ask = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResponse("")
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, propertyId: property.id }),
      })
      const data = await res.json()
      setResponse(data.response || "Unable to get a response right now.")
    } catch {
      setResponse("Unable to connect. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 12 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 30, padding: "6px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer", letterSpacing: "0.05em" }}
        >
          Ask about this house
        </button>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Ask anything..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", padding: "4px 0" }}
            />
            <button onClick={ask} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#fff", cursor: "pointer" }}>
              {loading ? "..." : "Ask"}
            </button>
          </div>
          {response && (
            <div style={{ marginTop: 10, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ item, size = "normal", onSelect }) {
  const [hovered, setHovered] = useState(false)
  const property = item.property
  const height = size === "large" ? 480 : size === "small" ? 300 : 380

  const colors = {
    "sale-house": "#2a2420",
    "stahl-house": "#1a1a24",
    "casa-luna": "#1a3020",
    "invisible-house": "#3a2e1a",
    "bailey-house": "#1e2a1a",
  }

  return (
    <div
      onClick={() => property && (window.location.href = `/property/${property.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: "hidden", position: "relative",
        background: colors[property?.id] || "#1a1a20",
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.5)" : "0 2px 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* Image placeholder / actual image */}
      <div style={{ height, background: colors[property?.id] || "#1a1a20", position: "relative" }}>
        {(property?.hero_photo || property?.image) && (
          <img src={property.hero_photo || property.image} alt={property.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
        {property && (
          <>
            <div style={{ position: "absolute", top: 14, right: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{property.location}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff", fontWeight: 400, lineHeight: 1.2, marginBottom: 3 }}>{property.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{property.architect} · {property.year}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{property.price}</div>
            </div>
          </>
        )}
      </div>

      {/* AI reason + insight bar */}
      {property && (
        <div style={{ padding: "14px 18px 16px", background: "rgba(0,0,0,0.3)" }}>
          {item.reason && (
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 8 }}>
              {item.reason}
            </div>
          )}
          <InsightBar property={property} />
        </div>
      )}
    </div>
  )
}

function SkeletonCard({ size = "normal" }) {
  const height = size === "large" ? 480 : size === "small" ? 300 : 380
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: "#1a1a1a", animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ height }} />
      <div style={{ padding: "14px 18px 16px" }}>
        <div style={{ height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 8, width: "70%" }} />
        <div style={{ height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  )
}

function AnimatedText({ text, speed = 14 }) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    if (!text) return
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text])
  return <>{displayed}</>
}

export default function ResultsPage({ query, results, searching, streamingInterpretation, onSearch, onBack, onSignUp, onSignIn, user, searchValue, setSearchValue }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])
  const [prevResultsKey, setPrevResultsKey] = useState(null)
  const resultsKey = results ? JSON.stringify(results.matched?.map(m => m.id)) : null
  useEffect(() => {
    if (resultsKey && resultsKey !== prevResultsKey) setPrevResultsKey(resultsKey)
  }, [resultsKey])

  if (selectedProperty) {
    const allProperties = [
      ...(results?.matched || []).map(m => m.property),
      ...(results?.alsoLove || []).map(m => m.property),
    ].filter(Boolean)
    return <PropertyPage property={selectedProperty} allProperties={allProperties} onBack={() => setSelectedProperty(null)} />
  }
  const [focused, setFocused] = useState(false)
  const toggleFilter = f => setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const matchedSizes = ["large", "small", "small"]
  const alsoSizes = ["small", "large", "small"]

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        ::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "16px 32px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24, zIndex: 50, background: "rgba(12,12,12,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ThresholdMark color="white" size={18} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: "0.24em", color: "#fff" }}>THRESHOLD</span>
        </button>

        <div style={{ position: "relative", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "none", borderRadius: 50, display: "flex", alignItems: "center", padding: "0 18px", width: 420 }}>
          {!focused && !searchValue && (
            <span style={{ position: "absolute", left: 18, right: 18, pointerEvents: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Search Threshold...</span>
          )}
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === "Enter" && searchValue.trim() && onSearch(searchValue)}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", color: "#fff", padding: "14px 0" }}
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "9px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Sign Up</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 80px", animation: "fadeUp 0.4s ease" }}>

        {/* Query headline */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Results for</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>"{query}"</h1>
          {(streamingInterpretation || results?.interpretation) && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 600 }}>
              <AnimatedText text={results?.interpretation || streamingInterpretation} speed={14} />
            </p>
          )}
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 48, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {IDEA_FILTERS.map(f => (
              <button key={f} onClick={() => toggleFilter(f)} style={{ background: activeFilters.includes(f) ? "#fff" : "transparent", color: activeFilters.includes(f) ? "#0f0f0f" : "rgba(255,255,255,0.5)", border: "1px solid", borderColor: activeFilters.includes(f) ? "#fff" : "rgba(255,255,255,0.18)", borderRadius: 30, padding: "5px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LANDSCAPE_FILTERS.map(f => (
              <button key={f} onClick={() => toggleFilter(f)} style={{ background: activeFilters.includes(f) ? "rgba(255,255,255,0.15)" : "transparent", color: activeFilters.includes(f) ? "#fff" : "rgba(255,255,255,0.35)", border: "1px solid", borderColor: activeFilters.includes(f) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)", borderRadius: 30, padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Matched results */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>
            {searching ? "Searching..." : results ? `${results.matched?.length || 0} properties matched` : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 16 }}>
            {searching ? (
              <>
                <SkeletonCard size="large" />
                <SkeletonCard size="small" />
                <SkeletonCard size="small" />
              </>
            ) : results?.matched?.map((item, i) => (
              <div key={item.id} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 80}ms` }}>
                <PropertyCard item={item} size={matchedSizes[i] || "normal"} onSelect={setSelectedProperty} />
              </div>
            ))}
          </div>
        </div>

        {/* You may also love */}
        {(searching || results?.alsoLove?.length > 0) && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#fff", marginBottom: 6 }}>You may also love</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Spectacular properties from the collection worth considering</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 16 }}>
              {searching ? (
                <>
                  <SkeletonCard size="small" />
                  <SkeletonCard size="large" />
                  <SkeletonCard size="small" />
                </>
              ) : results?.alsoLove?.map((item, i) => (
                <div key={item.id} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${(i + 3) * 80}ms` }}>
                  <PropertyCard item={item} size={alsoSizes[i] || "normal"} onSelect={setSelectedProperty} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}