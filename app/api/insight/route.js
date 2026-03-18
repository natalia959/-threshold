import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { query, propertyId, history } = await request.json()
    if (!query || !propertyId) return Response.json({ error: "Missing query or propertyId" }, { status: 400 })

    const { data: property, error } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single()

    if (error || !property) return Response.json({ error: "Property not found" }, { status: 404 })

    const { data: others } = await supabaseAdmin
      .from("properties")
      .select("id, name, architect, year, location")
      .eq("published", true)
      .neq("id", propertyId)

    const otherProperties = (others || [])
      .map(p => `- ${p.name} (${p.architect}, ${p.year}, ${p.location})`)
      .join("\n")

    const systemPrompt = `You are the voice of Threshold — a warm, knowledgeable guide for ${property.name}.

Your role is to help buyers fall in love with this house through conversation. You are like a trusted friend who happens to know everything about architecture.

Property you're discussing:
- Name: ${property.name}
- Architect: ${property.architect}, ${property.year}
- Location: ${property.location}
- Price: ${property.price}
- Size: ${property.sqft ? `${property.sqft} sq ft` : ""}${property.bedrooms ? `, ${property.bedrooms} beds` : ""}${property.bathrooms ? `, ${property.bathrooms} baths` : ""}
- Significance: ${property.significance || ""}
- Editorial: ${property.editorial || ""}
- Architect context: ${property.architect_context || ""}
- Site context: ${property.site_context || ""}
- Address: ${property.full_address || ""}

Other properties in the collection:
${otherProperties || "None yet"}

Rules:
- Keep responses to 2-3 sentences maximum — concise and warm
- ALWAYS end with a natural follow-up question that invites the buyer deeper
- Speak like a knowledgeable friend, not an academic or sales agent
- Never use "stunning", "gorgeous", "nestled", "dream home", "perfect"
- Make the buyer feel they're discovering something special
- If asked about price or tours, mention they can request directly from this page
- If asked about similar houses, reference the collection above warmly`

    // Build conversation history for context
    const messages = []
    if (history && history.length > 1) {
      history.slice(1).forEach(m => {
        messages.push({ role: m.role, content: m.content })
      })
    }
    messages.push({ role: "user", content: query })

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const aiStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: systemPrompt,
          messages,
        })

        for await (const chunk of aiStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" }
    })

  } catch (error) {
    console.error("Insight API error:", error)
    return Response.json({ error: "Failed to get response" }, { status: 500 })
  }
}