"use client"
import { useState, useRef, useEffect } from "react"

const PAIRING = {
  furniture: [
    { name: "Lounge Chair & Ottoman", brand: "Charles & Ray Eames", note: "The original resolution of comfort and steel." },
    { name: "Barcelona Chair", brand: "Ludwig Mies van der Rohe", note: "Conceived for a king. At home here." },
    { name: "Bertoia Diamond Chair", brand: "Harry Bertoia", note: "Wire and air — it disappears into the view." },
  ],
  objects: [
    { name: "Noguchi Akari 1A", brand: "Isamu Noguchi", note: "Light as sculpture. Never overhead." },
    { name: "Blown Glass Carafe", brand: "Ichendorf Milano", note: "Water catches the afternoon differently here." },
    { name: "Plinth Block", brand: "Muller Van Severen", note: "A surface that asks nothing of the room." },
  ],
  materials: [
    { name: "Honed Black Slate", brand: "Antolini", note: "Cool underfoot. Holds the heat of the afternoon." },
    { name: "Raw Linen Drapery", brand: "Dedar Milano", note: "The wind moves through it like a thought." },
    { name: "Oiled White Oak", brand: "Dinesen", note: "Time will only improve it." },
  ],
  wardrobe: [
    { name: "Cotton Turtleneck", brand: "Lemaire", note: "Nothing competes with the view." },
    { name: "Linen Trousers", brand: "Studio Nicholson", note: "Made for a life with more space in it." },
  ],
}

const PROMPTS = [
  "Does the kitchen get morning light?",
  "What is the countertop material?",
  "How does the light change throughout the day?",
  "What makes this home architecturally significant?",
  "How do the indoor and outdoor spaces connect?",
  "What would evenings feel like here?",
]

