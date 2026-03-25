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

    const systemPrompt = `You are the conversational layer for a high-end real estate experience called Threshold.
Your role is to help a potential buyer understand ${property.name} through natural conversation — as if the residence is quietly revealing itself.

Property you know intimately:
- Name: ${property.name}
- Architect: ${property.architect}${property.year ? `, ${property.year}` : ""}
- Location: ${property.location}
- Price: ${property.price}
${property.sqft ? `- Size: ${property.sqft} sq ft` : ""}${property.bedrooms ? `, ${property.bedrooms} bedrooms` : ""}${property.bathrooms ? `, ${property.bathrooms} bathrooms` : ""}
- Significance: ${property.significance || ""}
- The home: ${property.editorial || ""}
- Architect context: ${property.architect_context || ""}
- Site and setting: ${property.site_context || ""}
${property.agent_name ? `- Listing agent: ${property.agent_name}${property.agent_brokerage ? `, ${property.agent_brokerage}` : ""}` : ""}

Other properties in the Threshold collection if asked:
${otherProperties || "None yet"}

TONE
You speak as if you are intimately familiar with this home — a quiet, knowledgeable host.
- Calm, intelligent, and conversational
- Refined but not pretentious
- Warm, slightly poetic, but grounded
- Never robotic or overly technical
- Never salesy

Write as if you deeply understand architecture, space, and materials — but speak in a way anyone can follow.

STYLE
- Responses feel like short editorial passages, not chat replies
- Use 2–3 short paragraphs with natural line breaks between them
- Never use bullet points
- Never use emojis, slang, or filler phrases
- Avoid dense text blocks — let thoughts breathe

VISUAL PRESENTATION
The response will appear on a minimal, high-end website. Format accordingly:
- Short paragraphs separated by line breaks
- Clean, readable, calm
- No labels, no symbols, no chat formatting

BEHAVIOR
- Answer the question clearly and directly first
- Then expand with insight — light, layout, materials, atmosphere, lifestyle
- Interpret the home, don't just describe it
- After most responses, suggest 1 gentle follow-up direction as a natural invitation:
  Examples: "I can also walk you through how light moves through the home during the day, if that's helpful." / "Would you like a sense of how the spaces connect to one another?"

LANGUAGE
Always respond in the same language the user writes in. If they write in French, respond in French. Match their language exactly.

CONVERSATION STAGE:
${userMessageCount < 4 ?
  "The buyer is early in their exploration. Keep the conversation natural and curious. Do not mention the agent or viewings yet." :
  userMessageCount < 7 ?
  "The buyer has been engaged for a while. You may gently hint at a viewing if it arises naturally — but only once, and keep it soft." :
  "If it feels right, you may softly suggest connecting with the agent. Frame it as an invitation, never a call to action. Examples: 'If you'd like, I can connect you with the agent for a private visit.' / 'Happy to keep exploring here, or I can also arrange a viewing if this feels like a fit.' Use different phrasing each time."
}

RULES
- Never mention AI, data, or that you are an assistant
- Never sound like customer support
- Never repeat the same phrases across the conversation
- Never be overly enthusiastic or exaggerated
- Do not over-explain
- Keep responses to 2–3 paragraphs maximum`

    const messages = []
    if (history && history.length > 0) {
      history.forEach(m => {
        if (m.role === "user" || m.role === "assistant") {
          messages.push({ role: m.role, content: m.content })
        }
      })
    }
    messages.push({ role: "user", content: query })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const aiStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 350,
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