"use client"
import { useEffect, useRef } from "react"

export default function DriftingGrid({ properties }) {
  const canvasRef = useRef(null)
  const cardsRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const images = properties.flatMap(p => p.images)
    const totalCards = 14

    images.slice(0, totalCards).forEach((src, i) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = src
      const w = 160 + Math.random() * 120
      const h = w * (1.2 + Math.random() * 0.4)
      cardsRef.current[i] = {
        img,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w, h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        opacity: 0.18 + Math.random() * 0.22,
        radius: 8,
      }
    })

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      cardsRef.current.forEach(card => {
        if (!card) return
        card.x += card.vx
        card.y += card.vy
        if (card.x > canvas.width + card.w) card.x = -card.w
        if (card.x < -card.w) card.x = canvas.width + card.w
        if (card.y > canvas.height + card.h) card.y = -card.h
        if (card.y < -card.h) card.y = canvas.height + card.h

        if (!card.img.complete) return
        ctx.save()
        ctx.globalAlpha = card.opacity
        const { x, y, w, h, radius: r } = card
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r)
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(card.img, x, y, w, h)
        ctx.restore()
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  )
}
