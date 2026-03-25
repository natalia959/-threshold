"use client"
import { useState, useRef, useEffect } from "react"

function AskExperience({ property }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  const prompts = [
    "How does the light move through the home?",
    "What makes this residence significant?",
    "Is it designed for entertaining?",
    "What materials define the space?",
    "What would mornings feel like here?",
    "How do the indoor and outdoor spaces connect?",
  ]

  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => (i + 1) % prompts.length), 3800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput("")

    const userMsg = { role: "user", content: msg }
    const history = [...messages, userMsg]
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
    <div style={{
      background: "#0f0f0f",
      minHeight: "60vh",
      padding: "120px 24px 200px",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes promptFade { 0%{opacity:0;transform:translateY(4px)} 12%{opacity:1;transform:translateY(0)} 88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
        .msg-appear { animation: fadeIn 0.3s ease forwards; }
        .input-glow:focus-within { box-shadow: 0 0 0 1px rgba(255,255,255,0.12); }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Rotating prompts — shown when no messages */}
        {messages.length === 0 && (
          <div style={{ marginBottom: 64, textAlign: "center" }}>
            <div style={{
              fontSize: 13, color: "#4a4a4a",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 20, letterSpacing: "0.02em",
            }}>
              Ask anything about this home
            </div>
            <div key={promptIdx} style={{
              fontSize: 15, color: "#6f6f6f",
              fontFamily: "'DM Sans', sans-serif",
              animation: "promptFade 3.8s ease infinite",
              letterSpacing: "0.01em",
            }}>
              {prompts[promptIdx]}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div key={i} className="msg-appear" style={{
            marginBottom: i < messages.length - 1 ? 40 : 0,
          }}>
            {m.role === "user" ? (
              // User question — small, muted
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#5a5a5a",
                lineHeight: 1.5,
                fontWeight: 400,
                marginBottom: 20,
              }}>
                {m.content}
              </div>
            ) : (
              // AI response — editorial paragraphs
              <div>
                {m.content ? (
                  m.content.split(/\n\n+/).filter(Boolean).map((para, pi, arr) => {
                    // Detect follow-up suggestion (starts with → or "I can" or "Would you")
                    const isFollowUp = para.startsWith("→") || para.startsWith("I can") || para.startsWith("Would you") || para.startsWith("Happy to") || para.startsWith("If you")
                    return (
                      <p key={pi} style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: isFollowUp ? 14 : 18,
                        lineHeight: isFollowUp ? 1.6 : 1.8,
                        color: isFollowUp ? "#6f6f6f" : "#eae7e1",
                        fontWeight: 400,
                        marginBottom: pi < arr.length - 1 ? (isFollowUp ? 0 : 18) : 0,
                        fontStyle: "normal",
                        letterSpacing: isFollowUp ? "0" : "-0.01em",
                      }}>
                        {isFollowUp && !para.startsWith("→") ? `→ ${para}` : para}
                      </p>
                    )
                  })
                ) : (
                  // Loading state — just a subtle cursor, no dots
                  <div style={{
                    width: 2, height: 18,
                    background: "#3a3a3a",
                    borderRadius: 1,
                    animation: "fadeIn 0.3s ease infinite alternate",
                  }} />
                )}
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Fixed bottom input */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 50, padding: "20px 24px 32px",
        background: "linear-gradient(to top, #0f0f0f 60%, transparent)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="input-glow" style={{
            background: "#1a1a1a",
            borderRadius: 14,
            padding: "0 20px",
            height: 52,
            display: "flex", alignItems: "center",
            transition: "box-shadow 0.2s ease",
            position: "relative",
          }}>
            {/* Placeholder */}
            {!input && !focused && (
              <div style={{
                position: "absolute", left: 20,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: "#3a3a3a",
                pointerEvents: "none",
                letterSpacing: "0.01em",
              }}>
                Ask anything about this home…
              </div>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && send()}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: "#eae7e1",
                letterSpacing: "0.01em",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []

  return (
    <div style={{ background: "#0f0f0f", color: "#eae7e1", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .no-bar::-webkit-scrollbar { display: none; }
        .no-bar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Minimal nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "22px 40px",
        background: "linear-gradient(to bottom, rgba(15,15,15,0.9) 0%, transparent 100%)",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
        }}>
          Threshold
        </button>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em",
        }}>
          ← Collection
        </button>
      </nav>

      {/* Hero — full viewport */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {photos[0] ? (
          <img src={photos[0]} alt={property.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
        )}
        {/* Gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 35%, rgba(15,15,15,0.5) 70%, #0f0f0f 100%)"
        }} />

        {/* Property info over hero */}
        <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, padding: "0 40px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10,
              letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", marginBottom: 12,
            }}>
              {property.location}
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 300, lineHeight: 1.05, marginBottom: 10,
            }}>
              {property.name}
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.4)", display: "flex",
              justifyContent: "space-between", alignItems: "flex-end",
            }}>
              <span>{property.architect}{property.year ? ` · ${property.year}` : ""}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{
                  padding: "9px 20px", background: "#fff", color: "#0f0f0f",
                  border: "none", borderRadius: 40,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  letterSpacing: "0.05em", cursor: "pointer",
                }}>Request a Tour</button>
                <button style={{
                  padding: "9px 20px", background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  letterSpacing: "0.05em", cursor: "pointer",
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining photos */}
      {photos.slice(1).map((url, i) => (
        <div key={i} style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <img src={url} alt={`${property.name} ${i + 2}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ))}

      {/* Editorial text */}
      {(property.editorial || property.architect_context || property.site_context) && (
        <div style={{ padding: "100px 24px 80px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {property.editorial && (
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, lineHeight: 1.85, color: "#b8b5ae",
                marginBottom: 56, fontWeight: 300,
              }}>
                {property.editorial}
              </div>
            )}
            {property.architect_context && (
              <div style={{ marginBottom: 40 }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#3a3a3a",
                  textTransform: "uppercase", marginBottom: 16,
                }}>Architect</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: "#5a5a5a", lineHeight: 1.9,
                }}>{property.architect_context}</div>
              </div>
            )}
            {property.site_context && (
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: "0.18em", color: "#3a3a3a",
                  textTransform: "uppercase", marginBottom: 16,
                }}>Site</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: "#5a5a5a", lineHeight: 1.9,
                }}>{property.site_context}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "#1a1a1a", maxWidth: 640, margin: "0 auto" }} />

      {/* Ask experience */}
      <AskExperience property={property} />
    </div>
  )
}