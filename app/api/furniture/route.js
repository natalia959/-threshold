import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { property, searchQuery = "" } = await request.json()

    // Fetch the curated object library
    const { data: library } = await supabaseAdmin
      .from("objects")
      .select("id, name, designer, year, category, tags, image, url, price")
      .order("created_at", { ascending: true })

    // If library is empty, fall back to AI-generated suggestions
    if (!library || library.length === 0) {
      return await generateFallback(property)
    }

    const libraryJson = JSON.stringify(library.map(o => ({
      id: o.id,
      name: o.name,
      designer: o.designer,
      year: o.year,
      category: o.category,
      tags: o.tags,
    })))

    const houseContext = [
      `${property.name} by ${property.architect}`,
      property.year ? `(${property.year})` : "",
      property.location ? `— ${property.location}` : "",
      property.significance ? `\n${property.significance}` : "",
    ].filter(Boolean).join(" ")

    const queryLine = searchQuery
      ? `\nThe visitor searched for: "${searchQuery}" — factor this into the selection.`
      : ""

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: `You are a furniture and objects curator for Threshold, a platform for architecturally significant homes. Given a curated object library and a house, select 4 objects that genuinely belong in that space.

Return ONLY a valid JSON array of up to 10 picks:
[{ "id": "uuid", "reason": "One short sentence, max 8 words, starting with Chosen to / Selected for / Positioned to / Picked for." }]

Rules:
- Only pick from the provided library — use exact IDs
- Pick as many as 10, minimum 4 if library allows
- The reason must be specific to THIS house, never generic
- Mix categories when possible`,
      messages: [{
        role: "user",
        content: `House: ${houseContext}${queryLine}\n\nLibrary:\n${libraryJson}`,
      }]
    })

    const text = response.content[0].text
    const clean = text.replace(/```json|```/g, "").trim()
    const picks = JSON.parse(clean)

    // Merge AI picks with full object data from library
    const suggestions = picks
      .map(pick => {
        const obj = library.find(o => o.id === pick.id)
        if (!obj) return null
        return { ...obj, reason: pick.reason }
      })
      .filter(Boolean)

    return Response.json({ suggestions })
  } catch (error) {
    console.error("Furniture error:", error)
    return Response.json({ suggestions: [] })
  }
}

async function generateFallback(property) {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a furniture curator for Threshold. Given a house, suggest 4 furniture pieces that belong in that space.

Return ONLY valid JSON array:
[{ "name": "Eames Lounge Chair", "designer": "Charles & Ray Eames", "year": "1956", "price": "from $5,500", "reason": "Chosen to face the canyon, not the room.", "url": "", "image": "" }]

Rules:
- Only suggest real, purchasable pieces
- Reason: one sentence, max 8 words, starting with Chosen to / Selected for / Positioned to
- Price should be real approximate retail`,
      messages: [{
        role: "user",
        content: `House: ${property.name} by ${property.architect}, ${property.year}. ${property.significance}`,
      }]
    })
    const text = response.content[0].text
    const clean = text.replace(/```json|```/g, "").trim()
    const suggestions = JSON.parse(clean)
    return Response.json({ suggestions })
  } catch {
    return Response.json({ suggestions: [] })
  }
}
