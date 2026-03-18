import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query) return Response.json({ error: "Missing query" }, { status: 400 })

    const { data: properties } = await supabaseAdmin
      .from("properties")
      .select("id, name, architect, year, location, price, significance, idea_tags, landscape_tag, hero_photo, photos, editorial")
      .eq("published", true)

    if (!properties?.length) {
      return Response.json({ interpretation: "", matched: [], alsoLove: [] })
    }

    const systemPrompt = `You are Threshold's search intelligence. Threshold is a curated platform for architecturally significant homes.

Given a search query, return ONLY valid JSON with no extra text:
{
  "interpretation": "one short complete sentence starting with 'You' — e.g. 'You want a house that dissolves the boundary between inside and outside.'",
  "matched": [{ "id": "property-id", "reason": "one sentence why it matches" }],
  "alsoLove": [{ "id": "property-id", "reason": "one sentence why they might love it" }]
}

Property collection:
${properties.map(p => `- id: "${p.id}" | ${p.name} | ${p.architect}, ${p.year} | ${p.location} | ${p.significance} | Tags: ${(p.idea_tags || []).join(", ")}, ${p.landscape_tag}`).join("\n")}

Rules:
- interpretation MUST start with "You" and be a single complete sentence under 20 words
- Never use words like "stunning", "gorgeous", "nestled", "dream home", "buyer", "seeker"
- Speak like an architectural critic
- matched: 1-3 items, alsoLove: 2-3 items
- Only use ids from the collection above`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    })

    const text = message.content.find(b => b.type === "text")?.text || ""
    const clean = text.replace(/```json|```/g, "").trim()
    const result = JSON.parse(clean)

    const hydrate = (ids) => (ids || []).map(item => ({
      ...item,
      property: properties.find(p => p.id === item.id)
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