"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import HomePage from "../components/HomePage"
import ResultsPage from "../components/ResultsPage"
import VerifiedModal from "../components/VerifiedModal"
import SignInModal from "../components/SignInModal"

export default function Page() {
  const [page, setPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showVerified, setShowVerified] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [user, setUser] = useState(null)

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
    setSearchQuery(q)
    setPage("results")
    setSearching(true)
    setSearchResults(null)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults(null)
    }
    setSearching(false)
  }

  const handleAuthClick = () => {
    if (user) {
      window.location.href = "/dashboard"
    } else {
      setShowSignIn(true)
    }
  }

  return (
    <>
      {page === "home" ? (
        <HomePage
          onSearch={handleSearch}
          onSignUp={() => setShowVerified(true)}
          onSignIn={handleAuthClick}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      ) : (
        <ResultsPage
          query={searchQuery}
          results={searchResults}
          searching={searching}
          onSearch={handleSearch}
          onBack={() => { setPage("home"); setSearchResults(null) }}
          onSignUp={() => setShowVerified(true)}
          onSignIn={handleAuthClick}
          user={user}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      )}
      {showVerified && <VerifiedModal onClose={() => setShowVerified(false)} />}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onApply={() => setShowVerified(true)} />}
    </>
  )
}