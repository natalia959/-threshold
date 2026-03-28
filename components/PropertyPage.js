"use client"
import { useState, useRef, useEffect } from "react"

const PROMPTS = [
  "Does the kitchen get morning light?",
  "What is the countertop material?",
  "How does the light change throughout the day?",
  "How far is Erewhon?",
  "What makes this home unique?",
]

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

function AskBar({ property }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const [promptVisible, setPromptVisible] = useState(true)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Rotate placeholder every 5s with smooth crossfade
  useEffect(() => {
    const t = setInterval(() => {
      setPromptVisible(false)
      setTimeout(() => {
        setPromptIdx(i => (i + 1) % PROMPTS.length)
        setPromptVisible(true)
      }, 380)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")
    setOpen(true)
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

  return (
    <>
      <style>{`
        @keyframes askExpand {
          from { opacity: 0; transform: translateY(10px) scaleY(0.95); }
          to   { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ask-panel-scroll::-webkit-scrollbar { display: none; }
        .ask-panel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .ask-bar-input::placeholder { color: transparent; }
        .ask-bar-wrap:focus-within { border-color: rgba(0,0,0,0.28) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.07) !important; }
      `}</style>

      <div ref={panelRef} style={{
        position: "fixed", bottom: 32, left: 40, zIndex: 200,
        width: 336, fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Suggestion chips — shown when open, no messages yet */}
        {open && messages.length === 0 && (
          <div style={{
            marginBottom: 8,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
            animation: "askExpand 0.25s cubic-bezier(0.16,1,0.3,1)",
            transformOrigin: "bottom left",
          }}>
            {PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => send(p)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "11px 16px",
                  background: "none", border: "none",
                  borderBottom: i < PROMPTS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12.5,
                  color: "#999", cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f9f8f6"; e.currentTarget.style.color = "#222" }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#999" }}
              >{p}</button>
            ))}
          </div>
        )}

        {/* Conversation panel */}
        {messages.length > 0 && (
          <div
            className="ask-panel-scroll"
            style={{
              marginBottom: 8,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              padding: "20px 20px 16px",
              maxHeight: 300, overflowY: "auto",
              boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
              animation: "askExpand 0.28s cubic-bezier(0.16,1,0.3,1)",
              transformOrigin: "bottom left",
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 18, animation: "msgIn 0.3s ease" }}>
                {m.role === "user" ? (
                  <div style={{ fontSize: 11, color: "#bbb", letterSpacing: "0.02em" }}>{m.content}</div>
                ) : (
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 17, color: "#1a1a1a",
                    lineHeight: 1.82, fontStyle: "italic",
                    marginTop: 6,
                  }}>
                    {m.content
                      ? m.content.split(/\n\n+/).filter(Boolean).map((p, pi) => (
                          <p key={pi} style={{ margin: pi > 0 ? "12px 0 0" : 0 }}>{p}</p>
                        ))
                      : <span style={{ color: "#ccc" }}>···</span>
                    }
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* The bar — default state: simple input field */}
        <div
          className="ask-bar-wrap"
          style={{
            display: "flex", alignItems: "center",
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.16)",
            borderRadius: 6,
            padding: "0 14px",
            height: 44,
            cursor: "text",
            position: "relative",
            transition: "border-color 0.18s, box-shadow 0.18s",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          }}
          onClick={() => { setOpen(true); inputRef.current?.focus() }}
        >
          {/* Rotating placeholder with crossfade */}
          {!input && (
            <div style={{
              position: "absolute", left: 14, right: 44,
              fontSize: 13, color: "#b0b0b0",
              pointerEvents: "none",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              opacity: promptVisible ? 1 : 0,
              transform: promptVisible ? "translateY(0)" : "translateY(-3px)",
              transition: "opacity 0.38s ease, transform 0.38s ease",
              letterSpacing: "0.01em",
            }}>
              {PROMPTS[promptIdx]}
            </div>
          )}
          <input
            ref={inputRef}
            className="ask-bar-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { send(); setOpen(false) }
              if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() }
            }}
            onFocus={() => setOpen(true)}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "#1a1a1a", letterSpacing: "0.01em",
            }}
          />
          {input && (
            <button
              onClick={e => { e.stopPropagation(); send(); setOpen(false) }}
              style={{
                flexShrink: 0, background: "#0f0f0f", border: "none",
                borderRadius: "50%", width: 26, height: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", marginLeft: 8,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 9.5V1.5M1.5 5.5L5.5 1.5L9.5 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function FadeImage({ src, alt, style }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.04 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transition: "opacity 0.65s ease", overflow: "hidden" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []
  const editorialParagraphs = Array.isArray(property.editorial)
    ? property.editorial
    : (property.editorial || "").split(/\n\n+/).filter(Boolean)

  return (
    <div style={{ background: "#fff", color: "#0f0f0f", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes heroIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 48px",
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          letterSpacing: "0.22em", color: "#0f0f0f", textTransform: "uppercase",
        }} style={{ fontFamily: "var(--font-logo), sans-serif", fontSize: 13, letterSpacing: "0.04em", color: "#F7F4EC", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>THRESHOLD</button>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          color: "#bbb", letterSpacing: "0.04em",
        }}>← Collection</button>
      </nav>

      {/* ── Hero — full viewport ── */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {photos[0] ? (
          <img
            src={photos[0]}
            alt={property.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e8e4de" }} />
        )}

        {/* Gradient: subtle at top (for nav), stronger at bottom (for text) */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 25%, transparent 45%, rgba(0,0,0,0.62) 100%)",
        }} />

        {/* Title overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 48px 52px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          animation: "heroIn 0.9s ease 0.15s both",
        }}>
          {/* Left: name + architect */}
          <div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10,
              letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", marginBottom: 10,
            }}>
              {property.location}
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(30px, 3.4vw, 50px)",
              fontWeight: 300, lineHeight: 1.05,
              color: "#fff", margin: "0 0 9px",
            }}>
              {property.name}
            </h1>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.42)", letterSpacing: "0.02em",
            }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </div>
          </div>

          {/* Right: price + CTAs */}
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 40 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 33, fontWeight: 300,
              color: "#fff", marginBottom: 18,
            }}>
              {property.price}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{
                padding: "10px 26px",
                background: "#fff", color: "#0f0f0f",
                border: "none", borderRadius: 40,
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                letterSpacing: "0.07em", cursor: "pointer",
              }}>
                Request a Tour
              </button>
              <button style={{
                padding: "10px 26px",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.22)", borderRadius: 40,
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                letterSpacing: "0.07em", cursor: "pointer",
              }}>
                Save Estate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editorial section ── */}
      <div style={{ background: "#fff", padding: "88px 48px 80px" }}>
        <div style={{
          maxWidth: 1240, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "252px 1fr",
          gap: "0 88px",
          alignItems: "start",
        }}>

          {/* Left: sticky metadata */}
          <div style={{ position: "sticky", top: 88 }}>

            {/* Specs */}
            {(property.beds || property.bedrooms || property.sqft || property.baths || property.bathrooms) && (
              <div style={{ marginBottom: 36 }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 14,
                  paddingBottom: 10, borderBottom: "1px solid #eeece8",
                }}>Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[
                    ["Beds", property.beds || property.bedrooms],
                    ["Baths", property.baths || property.bathrooms],
                    ["Size", property.sqft ? `${Number(property.sqft).toLocaleString()} sq ft` : null],
                    ["Lot", property.lot_size],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#ccc", letterSpacing: "0.04em" }}>{label}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#888" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Idea tags */}
            {(property.idea_tags?.length > 0 || property.landscape_tag) && (
              <div style={{ marginBottom: 36 }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 14,
                  paddingBottom: 10, borderBottom: "1px solid #eeece8",
                }}>Themes</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(property.idea_tags || []).map(tag => (
                    <span key={tag} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                      letterSpacing: "0.06em", color: "#aaa",
                      border: "1px solid #e6e2dc", borderRadius: 20,
                      padding: "3px 11px",
                    }}>{tag}</span>
                  ))}
                  {property.landscape_tag && (
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                      letterSpacing: "0.06em", color: "#aaa",
                      border: "1px solid #e6e2dc", borderRadius: 20,
                      padding: "3px 11px",
                    }}>{property.landscape_tag}</span>
                  )}
                </div>
              </div>
            )}

            {/* Agent */}
            {(property.agent?.name || property.agent_name) && (
              <div style={{ marginBottom: 36 }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 14,
                  paddingBottom: 10, borderBottom: "1px solid #eeece8",
                }}>Listed by</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#888", lineHeight: 1.75 }}>
                  {property.agent?.name || property.agent_name}
                  <br />
                  <span style={{ fontSize: 11, color: "#bbb" }}>
                    {property.agent?.brokerage || property.agent_brokerage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: editorial text */}
          <div>
            {editorialParagraphs.map((para, i) => (
              <p key={i} style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(20px, 1.65vw, 24px)",
                fontWeight: 300, lineHeight: 1.88,
                color: "#1a1a1a",
                margin: i > 0 ? "1.6em 0 0" : "0",
              }}>{para}</p>
            ))}

            {property.architect_context && (
              <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #eeece8" }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 14,
                }}>Architect</div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#888", lineHeight: 1.9, margin: 0,
                }}>{property.architect_context}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Photo stack ── */}
      {photos.slice(1).map((url, i) => (
        <div key={i}>
          {/* Alternating aspect ratios — Leibal-style editorial pacing */}
          {i % 4 === 1 && photos[i + 2] ? (
            // Side-by-side pair (portrait)
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              <FadeImage src={url} alt={`${property.name} ${i + 2}`} style={{ width: "100%", aspectRatio: "4/5" }} />
              <FadeImage src={photos[i + 2]} alt={`${property.name} ${i + 3}`} style={{ width: "100%", aspectRatio: "4/5" }} />
            </div>
          ) : i % 4 === 2 ? null /* rendered in pair above */ : (
            <FadeImage
              src={url}
              alt={`${property.name} ${i + 2}`}
              style={{ width: "100%", aspectRatio: i % 4 === 0 ? "16/9" : "3/2" }}
            />
          )}

          {/* Site context slipped in after the second standalone photo */}
          {i === 2 && property.site_context && (
            <div style={{ background: "#faf9f6", padding: "80px 48px" }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 14,
                }}>Site</div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#888", lineHeight: 1.9, margin: 0,
                }}>{property.site_context}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Site context fallback — show here if not enough photos to place it above */}
      {photos.slice(1).length < 3 && property.site_context && (
        <div style={{ background: "#faf9f6", padding: "80px 48px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 9,
              letterSpacing: "0.18em", color: "#d0ccc6",
              textTransform: "uppercase", marginBottom: 14,
            }}>Site</div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              color: "#888", lineHeight: 1.9, margin: 0,
            }}>{property.site_context}</p>
          </div>
        </div>
      )}

      {/* ── The Pairing ── */}
      <div style={{ padding: "88px 48px 96px", background: "#faf9f6", borderTop: "1px solid #eeece8" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 26, fontWeight: 300, color: "#0f0f0f", marginBottom: 5,
            }}>The Pairing</div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#c0bdb8", letterSpacing: "0.03em",
            }}>Objects that belong to this space</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 48px" }}>
            {[
              { label: "Furniture", items: PAIRING.furniture },
              { label: "Objects",   items: PAIRING.objects },
              { label: "Materials", items: PAIRING.materials },
              { label: "Wardrobe",  items: PAIRING.wardrobe },
            ].map(section => (
              <div key={section.label}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#d0ccc6",
                  textTransform: "uppercase", marginBottom: 20,
                  paddingBottom: 10, borderBottom: "1px solid #e8e4de",
                }}>{section.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                  {section.items.map((item, i) => (
                    <div key={i}>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                        letterSpacing: "0.1em", color: "#ccc",
                        textTransform: "uppercase", marginBottom: 3,
                      }}>{item.brand}</div>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16, color: "#0f0f0f",
                        fontWeight: 400, marginBottom: 4,
                      }}>{item.name}</div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                        color: "#aaa", lineHeight: 1.6, fontStyle: "italic",
                      }}>{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacer so AskBar doesn't cover content */}
      <div style={{ height: 96, background: "#faf9f6" }} />

      {/* ── Ask bar ── */}
      <AskBar property={property} />
    </div>
  )
}
