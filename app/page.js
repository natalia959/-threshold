"use client"
import { useState } from "react"
import HomePage from "../components/HomePage"
import ResultsPage from "../components/ResultsPage"
import VerifiedModal from "../components/VerifiedModal"

export default function Page() {
  const [page, setPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)

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

  return (
    <>
      {page === "home" ? (
        <HomePage
          onSearch={handleSearch}
          onSignUp={() => setShowModal(true)}
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
          onSignUp={() => setShowModal(true)}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      )}
      {showModal && <VerifiedModal onClose={() => setShowModal(false)} />}
    </>
  )
}
