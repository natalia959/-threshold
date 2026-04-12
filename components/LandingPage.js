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

export default function LandingPage({ onSearch }) {
  const [value, setValue]                           = useState("")
  const [focused, setFocused]                       = useState(false)
  const [placeholderIdx, setPlaceholderIdx]         = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)

  useEffect(() => {
    if (focused) return
    const t = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 900)
    }, 6000)
    return () => clearInterval(t)
  }, [focused])

  const handleSubmit = () => { if (value.trim()) onSearch(value.trim()) }

  return (
    <div style={{ background: "#131313", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
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

      {/* ── Center content ──────────────────────────────────────────── */}
      <h1 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "clamp(38px, 5vw, 62px)",
        fontWeight: 400,
        color: "#F7F4EC",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        marginBottom: 32,
        textAlign: "center",
      }}>
        Home for<br />your taste
      </h1>

      {/* ── Search box ──────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%", maxWidth: 760,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          borderRadius: 16,
          padding: "22px 24px 20px",
          cursor: "text",
        }}
        onClick={() => document.getElementById("landing-input").focus()}
      >
        <div style={{ position: "relative", minHeight: 80 }}>
          {/* Placeholder */}
          {!value && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none",
              lineHeight: 1.55, opacity: placeholderVisible ? 1 : 0,
              transition: "opacity 0.9s ease",
            }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: "rgba(255,255,255,0.28)" }}>Try </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: "rgba(255,255,255,0.22)" }}>{PLACEHOLDERS[placeholderIdx]}</span>
            </div>
          )}
          {/* Textarea */}
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
              fontSize: 19, color: "#F7F4EC", lineHeight: 1.55, resize: "none",
            }}
          />
        </div>
      </div>

      {/* ── Hint ────────────────────────────────────────────────────── */}
      <p style={{
        marginTop: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        color: "rgba(255,255,255,0.18)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        Press Enter to search
      </p>
    </div>
  )
}
