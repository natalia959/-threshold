"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import LandingPage from "../components/LandingPage"
import ResultsPage from "../components/ResultsPage"
import SignInModal from "../components/SignInModal"
import VerifiedModal from "../components/VerifiedModal"

function ComingSoon() {
  return (
    <div style={{
      background: "#131313", height: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, color: "#fff",
    }}>
      <img src="/threshold-logo.png" alt="Threshold" style={{ height: 44, width: "auto" }} />
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.32)", textTransform: "uppercase", margin: 0,
      }}>
        Coming soon
      </p>
    </div>
  )
}

export default function Page() {
  const [view, setView] = useState("coming-soon")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [user, setUser] = useState(null)
  const [searchValue, setSearchValue] = useState("")
  const [showSignIn, setShowSignIn] = useState(false)
  const [showApply, setShowApply] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = async (q) => {
    setQuery(q)
    setView("results")
    setSearching(true)
    setResults(null)

    const SPLIT = "\n\x1E\n"

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let properties = null // property map, received in phase 1
      let aiText = ""       // Claude's streaming JSON, received in phase 2

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Phase 1: extract properties payload once delimiter arrives
        if (!properties) {
          const splitIdx = buffer.indexOf(SPLIT)
          if (splitIdx !== -1) {
            properties = JSON.parse(buffer.slice(0, splitIdx))
            aiText = buffer.slice(splitIdx + SPLIT.length)
          }
          continue
        }

        // Phase 2: accumulate Claude's JSON and surface interpretation immediately
        aiText += decoder.decode(value, { stream: true })

        // Extract interpretation as soon as it's fully quoted in the stream
        const interpMatch = aiText.match(/"interpretation"\s*:\s*"((?:[^"\\]|\\.)*)"/)
        if (interpMatch) {
          const interp = interpMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
          setResults(prev => prev?.interpretation === interp ? prev : {
            interpretation: interp,
            matched: prev?.matched || [],
            alsoLove: prev?.alsoLove || [],
          })
        }
      }

      // Full parse once stream ends — hydrate matched/alsoLove with property objects
      if (properties && aiText) {
        try {
          const clean = aiText.replace(/```json|```/g, "").trim()
          const result = JSON.parse(clean)
          const propMap = Object.fromEntries(properties.map(p => [p.id, p]))
          const hydrate = (items) => (items || [])
            .map(item => ({ ...item, property: propMap[item.id] }))
            .filter(item => item.property)
          setResults({
            interpretation: result.interpretation,
            matched: hydrate(result.matched),
            alsoLove: hydrate(result.alsoLove),
          })
        } catch {
          // keep whatever partial results we already showed
        }
      }
    } catch {
      setResults({ matched: [], alsoLove: [] })
    }
    setSearching(false)
  }

  const handleBack = () => {
    setView("home")
    setSearchValue("")
  }

  return (
    <>
      {view === "coming-soon" ? <ComingSoon /> : view === "results" ? (
        <ResultsPage
          query={query}
          results={results}
          searching={searching}
          onSearch={handleSearch}
          onBack={handleBack}
          onSignUp={() => setShowApply(true)}
          onSignIn={() => setShowSignIn(true)}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      ) : (
        <LandingPage
          onSearch={handleSearch}
          onSignUp={() => setShowApply(true)}
          onSignIn={() => setShowSignIn(true)}
          user={user}
        />
      )}

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onApply={() => { setShowSignIn(false); setShowApply(true) }}
        />
      )}

      {showApply && (
        <VerifiedModal onClose={() => setShowApply(false)} />
      )}
    </>
  )
}
