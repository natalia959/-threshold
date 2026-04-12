"use client"
import { useState, useEffect } from "react"

const PLACEHOLDERS = [
  "I'm an art collector looking for a residence that will best display my pieces — open walls, north light, generous ceiling height.",
  "I love Prada and modern furniture. What house in Los Feliz would be the best fit for me?",
  "Looking for a vacation house with beautiful views and a garden where my kids can run around.",
  "Something that feels like it was built for one person and never quite recovered. Quiet, serious, a little severe.",
  "A house a filmmaker would live in — dramatic light, raw materials, nothing decorative.",
  "I want to wake up to a canyon and have a kitchen worth cooking a long Sunday breakfast in.",
  "Midcentury, but not the kind everyone has. Something that still feels like a discovery.",
]

const GRADIENTS = [
  "radial-gradient(ellipse at 60% 40%, #2a1f0e 0%, #0f0c08 100%)",
  "radial-gradient(ellipse at 40% 60%, #1a1e22 0%, #0c0e10 100%)",
  "radial-gradient(ellipse at 50% 30%, #2e2618 0%, #141210 100%)",
  "radial-gradient(ellipse at 35% 55%, #1c1a18 0%, #0d0c0b 100%)",
  "radial-gradient(ellipse at 60% 50%, #221e18 0%, #100e0c 100%)",
  "radial-gradient(ellipse at 45% 35%, #161a1e 0%, #0a0c0e 100%)",
  "radial-gradient(ellipse at 55% 60%, #201812 0%, #0e0b09 100%)",
  "radial-gradient(ellipse at 30% 40%, #1e2218 0%, #0c0e0a 100%)",
  "radial-gradient(ellipse at 70% 65%, #241c10 0%, #100d08 100%)",
  "radial-gradient(ellipse at 50% 50%, #1a1a1e 0%, #0a0a0c 100%)",
  "radial-gradient(ellipse at 25% 55%, #221e1a 0%, #0e0c0a 100%)",
  "radial-gradient(ellipse at 65% 30%, #1c2018 0%, #0c0e0a 100%)",
  "radial-gradient(ellipse at 40% 70%, #201a14 0%, #100d0a 100%)",
  "radial-gradient(ellipse at 75% 45%, #181e22 0%, #0a0c10 100%)",
  "radial-gradient(ellipse at 20% 30%, #2a2218 0%, #110e0c 100%)",
  "radial-gradient(ellipse at 55% 75%, #1e1c18 0%, #0e0c0a 100%)",
  "radial-gradient(ellipse at 80% 20%, #161c20 0%, #0a0c0e 100%)",
  "radial-gradient(ellipse at 30% 80%, #241e14 0%, #100d09 100%)",
]

// Scattered positions — avoids the center 40% of the screen
// Each: { top/bottom, left/right as % strings, w in px, rot in deg, aspect }
const POSITIONS = [
  // top-left cluster
  { top: "3%",  left: "2%",   w: 105, rot: -7,  aspect: "3/4" },
  { top: "13%", left: "9%",   w: 88,  rot:  5,  aspect: "4/3" },
  { top: "1%",  left: "20%",  w: 96,  rot: -3,  aspect: "3/4" },
  { top: "22%", left: "2%",   w: 78,  rot:  8,  aspect: "1/1" },
  { top: "36%", left: "6%",   w: 112, rot: -5,  aspect: "4/3" },
  { top: "52%", left: "1%",   w: 90,  rot:  4,  aspect: "3/4" },
  { top: "64%", left: "9%",   w: 82,  rot: -9,  aspect: "4/3" },
  { top: "75%", left: "2%",   w: 100, rot:  6,  aspect: "3/4" },
  { top: "86%", left: "12%",  w: 88,  rot: -4,  aspect: "1/1" },
  // top-right cluster
  { top: "2%",  right: "2%",  w: 108, rot:  6,  aspect: "3/4" },
  { top: "10%", right: "10%", w: 82,  rot: -5,  aspect: "4/3" },
  { top: "1%",  right: "20%", w: 94,  rot:  3,  aspect: "3/4" },
  { top: "23%", right: "2%",  w: 115, rot: -8,  aspect: "4/3" },
  { top: "38%", right: "7%",  w: 86,  rot:  5,  aspect: "1/1" },
  { top: "53%", right: "1%",  w: 98,  rot: -4,  aspect: "3/4" },
  { top: "65%", right: "10%", w: 80,  rot:  7,  aspect: "4/3" },
  { top: "76%", right: "2%",  w: 104, rot: -6,  aspect: "3/4" },
  { top: "88%", right: "14%", w: 92,  rot:  4,  aspect: "1/1" },
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

  return (
    <div style={{ background: "#131313", height: "100vh", overflow: "hidden", position: "relative", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes floatIn { from { opacity: 0; transform: scale(0.92) rotate(var(--rot)); } to { opacity: 1; transform: scale(1) rotate(var(--rot)); } }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 40px", height: 52,
      }}>
        <img src="/threshold-logo.png" alt="Threshold" style={{ height: 27, width: "auto", display: "block", marginRight: 8 }} />
        <a
          href="/explore"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 40, padding: "6px 18px", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#F7F4EC" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
        >Explore</a>
      </nav>

      {/* ── Scattered images ─────────────────────────────────────────── */}
      {POSITIONS.map((pos, i) => {
        const obj = objects[i % Math.max(objects.length, 1)] || null
        const style = {
          position: "absolute",
          width: pos.w,
          aspectRatio: pos.aspect,
          background: GRADIENTS[i % GRADIENTS.length],
          borderRadius: 6,
          overflow: "hidden",
          "--rot": `${pos.rot}deg`,
          transform: `rotate(${pos.rot}deg)`,
          animation: `floatIn 0.7s ease both`,
          animationDelay: `${i * 45}ms`,
          zIndex: 1,
        }
        if (pos.top)    style.top    = pos.top
        if (pos.bottom) style.bottom = pos.bottom
        if (pos.left)   style.left   = pos.left
        if (pos.right)  style.right  = pos.right

        return (
          <div key={i} style={style}>
            {obj?.image && (
              <img src={obj.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
          </div>
        )
      })}

      {/* ── Center content ──────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 40px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(38px, 5vw, 62px)",
          fontWeight: 400,
          color: "#F7F4EC",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: 32,
        }}>
          Home for<br />your taste
        </h1>

        {/* Search box — tall card style */}
        <div style={{
          width: "100%",
          maxWidth: 760,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          borderRadius: 16,
          padding: "22px 22px 16px 24px",
          cursor: "text",
        }} onClick={() => document.getElementById("landing-input").focus()}>
          {/* Input area */}
          <div style={{ position: "relative", minHeight: 72, marginBottom: 20 }}>
            {!value && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: 19, color: "rgba(255,255,255,0.22)", lineHeight: 1.55,
                opacity: placeholderVisible ? 1 : 0,
                transition: "opacity 0.5s ease",
                textAlign: "left",
              }}>
                {PLACEHOLDERS[placeholderIdx]}
              </div>
            )}
            <textarea
              id="landing-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
              rows={3}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: 19, color: "#F7F4EC", lineHeight: 1.55,
                resize: "none",
              }}
            />
          </div>
          {/* Bottom row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              style={{
                background: value ? "rgba(247,244,236,0.9)" : "rgba(255,255,255,0.08)",
                border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400,
                color: value ? "#0c0c0c" : "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              Search →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
