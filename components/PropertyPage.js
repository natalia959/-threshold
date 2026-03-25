"use client"
import { useState, useRef, useEffect } from "react"

function BottomChat({ property }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [placeholder, setPlaceholder] = useState("")
  const inputRef = useRef(null)

  const suggestions = [
    "What's the quietest room in the house?",
    "How does light move through the day?",
    "What makes this house architecturally significant?",
    "What would mornings feel like here?",
    "Who designed it and why does it matter?",
    "How does it feel from the inside?",
  ]

  // Rotate placeholder suggestions
  useEffect(() => {
    let i = 0
    setPlaceholder(suggestions[0])
    const interval = setInterval(() => {
      i = (i + 1) % suggestions.length
      setPlaceholder(suggestions[i])
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")

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

  // Last assistant message to show above input
  const lastExchange = messages.length > 0 ? {
    question: messages.filter(m => m.role === "user").slice(-1)[0]?.content,
    answer: messages.filter(m => m.role === "assistant").slice(-1)[0]?.content,
  } : null

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes placeholderFade { 0%{opacity:0;transform:translateY(4px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
      `}</style>

      {/* Answer floats above the bar */}
      {lastExchange && (
        <div style={{
          position: "fixed", bottom: 80, left: 0, right: 0, zIndex: 40,
          display: "flex", justifyContent: "center",
          padding: "0 40px", pointerEvents: "none",
        }}>
          <div style={{
            maxWidth: 680, width: "100%",
            animation: "fadeInUp 0.5s ease",
          }}>
            {/* Question */}
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12, color: "rgba(255,255,255,0.45)",
              marginBottom: 10, letterSpacing: "0.02em",
            }}>
              {lastExchange.question}
            </div>
            {/* Answer */}
            <div style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic", fontSize: 22,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.65,
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
            }}>
              {lastExchange.answer}
              {loading && !lastExchange.answer && (
                <span style={{ display: "inline-block", width: 1.5, height: "0.8em", background: "rgba(255,255,255,0.6)", marginLeft: 3, verticalAlign: "text-bottom", animation: "blink 0.8s step-end infinite" }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom input bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: "16px 40px 20px",
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 12,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 50, padding: "12px 16px 12px 24px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 14, color: "#fff",
              letterSpacing: "0.01em",
            }}
          />
          {/* Animated placeholder when empty */}
          {!input && (
            <div style={{
              position: "absolute", left: 24, pointerEvents: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.3)",
              animation: "placeholderFade 3.5s ease infinite",
              key: placeholder,
            }}>
              {placeholder}
            </div>
          )}
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: input.trim() ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
              color: input.trim() ? "#0f0f0f" : "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            →
          </button>
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