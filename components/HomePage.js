"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"

const FALLBACK_COLORS = [
  "#1a2030","#182818","#282018","#1e1e2c","#201a28","#1a2818","#2c2018","#181e2c",
]

// ── Infinite scrolling gallery ────────────────────────────────────────────

function ScrollingGallery({ images }) {
  // Duplicate images so the loop is seamless
  const items = images.length ? [...images, ...images] : FALLBACK_COLORS.map(c => ({ color: c }))
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div style={{
        display: "flex", gap: 16,
        animation: `marquee ${images.length * 6}s linear infinite`,
        width: "max-content",
      }}>
        {items.map((img, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 220, height: 280,
            borderRadius: 8, overflow: "hidden",
            background: img.color || "#1a1a18",
          }}>
            {img.url && (
              <img src={img.url} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Collection card ───────────────────────────────────────────────────────

function CollectionCard({ property, large }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={`/property/${property.id}`}
      style={{ textDecoration: "none", display: "block", borderRadius: 8, overflow: "hidden", background: "#111", cursor: "pointer", transform: hovered ? "translateY(-3px)" : "none", transition: "transform 0.3s ease", boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.6)" : "none" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "relative", height: large ? 520 : 320 }}>
        {property.hero_photo
          ? <img src={property.hero_photo} alt={property.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, background: "#1a1a24" }} />
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,12,12,0.92) 0%, transparent 52%)" }} />
        <div style={{ position: "absolute", top: 16, right: 16, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(247,244,236,0.35)", textTransform: "uppercase" }}>
          {property.location}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 22px" }}>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: large ? 24 : 19, color: "#F7F4EC", lineHeight: 1.1, marginBottom: 4 }}>{property.name}</div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "rgba(247,244,236,0.4)" }}>{property.architect}{property.year ? ` · ${property.year}` : ""}</div>
        </div>
      </div>
    </a>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

const GALLERY_IMAGES = [
  { url: "/homes-1.jpg" },
  { url: "/homes-2.webp" },
  { url: "/homes-3.jpg" },
  { url: "/homes-4.jpg" },
]

export default function HomePage({ onSearch, onSignUp, onSignIn, user, searchValue, setSearchValue }) {
  const [properties, setProperties] = useState([])
  const collectionRef = useRef(null)

  useEffect(() => {
    supabase
      .from("properties")
      .select("id, name, location, hero_photo, idea_tags, landscape_tag, architect, year, price")
      .eq("published", true)
      .then(({ data }) => { if (data?.length) setProperties(data) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ background: "#111110", color: "#F7F4EC", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scrollPulse { 0%,100%{opacity:0.3;transform:translateY(0)} 50%{opacity:0.7;transform:translateY(5px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

        {/* Scrolling gallery */}
        <div style={{
          position: "absolute", bottom: "8%", left: 0, right: 0, zIndex: 0,
          animation: "fadeIn 1.2s ease 0.6s both",
        }}>
          <ScrollingGallery images={GALLERY_IMAGES} />
        </div>

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, #111110 0%, #111110 22%, rgba(17,17,16,0.45) 52%, rgba(17,17,16,0.15) 100%)" }} />

        {/* Nav */}
        <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 48px" }}>
          <div /><div />
        </nav>

        {/* Hero content */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "56vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 10, textAlign: "center", padding: "0 48px",
        }}>

          {/* Pill bar */}
          <div style={{
            position: "fixed", top: 20, left: 0, right: 0, margin: "0 auto",
            zIndex: 100,
            display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
            width: 480,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            borderRadius: 8, padding: "10px 20px",
            animation: "fadeUp 1s ease 0.1s both",
          }}>
            <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(247,244,236,0.4)", textTransform: "uppercase" }}>
              Manifesto
            </span>
            <img src="/threshold-logo.png" alt="Threshold" style={{ height: 33, width: "auto" }} />
            <button onClick={onSignUp} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(247,244,236,0.55)", textTransform: "uppercase", padding: 0, transition: "color 0.2s", textAlign: "right", justifySelf: "end" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F7F4EC"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(247,244,236,0.55)"}
            >
              Join Reserved
            </button>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(34px, 4.2vw, 58px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.01em", color: "#F7F4EC", margin: "0 0 28px", animation: "fadeUp 1s ease 0.3s both", textAlign: "center" }}>
            Homes shaped by<br />
            <span style={{ color: "rgba(247,244,236,0.5)", fontStyle: "italic" }}>Your taste</span>
          </h1>

          {/* Join button */}
          <button onClick={onSignUp} style={{ background: "none", border: "1px solid rgba(247,244,236,0.22)", borderRadius: 40, padding: "10px 28px", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.08em", color: "rgba(247,244,236,0.55)", marginBottom: 48, animation: "fadeUp 1s ease 0.45s both", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(247,244,236,0.5)"; e.currentTarget.style.color = "#F7F4EC" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(247,244,236,0.22)"; e.currentTarget.style.color = "rgba(247,244,236,0.55)" }}
          >
            Join Reserved
          </button>

        </div>

        {/* Scroll indicator */}
        <div
          onClick={() => collectionRef.current?.scrollIntoView({ behavior: "smooth" })}
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "fadeIn 1s ease 1.8s both" }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(247,244,236,0.2)", textTransform: "uppercase" }}>Collection</div>
          <div style={{ width: 1, height: 28, background: "rgba(247,244,236,0.15)", animation: "scrollPulse 2.5s ease-in-out infinite" }} />
        </div>
      </div>

      {/* ══ COLLECTION SCROLL SECTION ════════════════════════════════════════ */}
      <div ref={collectionRef} style={{ padding: "100px 48px 120px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          <div style={{ marginBottom: 60 }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.24em", color: "rgba(247,244,236,0.2)", textTransform: "uppercase", marginBottom: 16 }}>
              Selected for this season
            </div>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(36px, 3.6vw, 54px)", fontWeight: 300, color: "#F7F4EC", lineHeight: 1.08 }}>
              A private collection
            </h2>
          </div>

          {properties.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 14 }}>
              {properties.slice(0, Math.min(6, properties.length)).map((p, i) => (
                <CollectionCard key={p.id} property={p} large={i === 0} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 14 }}>
              {[520, 320, 320].map((h, i) => (
                <div key={i} style={{ height: h, borderRadius: 8, background: "#141414" }} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
