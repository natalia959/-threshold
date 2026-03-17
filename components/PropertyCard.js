"use client"
import { useState } from "react"

export default function PropertyCard({ property, onClick, activeFilters }) {
  const [hovered, setHovered] = useState(false)

  const matchesFilter = activeFilters.length === 0 || activeFilters.every(f =>
    property.tags.idea.includes(f) ||
    property.tags.landscape === f ||
    property.tags.provenance === f
  )

  return (
    <div
      onClick={() => matchesFilter && onClick(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 6,
        overflow: "hidden",
        cursor: matchesFilter ? "pointer" : "default",
        aspectRatio: "3/4",
        transform: hovered && matchesFilter ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.3s ease",
        boxShadow: hovered && matchesFilter
          ? "0 16px 48px rgba(0,0,0,0.5)"
          : "0 4px 16px rgba(0,0,0,0.3)",
        opacity: !matchesFilter ? 0.2 : 1,
      }}
    >
      <img
        src={property.hero_photo || property.image || ""}
        alt={property.name}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: hovered ? "brightness(0.65)" : "brightness(0.75)",
          transition: "filter 0.25s ease",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "20px 18px",
        transform: hovered ? "translateY(0)" : "translateY(4px)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: 20, color: "#fff", fontWeight: 400, lineHeight: 1.2,
        }}>
          {property.name}
        </div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12, color: "rgba(255,255,255,0.65)",
          marginTop: 4, letterSpacing: "0.03em",
        }}>
          {property.architect} · {property.year}
        </div>
      </div>
    </div>
  )
}