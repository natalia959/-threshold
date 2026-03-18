"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "../../../lib/supabase"

// Furniture suggestions API
async function getFurnitureSuggestions(property) {
  const res = await fetch("/api/furniture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ property }),
  })
  return res.json()
}

function ConversationThread({ property }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, propertyId: property.id, history: messages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I wasn't able to respond just now." }])
    }
    setLoading(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const starters = [
    "What makes this house significant?",
    "How does the light work here?",
    "What would living here feel like?",
    "Are there similar houses I should know?",
  ]

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: 20 }}>
        Ask about this house
      </div>

      {messages.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {starters.map(s => (
            <button key={s} onClick={() => { setInput(s); setTimeout(send, 50) }}
              style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 2, padding: "8px 12px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#888", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.target.style.borderColor = "rgba(0,0,0,0.3)"}
              onMouseLeave={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
            >{s}</button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ marginBottom: 20, maxHeight: 400, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              {m.role === "user" ? (
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#333", fontWeight: 500 }}>{m.content}</div>
              ) : (
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>{m.content}</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, color: "#bbb", fontStyle: "italic" }}>…</div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about this house..."
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#333" }}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ background: "#0c0c0c", color: "#fff", border: "none", borderRadius: 2, padding: "8px 16px", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, cursor: input.trim() ? "pointer" : "default", opacity: input.trim() ? 1 : 0.4 }}>
          Ask
        </button>
      </div>
    </div>
  )
}

function FurnitureRail({ property }) {
  const [furniture, setFurniture] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFurnitureSuggestions(property).then(data => {
      setFurniture(data.suggestions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [property.id])

  if (loading) return (
    <div style={{ padding: "0 0 0 32px" }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ marginBottom: 32, opacity: 0.3 }}>
          <div style={{ width: "100%", aspectRatio: "1", background: "#f0ece6", borderRadius: 2, marginBottom: 12 }} />
          <div style={{ height: 10, background: "#f0ece6", borderRadius: 2, marginBottom: 6 }} />
          <div style={{ height: 10, width: "60%", background: "#f0ece6", borderRadius: 2 }} />
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: "0 0 0 32px" }}>
      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: 24 }}>
        Objects for this house
      </div>
      {furniture.map((item, i) => (
        <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", marginBottom: 32, textDecoration: "none", color: "inherit" }}>
          <div style={{ width: "100%", aspectRatio: "1", background: "#f7f4f0", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
            {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12, boxSizing: "border-box" }} />}
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: 4 }}>{item.designer}</div>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 15, color: "#222", marginBottom: 3 }}>{item.name}</div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#aaa" }}>{item.year} · {item.price}</div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb", marginTop: 6, lineHeight: 1.5 }}>{item.reason}</div>
        </a>
      ))}
    </div>
  )
}

export default function PropertyDetailPage({ params }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [verified, setVerified] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      // Get property
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .single()
      setProperty(data)

      // Check auth
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("verified")
          .eq("id", session.user.id)
          .single()
        setVerified(profile?.verified || false)
      }
      setLoading(false)
    }
    init()
  }, [params.id])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, color: "#ccc" }}>—</div>
    </div>
  )

  if (!property) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, color: "#ccc" }}>Property not found.</div>
    </div>
  )

  const photos = property.photos?.length ? property.photos : [property.hero_photo].filter(Boolean)

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0c0c0c" }}>
      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#0c0c0c", textDecoration: "none" }}>THRESHOLD</a>
        <a href="/" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", textDecoration: "none" }}>← Collection</a>
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 220px", minHeight: "100vh", paddingTop: 61 }}>

        {/* LEFT — fixed text panel */}
        <div style={{ position: "sticky", top: 61, height: "calc(100vh - 61px)", overflowY: "auto", padding: "48px 40px 48px 48px", borderRight: "1px solid rgba(0,0,0,0.06)" }}>

          {/* Header */}
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>
            {property.location}
          </div>
          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, lineHeight: 1.1, marginBottom: 8, fontWeight: 400 }}>
            {property.name}
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888", marginBottom: 4 }}>
            {property.architect} · {property.year}
          </div>

          {/* Price — full for verified, blurred for others */}
          {verified ? (
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 18, color: "#0c0c0c", marginBottom: 32, marginTop: 16 }}>
              {property.price}
            </div>
          ) : (
            <div style={{ marginBottom: 32, marginTop: 16 }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 18, color: "transparent", textShadow: "0 0 8px rgba(0,0,0,0.3)", userSelect: "none", display: "inline" }}>$00,000,000</div>
              <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb", marginLeft: 8 }}>— verified members only</span>
            </div>
          )}

          {/* Editorial */}
          {property.significance && (
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.05em", color: "#bbb", textTransform: "uppercase", marginBottom: 12 }}>
              {property.significance}
            </div>
          )}
          {property.editorial && (
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 17, lineHeight: 1.75, color: "#333", marginBottom: 24 }}>
              {property.editorial}
            </div>
          )}
          {property.architect_context && (
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, lineHeight: 1.7, color: "#888", marginBottom: 24, paddingTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              {property.architect_context}
            </div>
          )}

          {/* Verified details */}
          {verified && (
            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 0" }}>
                {[
                  ["Address", property.full_address],
                  ["Agent", property.agent_name],
                  ["Brokerage", property.agent_brokerage],
                  ["Contact", property.agent_email],
                  ["Bedrooms", property.bedrooms],
                  ["Bathrooms", property.bathrooms],
                  ["Size", property.sqft ? `${property.sqft.toLocaleString()} sq ft` : null],
                  ["Lot", property.lot_size],
                ].filter(([,v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#333" }}>{value}</div>
                  </div>
                ))}
              </div>
              <a href={`mailto:${property.agent_email}`}
                style={{ display: "block", marginTop: 20, padding: "12px 0", textAlign: "center", background: "#0c0c0c", color: "#fff", textDecoration: "none", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, letterSpacing: "0.1em", borderRadius: 2 }}>
                Contact Agent
              </a>
            </div>
          )}

          {/* Conversation */}
          <ConversationThread property={property} />
        </div>

        {/* CENTER — scrollable photos */}
        <div ref={scrollRef} style={{ overflowY: "auto", height: "calc(100vh - 61px)", position: "sticky", top: 61 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ width: "100%", minHeight: "calc(100vh - 61px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f4f0" }}>
              <img src={url} alt={`${property.name} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
          {property.site_context && (
            <div style={{ padding: "60px 48px", background: "#fff" }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 16 }}>Site</div>
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, lineHeight: 1.75, color: "#555", maxWidth: 600 }}>{property.site_context}</div>
            </div>
          )}
        </div>

        {/* RIGHT — furniture rail */}
        <div style={{ position: "sticky", top: 61, height: "calc(100vh - 61px)", overflowY: "auto", padding: "48px 24px 48px 0", borderLeft: "1px solid rgba(0,0,0,0.06)" }}>
          <FurnitureRail property={property} />
        </div>

      </div>
    </div>
  )
}