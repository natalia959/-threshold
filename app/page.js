"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import HomePage from "../components/HomePage"
import ResultsPage from "../components/ResultsPage"
import VerifiedModal from "../components/VerifiedModal"
import SignInModal from "../components/SignInModal"

function quickMatch(properties, query) {
  const q = query.toLowerCase()
    // Expand common search terms
    .replace(/mid.?century/g, "koenig neutra")
    .replace(/modernist|modern/g, "koenig neutra")
    .replace(/glass/g, "glass steel")
    .replace(/view|views/g, "hills los angeles")
  const terms = q.split(/\s+/)
  return properties
    .map(p => {
      const text = `${p.name} ${p.architect} ${p.location} ${p.significance} ${(p.idea_tags||[]).join(" ")} ${p.landscape_tag}`.toLowerCase()
      const score = terms.filter(t => text.includes(t)).length
      return { score, property: p }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => ({ id: r.property.id, reason: "", property: r.property }))
}

export default function Page() {
  const [page, setPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showVerified, setShowVerified] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [user, setUser] = useState(null)
  const [allProperties, setAllProperties] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    fetch("/api/properties-list")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllProperties(data) })
      .catch(() => {})
    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = async (q) => {
    setSearchQuery(q)
    setPage("results")
    setSearching(true)

    // Show instant keyword results immediately (no interpretation yet)
    if (allProperties.length > 0) {
      const instant = quickMatch(allProperties, q)
      if (instant.length > 0) {
        setSearchResults({ interpretation: "", matched: instant, alsoLove: [], isInstant: true })
      }
    }

    // Wait for full AI result then set it
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults(prev => prev ? { ...prev, isInstant: false } : null)
    }
    setSearching(false)
  }

  const handleAuthClick = () => {
    if (user) window.location.href = "/dashboard"
    else setShowSignIn(true)
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