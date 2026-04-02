"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ── Fonts ─────────────────────────────────────────────────────────────────────
const serif = "var(--font-eb-garamond), 'EB Garamond', Georgia, serif"
const sans  = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif"

// ── Palette ───────────────────────────────────────────────────────────────────
const BG     = "#FFFFFF"
const INK    = "#0A0A0A"
const MUTED  = "#888880"
const FAINT  = "#BBBBBB"
const BORDER = "rgba(0,0,0,0.08)"

// ── Layout ────────────────────────────────────────────────────────────────────
const MAX = "1200px"
const PAD = "2rem"

// ── Placeholder texts ─────────────────────────────────────────────────────────
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
  { category: "Automobile", name: "Porsche 911 Targa, 1973" },
  { category: "Seating",    name: "Prouvé Standard Chair, 1934" },
  { category: "Lighting",   name: "Noguchi Akari 55A" },
  { category: "Object",     name: "Brancusi-inspired sculpture" },
  { category: "Textile",    name: "Loro Piana cashmere, undyed" },
  { category: "Glassware",  name: "Lobmeyr Series B" },
  { category: "Scent",      name: "Cire Trudon Ernesto" },
  { category: "Surface",    name: "Nero Marquina, honed" },
]

// ═══════════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR
// ═══════════════════════════════════════════════════════════════════
function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: 36,
        borderBottom: `0.5px solid ${BORDER}`,
        background: BG,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}
    >
      <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, color: MUTED, letterSpacing: "0.06em" }}>
        Now featuring estates in Los Angeles, Malibu, and the Bay Area
      </span>
      <Link
        href="/reserve"
        style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, color: MUTED, letterSpacing: "0.06em", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        Apply to Reserve →
      </Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════
function Nav() {
  return (
    <nav
      className="fixed left-0 right-0 z-50 flex items-center justify-between"
      style={{
        top: 36,
        height: 56,
        borderBottom: `0.5px solid ${BORDER}`,
        background: BG,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}
    >
      <span style={{ fontFamily: serif, fontSize: 15, letterSpacing: "0.22em", color: INK }}>
        THRESHOLD
      </span>
      <div className="flex items-center" style={{ gap: "2rem" }}>
        <Link
          href="/explore"
          style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.1em", color: INK, textDecoration: "none" }}
        >
          Explore
        </Link>
        <Link
          href="/reserve"
          style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: INK, textDecoration: "none" }}
        >
          Reserve
        </Link>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════
function HeroSection({ onSearch }) {
  const [value, setValue]                     = useState("")
  const [placeholderIdx, setPlaceholderIdx]   = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [focused, setFocused]                 = useState(false)

  useEffect(() => {
    if (focused) return
    const t = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 600)
    }, 3500)
    return () => clearInterval(t)
  }, [focused])

  const handleSubmit = () => { if (value.trim()) onSearch(value.trim()) }

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        background: "linear-gradient(160deg, #E8E0D5 0%, #D4C9BC 100%)",
      }}
    >
      {/* Layer 1 — headline, top-left, 35% from top */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: MAX,
          paddingLeft: PAD,
          paddingRight: PAD,
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <p style={{
            fontFamily: serif,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            fontWeight: 400,
          }}>
            Private Entrance to Architectural Living
          </p>
          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(42px, 6vw, 72px)",
            fontWeight: 400,
            fontStyle: "normal",
            color: "#fff",
            lineHeight: 1.05,
            marginTop: "0.5rem",
            marginBottom: 0,
            letterSpacing: "-0.01em",
          }}>
            Where you always<br />wanted to live.
          </h1>
        </div>
      </div>

      {/* Layer 2 — frosted glass search bar, flush to bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: 140,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "0.5px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "flex-start",
          paddingTop: "1.75rem",
          paddingBottom: "1.75rem",
          paddingLeft: PAD,
          paddingRight: PAD,
          gap: "2rem",
        }}
      >
        {/* Input column */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Animated placeholder */}
          {!focused && !value && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: "none",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: 18,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
                opacity: placeholderVisible ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            >
              {PLACEHOLDERS[placeholderIdx]}
            </div>
          )}

          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            rows={2}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 18,
              color: "#fff",
              lineHeight: 1.5,
              display: "block",
            }}
          />

          <p style={{
            fontFamily: sans,
            fontWeight: 300,
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
            margin: "0.5rem 0 0 0",
          }}>
            Describe a feeling, a name, a morning — anything.
          </p>
        </div>

        {/* Search button */}
        <button
          onClick={handleSubmit}
          style={{
            fontFamily: sans,
            fontWeight: 300,
            fontSize: 11,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            paddingTop: "0.2rem",
            whiteSpace: "nowrap",
          }}
        >
          Search →
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BODY COPY
// ═══════════════════════════════════════════════════════════════════
const THREE_COLS = [
  {
    label: "Discovery",
    copy: "Search by mood, material, architect, or the feeling you've never quite found words for.",
  },
  {
    label: "In Residence",
    copy: "Every estate arrives with a world — objects, furniture, atmosphere — curated to belong inside it.",
  },
  {
    label: "Reserve",
    copy: "A private membership for those ready to move. Pricing, access, and invitations that exist nowhere else.",
  },
]

