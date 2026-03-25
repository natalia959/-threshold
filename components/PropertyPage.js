"use client"
import { useState, useRef, useEffect } from "react"

// Property-specific prompts that feel alive and intelligent
const PROMPTS = [
  "What's the flooring material in the main living space?",
  "How does the light change through the day here?",
  "Has this house been altered from the original design?",
  "What would mornings feel like in the kitchen?",
  "What's the relationship between inside and outside?",
  "Who were the original owners and how did they live here?",
  "What makes this architect's work different from their peers?",
  "Is the structure exposed anywhere in the interior?",
  "What's the quietest room in the house?",
  "How does this house handle the landscape around it?",
  "What materials would you feel underfoot throughout the day?",
  "What does the view look like at dusk?",
  "How private is this from the street?",
  "What's the best season to experience this house?",
  "Could you work from home here comfortably?",
]

function FloatingPromptBar({ onPromptClick }) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [input, setInput] = useState("")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (focused) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % PROMPTS.length)
        setVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [focused])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) {
      onPromptClick(PROMPTS[current])
    } else {
      onPromptClick(text)
      setInput("")
    }
    inputRef.current?.blur()
    setFocused(false)
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 32,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      width: "min(560px, calc(100vw - 48px))",
    }}>
      <style>{`
        @keyframes promptFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prompt-bar { transition: all 0.3s ease; }
        .prompt-bar:focus-within { opacity: 1 !important; }
      `}</style>
      <div
        className="prompt-bar"
        style={{
          background: "rgba(15,15,14,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 50,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: focused ? "12px 16px 12px 22px" : "14px 16px 14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: focused ? 1 : 0.5,
          transition: "opacity 0.3s ease, padding 0.2s ease, background 0.3s ease",
          cursor: focused ? "text" : "pointer",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
        onClick={() => { if (!focused) { setFocused(true); inputRef.current?.focus() } }}
      >
        {/* Sparkle */}
        <div style={{
          width: 18, height: 18, flexShrink: 0, opacity: 0.6,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="rgba(201,169,110,0.8)"/>
          </svg>
        </div>

        {/* Input / animated placeholder */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!input) setFocused(false) }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              background: "none", border: "none", outline: "none",
              width: "100%", fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13, color: "#fff", letterSpacing: "0.01em",
              caretColor: "#c9a96e",
            }}
          />
          {!focused && !input && (
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13, color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.01em", pointerEvents: "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {PROMPTS[current]}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={e => { e.stopPropagation(); handleSubmit() }}
          style={{
            background: input.trim() ? "#c9a96e" : "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 50,
            width: 32, height: 32, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.2s ease",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6H11M6 1L11 6L6 11" stroke={input.trim() ? "#0f0f0f" : "rgba(255,255,255,0.5)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function Chat({ property, initialMessage, chatRef }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `You're looking at ${property.name}${property.architect ? ` by ${property.architect}` : ""}${property.year ? `, ${property.year}` : ""}. What would you like to know about it?` }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Expose send function via ref
  useEffect(() => {
    if (chatRef) chatRef.current = { send }
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle messages sent from floating bar
  useEffect(() => {
    if (initialMessage) send(initialMessage)
  }, [initialMessage])

  const send = async (text) => {
    const msg = text.trim()
    if (!msg || loading) return

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

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, padding: "24px 32px 20px" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .chat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>
        Conversation
      </div>

      {/* Messages */}
      <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0, msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            {m.role === "assistant" ? (
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#555", lineHeight: 1.85 }}>
                {m.content}
                {loading && i === messages.length - 1 && (
                  <span style={{ display: "inline-block", width: 1.5, height: "0.85em", background: "#c9a96e", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 0.7s step-end infinite" }} />
                )}
              </div>
            ) : (
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#999", fontStyle: "italic", marginBottom: 2 }}>
                {m.content}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default function PropertyPage({ property, allProperties, onBack }) {
  const photos = property.photos?.length ? property.photos : property.hero_photo ? [property.hero_photo] : []
  const [pendingMessage, setPendingMessage] = useState(null)
  const chatRef = useRef(null)

  const handlePrompt = (text) => {
    // Scroll to chat panel and send
    document.getElementById("chat-panel")?.scrollIntoView({ behavior: "smooth" })
    if (chatRef.current) {
      chatRef.current.send(text)
    } else {
      setPendingMessage(text)
    }
  }

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
                <span key={tag} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#aaa", border: "1px solid #e8e4de", borderRadius: 20, padding: "3px 10px" }}>{tag}</span>
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
          <div id="chat-panel" className="no-scroll" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Chat property={property} initialMessage={pendingMessage} chatRef={chatRef} />
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
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, lineHeight: 1.85, color: "#222", maxWidth: 640 }}>{property.editorial}</div>
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
          <div style={{ height: 140 }} />
        </div>
      </div>

      {/* Floating prompt bar */}
      <FloatingPromptBar onPromptClick={handlePrompt} />
    </div>
  )
}