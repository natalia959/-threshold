import Anthropic from "@anthropic-ai/sdk"
import { PROPERTIES } from "../properties"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query) return Response.json({ error: "Missing query" }, { status: 400 })

    const systemPrompt = `You are Threshold's search intelligence. Threshold is a curated platform for architecturally significant homes. You interpret natural language queries and match them to properties.

Given a search query, you must:
1. Identify the 1-3 best matching properties from the collection
2. For each match, write one sentence (max 20 words) explaining specifically why it matches
3. Also identify 2-3 "you may also love" properties that aren't direct matches but share relevant qualities

Return ONLY valid JSON in this exact format:
{
  "interpretation": "one sentence restating what the buyer is looking for, in Threshold's editorial voice",
  "matched": [
    { "id": "property-id", "reason": "one sentence why it matches" }
  ],
  "alsoLove": [
    { "id": "property-id", "reason": "one sentence why they might love it" }
  ]
}

Property collection:
${PROPERTIES.map(p => `- id: "${p.id}" | ${p.name} | ${p.architect}, ${p.year} | ${p.location} | ${p.significance} | Tags: ${p.tags.idea.join(", ")}, ${p.tags.landscape}`).join("\n")}

Rules:
- Never use words like "stunning", "gorgeous", "nestled", "dream home"
- Speak like an architectural critic, not a real estate agent
- Be specific about materials, architects, spatial qualities
- matched array should have 1-3 items, alsoLove should have 2-3 items
- Only use property ids from the collection above`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    })

    const text = message.content.find(b => b.type === "text")?.text || ""
    const clean = text.replace(/```json|```/g, "").trim()
    const result = JSON.parse(clean)

    // Hydrate with full property data
    const hydrate = (ids) => ids.map(item => ({
      ...item,
      property: PROPERTIES.find(p => p.id === item.id)
    })).filter(item => item.property)

    return Response.json({
      interpretation: result.interpretation,
      matched: hydrate(result.matched),
      alsoLove: hydrate(result.alsoLove),
    })

  } catch (error) {
    console.error("Search API error:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}