function AskBar({ property }) {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => (i + 1) % PROMPTS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (expanded) setTimeout(() => inputRef.current?.focus(), 100)
  }, [expanded])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setExpanded(false)
    }
    if (expanded) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [expanded])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")
    const history = [...messages, { role: "user", content: msg }]
    setMessages(history)
    setLoading(true)
    const aiIdx = history.length
    setMessages(m => [...m, { role: "assistant", content: "" }])
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg, propertyId: property.id, history }),
      })
      if (!res.ok || !res.body) throw new Error()
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const data = await res.json()
        setMessages(m => m.map((x, i) => i === aiIdx ? { ...x, content: data.response || "" } : x))
      } else {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          setMessages(m => m.map((x, i) => i === aiIdx ? { ...x, content: full } : x))
        }
      }
    } catch {
      setMessages(m => m.map((x, i) => i === aiIdx ? { ...x, content: "Unable to respond right now." } : x))
    }
    setLoading(false)
  }

  const lastQ = messages.filter(m => m.role === "user").slice(-1)[0]?.content
  const lastA = messages.filter(m => m.role === "assistant").slice(-1)[0]?.content

  return (
    <>
      <style>{`
        @keyframes promptSlide { 0%{opacity:0;transform:translateY(3px)} 10%{opacity:1;transform:translateY(0)} 90%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-3px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expandUp { from{opacity:0;transform:scaleY(0.92) translateY(8px)} to{opacity:1;transform:scaleY(1) translateY(0)} }
        .ask-bar { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .ask-bar:hover { border-color: rgba(255,255,255,0.18) !important; }
      `}</style>

      <div ref={panelRef} style={{
        position: "fixed", bottom: 32, left: 32, zIndex: 200,
        width: 320, fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Response bubble — appears above bar */}
        {lastA && (
          <div style={{
            marginBottom: 12, padding: "16px 18px",
            background: "rgba(15,15,15,0.82)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            animation: "fadeUp 0.3s ease",
          }}>
            {lastQ && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: "0.02em" }}>
                {lastQ}
              </div>
            )}
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, fontWeight: 300 }}>
              {lastA.split(/\n\n+/).filter(Boolean).map((p, i) => (
                <p key={i} style={{ margin: i > 0 ? "10px 0 0" : 0 }}>{p}</p>
              ))}
              {loading && !lastA && <span style={{ opacity: 0.3 }}>···</span>}
            </div>
          </div>
        )}

        {/* Expanded panel */}
        {expanded && (
          <div style={{
            marginBottom: 8, padding: "20px 18px 16px",
            background: "rgba(15,15,15,0.88)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
            animation: "expandUp 0.25s cubic-bezier(0.16,1,0.3,1)",
            transformOrigin: "bottom center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PROMPTS.slice(0, 4).map((p, i) => (
                <button key={i} onClick={() => { send(p); setExpanded(false) }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", padding: "6px 0",
                  fontSize: 12, color: "rgba(255,255,255,0.35)",
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The bar itself */}
        <div className="ask-bar" style={{
          display: "flex", alignItems: "center",
          background: "rgba(15,15,15,0.72)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "0 16px",
          height: 46, cursor: "text", position: "relative",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }} onClick={() => { setExpanded(true); inputRef.current?.focus() }}>
          {/* Rotating placeholder */}
          {!input && (
            <div key={promptIdx} style={{
              position: "absolute", left: 16, right: 16,
              fontSize: 13, color: "rgba(255,255,255,0.28)",
              animation: "promptSlide 4.5s ease infinite",
              pointerEvents: "none", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {PROMPTS[promptIdx]}
            </div>
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { send(); setExpanded(false) } if (e.key === "Escape") setExpanded(false) }}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.85)", letterSpacing: "0.01em",
            }}
          />
        </div>
      </div>
    </>
  )
}

function FadeImage({ src, alt, style }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease", overflow: "hidden" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []

  return (
    <div style={{ background: "#f9f7f4", color: "#1a1a1a", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .col-left { animation: fadeIn 0.6s ease 0.1s both; }
        .col-right { animation: fadeIn 0.6s ease 0.3s both; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px",
        background: "rgba(249,247,244,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.22em", color: "#888", textTransform: "uppercase" }}>Threshold</button>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#aaa", letterSpacing: "0.04em" }}>← Collection</button>
      </nav>

      {/* 3-column layout */}
      <div style={{
        maxWidth: 1440, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "300px 1fr 280px",
        gap: "0 48px",
        padding: "120px 40px 0",
        alignItems: "start",
      }}>

        {/* LEFT — editorial text, scrolls normally */}
        <div className="col-left" style={{ paddingBottom: 120 }}>
          {/* Location */}
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#c9a96e", textTransform: "uppercase", marginBottom: 16 }}>
            {property.location}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, lineHeight: 1.1, marginBottom: 8, color: "#0f0f0f" }}>
            {property.name}
          </h1>

          {/* Architect */}
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#999", marginBottom: 40, letterSpacing: "0.02em" }}>
            {property.architect}{property.year ? ` · ${property.year}` : ""}
          </div>

          {/* Price */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#0f0f0f", marginBottom: 40 }}>
            {property.price}
          </div>

          {/* Tags */}
          {(property.idea_tags || []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 40 }}>
              {(property.idea_tags || []).map(tag => (
                <span key={tag} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#aaa", border: "1px solid #e0ddd8", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
              ))}
              {property.landscape_tag && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#aaa", border: "1px solid #e0ddd8", borderRadius: 20, padding: "3px 10px" }}>{property.landscape_tag}</span>}
            </div>
          )}

          {/* Editorial */}
          {property.editorial && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#555", lineHeight: 1.85, marginBottom: 32 }}>
              {property.editorial.split(/\n\n+/).map((p, i) => <p key={i} style={{ marginBottom: 16 }}>{p}</p>)}
            </div>
          )}

          {property.architect_context && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#bbb", textTransform: "uppercase", marginBottom: 12 }}>Architect</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#777", lineHeight: 1.9 }}>{property.architect_context}</div>
            </div>
          )}

          {property.site_context && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#bbb", textTransform: "uppercase", marginBottom: 12 }}>Site</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#777", lineHeight: 1.9 }}>{property.site_context}</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ width: "100%", padding: "11px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Request a Tour
            </button>
            <button style={{ width: "100%", padding: "11px", background: "none", color: "#0f0f0f", border: "1px solid #e0ddd8", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Save Estate
            </button>
          </div>
        </div>

        {/* CENTER — images scroll freely */}
        <div style={{ paddingBottom: 200 }}>
          {photos.length > 0 ? (
            <>
              {/* Hero image */}
              <FadeImage src={photos[0]} alt={property.name} style={{ width: "100%", aspectRatio: "4/3", marginBottom: 4 }} />

              {/* Remaining images */}
              {photos.slice(1).map((url, i) => {
                // Occasionally do a 2-image grid
                if (i % 5 === 3 && photos[i + 2]) {
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                      <FadeImage src={url} alt={`${property.name} ${i + 2}`} style={{ aspectRatio: "3/4" }} />
                      <FadeImage src={photos[i + 2]} alt={`${property.name} ${i + 3}`} style={{ aspectRatio: "3/4" }} />
                    </div>
                  )
                }
                if (i % 5 === 4) return null // skip — already rendered in pair above
                return <FadeImage key={i} src={url} alt={`${property.name} ${i + 2}`} style={{ width: "100%", aspectRatio: "16/10", marginBottom: 4 }} />
              })}
            </>
          ) : (
            <div style={{ width: "100%", aspectRatio: "4/3", background: "#e8e4de", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#bbb" }}>No photos yet</span>
            </div>
          )}
        </div>

        {/* RIGHT — sticky pairing panel */}
        <div className="col-right" style={{ position: "sticky", top: 100, paddingBottom: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#0f0f0f", marginBottom: 4 }}>The Pairing</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#bbb", letterSpacing: "0.04em" }}>Objects that belong to this space</div>
          </div>

          {[
            { label: "Furniture", items: PAIRING.furniture },
            { label: "Objects", items: PAIRING.objects },
            { label: "Materials", items: PAIRING.materials },
            { label: "Wardrobe", items: PAIRING.wardrobe },
          ].map(section => (
            <div key={section.label} style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#ccc", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #f0ede8" }}>
                {section.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {section.items.map((item, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: 3 }}>{item.brand}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#0f0f0f", fontWeight: 400, marginBottom: 3 }}>{item.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa", lineHeight: 1.6, fontStyle: "italic" }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating ask bar */}
      <AskBar property={property} />
    </div>
  )
}