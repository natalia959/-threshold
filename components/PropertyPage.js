"use client"
import { useState, useRef, useEffect } from "react"

function StreamingMessage({ content, isStreaming }) {
  return (
    <div style={{
      fontFamily: "var(--font-cormorant), serif",
      fontStyle: "italic",
      fontSize: 15,
      color: "#444",
      lineHeight: 1.8,
    }}>
      {content}
      {isStreaming && (
        <span style={{
          display: "inline-block",
          width: 1.5,
          height: "0.85em",
          background: "#c9a96e",
          marginLeft: 2,
          verticalAlign: "text-bottom",
          animation: "blink 0.7s step-end infinite",
        }} />
      )}
    </div>
  )
}

function Chat({ property }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `You're looking at ${property.name}${property.architect ? ` by ${property.architect}` : ""}${property.year ? `, ${property.year}` : ""}. What would you like to know about it?` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingIndex, setStreamingIndex] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")

    const userMessage = { role: "user", content: msg }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)

    // Add empty assistant message to stream into
    const assistantIndex = updatedMessages.length
    setMessages(m => [...m, { role: "assistant", content: "" }])
    setStreamingIndex(assistantIndex)

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg,
          propertyId: property.id,
          history: updatedMessages,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Bad response")
      }

      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        // Fallback: non-streaming response
        const data = await res.json()
        setMessages(m => m.map((msg, i) =>
          i === assistantIndex ? { ...msg, content: data.response || data.error || "Unable to respond." } : msg
        ))
      } else {
        // Streaming response
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
          setMessages(m => m.map((msg, i) =>
            i === assistantIndex ? { ...msg, content: fullText } : msg
          ))
          bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages(m => m.map((msg, i) =>
        i === assistantIndex ? { ...msg, content: "Unable to respond right now." } : msg
      ))
    }

    setStreamingIndex(null)
    setLoading(false)
  }

  const suggestions = [
    "Who designed it?",
    "What makes it significant?",
    "Show me similar houses",
    "What's the structural system?",
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, padding: "24px 32px 20px" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .chat-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>
        Ask about this house
      </div>

      {/* Messages */}
      <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0, msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            {m.role === "assistant" ? (
              <StreamingMessage
                content={m.content}
                isStreaming={streamingIndex === i}
              />
            ) : (
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13, color: "#0f0f0f",
                background: "#f5f3f0", borderRadius: 6,
                padding: "8px 12px", display: "inline-block", maxWidth: "90%",
              }}>
                {m.content}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only on first message */}
      {messages.length === 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: "none", border: "1px solid #e8e4de",
              borderRadius: 20, padding: "5px 12px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11, color: "#aaa", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "#0f0f0f"; e.target.style.color = "#0f0f0f" }}
              onMouseLeave={e => { e.target.style.borderColor = "#e8e4de"; e.target.style.color = "#aaa" }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid #f0ede8", paddingTop: 12, marginTop: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about this house…"
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#0f0f0f",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          background: input.trim() ? "#0f0f0f" : "transparent",
          color: input.trim() ? "#fff" : "#ccc",
          border: input.trim() ? "none" : "1px solid #e0ddd8",
          borderRadius: 20, padding: "6px 16px",
          fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11,
          cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s",
        }}>Ask</button>
      </div>
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0f0f0f" }}>
      <style>{`* { box-sizing: border-box; } .no-scroll::-webkit-scrollbar { display: none; } .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* Nav */}
      <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #f0ede8", position: "sticky", top: 0, background: "#fff", zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "#0f0f0f", textAlign: "left" }}>
          THRESHOLD
        </button>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#999", textAlign: "right" }}>
          ← Collection
        </button>
      </nav>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", height: "calc(100vh - 61px)" }}>

        {/* LEFT — sticky */}
        <div style={{ borderRight: "1px solid #f0ede8", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "sticky", top: 61 }}>

          {/* Property info */}
          <div style={{ padding: "36px 32px 24px", borderBottom: "1px solid #f0ede8", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#c9a96e", textTransform: "uppercase", marginBottom: 10 }}>
              {property.location}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 30, lineHeight: 1.1, marginBottom: 6 }}>
              {property.name}
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", marginBottom: 16 }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, marginBottom: 14 }}>
              {property.price}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {(property.idea_tags || []).map(tag => (
                <span key={tag} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#aaa", border: "1px solid #e8e4de", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
              ))}
              {property.landscape_tag && (
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#aaa", border: "1px solid #e8e4de", borderRadius: 20, padding: "3px 10px" }}>{property.landscape_tag}</span>
              )}
            </div>
            {property.significance && (
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb", lineHeight: 1.6, fontStyle: "italic", marginBottom: 20 }}>
                {property.significance}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ width: "100%", padding: "11px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.05em", cursor: "pointer" }}>
                Request a Tour
              </button>
              <button style={{ width: "100%", padding: "11px", background: "none", color: "#0f0f0f", border: "1px solid #e0ddd8", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.05em", cursor: "pointer" }}>
                Save Estate
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="no-scroll" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Chat property={property} />
          </div>
        </div>

        {/* RIGHT — scrolling */}
        <div className="no-scroll" style={{ overflowY: "auto", scrollBehavior: "smooth" }}>
          {photos.length > 0 ? photos.map((url, i) => (
            <div key={i} style={{ width: "100%", aspectRatio: i === 0 ? "16/9" : "3/2", overflow: "hidden" }}>
              <img src={url} alt={`${property.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )) : (
            <div style={{ width: "100%", height: "60vh", background: "#f5f3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, color: "#ccc" }}>No photos yet</span>
            </div>
          )}
          {property.editorial && (
            <div style={{ padding: "80px 80px 60px" }}>
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, lineHeight: 1.85, color: "#222", maxWidth: 640 }}>
                {property.editorial}
              </div>
            </div>
          )}
          {property.architect_context && (
            <div style={{ padding: "0 80px 60px" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#ccc", textTransform: "uppercase", marginBottom: 16 }}>Architect</div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, lineHeight: 1.9, color: "#888", maxWidth: 560 }}>{property.architect_context}</div>
            </div>
          )}
          {property.site_context && (
            <div style={{ padding: "0 80px 80px" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#ccc", textTransform: "uppercase", marginBottom: 16 }}>Site</div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, lineHeight: 1.9, color: "#888", maxWidth: 560 }}>{property.site_context}</div>
            </div>
          )}
          <div style={{ height: 120 }} />
        </div>
      </div>
    </div>
  )
}