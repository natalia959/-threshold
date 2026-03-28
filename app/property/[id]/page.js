"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "../../../lib/supabase"

const PROMPTS = [
  "Does the kitchen get morning light?",
  "What is the countertop material?",
  "How does the light change throughout the day?",
  "How far is Erewhon?",
  "What makes this home unique?",
]

// ── Ask Bar ──────────────────────────────────────────────────────────────────

function AskBar({ property }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const [promptVisible, setPromptVisible] = useState(true)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => {
      setPromptVisible(false)
      setTimeout(() => { setPromptIdx(i => (i + 1) % PROMPTS.length); setPromptVisible(true) }, 380)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80) }, [open])
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, open])

  useEffect(() => {
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput(""); setOpen(true)
    const history = [...messages, { role: "user", content: msg }]
    setMessages(history); setLoading(true)
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

  return (
    <>
      <style>{`
        @keyframes askExpand { from{opacity:0;transform:translateY(8px) scaleY(0.96)} to{opacity:1;transform:translateY(0) scaleY(1)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .ask-scroll::-webkit-scrollbar{display:none}
        .ask-scroll{-ms-overflow-style:none;scrollbar-width:none}
        .ask-wrap:focus-within{border-color:rgba(0,0,0,0.3)!important}
        .ask-input::placeholder{color:transparent}
      `}</style>
      <div ref={panelRef} style={{ position: "fixed", bottom: 28, left: 32, zIndex: 200, width: 320, fontFamily: "var(--font-dm-sans), sans-serif" }}>

        {/* Suggestions */}
        {open && messages.length === 0 && (
          <div style={{ marginBottom: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.09)", animation: "askExpand 0.22s cubic-bezier(0.16,1,0.3,1)", transformOrigin: "bottom left" }}>
            {PROMPTS.map((p, i) => (
              <button key={i} onClick={() => send(p)} style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < PROMPTS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12.5, color: "#999", cursor: "pointer", transition: "background 0.12s, color 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f9f8f6"; e.currentTarget.style.color = "#222" }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#999" }}
              >{p}</button>
            ))}
          </div>
        )}

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="ask-scroll" style={{ marginBottom: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "20px 20px 16px", maxHeight: 280, overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.09)", animation: "askExpand 0.25s cubic-bezier(0.16,1,0.3,1)", transformOrigin: "bottom left" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 16, animation: "msgIn 0.3s ease" }}>
                {m.role === "user"
                  ? <div style={{ fontSize: 11, color: "#bbb" }}>{m.content}</div>
                  : <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 17, color: "#1a1a1a", lineHeight: 1.82, fontStyle: "italic", marginTop: 6 }}>
                      {m.content ? m.content.split(/\n\n+/).filter(Boolean).map((p, pi) => <p key={pi} style={{ margin: pi > 0 ? "10px 0 0" : 0 }}>{p}</p>) : <span style={{ color: "#ccc" }}>···</span>}
                    </div>
                }
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}

        {/* Bar */}
        <div className="ask-wrap" onClick={() => { setOpen(true); inputRef.current?.focus() }} style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid rgba(0,0,0,0.16)", borderRadius: 6, padding: "0 14px", height: 44, cursor: "text", position: "relative", transition: "border-color 0.18s", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          {!input && (
            <div style={{ position: "absolute", left: 14, right: 44, fontSize: 13, color: "#b0b0b0", pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: promptVisible ? 1 : 0, transform: promptVisible ? "translateY(0)" : "translateY(-3px)", transition: "opacity 0.38s ease, transform 0.38s ease" }}>
              {PROMPTS[promptIdx]}
            </div>
          )}
          <input ref={inputRef} className="ask-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { send(); setOpen(false) } if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() } }}
            onFocus={() => setOpen(true)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#1a1a1a" }}
          />
          {input && (
            <button onClick={e => { e.stopPropagation(); send(); setOpen(false) }} style={{ flexShrink: 0, background: "#0f0f0f", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 8 }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9.5V1.5M1.5 5.5L5.5 1.5L9.5 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Furniture Rail ────────────────────────────────────────────────────────────

function ObjectRail({ property }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/furniture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property }),
    })
      .then(r => r.json())
      .then(d => { setItems(d.suggestions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [property.id])

  const placeholderColors = ["#ece8e2", "#e4ddd5", "#ddd6cc", "#e8e4de", "#e0dbd3"]

  if (loading) return (
    <div style={{ padding: "40px 28px" }}>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#d0ccc6", textTransform: "uppercase", marginBottom: 24 }}>The Pairing</div>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div style={{ width: "100%", aspectRatio: "1", background: placeholderColors[i % placeholderColors.length], borderRadius: 4, marginBottom: 10, opacity: 0.5 }} />
          <div style={{ height: 9, background: "#f0ede8", borderRadius: 2, marginBottom: 6, width: "50%" }} />
          <div style={{ height: 11, background: "#f0ede8", borderRadius: 2, marginBottom: 5, width: "80%" }} />
          <div style={{ height: 9, background: "#f0ede8", borderRadius: 2, width: "65%" }} />
        </div>
      ))}
    </div>
  )

  if (!items.length) return null

  return (
    <div style={{ padding: "40px 28px 120px" }}>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#d0ccc6", textTransform: "uppercase", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid #eeece8" }}>The Pairing</div>
      {items.map((item, i) => (
        <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", marginBottom: 32, textDecoration: "none", color: "inherit" }}>
          {/* Image or placeholder */}
          <div style={{ width: "100%", aspectRatio: "1", background: placeholderColors[i % placeholderColors.length], borderRadius: 4, marginBottom: 10, overflow: "hidden", position: "relative" }}>
            {item.image ? (
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14, boxSizing: "border-box" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 13, color: "rgba(0,0,0,0.2)", fontStyle: "italic", textAlign: "center", padding: "0 12px", lineHeight: 1.4 }}>{item.name}</div>
              </div>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: 3 }}>{item.designer} · {item.year}</div>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 15, color: "#0f0f0f", marginBottom: 4 }}>{item.name}</div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#999", lineHeight: 1.6, fontStyle: "italic", marginBottom: 4 }}>{item.reason}</div>
          {item.price && <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb" }}>{item.price}</div>}
        </a>
      ))}
    </div>
  )
}

