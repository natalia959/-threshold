"use client"
import { useState } from "react"
import HomePage from "../components/HomePage"
import ResultsPage from "../components/ResultsPage"

export default function Page() {
  const [page, setPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)

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
      setSearchResults({
        interpretation: q,
        matched: PROPERTIES.slice(0, 3).map(p => ({ id: p.id, reason: "", property: p })),
        alsoLove: PROPERTIES.slice(3).map(p => ({ id: p.id, reason: "", property: p })),
      })
    }
    setSearching(false)
  }

  return page === "home" ? (
    <HomePage
      onSearch={handleSearch}
      onSignUp={() => {}}
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
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />
  )
}
