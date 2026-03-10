"use client"
import { useState } from "react"
import RotatingPlaceholder from "./RotatingPlaceholder"

const PLACEHOLDERS = [
  "What are the original materials in this house?",
  "What makes this architecturally significant?",
  "Who designed this and what else did they build?",
  "Has this house been altered from the original?",
  "Show me more houses like this one...",
]

export default function InsightBar({ property }) {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const ask = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, propertyId: property.id }),
      })
      const data = await res.json()
      setResponse(data.response || "Unable to get a response right now.")
    } catch {
      setResponse("Unable to connect. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "#999",
        fontFamily: "var(--font-dm-sans), sans-serif",
        marginBottom: 10,
        textTransform: "uppercase",
      }}>
        Ask about this house
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        border: `1px solid ${focused ? "#bbb" : "#e0ddd8"}`,
        borderRadius: 40,
        padding: "0 6px 0 18px",
        transition: "border-color 0.2s",
        position: "relative",
      }}>
        {!focused && !query && (
          <RotatingPlaceholder
            items={PLACEHOLDERS}
            active={false}
            color="rgba(0,0,0,0.35)"
          />
        )}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === "Enter" && ask()}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#0f0f0f",
            padding: "14px 0",
          }}
        />
        <button
          onClick={ask}
          disabled={loading}
          style={{
            background: "#0f0f0f",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            padding: "8px 16px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            letterSpacing: "0.05em",
            cursor: loading ? "default" : "pointer",
            flexShrink: 0,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {response && (
        <div style={{
          marginTop: 16,
          fontFamily: "var(--font-cormorant), serif",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.75,
          color: "#333",
          padding: "16px 0",
          borderTop: "1px solid #f0ede8",
          animation: "fadeIn 0.4s ease",
        }}>
          {response}
        </div>
      )}
    </div>
  )
}
