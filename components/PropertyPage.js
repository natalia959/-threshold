\"use client"
import { useState, useRef, useEffect } from "react"

function Chat({ property }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `You're looking at ${property.name}${property.architect ? ` by ${property.architect}` : ""}${property.year ? `, ${property.year}` : ""}. What would you like to know about it?` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")
    const updatedMessages = [...messages, { role: "user", content: msg }]
    setMessages(updatedMessages)
    setLoading(true)
    const assistantIndex = updatedMessages.length
    setMessages(m => [...m, { role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg, propertyId: property.id, history: updatedMessages }),
      })
      if (!res.ok || !res.body) throw new Error()
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const data = await res.json()
        setMessages(m => m.map((msg, i) => i === assistantIndex ? { ...msg, content: data.response || "Unable to respond." } : msg))
      } else {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
          setMessages(m => m.map((msg, i) => i === assistantIndex ? { ...msg, content: fullText } : msg))
          bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      }
    } catch {
      setMessages(m => m.map((msg, i) => i === assistantIndex ? { ...msg, content: "Unable to respond right now." } : msg))
    }
    setLoading(false)
  }

  const suggestions = ["Who designed it?", "What makes it significant?", "Show me similar houses", "What's the structural system?"]

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 20 }}>Ask about this house</div>
      <div style={{ maxHeight: 320, overflowY: "auto", msOverflowStyle: "none", scrollbarWidth: "none", marginBottom: 16 }}>
        <style>{`.chat-s::-webkit-scrollbar{display:none} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <div className="chat-s">
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              {m.role === "assistant" ? (
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#555", lineHeight: 1.8 }}>
                  {m.content}
                  {loading && i === messages.length - 1 && !m.content && (
                    <span style={{ display: "inline-block", width: 1.5, height: "0.85em", background: "#c9a96e", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 0.7s step-end infinite" }} />
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#999", fontStyle: "italic" }}>
                  {m.content}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      {messages.length === 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{ background: "none", border: "1px solid #e8e4de", borderRadius: 20, padding: "4px 10px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#aaa", cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid #f0ede8", paddingTop: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#0f0f0f" }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ background: "none", border: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: input.trim() ? "#0f0f0f" : "#ccc", cursor: input.trim() ? "pointer" : "default", letterSpacing: "0.05em" }}>Ask</button>
      </div>
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []
  const leftRef = useRef(null)
  const [leftStuck, setLeftStuck] = useState(false)

  return (
    <div style={{ background: "#fff", color: "#0f0f0f", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .no-bar::-webkit-scrollbar { display: none; }
        .no-bar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Minimal nav — just back link */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#0f0f0f" }}>THRESHOLD</button>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#aaa", letterSpacing: "0.05em" }}>← Back</button>
      </div>

      {/* Three column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 220px", paddingTop: 61, minHeight: "100vh", alignItems: "start" }}>

        {/* LEFT — sticky after scroll */}
        <div style={{ position: "sticky", top: 61, height: "calc(100vh - 61px)", overflowY: "auto", padding: "60px 40px 40px" }} className="no-bar">
          {/* Title */}
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, lineHeight: 1.15, marginBottom: 8, fontWeight: 400 }}>
            {property.name}
          </div>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 40, letterSpacing: "0.02em" }}>
            by {property.architect}
          </div>

          {/* Metadata grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 16px", marginBottom: 40 }}>
            {[
              { label: "Location", value: property.location },
              { label: "Year", value: property.year },
              { label: "Price", value: property.price },
              { label: "Size", value: property.sqft ? `${property.sqft.toLocaleString()} sq ft` : null },
              { label: "Bedrooms", value: property.bedrooms },
              { label: "Bathrooms", value: property.bathrooms },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#0f0f0f" }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Editorial text */}
          {property.editorial && (
            <div style={{ fontSize: 12, lineHeight: 1.9, color: "#555", marginBottom: 28 }}>
              {property.editorial}
            </div>
          )}
          {property.architect_context && (
            <div style={{ fontSize: 12, lineHeight: 1.9, color: "#888", marginBottom: 28 }}>
              {property.architect_context}
            </div>
          )}
          {property.site_context && (
            <div style={{ fontSize: 12, lineHeight: 1.9, color: "#888", marginBottom: 28 }}>
              {property.site_context}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            <button style={{ width: "100%", padding: "10px", background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Request a Tour
            </button>
            <button style={{ width: "100%", padding: "10px", background: "none", color: "#0f0f0f", border: "1px solid #e0ddd8", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer" }}>
              Save Estate
            </button>
          </div>

          {/* Chat */}
          <Chat property={property} />
        </div>

        {/* CENTER — photos scroll freely */}
        <div>
          {photos.length > 0 ? photos.map((url, i) => (
            <div key={i} style={{ width: "100%", aspectRatio: i === 0 ? "4/3" : "3/2", overflow: "hidden" }}>
              <img src={url} alt={`${property.name} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )) : (
            <div style={{ width: "100%", height: "80vh", background: "#f5f3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, color: "#ccc" }}>No photos yet</span>
            </div>
          )}
          <div style={{ height: 120 }} />
        </div>

        {/* RIGHT — product/details sidebar, scrolls freely */}
        <div style={{ padding: "60px 24px 40px 16px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 20 }}>Tags</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 40 }}>
            {(property.idea_tags || []).map(tag => (
              <div key={tag} style={{ fontSize: 11, color: "#888" }}>{tag}</div>
            ))}
            {property.landscape_tag && <div style={{ fontSize: 11, color: "#888" }}>{property.landscape_tag}</div>}
          </div>

          {property.significance && (
            <>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>Significance</div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 40 }}>{property.significance}</div>
            </>
          )}

          {property.agent_name && (
            <>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>Listing Agent</div>
              <div style={{ fontSize: 12, color: "#0f0f0f", marginBottom: 4 }}>{property.agent_name}</div>
              {property.agent_brokerage && <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{property.agent_brokerage}</div>}
              {property.agent_phone && <div style={{ fontSize: 11, color: "#888" }}>{property.agent_phone}</div>}
            </>
          )}
        </div>

      </div>
    </div>
  )
}