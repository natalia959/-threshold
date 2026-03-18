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
      return Response.json({ interpretation: query, matched: [], alsoLove: [] })
    }

    const systemPrompt = `You are Threshold's search intelligence. Threshold is a curated platform for architecturally significant homes.

Given a search query, return ONLY valid JSON:
{
  "interpretation": "one sentence restating what the buyer is looking for, in Threshold's editorial voice",
  "matched": [{ "id": "property-id", "reason": "one sentence why it matches" }],
  "alsoLove": [{ "id": "property-id", "reason": "one sentence why they might love it" }]
}

Property collection:
${properties.map(p => `- id: "${p.id}" | ${p.name} | ${p.architect}, ${p.year} | ${p.location} | ${p.significance} | Tags: ${(p.idea_tags || []).join(", ")}, ${p.landscape_tag}`).join("\n")}

Rules:
- Never use words like "stunning", "gorgeous", "nestled", "dream home"
- Speak like an architectural critic
- matched: 1-3 items, alsoLove: 2-3 items
- Only use ids from the collection above`

    // Use streaming
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = ""

        const aiStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: query }],
        })

        for await (const chunk of aiStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullText += chunk.delta.text
            // Send incremental interpretation as it streams
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ partial: fullText })}\n\n`))
          }
        }

        // Parse final JSON and hydrate with property data
        try {
          const clean = fullText.replace(/```json|```/g, "").trim()
          const result = JSON.parse(clean)
          const hydrate = (ids) => (ids || []).map(item => ({
            ...item,
            property: properties.find(p => p.id === item.id)
          })).filter(item => item.property)

          const final = {
            interpretation: result.interpretation,
            matched: hydrate(result.matched),
            alsoLove: hydrate(result.alsoLove),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ final })}\n\n`))
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Parse failed" })}\n\n`))
        }

        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    })

  } catch (error) {
    console.error("Search API error:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}