"use client"
import { useState, useEffect, useRef } from "react"

const QUERIES = [
  { text: "'I want to live in a house with ocean views'", cards: ["#1a3a4a","#0d2535","#1e4558","#0a1e2e","#163344","#1a3a4a","#0d2535","#1e4558"] },
  { text: "'I'm looking for something with big gardens'", cards: ["#1a3020","#0d2015","#243d28","#162a1a","#1f3825","#1a3020","#0d2015","#243d28"] },
  { text: "'Show me a Neutra with original details intact'", cards: ["#2a2420","#1e1a17","#332e29","#251f1c","#2e2822","#2a2420","#1e1a17","#332e29"] },
  { text: "'Something with rammed earth and desert light'", cards: ["#3a2e1a","#2e2415","#443620","#261e10","#382915","#3a2e1a","#2e2415","#443620"] },
  { text: "'A house designed around solitude and concrete'", cards: ["#1e1e28","#16161e","#252530","#121218","#1a1a24","#1e1e28","#16161e","#252530"] },
]

function GalleryStrip({ cards, visible }) {
  const trackRef = useRef(null)
  const posRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cardW = 320 + 12
    const total = cards.length * cardW
    const animate = () => {
      posRef.current -= 0.4
      if (posRef.current < -total) posRef.current = 0
      track.style.transform = `translateX(${posRef.current}px)`
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [cards])

  const tripled = [...cards, ...cards, ...cards]
  return (
    <div style={{ overflow: "hidden", width: "100%", opacity: visible ? 1 : 0, transition: "opacity 1s ease", position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <div ref={trackRef} style={{ display: "flex", gap: 12, willChange: "transform", alignItems: "flex-end" }}>
        {tripled.map((color, i) => {
          const h = i % 3 === 0 ? 420 : i % 3 === 1 ? 360 : 480
          return (
            <div key={i} style={{ flexShrink: 0, width: 320, height: h, borderRadius: 14, background: color, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 50%)", borderRadius: 14 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage({ onSearch, onSignUp, onSignIn, user, searchValue, setSearchValue }) {
  const [queryIndex, setQueryIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => {
        const next = (queryIndex + 1) % QUERIES.length
        setQueryIndex(next)
        setDisplayIndex(next)
        setTextVisible(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [queryIndex])

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0c0c0c", overflow: "hidden", position: "relative" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        ::placeholder { color: transparent !important; }
      `}</style>

      {/* Gallery — bottom 52vh only */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "52vh", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {QUERIES.map((q, i) => <GalleryStrip key={i} cards={q.cards} visible={i === displayIndex} />)}
      </div>

      {/* Gradient */}
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to bottom, rgba(12,12,12,1) 0%, rgba(12,12,12,1) 60%, rgba(12,12,12,0.5) 80%, rgba(12,12,12,0.0) 100%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "16px 32px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: "0.24em", color: "#fff" }}>THRESHOLD</span>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: 50, display: "flex", alignItems: "center", padding: "0 18px", width: 420 }}>
          {!focused && !searchValue && (
            <span style={{ position: "absolute", left: 18, right: 18, display: "flex", alignItems: "center", gap: 5, pointerEvents: "none", overflow: "hidden" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>Try</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", color: "rgba(255,255,255,0.75)", flexShrink: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: textVisible ? 1 : 0, transition: "opacity 0.45s ease" }}>{QUERIES[queryIndex].text}</span>
            </span>
          )}
          {focused && !searchValue && (
            <span style={{ position: "absolute", left: 18, right: 18, pointerEvents: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>Search Threshold...</span>
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
          <button onClick={onSignIn} style={{ background: "#fff", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "9px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "0.03em" }}>{user ? "My Portal" : "Sign In"}</button>
        </div>
      </nav>

      {/* Hero text */}
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: "42vh", zIndex: 10, pointerEvents: "none", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 16, animation: "fadeUp 1s ease 0.2s both" }}>A cabinet of architectural curiosities</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px, 6vw, 84px)", fontWeight: 300, lineHeight: 1.06, letterSpacing: "-0.01em", color: "#fff", margin: "0 0 32px", animation: "fadeUp 1s ease 0.4s both" }}>
          Find the house<br />that finds you back.
        </h1>
        <div style={{ pointerEvents: "all", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, animation: "fadeUp 1s ease 0.6s both" }}>
          <button onClick={onSignUp} style={{ background: "rgba(255,255,255,0.9)", color: "#0c0c0c", border: "none", borderRadius: 40, padding: "13px 32px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em" }}>Request Verified Access</button>

        </div>
      </div>
    </div>
  )
}