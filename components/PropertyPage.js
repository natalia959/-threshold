"use client"
import { useState, useRef, useEffect } from "react"

function ConversationalChat({ property }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `You're looking at ${property.name}${property.architect ? ` by ${property.architect}` : ""}${property.year ? `, ${property.year}` : ""}. What would you like to know about it?`
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput("")
    setMessages(m => [...m, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          propertyId: property.id,
          conversational: true,
          history: messages,
        }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: "assistant", content: data.response || "Unable to respond right now." }])
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Unable to respond right now." }])
    }
    setLoading(false)
  }

  const suggestions = ["Who designed it?", "What makes it significant?", "Show me similar houses", "What's the structural system?"]

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Messages — no scrollbar */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", msOverflowStyle: "none", scrollbarWidth: "none" }}>
        <style>{`.chat-msgs::-webkit-scrollbar { display: none; }`}</style>
        <div className="chat-msgs">
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              {m.role === "assistant" ? (
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 16, color: "#555", lineHeight: 1.75 }}>
                  {m.content}
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#0f0f0f", background: "#f5f3f0", borderRadius: 6, padding: "8px 14px", display: "inline-block", maxWidth: "90%" }}>
                  {m.content}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 15, color: "#bbb" }}>
              …
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested prompts — only on first message */}
      {messages.length === 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {suggestions.map(p => (
            <button key={p} onClick={() => send(p)}
              style={{ background: "none", border: "1px solid #e0ddd8", borderRadius: 20, padding: "5px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#999", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#0f0f0f"; e.target.style.color = "#0f0f0f" }}
              onMouseLeave={e => { e.target.style.borderColor = "#e0ddd8"; e.target.style.color = "#999" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10, borderTop: "1px solid #f0ede8", paddingTop: 14, marginTop: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about this house…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#0f0f0f" }}
        />
        <button onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ background: input.trim() ? "#0f0f0f" : "transparent", color: input.trim() ? "#fff" : "#ccc", border: input.trim() ? "none" : "1px solid #e0ddd8", borderRadius: 20, padding: "6px 16px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s", whiteSpace: "nowrap" }}>
          Ask
        </button>
      </div>
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0f0f0f" }}>
      <style>{`
        * { box-sizing: border-box; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Nav — chatbot lives here at top center */}
      <nav style={{
        display: "grid", gridTemplateColumns: "200px 1fr 200px",
        alignItems: "center", padding: "20px 40px",
        borderBottom: "1px solid #f0ede8",
        position: "sticky", top: 0, background: "#fff", zIndex: 20,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "#0f0f0f", textAlign: "left" }}>
          THRESHOLD
        </button>

        {/* Chatbot search bar — center of nav */}
        <div style={{ display: "flex", alignItems: "center", background: "#f7f5f2", borderRadius: 40, padding: "10px 20px", gap: 10 }}>
          <input
            placeholder={`Ask about ${property.name}…`}
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#0f0f0f" }}
            onKeyDown={e => {
              if (e.key === "Enter" && e.target.value.trim()) {
                // scroll to chat and send
                document.getElementById("chat-panel")?.scrollIntoView({ behavior: "smooth" })
              }
            }}
          />
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#ccc" }}>↵</div>
        </div>

        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#999", textAlign: "right" }}>
          ← Collection
        </button>
      </nav>

      {/* Main layout — sticky left, scrolling right */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "calc(100vh - 61px)" }}>

        {/* LEFT — sticky panel */}
        <div style={{ borderRight: "1px solid #f0ede8", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "sticky", top: 61 }}>

          {/* Property info */}
          <div style={{ padding: "40px 36px 28px", borderBottom: "1px solid #f0ede8", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#c9a96e", textTransform: "uppercase", marginBottom: 12 }}>
              {property.location}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 34, lineHeight: 1.1, marginBottom: 8 }}>
              {property.name}
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", marginBottom: 20, letterSpacing: "0.03em" }}>
              {property.architect}{property.year ? ` · ${property.year}` : ""}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 30, marginBottom: 20 }}>
              {property.price}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {(property.idea_tags || []).map(tag => (
                <span key={tag} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#aaa", border: "1px solid #e8e4de", borderRadius: 20, padding: "3px 10px" }}>
                  {tag}
                </span>
              ))}
              {property.landscape_tag && (
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#aaa", border: "1px solid #e8e4de", borderRadius: 20, padding: "3px 10px" }}>
                  {property.landscape_tag}
                </span>
              )}
            </div>

            {property.significance && (
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#bbb", lineHeight: 1.6, fontStyle: "italic" }}>
                {property.significance}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ width: "100%", padding: "11px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.05em", cursor: "pointer" }}>
                Request a Tour
              </button>
              <button style={{ width: "100%", padding: "11px", background: "none", color: "#0f0f0f", border: "1px solid #e0ddd8", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.05em", cursor: "pointer" }}>
                Save Estate
              </button>
            </div>
          </div>

          {/* Chat — fills remaining space */}
          <div id="chat-panel" className="no-scroll" style={{ flex: 1, padding: "28px 36px 24px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#ccc", textTransform: "uppercase", marginBottom: 20 }}>
              Ask about this house
            </div>
            <ConversationalChat property={property} allProperties={allProperties} />
          </div>
        </div>

        {/* RIGHT — smooth scrolling photos + text, no scrollbar */}
        <div className="no-scroll" style={{ overflowY: "auto", scrollBehavior: "smooth" }}>

          {/* Photos */}
          {photos.length > 0 ? photos.map((url, i) => (
            <div key={i} style={{ width: "100%", aspectRatio: i === 0 ? "16/9" : "3/2", overflow: "hidden" }}>
              <img src={url} alt={`${property.name} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              />
            </div>
          )) : (
            <div style={{ width: "100%", height: "60vh", background: "#f5f3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, color: "#ccc" }}>No photos yet</span>
            </div>
          )}

          {/* Editorial */}
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
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, lineHeight: 1.9, color: "#888", maxWidth: 560 }}>
                {property.architect_context}
              </div>
            </div>
          )}

          {property.site_context && (
            <div style={{ padding: "0 80px 80px" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#ccc", textTransform: "uppercase", marginBottom: 16 }}>Site</div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, lineHeight: 1.9, color: "#888", maxWidth: 560 }}>
                {property.site_context}
              </div>
            </div>
          )}

          {/* Bottom padding */}
          <div style={{ height: 120 }} />
        </div>
      </div>
    </div>
  )
}