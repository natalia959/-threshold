"use client"
import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function SignInModal({ onClose }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setLoading(true)
    setError("")
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://www.threshold.estate/auth/callback",
      },
    })
    if (err) {
      setError("Something went wrong. Please try again.")
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "48px", maxWidth: 420, width: "100%", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#666" }}>×</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, color: "#fff", marginBottom: 16 }}>
              Check your inbox.
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#888", lineHeight: 1.8 }}>
              We sent a sign-in link to<br />
              <span style={{ color: "#c9a96e" }}>{email}</span>
            </div>
            <div style={{ marginTop: 24, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#555" }}>
              The link expires in 24 hours. No password needed.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, color: "#fff", marginBottom: 8 }}>
              Sign In
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 32 }}>
              Enter your email and we'll send you a secure sign-in link. No password required.
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#555", marginBottom: 8, textTransform: "uppercase" }}>
                Email
              </div>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError("") }}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                placeholder="your@email.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${error ? "#e05555" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 2, padding: "12px 14px",
                  fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14,
                  color: "#fff", outline: "none",
                }}
              />
              {error && <div style={{ fontSize: 11, color: "#e05555", marginTop: 6 }}>{error}</div>}
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              style={{
                width: "100%", padding: "14px", marginTop: 24,
                background: loading ? "#333" : "#fff",
                color: "#0c0c0c", border: "none", borderRadius: 40,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14, letterSpacing: "0.05em",
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Sending..." : "Send Sign-In Link"}
            </button>

            <div style={{ textAlign: "center", marginTop: 20, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#444" }}>
              Only verified members can access the full collection.<br />
              <span
                onClick={onClose}
                style={{ color: "#c9a96e", cursor: "pointer", textDecoration: "underline" }}
              >
                Request verified access
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}