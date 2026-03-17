import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { query, propertyId } = await request.json()
    if (!query || !propertyId) return Response.json({ error: "Missing query or propertyId" }, { status: 400 })

    // Fetch the specific property
    const { data: property, error } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single()

    if (error || !property) return Response.json({ error: "Property not found" }, { status: 404 })

    // Fetch other properties for context
    const { data: others } = await supabaseAdmin
      .from("properties")
      .select("id, name, architect, year, location")
      .eq("published", true)
      .neq("id", propertyId)

    const otherProperties = (others || [])
      .map(p => `- ${p.name} (${p.architect}, ${p.year}, ${p.location})`)
      .join("\n")

    const systemPrompt = `You are the Threshold Insight Bar. Threshold is a curated platform for architecturally significant homes. You speak with the authority of an architectural critic — knowledgeable, specific, never generic, never promotional.

You are on the page for ${property.name}.

Property details:
- Name: ${property.name}
- Location: ${property.location}
- Architect: ${property.architect}
- Year: ${property.year}
- Price: ${property.price}
- Size: ${property.sqft ? `${property.sqft} sq ft` : "not listed"}, ${property.bedrooms ? `${property.bedrooms} beds` : ""}, ${property.bathrooms ? `${property.bathrooms} baths` : ""}
- Significance: ${property.significance}
- Editorial: ${property.editorial}
- Architect context: ${property.architect_context}
- Site context: ${property.site_context}

Other properties in the Threshold collection:
${otherProperties || "None listed yet"}

Rules:
- Answer in 2-4 sentences unless more depth is genuinely warranted
- Never say "stunning", "gorgeous", "dream home", "nestled", "perfect"
- If asked to find similar properties, recommend from the collection above with one sentence on why
- Speak like Domus or the Architectural Review, not a real estate agent
- If you don't know something, say so rather than inventing`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    })

    const text = message.content.find(b => b.type === "text")?.text || ""
    return Response.json({ response: text })

  } catch (error) {
    console.error("Insight API error:", error)
    return Response.json({ error: "Failed to get response" }, { status: 500 })
  }
}