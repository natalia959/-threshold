"use client"
import { useState, useEffect } from "react"

const PLACEHOLDERS = [
  "calm, full of light, nothing unnecessary...",
  "in the spirit of Tadao Ando...",
  "a kitchen big enough for everyone, coffee, no rush...",
  "warm but not precious — somewhere you actually live...",
  "what Schindler would build today...",
  "reading in a chair where the light finds you...",
  "the vision of a perfect Sunday morning...",
]

const STRIP_GRADIENTS = [
  "radial-gradient(ellipse at 60% 40%, #2a1f0e 0%, #0f0c08 100%)",
  "radial-gradient(ellipse at 40% 60%, #1a1e22 0%, #0c0e10 100%)",
  "radial-gradient(ellipse at 50% 30%, #2e2618 0%, #141210 100%)",
  "radial-gradient(ellipse at 35% 55%, #1c1a18 0%, #0d0c0b 100%)",
  "radial-gradient(ellipse at 60% 50%, #221e18 0%, #100e0c 100%)",
  "radial-gradient(ellipse at 45% 35%, #161a1e 0%, #0a0c0e 100%)",
  "radial-gradient(ellipse at 55% 60%, #201812 0%, #0e0b09 100%)",
]

export default function LandingPage({ onSearch }) {
  const [value, setValue]                           = useState("")
  const [focused, setFocused]                       = useState(false)
  const [placeholderIdx, setPlaceholderIdx]         = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [objects, setObjects]                       = useState([])

  useEffect(() => {
    fetch("/api/objects")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setObjects(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (focused) return
    const t = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 500)
    }, 3500)
    return () => clearInterval(t)
  }, [focused])

  const handleSubmit = () => { if (value.trim()) onSearch(value.trim()) }

  // 7 items for the strip — use real objects where available, fallback to gradients
  const stripItems = Array.from({ length: 7 }, (_, i) => objects[i] || null)

  return (
    <div style={{ background: "#131313", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 40px", height: 52,
      }}>
        <img src="/threshold-logo.png" alt="Threshold" style={{ height: 29, width: "auto", display: "block", marginRight: 8 }} />
        <a
          href="/explore"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 40, padding: "6px 18px", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#F7F4EC" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)" }}
        >Explore</a>
      </nav>

      {/* ── Image strip ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 3, height: "42vh", flexShrink: 0 }}>
        {stripItems.map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: STRIP_GRADIENTS[i % STRIP_GRADIENTS.length],
              overflow: "hidden",
              animation: "fadeIn 0.6s ease both",
              animationDelay: `${i * 60}ms`,
            }}
          >
            {item?.image && (
              <img
                src={item.image}
                alt={item?.name || ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Center content ──────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 40px",
        gap: 0,
      }}>
        {/* Logo */}
        <img src="/threshold-logo.png" alt="Threshold" style={{ height: 34, width: "auto", display: "block", marginBottom: 18 }} />

        {/* Tagline */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 400,
          color: "rgba(255,255,255,0.42)",
          letterSpacing: "0.02em",
          marginBottom: 32,
        }}>
          Home for your taste
        </p>

        {/* Search bar */}
        <div style={{
          width: "100%",
          maxWidth: 660,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          padding: "16px 20px 16px 28px",
          gap: 12,
          transition: "border-color 0.2s",
          ...(focused ? { borderColor: "rgba(255,255,255,0.28)" } : {}),
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            {!value && (
              <div style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                left: 0, right: 0, pointerEvents: "none",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: 18, color: "rgba(255,255,255,0.22)",
                opacity: placeholderVisible ? 1 : 0,
                transition: "opacity 0.5s ease",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {PLACEHOLDERS[placeholderIdx]}
              </div>
            )}
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSubmit() } }}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: 18, color: "#F7F4EC", lineHeight: 1,
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              background: value ? "#F7F4EC" : "rgba(255,255,255,0.08)",
              border: "none", borderRadius: 28, padding: "9px 22px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400,
              color: value ? "#0c0c0c" : "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em", whiteSpace: "nowrap",
              transition: "background 0.2s, color 0.2s", flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
