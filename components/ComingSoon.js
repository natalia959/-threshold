"use client"
import { useState, useEffect, useRef } from "react"

const WORDS = ["Homes", "Objects", "Living"]
const WORD_DURATION = 4200

// Positions scattered around the viewport, avoiding the center
const SLOTS = [
  { x: 6,  y: 10 }, { x: 30, y: 6  }, { x: 62, y: 5  }, { x: 85, y: 10 },
  { x: 90, y: 35 }, { x: 88, y: 65 }, { x: 72, y: 84 }, { x: 48, y: 88 },
  { x: 22, y: 85 }, { x: 6,  y: 68 }, { x: 4,  y: 40 }, { x: 18, y: 18 },
  { x: 76, y: 22 }, { x: 55, y: 82 }, { x: 12, y: 55 }, { x: 82, y: 50 },
]

const SIZES = [180, 200, 160, 220, 190, 175]

let uid = 0

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ComingSoon() {
  const [wordIdx,     setWordIdx]     = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [activeImgs,  setActiveImgs]  = useState([])
  const poolRef = useRef({ homes: [], objects: [], living: [] })

  // Fetch image pools once
  useEffect(() => {
    fetch("/api/photos")
      .then(r => r.json())
      .then(homes => {
        poolRef.current.homes = homes || []
        poolRef.current.living = [...(poolRef.current.homes), ...(poolRef.current.objects)]
      })
      .catch(() => {})

    fetch("/api/objects")
      .then(r => r.json())
      .then(data => {
        const objects = (data || []).filter(o => o.image).map(o => o.image)
        poolRef.current.objects = objects
        poolRef.current.living = [...(poolRef.current.homes), ...objects]
      })
      .catch(() => {})
  }, [])

  // Spawn a batch of images for the current word
  const spawnBatch = (idx) => {
    const word = WORDS[idx]
    const pool =
      word === "Homes"   ? poolRef.current.homes :
      word === "Objects" ? poolRef.current.objects :
                           poolRef.current.living

    if (!pool.length) return

    const urls = shuffle(pool).slice(0, 6)
    const slots = shuffle(SLOTS).slice(0, urls.length)

    const batch = urls.map((url, i) => ({
      id: ++uid,
      url,
      x: slots[i].x,
      y: slots[i].y,
      w: SIZES[i % SIZES.length],
      delay: i * 120,
      phase: "in",
    }))

    setActiveImgs(prev => [...prev, ...batch])

    // → hold
    setTimeout(() => {
      setActiveImgs(prev => prev.map(img =>
        batch.find(b => b.id === img.id) ? { ...img, phase: "hold" } : img
      ))
    }, 700)

    // → out
    setTimeout(() => {
      setActiveImgs(prev => prev.map(img =>
        batch.find(b => b.id === img.id) ? { ...img, phase: "out" } : img
      ))
    }, 2600)

    // remove
    setTimeout(() => {
      setActiveImgs(prev => prev.filter(img => !batch.find(b => b.id === img.id)))
    }, 3900)
  }

  // Word rotation + image spawn
  useEffect(() => {
    // Initial spawn after pools have a moment to load
    const initTimer = setTimeout(() => spawnBatch(0), 600)

    const interval = setInterval(() => {
      // Fade word out
      setWordVisible(false)

      setTimeout(() => {
        setWordIdx(prev => {
          const next = (prev + 1) % WORDS.length
          spawnBatch(next)
          return next
        })
        setWordVisible(true)
      }, 500)
    }, WORD_DURATION)

    return () => { clearTimeout(initTimer); clearInterval(interval) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: "#f5f4f0",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes imgFadeIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Scattered images */}
      {activeImgs.map(img => {
        const isOut = img.phase === "out"
        const isIn  = img.phase === "in"
        return (
          <div
            key={img.id}
            style={{
              position: "fixed",
              left: `${img.x}vw`,
              top:  `${img.y}vh`,
              transform: "translate(-50%, -50%)",
              width: img.w,
              zIndex: 1,
              pointerEvents: "none",
              opacity: isIn ? 0 : isOut ? 0 : 1,
              filter: isOut ? "blur(14px) saturate(0.6)" : "blur(0px) saturate(1)",
              transition: isIn
                ? `opacity 0.7s ease ${img.delay}ms, filter 0.7s ease ${img.delay}ms`
                : "opacity 1.1s ease, filter 1.1s ease",
              willChange: "opacity, filter",
            }}
          >
            <img
              src={img.url}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 4,
              }}
            />
          </div>
        )
      })}

      {/* Center content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "0 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}>

        {/* Logo */}
        <a href="/home" style={{ display: "block" }}>
          <img
            src="/threshold-logo.png"
            alt="Threshold"
            style={{ height: 36, width: "auto", display: "block", filter: "invert(1)" }}
          />
        </a>

        {/* Rotating headline */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(38px, 5vw, 66px)",
          fontWeight: 300,
          lineHeight: 1.1,
          color: "#1a1a18",
          margin: 0,
          letterSpacing: "-0.01em",
        }}>
          <span style={{
            display: "inline-block",
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? "translateY(0px)" : "translateY(-10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            {WORDS[wordIdx]}
          </span>
          <span style={{ color: "rgba(26,26,24,0.45)", fontStyle: "italic" }}>
            , shaped by your taste.
          </span>
        </h1>

      </div>
    </div>
  )
}
