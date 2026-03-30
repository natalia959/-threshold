"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

const COLLECTIONS = [
  {
    id: "architectural-icons",
    label: "Architectural Icons",
    tagline: "Homes that altered the conversation — built by the hands that changed how we live.",
    subcategories: [
      { id: "masters", name: "Masters of Form", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", description: "Neutra, Schindler, Lautner" },
      { id: "brutalist", name: "Brutalist Intimacy", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", description: "Raw concrete, honest structure" },
      { id: "midcentury", name: "Mid-Century Resolved", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", description: "The golden ratio of modernity" },
      { id: "contemporary", name: "Contemporary Canon", image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&q=80", description: "Works already being studied" },
    ],
  },
  {
    id: "california-modern",
    label: "California Modern",
    tagline: "A particular genius for dissolving walls — where the Pacific defines the threshold.",
    subcategories: [
      { id: "canyon", name: "Canyon", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80", description: "Topanga, Laurel, Malibu Creek" },
      { id: "coast", name: "Coast", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", description: "Malibu to Big Sur" },
      { id: "desert-edge", name: "Desert Edge", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", description: "Palm Springs and beyond" },
      { id: "valley", name: "Valley Compounds", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", description: "Hidden behind olive groves" },
    ],
  },
  {
    id: "nature-within",
    label: "Nature Within",
    tagline: "Architecture that accepts the land as collaborator — not canvas.",
    subcategories: [
      { id: "forest", name: "Forest Dwellings", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", description: "Among old-growth and fern" },
      { id: "meadow", name: "Meadow Houses", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80", description: "Open land, open rooms" },
      { id: "waterside", name: "Waterside", image: "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&q=80", description: "Lake, river, tide" },
      { id: "garden-rooms", name: "Garden as Room", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80", description: "The outside brought inside" },
    ],
  },
  {
    id: "spanish-revival",
    label: "Spanish Revival",
    tagline: "Thick walls and cool interiors — a vocabulary perfected over centuries.",
    subcategories: [
      { id: "hacienda", name: "Hacienda", image: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80", description: "Courtyards and colonnades" },
      { id: "mission", name: "Mission Style", image: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80", description: "Arched and stuccoed" },
      { id: "mediterranean", name: "Mediterranean", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80", description: "Terracotta and olive" },
      { id: "contemporary-spanish", name: "Contemporary Spanish", image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80", description: "Old grammar, new sentence" },
    ],
  },
  {
    id: "hillside-retreats",
    label: "Hillside Retreats",
    tagline: "What the view demands, the structure provides — cantilevered into certainty.",
    subcategories: [
      { id: "perched", name: "Perched", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", description: "Cliff-edge and ridge-top" },
      { id: "terraced", name: "Terraced", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80", description: "Following the contour" },
      { id: "cantilevered", name: "Cantilevered", image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80", description: "Engineering as gesture" },
      { id: "hidden", name: "Hidden in the Hill", image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&q=80", description: "Earth-sheltered and unseen" },
    ],
  },
  {
    id: "quiet-luxury",
    label: "Quiet Luxury",
    tagline: "Nothing announces itself. Everything is felt.",
    subcategories: [
      { id: "minimal", name: "Minimal", image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80", description: "The eloquence of restraint" },
      { id: "material-led", name: "Material-Led", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80", description: "Stone, walnut, linen" },
      { id: "wabi", name: "Wabi Sensibility", image: "https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80", description: "Imperfect, impermanent" },
      { id: "compound", name: "Private Compounds", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", description: "Gated and protected" },
    ],
  },
]

const THEMES = [
  { id: "solitude", label: "Solitude", sub: "Away from the noise of everything" },
  { id: "gathering", label: "Gathering", sub: "Built for people, for meals, for occasion" },
  { id: "light-as-material", label: "Light as Material", sub: "Architecture shaped by what the sun does" },
  { id: "garden-as-architecture", label: "Garden as Architecture", sub: "Outdoor rooms with intention" },
  { id: "indoors-dissolved", label: "Indoors Dissolved", sub: "Where inside ends and outside begins" },
  { id: "work-and-make", label: "Work and Make", sub: "Ateliers, studios, dedicated creative space" },
  { id: "coastal", label: "Coastal", sub: "Salt air and shifting light" },
  { id: "desert", label: "Desert", sub: "Silence and heat and wide sky" },
  { id: "urban", label: "Urban", sub: "Architecture that holds its ground in the city" },
  { id: "mountain", label: "Mountain", sub: "Elevation and exposure" },
]

function SubcategoryCard({ sub, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 8, overflow: "hidden", cursor: "pointer",
        aspectRatio: "4/3",
        outline: active ? "1px solid rgba(247,244,236,0.5)" : "1px solid transparent",
        transition: "outline 0.2s",
      }}
    >
      <img
        src={sub.image}
        alt={sub.name}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: hovered
          ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)"
          : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
        transition: "background 0.5s",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px",
        transform: hovered ? "translateY(0)" : "translateY(4px)",
        transition: "transform 0.4s ease",
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#fff", marginBottom: 3 }}>{sub.name}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.35s",
        }}>{sub.description}</div>
      </div>
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
          borderRadius: 10, overflow: "hidden", background: "#111",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.6)" : "0 2px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ position: "relative", height: 260 }}>
          {(property.hero_photo || property.image) ? (
            <img src={property.hero_photo || property.image} alt={property.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1a1a20" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{property.location}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: "#fff", lineHeight: 1.2, marginBottom: 2 }}>{property.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{property.architect} · {property.year}</div>
          </div>
        </div>
        <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{property.price}</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>VIEW →</span>
        </div>
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
  const gridRef = useRef(null)

  useEffect(() => {
    supabase.from("properties").select("*").eq("published", true).then(({ data }) => {
      setProperties(data || [])
      setLoading(false)
    })
  }, [])

  const toggleTheme = (id) => setActiveThemes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const handleCollectionClick = (col) => {
    setActiveCollection(col)
    setActiveSubcategory(null)
    if (gridRef.current) gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const filteredProperties = properties.filter(p => {
    // Collection filter
    if (p.collection && p.collection !== activeCollection.id) return false
    // Subcategory filter
    if (activeSubcategory && p.subcategory !== activeSubcategory.name) return false
    // Theme filter
    if (activeThemes.length > 0) {
      const tags = [...(p.idea_tags || []), p.landscape_tag].filter(Boolean).map(t => t.toLowerCase())
      const hasTheme = activeThemes.some(theme => {
        const themeLabel = THEMES.find(t => t.id === theme)?.label?.toLowerCase() || ""
        return tags.some(tag => tag.includes(themeLabel.split(" ")[0].toLowerCase()))
      })
      if (!hasTheme) return false
    }
    return true
  })

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50, background: "rgba(12,12,12,0.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-logo), sans-serif", fontWeight: 500, letterSpacing: "0.04em", fontSize: 15, color: "#F7F4EC" }}>THRESHOLD</span>
        </Link>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Explore</span>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 40, padding: "8px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>My Portal</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: 120, paddingBottom: 72, paddingLeft: 48, paddingRight: 48, borderBottom: "1px solid rgba(255,255,255,0.07)", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 16 }}>The Collection</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.0, color: "#fff", maxWidth: 640, marginBottom: 20 }}>
          Explore by what<br />draws you in
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.4)", maxWidth: 480, lineHeight: 1.7 }}>
          A living cabinet of architecturally significant homes, organised by sensibility rather than specification.
        </p>
      </div>

      {/* Collections Nav */}
      <div style={{ position: "sticky", top: 57, zIndex: 40, background: "rgba(12,12,12,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 48px" }}>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              onClick={() => handleCollectionClick(col)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "18px 28px 16px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: activeCollection.id === col.id ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: activeCollection.id === col.id ? 500 : 400,
                borderBottom: activeCollection.id === col.id ? "1px solid rgba(255,255,255,0.6)" : "1px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >{col.label}</button>
          ))}
        </div>
      </div>

      {/* Active Collection */}
      <div style={{ padding: "64px 48px 80px" }}>

        {/* Editorial tagline */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 560 }}>
            {activeCollection.tagline}
          </p>
        </div>

        {/* Subcategory grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 96 }}>
          {activeCollection.subcategories.map(sub => (
            <SubcategoryCard
              key={sub.id}
              sub={sub}
              active={activeSubcategory?.id === sub.id}
              onClick={() => setActiveSubcategory(prev => prev?.id === sub.id ? null : sub)}
            />
          ))}
        </div>

        {/* Themes Section */}
        <div style={{ marginBottom: 96, paddingTop: 56, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>Explore by Theme</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, color: "#fff", lineHeight: 1.1 }}>What are you drawn to?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {THEMES.map(theme => {
              const isActive = activeThemes.includes(theme.id)
              return (
                <button
                  key={theme.id}
                  onClick={() => toggleTheme(theme.id)}
                  style={{
                    background: isActive ? "rgba(247,244,236,0.08)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(247,244,236,0.3)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 8, padding: "18px 20px", cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: isActive ? "#F7F4EC" : "rgba(255,255,255,0.7)", marginBottom: 5, lineHeight: 1.2 }}>{theme.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{theme.sub}</div>
                </button>
              )
            })}
          </div>
          {activeThemes.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setActiveThemes([])} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textDecoration: "underline" }}>
                Clear themes
              </button>
            </div>
          )}
        </div>

        {/* You may also be drawn to */}
        <div style={{ marginBottom: 96, paddingBottom: 80, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>You may also be drawn to</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {COLLECTIONS.filter(c => c.id !== activeCollection.id).slice(0, 3).map(col => (
              <button key={col.id} onClick={() => handleCollectionClick(col)} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 40,
                padding: "10px 22px", cursor: "pointer",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16,
                color: "rgba(255,255,255,0.55)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)" }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)" }}
              >
                {col.label} →
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        <div ref={gridRef}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>Selected Residences</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#fff" }}>
                {activeSubcategory ? activeSubcategory.name : activeCollection.label}
              </h2>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                {loading ? "—" : `${filteredProperties.length} residence${filteredProperties.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "#1a1a1a", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i*0.15}s` }}>
                  <div style={{ height: 260 }} />
                  <div style={{ padding: 16 }}><div style={{ height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 4, width: "60%", marginBottom: 8 }} /><div style={{ height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "40%" }} /></div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.3)" }}>
                No residences match these filters yet —<br />the collection grows each season.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16 }}>
              {filteredProperties.map((property, i) => (
                <div key={property.id} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60}ms` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-logo), sans-serif", fontWeight: 500, letterSpacing: "0.04em", fontSize: 13, color: "rgba(247,244,236,0.3)" }}>THRESHOLD</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>A private collection · By invitation</span>
      </div>
    </div>
  )
}