// ── Fade Image ────────────────────────────────────────────────────────────────

function FadeImage({ src, alt, style }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.04 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transition: "opacity 0.65s ease", overflow: "hidden" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage({ params }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", params.id).single()
      .then(({ data }) => { setProperty(data); setLoading(false) })
  }, [params.id])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, color: "#ccc", fontStyle: "italic" }}>—</div>
    </div>
  )

  if (!property) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, color: "#ccc" }}>Property not found.</div>
    </div>
  )

  const photos = property.photos?.length ? property.photos : [property.hero_photo].filter(Boolean)
  const editorialParagraphs = Array.isArray(property.editorial)
    ? property.editorial
    : (property.editorial || "").split(/\n\n+/).filter(Boolean)

  const NAV_H = 61

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff", color: "#0f0f0f", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        .col-scroll { overflow-y: auto; height: 100%; }
        .col-scroll::-webkit-scrollbar { width: 0; }
        .col-scroll { scrollbar-width: none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        flexShrink: 0, height: NAV_H,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "#fff",
      }}>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.22em", color: "#0f0f0f", textDecoration: "none", textTransform: "uppercase" }}>Threshold</a>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb", textDecoration: "none" }}>← Collection</a>
      </nav>

      {/* ── 3-column body ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr 240px", minHeight: 0, borderTop: "none" }}>

        {/* LEFT — editorial text */}
        <div className="col-scroll" style={{ borderRight: "1px solid rgba(0,0,0,0.07)", padding: "48px 36px 120px", animation: "fadeIn 0.5s ease 0.1s both" }}>

          {/* Location */}
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.2em", color: "#c9a060", textTransform: "uppercase", marginBottom: 14 }}>
            {property.location}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, fontWeight: 300, lineHeight: 1.08, margin: "0 0 8px", color: "#0f0f0f" }}>
            {property.name}
          </h1>

          {/* Architect */}
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", marginBottom: 28, letterSpacing: "0.02em" }}>
            {property.architect}{property.year ? ` · ${property.year}` : ""}
          </div>

          {/* Price */}
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 26, fontWeight: 300, color: "#0f0f0f", marginBottom: 36 }}>
            {property.price}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #eeece8", marginBottom: 36 }} />

          {/* Editorial */}
          {editorialParagraphs.map((para, i) => (
            <p key={i} style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontWeight: 300, lineHeight: 1.85, color: "#1a1a1a", margin: i > 0 ? "1.4em 0 0" : "0" }}>
              {para}
            </p>
          ))}

          {/* Architect context */}
          {property.architect_context && (
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid #eeece8" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#d0ccc6", textTransform: "uppercase", marginBottom: 12 }}>Architect</div>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888", lineHeight: 1.9, margin: 0 }}>{property.architect_context}</p>
            </div>
          )}

          {/* Site context */}
          {property.site_context && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #eeece8" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#d0ccc6", textTransform: "uppercase", marginBottom: 12 }}>Site</div>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888", lineHeight: 1.9, margin: 0 }}>{property.site_context}</p>
            </div>
          )}

          {/* Specs */}
          {(property.bedrooms || property.bathrooms || property.sqft) && (
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #eeece8" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#d0ccc6", textTransform: "uppercase", marginBottom: 16 }}>Details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Beds", property.bedrooms],
                  ["Baths", property.bathrooms],
                  ["Size", property.sqft ? `${Number(property.sqft).toLocaleString()} sq ft` : null],
                  ["Lot", property.lot_size],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#ccc" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#888" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {(property.idea_tags?.length > 0 || property.landscape_tag) && (
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(property.idea_tags || []).map(tag => (
                <span key={tag} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.06em", color: "#aaa", border: "1px solid #e6e2dc", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
              ))}
              {property.landscape_tag && (
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.06em", color: "#aaa", border: "1px solid #e6e2dc", borderRadius: 20, padding: "3px 10px" }}>{property.landscape_tag}</span>
              )}
            </div>
          )}

          {/* CTAs */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ padding: "11px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Request a Tour
            </button>
            <button style={{ padding: "11px", background: "none", color: "#0f0f0f", border: "1px solid #e0ddd8", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Save Estate
            </button>
          </div>
        </div>

        {/* CENTER — photos */}
        <div className="col-scroll" style={{ background: "#f5f3f0" }}>
          {photos.length > 0 ? (
            <>
              {/* First photo: full column height */}
              <div style={{ width: "100%", height: `calc(100vh - ${NAV_H}px)`, overflow: "hidden", flexShrink: 0 }}>
                <img src={photos[0]} alt={property.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>

              {/* Remaining photos */}
              {photos.slice(1).map((url, i) => {
                if (i % 4 === 1 && photos[i + 2]) {
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginTop: 3 }}>
                      <FadeImage src={url} alt={`${property.name} ${i + 2}`} style={{ width: "100%", aspectRatio: "4/5" }} />
                      <FadeImage src={photos[i + 2]} alt={`${property.name} ${i + 3}`} style={{ width: "100%", aspectRatio: "4/5" }} />
                    </div>
                  )
                }
                if (i % 4 === 2) return null
                return (
                  <FadeImage key={i} src={url} alt={`${property.name} ${i + 2}`}
                    style={{ width: "100%", aspectRatio: i % 4 === 0 ? "16/9" : "3/2", marginTop: 3 }}
                  />
                )
              })}
            </>
          ) : (
            <div style={{ width: "100%", height: `calc(100vh - ${NAV_H}px)`, background: "#eeece8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, color: "#bbb" }}>No photos</span>
            </div>
          )}
        </div>

        {/* RIGHT — objects / pairing */}
        <div className="col-scroll" style={{ borderLeft: "1px solid rgba(0,0,0,0.07)", background: "#faf9f7", animation: "fadeIn 0.5s ease 0.3s both" }}>
          <ObjectRail property={property} />
        </div>
      </div>

      {/* Ask bar */}
      <AskBar property={property} />
    </div>
  )
}
