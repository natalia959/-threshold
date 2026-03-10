"use client"
import { useState } from "react"

export default function VerifiedModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 4,
          padding: "48px 48px 40px",
          maxWidth: 500,
          width: "100%",
          position: "relative",
          animation: "slideUp 0.3s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: "#999", lineHeight: 1,
          }}
        >×</button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, marginBottom: 16 }}>
              Application received.
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#888", lineHeight: 1.7 }}>
              We review applications within 48 hours. All information is kept strictly confidential.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, marginBottom: 8 }}>
              Threshold Verified
            </div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 28 }}>
              Verified members receive full property details, direct agent contact, and priority access to new listings before they appear publicly.
            </div>

            {[
              { label: "Full name", type: "text" },
              { label: "Email", type: "email" },
              { label: "Phone", type: "tel" },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#999", marginBottom: 6, textTransform: "uppercase" }}>
                  {field.label}
                </div>
                <input
                  type={field.type}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1px solid #e0ddd8", borderRadius: 2,
                    padding: "10px 12px",
                    fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ))}

            {[
              { label: "Purchasing budget", options: ["$1M – $3M", "$3M – $7M", "$7M – $15M", "$15M+"] },
              { label: "Preferred verification", options: ["Bank statement", "Letter from financial advisor", "Pre-approval letter", "Other"] },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#999", marginBottom: 6, textTransform: "uppercase" }}>
                  {field.label}
                </div>
                <select
                  style={{
                    width: "100%",
                    border: "1px solid #e0ddd8", borderRadius: 2,
                    padding: "10px 12px",
                    fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14,
                    background: "#fff", outline: "none", appearance: "none",
                  }}
                >
                  {field.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#999", marginBottom: 6, textTransform: "uppercase" }}>
                What are you looking for?
              </div>
              <textarea
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: "1px solid #e0ddd8", borderRadius: 2,
                  padding: "10px 12px",
                  fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14,
                  resize: "none", outline: "none",
                }}
              />
            </div>

            <button
              onClick={() => setSubmitted(true)}
              style={{
                width: "100%", padding: "14px",
                background: "#0f0f0f", color: "#fff",
                border: "none", borderRadius: 40,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14, letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              Apply for Verified Access
            </button>
            <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb" }}>
              Documents reviewed within 48 hours. All information strictly confidential.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
