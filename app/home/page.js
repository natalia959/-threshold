"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import HomePage from "../../components/HomePage"
import ResultsPage from "../../components/ResultsPage"
import SignInModal from "../../components/SignInModal"
import VerifiedModal from "../../components/VerifiedModal"

const SPLIT = "\n\x1E\n"

export default function HomeFull() {
  const [page, setPage]               = useState("home")
  const [query, setQuery]             = useState("")
  const [results, setResults]         = useState(null)
  const [searching, setSearching]     = useState(false)
  const [user, setUser]               = useState(null)
  const [searchValue, setSearchValue] = useState("")
  const [showSignIn, setShowSignIn]   = useState(false)
  const [showSignUp, setShowSignUp]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = async (q) => {
    setQuery(q)
    setPage("results")
    setSearching(true)
    setResults(null)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let properties = null
      let aiText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })

        if (!properties) {
          const idx = buf.indexOf(SPLIT)
          if (idx !== -1) {
            properties = JSON.parse(buf.slice(0, idx))
            aiText = buf.slice(idx + SPLIT.length)
          }
          continue
        }

        aiText += decoder.decode(value, { stream: true })

        // Stream interpretation as it arrives
        const match = aiText.match(/"interpretation"\s*:\s*"((?:[^"\\]|\\.)*)"/)
        if (match) {
          const interp = match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n")
          setResults(r => r?.interpretation === interp ? r : { interpretation: interp, matched: r?.matched || [], alsoLove: r?.alsoLove || [] })
        }
      }

      // Parse final JSON
      if (properties && aiText) {
        try {
          const parsed = JSON.parse(aiText.replace(/```json|```/g, "").trim())
          const propMap = Object.fromEntries(properties.map(p => [p.id, p]))
          const hydrate = (arr) => (arr || []).map(item => ({ ...item, property: propMap[item.id] })).filter(i => i.property)
          setResults({
            interpretation: parsed.interpretation,
            matched: hydrate(parsed.matched),
            alsoLove: hydrate(parsed.alsoLove),
          })
        } catch {}
      }
    } catch {
      setResults({ matched: [], alsoLove: [] })
    }

    setSearching(false)
  }

  return (
    <>
      {page === "results" ? (
        <ResultsPage
          query={query}
          results={results}
          searching={searching}
          onSearch={handleSearch}
          onBack={() => { setPage("home"); setSearchValue("") }}
          onSignUp={() => setShowSignUp(true)}
          onSignIn={() => setShowSignIn(true)}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      ) : (
        <HomePage
          onSearch={handleSearch}
          onSignUp={() => setShowSignUp(true)}
          onSignIn={() => setShowSignIn(true)}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      )}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onApply={() => { setShowSignIn(false); setShowSignUp(true) }} />}
      {showSignUp && <VerifiedModal onClose={() => setShowSignUp(false)} />}
    </>
  )
}
