import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

// Delimiter between the properties payload and the Claude stream
const SPLIT = "\n\x1E\n"

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query) return Response.json({ error: "Missing query" }, { status: 400 })

    const { data: properties } = await supabaseAdmin
      .from("properties")
      .select("id, name, architect, year, location, price, significance, idea_tags, landscape_tag, hero_photo, photos, photo_descriptions, editorial")
      .eq("published", true)

    if (!properties?.length) {
      return Response.json({ interpretation: "", matched: [], alsoLove: [] })
    }

    const systemPrompt = `You are Threshold's search intelligence. Threshold is a curated platform for architecturally significant homes.

Given a search query, return ONLY valid JSON with no extra text:
{
  "interpretation": "one short complete sentence starting with 'You' — e.g. 'You want a house that dissolves the boundary between inside and outside.'",
  "matched": [{ "id": "property-id", "reason": "one sentence why it matches", "heroPhotoIndex": 0 }],
  "alsoLove": [{ "id": "property-id", "reason": "one sentence why they might love it" }]
}

Property collection:
${properties.map(p => {
  const photos = (p.photos || []).map((url, i) => {
    const desc = p.photo_descriptions?.[i]
    const filename = url.split("/").pop().split("?")[0]
    return `  [${i}] ${desc || filename}`
  }).join("\n")
  return `- id: "${p.id}" | ${p.name} | ${p.architect}, ${p.year} | ${p.location} | ${p.significance} | Tags: ${(p.idea_tags || []).join(", ")}, ${p.landscape_tag}${photos ? `\n  photos:\n${photos}` : ""}`
}).join("\n")}

Rules:
- interpretation MUST start with "You" and be a single complete sentence under 20 words
- Never use words like "stunning", "gorgeous", "nestled", "dream home", "buyer", "seeker"
- Speak like an architectural critic
- matched: 1-3 items, alsoLove: 2-3 items. Be generous — if a property plausibly matches based on ANY evidence (text or photo descriptions), include it
- Only use ids from the collection above
- Photo descriptions are ground truth: if a photo description mentions "pool", the property has a pool. Use this to match features the user asks for even if they're not in the text description.
- heroPhotoIndex: pick the index of the photo whose description best matches what the user is searching for. Default to 0 if no better match.`

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        // Phase 1 — send properties map immediately (Supabase is already done)
        controller.enqueue(encoder.encode(JSON.stringify(properties) + SPLIT))

        // Phase 2 — stream Claude's JSON as it generates
        const aiStream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: "user", content: query }],
        })

        for await (const chunk of aiStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    })

  } catch (error) {
    console.error("Search API error:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}
