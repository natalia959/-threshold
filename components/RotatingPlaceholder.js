"use client"
import { useState, useEffect } from "react"

export default function RotatingPlaceholder({ items, active, color = "rgba(255,255,255,0.45)" }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (active) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % items.length)
        setVisible(true)
      }, 350)
    }, 3200)
    return () => clearInterval(interval)
  }, [items, active])

  return (
    <span style={{
      transition: "opacity 0.35s ease",
      opacity: active ? 0 : visible ? 1 : 0,
      pointerEvents: "none",
      position: "absolute",
      left: 0, right: 80,
      top: "50%",
      transform: "translateY(-50%)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 15,
      color,
    }}>
      {items[index]}
    </span>
  )
}
