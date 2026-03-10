"use client"
import { useState } from "react"
import InsightBar from "./InsightBar"
import VerifiedModal from "./VerifiedModal"
import ThresholdMark from "./ThresholdMark"

export default function PropertyPage({ property, allProperties, onBack }) {
  const [showModal, setShowModal] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const fmt = (n) => "$" + n.toLocaleString()

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0f0f0f" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0ede8" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ThresholdMark color="#0f0f0f" size={20} />
          <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, letterSpacing: "0.18em", color: "#0f0f0f" }}>
            THRESHOLD
          </span>
        </button>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#999", letterSpacing: "0.05em" }}>
          ← Collection
        </button>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "56px 48px 80px",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 72,
        animation: "fadeIn 0.5s ease",
      }}>

        {/* Left — Editorial */}
        <div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
            {property.location} · {property.architect} · {property.year}
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 300, lineHeight: 1.05, margin: "0 0 36px", letterSpacing: "-0.01em" }}>
            {property.name}
          </h1>

          {/* Hero image */}
          <div style={{ borderRadius: 4, overflow: "hidden", marginBottom: 8, aspectRatio: "16/10" }}>
            <img
              src={property.images[activeImage]}
              alt={property.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Thumbnails */}
          <div style={{ display: "flex", gap: 8, marginBottom: 44 }}>
            {property.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImage(i)}
                style={{
                  width: 72, height: 48, borderRadius: 2,
                  overflow: "hidden", cursor: "pointer",
                  opacity: activeImage === i ? 1 : 0.45,
                  border: activeImage === i ? "1.5px solid #0f0f0f" : "1.5px solid transparent",
                  transition: "opacity 0.2s",
                }}
              >
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>

          {/* Editorial */}
          {property.editorial.map((para, i) => (
            <p key={i} style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 19, lineHeight: 1.8, color: "#1a1a1a", margin: "0 0 24px", fontWeight: 400 }}>
              {para}
            </p>
          ))}

          {/* Context */}
          <div style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid #f0ede8" }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#aaa", marginBottom: 12, textTransform: "uppercase" }}>The Architect</div>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, lineHeight: 1.8, color: "#555", margin: 0 }}>{property.architectContext}</p>
          </div>

          <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #f0ede8" }}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#aaa", marginBottom: 12, textTransform: "uppercase" }}>The Site</div>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, lineHeight: 1.8, color: "#555", margin: 0 }}>{property.siteContext}</p>
          </div>
        </div>

        {/* Right — Details + Bar */}
        <div>
          <div style={{ position: "sticky", top: 32 }}>

            {/* Price */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 34, fontWeight: 400, letterSpacing: "-0.01em" }}>
                {fmt(property.price)}
              </div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#aaa", marginTop: 4 }}>
                {property.beds} beds · {property.baths} baths · {property.sqft.toLocaleString()} sq ft
              </div>
            </div>

            {/* Details */}
            <div style={{ borderTop: "1px solid #f0ede8", borderBottom: "1px solid #f0ede8", padding: "20px 0", marginBottom: 24 }}>
              {[
                ["Year built", property.year],
                ["Architect", property.architect],
                ["Location", property.location],
                ["Status", "Available"],
                ["Listed by", `${property.agent.name}, ${property.agent.brokerage}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 16 }}>
                  <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#aaa", letterSpacing: "0.05em", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#0f0f0f", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Verified gate */}
            <div style={{ background: "#f9f7f4", borderRadius: 4, padding: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>
                Agent contact available to{" "}
                <span style={{ color: "#0f0f0f", fontWeight: 500 }}>Threshold Verified</span>{" "}
                members.
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: "100%", padding: "12px",
                  background: "#0f0f0f", color: "#fff",
                  border: "none", borderRadius: 30,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13, letterSpacing: "0.05em", cursor: "pointer",
                }}
              >
                Apply for Verified Access
              </button>
            </div>

            {/* Insight Bar */}
            <div style={{ background: "#f9f7f4", borderRadius: 4, padding: 20 }}>
              <InsightBar property={property} allProperties={allProperties} />
            </div>

          </div>
        </div>
      </div>

      {showModal && <VerifiedModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
