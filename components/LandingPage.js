"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

// ── Fonts ─────────────────────────────────────────────────────────────────────
const serif = "var(--font-eb-garamond), 'EB Garamond', Georgia, serif"
const sans  = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif"

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#151412"
const INK     = "#F0EBE1"
const MUTED   = "rgba(240,235,225,0.45)"
const WHISPER = "rgba(240,235,225,0.22)"
const BORDER  = "rgba(240,235,225,0.09)"

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

// ── In Residence items — each with a distinct placeholder gradient ─────────────
const RESIDENCE_ITEMS = [
  {
    category: "Automobile",
    name: "Porsche 911 Targa, 1973",
    gradient: "radial-gradient(ellipse at 60% 40%, #2a1f0e 0%, #0f0c08 100%)",
  },
  {
    category: "Seating",
    name: "Prouvé Standard Chair, 1934",
    gradient: "radial-gradient(ellipse at 40% 60%, #1a1e22 0%, #0c0e10 100%)",
  },
  {
    category: "Lighting",
    name: "Noguchi Akari 55A",
    gradient: "radial-gradient(ellipse at 50% 30%, #2e2618 0%, #141210 100%)",
  },
  {
    category: "Object",
    name: "Brancusi-inspired sculpture",
    gradient: "radial-gradient(ellipse at 35% 55%, #1c1a18 0%, #0d0c0b 100%)",
  },
  {
    category: "Textile",
    name: "Loro Piana cashmere, undyed",
    gradient: "radial-gradient(ellipse at 60% 50%, #221e18 0%, #100e0c 100%)",
  },
  {
    category: "Glassware",
    name: "Lobmeyr Series B",
    gradient: "radial-gradient(ellipse at 45% 35%, #161a1e 0%, #0a0c0e 100%)",
  },
  {
    category: "Scent",
    name: "Cire Trudon Ernesto",
    gradient: "radial-gradient(ellipse at 55% 60%, #201812 0%, #0e0b09 100%)",
  },
  {
    category: "Surface",
    name: "Nero Marquina, honed",
    gradient: "radial-gradient(ellipse at 40% 40%, #18181a 0%, #0a0a0c 100%)",
  },
]

// ── Hero placeholder — suggests a dramatic architectural interior ──────────────
const HERO_BG = `
  radial-gradient(ellipse at 30% 60%, rgba(52,40,28,0.9) 0%, transparent 55%),
  radial-gradient(ellipse at 80% 20%, rgba(30,26,20,0.8) 0%, transparent 50%),
  linear-gradient(170deg, #1e1a14 0%, #0e0c0a 60%, #080706 100%)
`.trim()

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
      <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, color: WHISPER, letterSpacing: "0.06em" }}>
        Now featuring estates in Los Angeles, Malibu, and the Bay Area
      </span>
      <Link
        href="/reserve"
        style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, color: WHISPER, letterSpacing: "0.06em", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: BORDER }}
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
      <img src="/threshold-logo.png" alt="Threshold" style={{ height: 24, width: "auto", display: "block" }} />
      <div className="flex items-center" style={{ gap: "2rem" }}>
        <Link
          href="/explore"
          style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.1em", color: MUTED, textDecoration: "none" }}
        >
          Explore
        </Link>
        <Link
          href="/reserve"
          style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: MUTED, textDecoration: "none" }}
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
  const [value, setValue]                           = useState("")
  const [placeholderIdx, setPlaceholderIdx]         = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [focused, setFocused]                       = useState(false)

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
    <section style={{ position: "relative", height: "100vh", background: HERO_BG }}>

      {/* Subtle vignette overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* Layer 1 — headline at 35% */}
      <div style={{
        position: "absolute",
        top: "35%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: MAX,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{
            fontFamily: serif,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(240,235,225,0.55)",
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
            color: INK,
            lineHeight: 1.05,
            marginTop: "0.5rem",
            marginBottom: 0,
            letterSpacing: "-0.01em",
          }}>
            Where you always<br />wanted to live.
          </h1>
        </div>
      </div>

      {/* Layer 2 — prominent pill search bar */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        paddingLeft: PAD,
        paddingRight: PAD,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 780,
          background: "rgba(28,25,21,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 40,
          border: "1px solid rgba(240,235,225,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "20px 28px",
          gap: 16,
        }}>
          {/* Placeholder / input */}
          <div style={{ flex: 1, position: "relative" }}>
            {!focused && !value && (
              <div style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: 0,
                right: 0,
                pointerEvents: "none",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                opacity: placeholderVisible ? 1 : 0,
                transition: "opacity 0.6s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}>
                <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 18, color: "rgba(240,235,225,0.3)", flexShrink: 0 }}>Try</span>
                <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 20, color: "rgba(240,235,225,0.55)" }}>'{PLACEHOLDERS[placeholderIdx]}'</span>
              </div>
            )}
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSubmit() } }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: 20,
                color: INK,
                lineHeight: 1,
              }}
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSubmit}
            style={{
              background: value ? INK : "rgba(240,235,225,0.12)",
              border: "none",
              borderRadius: 28,
              padding: "10px 22px",
              cursor: "pointer",
              fontFamily: sans,
              fontWeight: 400,
              fontSize: 12,
              color: value ? BG : "rgba(240,235,225,0.35)",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              transition: "background 0.2s, color 0.2s",
              flexShrink: 0,
            }}
          >
            Search
          </button>
        </div>
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

        <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {THREE_COLS.map((col, i) => (
            <div
              key={col.label}
              style={{
                padding: i === 0 ? "0 2rem 0 0" : "0 2rem",
                borderLeft: i > 0 ? `0.5px solid ${BORDER}` : "none",
              }}
            >
              <p style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: WHISPER,
                margin: "0 0 0.75rem 0",
              }}>
                {col.label}
              </p>
              <p style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: 16,
                fontWeight: 400,
                color: MUTED,
                lineHeight: 1.6,
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
    <div style={{ background: "rgba(240,235,225,0.03)", borderRadius: 6, padding: "1rem" }}>
      {/* Placeholder image */}
      <div style={{
        width: "100%",
        aspectRatio: "4/3",
        background: item.gradient,
        borderRadius: 4,
        marginBottom: "0.85rem",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Subtle inner highlight to suggest depth */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(240,235,225,0.04) 0%, transparent 60%)",
        }} />
      </div>
      <span style={{
        fontFamily: sans,
        fontWeight: 300,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: WHISPER,
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
          color: WHISPER,
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

        <div style={{
          marginTop: "3rem",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}>
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
        <p style={{ fontFamily: sans, fontSize: 13, color: WHISPER, margin: "0.5rem 0 0 0" }}>
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
      <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: WHISPER, letterSpacing: "0.1em", textTransform: "uppercase" }}>
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
