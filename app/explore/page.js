"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

const COLLECTIONS = [
  {
    id: "architectural-icons",
    label: "Architectural Icons",
    tagline: "You seek houses that represent pivotal moments in architectural history and innovation.",
    subcategories: [
      { id: "mid-century-masters", name: "Mid-Century Masters", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
      { id: "lautner-neutra", name: "Lautner / Neutra / Schindler", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" },
      { id: "brutalist-works", name: "Brutalist Works", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
      { id: "experimental-forms", name: "Experimental Forms", image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&q=80" },
    ],
  },
  {
    id: "california-modern",
    label: "California Modern",
    tagline: "A particular genius for dissolving walls — where the Pacific defines the threshold.",
    subcategories: [
      { id: "canyon", name: "Canyon", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80" },
      { id: "coast", name: "Coast", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80" },
      { id: "desert-edge", name: "Desert Edge", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80" },
      { id: "valley-compounds", name: "Valley Compounds", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },
    ],
  },
  {
    id: "nature-within",
    label: "Nature Within",
    tagline: "Architecture that accepts the land as collaborator — not canvas.",
    subcategories: [
      { id: "forest", name: "Forest Dwellings", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80" },
      { id: "meadow", name: "Meadow Houses", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80" },
      { id: "waterside", name: "Waterside", image: "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&q=80" },
      { id: "garden-rooms", name: "Garden as Room", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80" },
    ],
  },
  {
    id: "spanish-revival",
    label: "Spanish Revival",
    tagline: "Thick walls and cool interiors — a vocabulary perfected over centuries.",
    subcategories: [
      { id: "hacienda", name: "Hacienda", image: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80" },
      { id: "mission", name: "Mission Style", image: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80" },
      { id: "mediterranean", name: "Mediterranean", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80" },
      { id: "contemporary-spanish", name: "Contemporary Spanish", image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80" },
    ],
  },
  {
    id: "hillside-retreats",
    label: "Hillside Retreats",
    tagline: "What the view demands, the structure provides — cantilevered into certainty.",
    subcategories: [
      { id: "perched", name: "Perched", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80" },
      { id: "terraced", name: "Terraced", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80" },
      { id: "cantilevered", name: "Cantilevered", image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80" },
      { id: "hidden", name: "Hidden in the Hill", image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&q=80" },
    ],
  },
  {
    id: "quiet-luxury",
    label: "Quiet Luxury",
    tagline: "Nothing announces itself. Everything is felt.",
    subcategories: [
      { id: "minimal", name: "Minimal", image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80" },
      { id: "material-led", name: "Material-Led", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80" },
      { id: "wabi", name: "Wabi Sensibility", image: "https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80" },
      { id: "compound", name: "Private Compounds", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" },
    ],
  },
]

const THEMES = [
  "Solitude", "Gathering", "Light as Material", "Garden as Architecture",
  "Indoors Dissolved", "Work and Make", "Coastal", "Desert", "Urban", "Mountain",
]

// Subcategory name → DB subcategory value mapping
const SUBCATEGORY_DB_MAP = {
  "Mid-Century Masters": "Mid-Century Resolved",
  "Lautner / Neutra / Schindler": "Masters of Form",
  "Brutalist Works": "Brutalist Intimacy",
  "Experimental Forms": "Contemporary Canon",
}

function SubcategoryCard({ sub, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ flexShrink: 0, width: 220, cursor: "pointer" }}
    >
      <div style={{
        width: "100%", height: 280, borderRadius: 18, overflow: "hidden", position: "relative",
        background: "#1a1a1a",
        outline: active ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
        transition: "outline 0.2s",
      }}>
        <img
          src={sub.image}
          alt={sub.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
        {active && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.06)", borderRadius: 18 }} />
        )}
      </div>
      <div style={{
        marginTop: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 12,
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        textAlign: "center", letterSpacing: "0.02em", transition: "color 0.2s",
      }}>{sub.name}</div>
    </div>
  )
}

function PropertyCard({ property }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={`/property/${property.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 12, overflow: "hidden", background: "#111",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.6)" : "0 2px 16px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ position: "relative", height: 320 }}>
          {(property.hero_photo || property.image) ? (
            <img src={property.hero_photo || property.image} alt={property.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1a1a20" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", whiteSpace: "nowrap",
          }}>{property.location}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#fff", lineHeight: 1.15, marginBottom: 4 }}>{property.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {property.architect}{property.year ? ` / ${property.year}` : ""}
            </div>
            {property.price && (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, marginTop: 6 }}>{property.price}</div>
            )}
          </div>
        </div>
        {property.significance && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{property.significance}</div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function ExplorePage() {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0])
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const [activeThemes, setActiveThemes] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    supabase.from("properties").select("*").eq("published", true).then(({ data }) => {
      setProperties(data || [])
      setLoading(false)
    })
  }, [])

  const handleCollectionClick = (col) => {
    setActiveCollection(col)
    setActiveSubcategory(null)
  }

  const toggleTheme = (t) => setActiveThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const filteredProperties = properties.filter(p => {
    if (p.collection && p.collection !== activeCollection.id) return false
    if (activeSubcategory) {
      const dbName = SUBCATEGORY_DB_MAP[activeSubcategory.name] || activeSubcategory.name
      if (p.subcategory && p.subcategory !== dbName && p.subcategory !== activeSubcategory.name) return false
    }
    if (activeThemes.length > 0) {
      const tags = [...(p.idea_tags || []), p.landscape_tag].filter(Boolean)
      if (!activeThemes.some(t => tags.includes(t))) return false
    }
    return true
  })

  return (
    <div style={{ minHeight: "100vh", background: "#111110", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { display: none; }
        .theme-pill:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
        .coll-tab:hover { color: rgba(255,255,255,0.8) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "grid", gridTemplateColumns: "auto 1fr auto",
        alignItems: "center", gap: 32,
        padding: "0 48px", height: 56,
        background: "#111110", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Left: logo + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/threshold-logo.png" alt="Threshold" style={{ height: 44, width: "auto", display: "block" }} />
          </Link>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F7F4EC", fontWeight: 600 }}>Explore</span>
        </div>

        {/* Center: search */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.07)", borderRadius: 50,
            padding: "0 20px", width: "100%", maxWidth: 460, height: 38,
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3"/>
              <path d="M11 11L14 14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchValue.trim()) window.location.href = `/?q=${encodeURIComponent(searchValue)}` }}
              placeholder={`Try 'I want to live in a house with ocean views'`}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: "#fff",
              }}
            />
          </div>
        </div>

        {/* Right: sign in */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ background: "#fff", color: "#111110", border: "none", borderRadius: 40, padding: "8px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            Sign In
          </button>
        </Link>
      </nav>

      {/* Collections tabs */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 48px", display: "flex", gap: 0 }}>
        {COLLECTIONS.map(col => (
          <button
            key={col.id}
            className="coll-tab"
            onClick={() => handleCollectionClick(col)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "20px 0", marginRight: 48,
              fontFamily: "'DM Sans', sans-serif", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: activeCollection.id === col.id ? "#fff" : "rgba(255,255,255,0.35)",
              fontWeight: activeCollection.id === col.id ? 500 : 400,
              borderBottom: activeCollection.id === col.id ? "2px solid #fff" : "2px solid transparent",
              transition: "color 0.2s",
              whiteSpace: "nowrap",
            }}
          >{col.label}</button>
        ))}
      </div>

      <div style={{ padding: "52px 48px 80px" }}>

        {/* Subcategory horizontal scroll */}
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4, marginBottom: 40 }}>
          {activeCollection.subcategories.map(sub => (
            <SubcategoryCard
              key={sub.id}
              sub={sub}
              active={activeSubcategory?.id === sub.id}
              onClick={() => setActiveSubcategory(prev => prev?.id === sub.id ? null : sub)}
            />
          ))}
        </div>

        {/* Editorial tagline */}
        <div style={{ marginBottom: 52 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: 22, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 560,
          }}>
            {activeCollection.tagline}
          </p>
        </div>

        {/* Theme filters */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>
            Explore by Theme
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THEMES.map(t => {
              const active = activeThemes.includes(t)
              return (
                <button
                  key={t}
                  className="theme-pill"
                  onClick={() => toggleTheme(t)}
                  style={{
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    border: `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.14)"}`,
                    borderRadius: 40, padding: "7px 18px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                    transition: "all 0.2s",
                  }}
                >{t}</button>
              )
            })}
          </div>
        </div>

        {/* Count */}
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>
          {loading ? "Loading..." : `${filteredProperties.length} ${filteredProperties.length === 1 ? "Property" : "Properties"} Matched`}
        </div>

        {/* Property grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "#1a1a1a" }}>
                <div style={{ height: 320 }} />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ paddingTop: 60, textAlign: "center" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.25)" }}>
              No residences match these filters yet —<br />the collection grows each season.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filteredProperties.map((property, i) => (
              <div key={property.id} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60}ms` }}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
