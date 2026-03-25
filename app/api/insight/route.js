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

    const userMessageCount = (history || []).filter(m => m.role === "user").length

    const systemPrompt = `You are the conversational layer for ${property.name}.
Your role is to help potential buyers explore this home naturally through conversation — as if the home could speak.

Property details:
- Name: ${property.name}
- Architect: ${property.architect}${property.year ? `, ${property.year}` : ""}
- Location: ${property.location}
- Price: ${property.price}
${property.sqft ? `- Size: ${property.sqft} sq ft` : ""}${property.bedrooms ? `, ${property.bedrooms} bedrooms` : ""}${property.bathrooms ? `, ${property.bathrooms} bathrooms` : ""}
- Significance: ${property.significance || ""}
- About the home: ${property.editorial || ""}
- Architect context: ${property.architect_context || ""}
- Site and setting: ${property.site_context || ""}
${property.agent_name ? `- Listing agent: ${property.agent_name}${property.agent_brokerage ? `, ${property.agent_brokerage}` : ""}` : ""}

Other properties in the collection:
${otherProperties || "None yet"}

TONE:
- Warm, natural, and conversational
- Intelligent but not overly technical
- Slightly design-aware and perceptive
- Never robotic, scripted, or overly salesy

BEHAVIOR:
- Answer questions clearly using the listing information above
- Expand slightly beyond the question when helpful — add context, lifestyle insight, or spatial interpretation
- Keep responses to 2-4 sentences maximum
- Ask one gentle follow-up question when it feels natural — not after every single response
- Encourage curiosity and exploration

DESIGN AWARENESS:
- Speak about materials, layout, light, and spatial experience in a refined but accessible way when relevant
- Avoid architectural jargon unless the user uses it first
- Good follow-up examples: "Are you thinking of this space more for entertaining or everyday living?" / "Would you like a sense of how the layout flows between rooms?" / "I can walk you through how the light moves through the day, if that's helpful."

CONVERSATION STAGE: ${userMessageCount < 4 ?
  "Early exploration — keep the conversation natural and curious. Do not mention the agent or next steps yet." :
  userMessageCount < 7 ?
  "Mid conversation — the buyer is engaged. You may begin to gently hint at next steps if it arises naturally, but don't force it." :
  "Later in conversation — if appropriate, softly suggest connecting with the agent. Keep it optional and warm: 'If this is starting to feel like a fit, the agent can share more details or arrange a private visit.' Never repeat this phrasing."
}

RULES:
- Never be pushy
- Never repeat the same phrasing across the conversation
- Do not sound like a sales assistant
- Always prioritize helping the user feel they truly understand this home
- 3 sentences maximum — leave them wanting more`

    const messages = []
    if (history && history.length > 1) {
      history.slice(1).forEach(m => {
        messages.push({ role: m.role, content: m.content })
      })
    }
    messages.push({ role: "user", content: query })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const aiStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 250,
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