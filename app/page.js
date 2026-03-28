"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import HomePage from "../components/HomePage"
import ResultsPage from "../components/ResultsPage"
import SignInModal from "../components/SignInModal"
import VerifiedModal from "../components/VerifiedModal"

export default function Page() {
  const [view, setView] = useState("home")
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
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setResults(data)
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
      {view === "results" ? (
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
        <HomePage
          onSearch={handleSearch}
          onSignUp={() => setShowApply(true)}
          onSignIn={() => setShowSignIn(true)}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
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
