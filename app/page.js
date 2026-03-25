"use client"
import { useState, useRef, useEffect } from "react"

function BottomChat({ property }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const suggestions = [
    "What's the quietest room in the house?",
    "How does light move through the day?",
    "What makes this house significant?",
    "What would mornings feel like here?",
    "Who designed it and why does it matter?",
    "How does it feel from the inside?",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % suggestions.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (expanded) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, expanded])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")
    setExpanded(true)

    const userMessage = { role: "user", content: msg }
    const history = [...messages, userMessage]
    setMessages(history)
    setLoading(true)

    const assistantIndex = history.length
    setMessages(m => [...m, { role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg, propertyId: property.id, history }),
      })
      if (!res.ok || !res.body) throw new Error()
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const data = await res.json()
        setMessages(m => m.map((m, i) => i === assistantIndex ? { ...m, content: data.response || "Unable to respond." } : m))
      } else {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
          setMessages(m => m.map((m, i) => i === assistantIndex ? { ...m, content: fullText } : m))
        }
      }
    } catch {
      setMessages(m => m.map((m, i) => i === assistantIndex ? { ...m, content: "Unable to respond right now." } : m))
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideUp { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }
        .chat-expand { animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1); }
        .msg-in { animation: fadeInUp 0.4s ease; }
      `}</style>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "0 40px 24px",
        pointerEvents: "none",
      }}>

        {/* White conversation panel — expands on first message */}
        {expanded && messages.length > 0 && (
          <div className="chat-expand" style={{
            width: "100%", maxWidth: 640,
            background: "#fff", color: "#0f0f0f",
            borderRadius: "16px 16px 0 0",
            padding: "28px 32px 0",
            maxHeight: 340,
            overflowY: "auto",
            msOverflowStyle: "none", scrollbarWidth: "none",
            pointerEvents: "all",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          }}>
            <style>{`.chat-expand::-webkit-scrollbar{display:none}`}</style>
            {/* Close */}
            <button onClick={() => setExpanded(false)} style={{
              position: "absolute", top: 16, right: 20,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 18, color: "#ccc", lineHeight: 1,
            }}>×</button>

            {messages.map((m, i) => (
              <div key={i} className="msg-in" style={{ marginBottom: 24 }}>
                {m.role === "user" ? (
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 12, color: "#999",
                    marginBottom: 8, letterSpacing: "0.01em",
                  }}>{m.content}</div>
                ) : (
                  <div style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 18, color: "#0f0f0f", lineHeight: 1.8 }}>
                    {m.content.split("\n\n").filter(Boolean).map((para, pi) => (
                      <p key={pi} style={{ marginBottom: pi < m.content.split("\n\n").length - 1 ? 16 : 0 }}>{para}</p>
                    ))}
                    {loading && i === messages.length - 1 && !m.content && (
                      <span style={{ display: "inline-block", width: 1.5, height: "0.8em", background: "#0f0f0f", marginLeft: 3, verticalAlign: "text-bottom", animation: "blink 0.8s step-end infinite" }} />
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} style={{ height: 8 }} />
          </div>
        )}

        {/* Input bar */}
        <div style={{
          width: "100%", maxWidth: 640,
          display: "flex", alignItems: "center", gap: 12,
          background: expanded ? "#fff" : "transparent",
          border: "none",
          borderTop: expanded ? "1px solid #f0ede8" : "none",
          borderRadius: expanded ? "0 0 16px 16px" : 50,
          padding: "12px 14px 12px 22px",
          transition: "all 0.3s ease",
          pointerEvents: "all",
          position: "relative",
          boxShadow: expanded ? "0 8px 40px rgba(0,0,0,0.15)" : "none",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13, letterSpacing: "0.01em",
              color: expanded ? "#0f0f0f" : "#fff",
            }}
          />
          {!input && (
            <div key={placeholderIdx} style={{
              position: "absolute", left: 22, pointerEvents: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13, color: expanded ? "#bbb" : "rgba(255,255,255,0.35)",
              animation: "fadeInUp 0.4s ease",
            }}>
              {suggestions[placeholderIdx]}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []

  return (
    <div style={{ background: "#0c0c0c", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .no-bar::-webkit-scrollbar { display: none; }
        .no-bar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Minimal nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,255,255,0.7)" }}>
          THRESHOLD
        </button>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
          ← Collection
        </button>
      </nav>

      {/* Full screen photo stack */}
      <div className="no-bar" style={{ overflowY: "auto", scrollBehavior: "smooth" }}>

        {/* Hero — full viewport */}
        <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
          {photos[0] ? (
            <img src={photos[0]} alt={property.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
          )}
          {/* Dark gradient at bottom for readability */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />

          {/* Property title over hero */}
          <div style={{ position: "absolute", bottom: 120, left: 40, right: 400 }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 10 }}>
              {property.location}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 300, lineHeight: 1.05, marginBottom: 8 }}>
              {property.name}
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </div>
          </div>

          {/* Price + actions top right */}
          <div style={{ position: "absolute", bottom: 120, right: 40, textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, fontWeight: 300, marginBottom: 16 }}>
              {property.price}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ padding: "10px 24px", background: "#fff", color: "#0f0f0f", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer" }}>
                Request a Tour
              </button>
              <button style={{ padding: "10px 24px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer" }}>
                Save Estate
              </button>
            </div>
          </div>
        </div>

        {/* Remaining photos full width */}
        {photos.slice(1).map((url, i) => (
          <div key={i} style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
            <img src={url} alt={`${property.name} ${i + 2}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}

        {/* Editorial text — clean, centered, generous padding */}
        {(property.editorial || property.architect_context || property.site_context) && (
          <div style={{ background: "#fff", color: "#0f0f0f", padding: "100px 0" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px" }}>
              {property.editorial && (
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, lineHeight: 1.9, color: "#222", marginBottom: 60 }}>
                  {property.editorial}
                </div>
              )}
              {property.architect_context && (
                <div style={{ marginBottom: 48 }}>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>Architect</div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#777", lineHeight: 1.9 }}>{property.architect_context}</div>
                </div>
              )}
              {property.site_context && (
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>Site</div>
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#777", lineHeight: 1.9 }}>{property.site_context}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom padding for chat bar */}
        <div style={{ height: 120, background: "#0c0c0c" }} />
      </div>

      {/* Floating chat */}
      <BottomChat property={property} />
    </div>
  )
}