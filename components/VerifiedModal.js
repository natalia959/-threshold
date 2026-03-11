"use client"
import { useState } from "react"

const inputStyle = (error) => ({
  width: "100%", boxSizing: "border-box",
  border: `1px solid ${error ? "#e05555" : "#e0ddd8"}`, borderRadius: 2,
  padding: "10px 12px",
  fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14,
  outline: "none", background: error ? "#fff8f8" : "#fff",
  transition: "border-color 0.2s",
})

const labelStyle = {
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 11, letterSpacing: "0.1em",
  color: "#999", marginBottom: 6, textTransform: "uppercase",
  display: "block",
}

export default function VerifiedModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    budget: "$1M – $3M",
    verification: "Bank statement",
    looking: "",
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.email.trim()) e.email = "Required"
    else if (!form.email.includes("@") || !form.email.includes(".")) e.email = "Enter a valid email"
    if (!form.phone.trim()) e.phone = "Required"
    else if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number"
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
      else setErrors({ submit: "Something went wrong. Please try again." })
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." })
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 4, padding: "48px 48px 40px", maxWidth: 500, width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#999" }}>×</button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, marginBottom: 16 }}>Application received.</div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#888", lineHeight: 1.7 }}>
              We review applications within 48 hours. All information is kept strictly confidential.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, marginBottom: 8 }}>Threshold Verified</div>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 28 }}>
              Verified members receive full property details, direct agent contact, and priority access to new listings before they appear publicly.
            </div>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full name *</label>
              <input value={form.name} onChange={set("name")} type="text" style={inputStyle(errors.name)} />
              {errors.name && <div style={{ fontSize: 11, color: "#e05555", marginTop: 4 }}>{errors.name}</div>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email *</label>
              <input value={form.email} onChange={set("email")} type="email" style={inputStyle(errors.email)} />
              {errors.email && <div style={{ fontSize: 11, color: "#e05555", marginTop: 4 }}>{errors.email}</div>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone *</label>
              <input value={form.phone} onChange={set("phone")} type="tel" style={inputStyle(errors.phone)} />
              {errors.phone && <div style={{ fontSize: 11, color: "#e05555", marginTop: 4 }}>{errors.phone}</div>}
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Purchasing budget</label>
              <select value={form.budget} onChange={set("budget")} style={inputStyle(false)}>
                {["$1M – $3M","$3M – $7M","$7M – $15M","$15M+"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Verification */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Preferred verification</label>
              <select value={form.verification} onChange={set("verification")} style={inputStyle(false)}>
                {["Bank statement","Letter from financial advisor","Pre-approval letter","Other"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Looking for */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>What are you looking for?</label>
              <textarea value={form.looking} onChange={set("looking")} rows={3} style={{ ...inputStyle(false), resize: "none" }} />
            </div>

            {errors.submit && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff8f8", border: "1px solid #e05555", borderRadius: 2, fontSize: 13, color: "#e05555" }}>
                {errors.submit}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#666" : "#0f0f0f", color: "#fff", border: "none", borderRadius: 40, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, letterSpacing: "0.05em", cursor: loading ? "default" : "pointer", transition: "background 0.2s" }}>
              {loading ? "Submitting..." : "Apply for Verified Access"}
            </button>
            <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#bbb" }}>
              Reviewed within 48 hours · Strictly confidential
            </div>
          </>
        )}
      </div>
    </div>
  )
}