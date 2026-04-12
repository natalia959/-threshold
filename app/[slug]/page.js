"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import PropertyPage from "../../components/PropertyPage"

export default function PropertySlugPage({ params }) {
  const [property, setProperty] = useState(null)
  const [allProperties, setAllProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  useEffect(() => {
    Promise.all([
      supabase.from("properties").select("*").eq("id", params.slug).single(),
      supabase.from("properties").select("id, name, location, hero_photo, architect, year, idea_tags, landscape_tag").eq("published", true),
    ]).then(([{ data: prop }, { data: all }]) => {
      setProperty(prop)
      setAllProperties(all || [])
      setLoading(false)
    })
  }, [params.slug])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>—</div>
    </div>
  )

  if (!property) return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,0.25)" }}>Property not found.</div>
    </div>
  )

  return (
    <PropertyPage
      property={property}
      allProperties={allProperties}
      onBack={() => router.back()}
      searchQuery={searchQuery}
    />
  )
}