function BodyCopySection() {
  return (
    <section style={{ background: BG, padding: `6rem ${PAD}` }}>
      <div style={{ maxWidth: MAX, margin: "0 auto" }}>
        {/* Main copy */}
        <p style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 22,
          color: INK,
          maxWidth: 640,
          lineHeight: 1.6,
          textAlign: "center",
          margin: "0 auto",
          fontWeight: 400,
        }}>
          Threshold is a space crafted for the world's most singular architectural estates. Search the way you think — every detail brings you closer.
        </p>

        {/* Three columns */}
        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {THREE_COLS.map((col, i) => (
            <div
              key={col.label}
              style={{
                padding: `0 ${i === 0 ? "2rem 0 0" : "2rem"}`,
                borderLeft: i > 0 ? `0.5px solid ${BORDER}` : "none",
              }}
            >
              <p style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: FAINT,
                margin: "0 0 0.75rem 0",
              }}>
                {col.label}
              </p>
              <p style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: 16,
                fontWeight: 400,
                color: INK,
                lineHeight: 1.5,
                margin: 0,
              }}>
                {col.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// IN RESIDENCE
// ═══════════════════════════════════════════════════════════════════
function ResidenceCard({ item }) {
  return (
    <div style={{ background: "#F5F3F0", borderRadius: 8, padding: "1.25rem" }}>
      <div style={{
        width: "100%",
        aspectRatio: "4/3",
        background: "#E8E4E0",
        borderRadius: 4,
        marginBottom: "0.75rem",
      }} />
      <span style={{
        fontFamily: sans,
        fontWeight: 300,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: FAINT,
      }}>
        {item.category}
      </span>
      <p style={{
        fontFamily: serif,
        fontStyle: "italic",
        fontSize: 15,
        fontWeight: 400,
        color: INK,
        lineHeight: 1.3,
        margin: "0.25rem 0 0 0",
      }}>
        {item.name}
      </p>
    </div>
  )
}

function InResidenceSection() {
  return (
    <section style={{ borderTop: `0.5px solid ${BORDER}`, padding: `6rem ${PAD}` }}>
      <div style={{ maxWidth: MAX, margin: "0 auto" }}>
        <p style={{
          fontFamily: sans,
          fontSize: 10,
          fontWeight: 400,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: FAINT,
          margin: 0,
        }}>
          In Residence
        </p>
        <h2 style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 400,
          color: INK,
          lineHeight: 1.15,
          marginTop: "0.5rem",
          marginBottom: 0,
        }}>
          A world assembled for this house alone.
        </h2>
        <p style={{
          fontFamily: sans,
          fontWeight: 300,
          fontSize: 14,
          color: MUTED,
          maxWidth: 480,
          lineHeight: 1.85,
          marginTop: "1rem",
          marginBottom: 0,
        }}>
          Objects, furniture, art, and atmosphere chosen for this property and no other. Not what could work here — what belongs here.
        </p>

        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {RESIDENCE_ITEMS.map((item, i) => <ResidenceCard key={i} item={item} />)}
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
    <div style={{ borderTop: `0.5px solid ${BORDER}`, padding: `5rem ${PAD}`, textAlign: "center" }}>
      <Link
        href="/reserve"
        className="transition-opacity duration-200 hover:opacity-70"
        style={{ textDecoration: "none", cursor: "pointer", display: "inline-block" }}
      >
        <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 22, fontWeight: 400, color: INK, margin: 0 }}>
          Threshold Reserve
        </p>
        <p style={{ fontFamily: sans, fontSize: 13, color: FAINT, margin: "0.5rem 0 0 0" }}>
          →
        </p>
      </Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ borderTop: `0.5px solid ${BORDER}`, padding: "2rem", textAlign: "center" }}>
      <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: FAINT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        threshold.estate
      </span>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage({ onSearch, onSignUp, onSignIn, user }) {
  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <AnnouncementBar />
      <Nav />
      <main>
        <HeroSection onSearch={onSearch} />
        <BodyCopySection />
        <InResidenceSection />
        <ReserveWhisper />
        <Footer />
      </main>
    </div>
  )
}
