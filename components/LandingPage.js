"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ── Fonts (CSS variable references) ──────────────────────────────────────────
const garamond = "var(--font-eb-garamond), Georgia, serif"
const dmSans   = "var(--font-dm-sans), system-ui, sans-serif"

// ── Animated placeholder texts ────────────────────────────────────────────────
const PLACEHOLDERS = [
  "calm, full of light, nothing unnecessary...",
  "in the spirit of Tadao Ando...",
  "a kitchen big enough for everyone, coffee, no rush...",
  "warm but not precious — somewhere you actually live...",
  "what Schindler would build today...",
  "reading in a chair where the light finds you...",
  "the vision of a perfect Sunday morning...",
]

// ── In Residence items (Stahl House) ─────────────────────────────────────────
const RESIDENCE_ITEMS = [
  { category: "Seating",    name: "Eames Lounge Chair & Ottoman", span: 2, tall: true  },
  { category: "Lighting",   name: "Noguchi Akari 55A",            span: 1, tall: true  },
  { category: "Automobile", name: "Porsche 911 Targa",            span: 1, tall: false },
  { category: "Seating",    name: "Prouvé Standard Chair",        span: 1, tall: false },
  { category: "Object",     name: "Carl Auböck Carafe No. 3",     span: 1, tall: false },
  { category: "Textile",    name: "Beni Ourain Rug",              span: 2, tall: false },
  { category: "Book",       name: "Shulman's Los Angeles",        span: 1, tall: false },
]

// ═══════════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR
// ═══════════════════════════════════════════════════════════════════
function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
      style={{ height: 36, borderBottom: "0.5px solid rgba(0,0,0,0.1)", background: "#fff", fontFamily: dmSans }}
    >
      <span style={{ fontSize: 11, color: "#bbb", letterSpacing: "0.03em", fontWeight: 300 }}>
        Now featuring estates in Los Angeles, Malibu, and the Bay Area
      </span>
      <Link href="/reserve" style={{ fontSize: 11, color: "#bbb", letterSpacing: "0.03em", fontWeight: 300, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "#ddd" }}>
        Apply to Reserve →
      </Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════
function Nav({ onSignIn, user }) {
  return (
    <nav
      className="fixed left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
      style={{ top: 36, height: 60, borderBottom: "0.5px solid rgba(0,0,0,0.1)", background: "#fff" }}
    >
      <span style={{ fontFamily: garamond, fontSize: 15, letterSpacing: "0.18em", fontVariant: "small-caps", color: "#0f0f0f" }}>
        Threshold
      </span>
      <div className="flex items-center gap-8">
        <Link
          href="/explore"
          style={{ fontFamily: dmSans, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", fontWeight: 300, textDecoration: "none" }}
        >
          Explore
        </Link>
        <Link
          href="/reserve"
          style={{ fontFamily: garamond, fontStyle: "italic", fontSize: 15, color: "#555", textDecoration: "none" }}
        >
          Reserve
        </Link>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════
function HeroSection({ onSearch, onSignUp }) {
  const handleExplore = () => {
    document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ height: "100vh", paddingTop: 96 }}
    >
      {/* Tagline */}
      <p style={{ fontFamily: garamond, fontVariant: "small-caps", fontSize: 12, letterSpacing: "0.3em", color: "#bbb", marginBottom: 24, fontWeight: 400 }}>
        Private Entrance to Architectural Living
      </p>

      {/* Headline */}
      <h1
        className="max-w-2xl"
        style={{ fontFamily: garamond, fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 400, lineHeight: 1.08, color: "#0f0f0f", marginBottom: 32, letterSpacing: "-0.01em" }}
      >
        Discover the home<br />you've always talked about.
      </h1>

      {/* Rule */}
      <div style={{ width: 32, height: 0, borderTop: "0.5px solid rgba(0,0,0,0.25)", marginBottom: 28 }} />

      {/* Body */}
      <p
        className="max-w-md"
        style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: "#888", lineHeight: 1.85, marginBottom: 40 }}
      >
        Threshold is a space crafted for the world's most singular architectural estates. Search the way you think — every detail brings you closer.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <button
          onClick={handleExplore}
          className="transition-opacity duration-200 hover:opacity-70"
          style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, letterSpacing: "0.06em", color: "#fff", background: "#0f0f0f", border: "none", borderRadius: 40, padding: "12px 28px", cursor: "pointer" }}
        >
          Explore Estates
        </button>
        <button
          onClick={onSignUp}
          className="transition-opacity duration-200 hover:opacity-70"
          style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, letterSpacing: "0.06em", color: "#0f0f0f", background: "transparent", border: "0.5px solid rgba(0,0,0,0.3)", borderRadius: 40, padding: "12px 28px", cursor: "pointer" }}
        >
          Apply to Reserve
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH SECTION
// ═══════════════════════════════════════════════════════════════════
function SearchSection({ onSearch }) {
  const [value, setValue] = useState("")
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const textareaRef = useRef(null)

  // Cycle placeholder every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 500)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = () => {
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <section
      id="search-section"
      className="px-6 md:px-10 py-24 md:py-32"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <p style={{ fontFamily: garamond, fontStyle: "italic", fontSize: "clamp(22px, 2.5vw, 30px)", color: "#0f0f0f", marginBottom: 28 }}>
          Search the way you think
        </p>

        {/* Textarea container */}
        <div style={{ position: "relative" }}>
          {/* Animated placeholder — shown only when textarea is empty */}
          {!value && (
            <div
              style={{
                position: "absolute", top: 20, left: 20, right: 56, pointerEvents: "none", zIndex: 1,
                fontFamily: garamond, fontStyle: "italic", fontSize: 17, color: "#ccc", lineHeight: 1.65,
                opacity: placeholderVisible ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              {PLACEHOLDERS[placeholderIdx]}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            rows={4}
            style={{
              width: "100%", minHeight: 120, resize: "none",
              fontFamily: garamond, fontStyle: value ? "italic" : "normal", fontSize: 17, color: "#0f0f0f", lineHeight: 1.65,
              background: "#fff", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 6,
              padding: "20px 20px 48px 20px", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(0,0,0,0.35)"}
            onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.18)"}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{ position: "absolute", bottom: 14, right: 16, background: "none", border: "none", cursor: "pointer", fontFamily: garamond, fontStyle: "italic", fontSize: 15, color: value ? "#0f0f0f" : "#ccc", transition: "color 0.2s", padding: "4px 0" }}
          >
            Search →
          </button>
        </div>

        {/* Hint */}
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: "#ccc", marginTop: 10, letterSpacing: "0.02em" }}>
          Describe a feeling, a name, a morning — anything.
        </p>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// IN RESIDENCE
// ═══════════════════════════════════════════════════════════════════
function ResidenceCard({ item }) {
  const imgHeight = item.tall ? 280 : 180
  return (
    <div
      className={item.span === 2 ? "col-span-2" : "col-span-1"}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Image placeholder */}
      <div style={{ width: "100%", height: imgHeight, background: "#f2f1ef", borderRadius: 4 }} />
      {/* Label */}
      <div>
        <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 300, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb" }}>
          {item.category}
        </span>
        <p style={{ fontFamily: garamond, fontStyle: "italic", fontSize: 17, color: "#0f0f0f", marginTop: 4, lineHeight: 1.3 }}>
          {item.name}
        </p>
      </div>
    </div>
  )
}

function InResidenceSection() {
  return (
    <section
      className="px-6 md:px-10 py-24 md:py-32"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-14">
          <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 14 }}>
            In Residence
          </p>
          <h2
            className="max-w-lg"
            style={{ fontFamily: garamond, fontStyle: "italic", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, color: "#0f0f0f", lineHeight: 1.2, marginBottom: 16 }}
          >
            A world assembled for this house alone.
          </h2>
          <p
            className="max-w-md"
            style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: "#888", lineHeight: 1.8 }}
          >
            Objects, furniture, art, and atmosphere chosen for this property and no other. Not what could work here — what belongs here.
          </p>
          <p style={{ fontFamily: garamond, fontStyle: "italic", fontSize: 13, color: "#bbb", marginTop: 10 }}>
            Stahl House · Pierre Koenig · 1959
          </p>
        </div>

        {/* Editorial grid — 3 columns */}
        <div
          className="grid gap-x-6 gap-y-10"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {RESIDENCE_ITEMS.map((item, i) => (
            <ResidenceCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// RESERVE WHISPER
// ═══════════════════════════════════════════════════════════════════
function ReserveWhisper() {
  return (
    <div
      className="flex items-center justify-center py-16"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      <Link
        href="/reserve"
        style={{ fontFamily: garamond, fontStyle: "italic", fontSize: 18, color: "#aaa", textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#0f0f0f"}
        onMouseLeave={e => e.currentTarget.style.color = "#aaa"}
      >
        Threshold Reserve →
      </Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer
      className="flex items-center justify-center py-8"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: "#ccc", letterSpacing: "0.06em" }}>
        threshold.estate
      </span>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage({ onSearch, onSignUp, onSignIn, user }) {
  return (
    <div style={{ background: "#fff", color: "#0f0f0f", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Nav onSignIn={onSignIn} user={user} />
      <main>
        <HeroSection onSearch={onSearch} onSignUp={onSignUp} />
        <SearchSection onSearch={onSearch} />
        <InResidenceSection />
        <ReserveWhisper />
        <Footer />
      </main>
    </div>
  )
}
