import Anthropic from "@anthropic-ai/sdk"
import { PROPERTIES } from "@/lib/properties"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { query, propertyId } = await request.json()

    if (!query || !propertyId) {
      return Response.json({ error: "Missing query or propertyId" }, { status: 400 })
    }

    const property = PROPERTIES.find(p => p.id === propertyId)
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 })
    }

    const otherProperties = PROPERTIES
      .filter(p => p.id !== propertyId)
      .map(p => `- ${p.name} (${p.architect}, ${p.year}, ${p.location})`)
      .join("\n")

    const systemPrompt = `You are the Threshold Insight Bar. Threshold is a curated platform for architecturally significant homes. You speak with the authority and tone of an architectural critic — knowledgeable, specific, never generic, never promotional.

You are currently on the page for ${property.name}.

Property details:
- Name: ${property.name}
- Location: ${property.location}
- Architect: ${property.architect}
- Year: ${property.year}
- Price: $${property.price.toLocaleString()}
- Size: ${property.sqft} sq ft, ${property.beds} beds, ${property.baths} baths
- Agent: ${property.agent.name} at ${property.agent.brokerage}
- Significance: ${property.significance}
- Architect context: ${property.architectContext}
- Site context: ${property.siteContext}

Other properties in the Threshold collection:
${otherProperties}

Answer questions about this property specifically and architecture generally. If asked to find similar properties, recommend from the collection above with a sentence about why. Never use words like "stunning," "gorgeous," "dream home," or "nestled." Never sound like a real estate agent. Speak the way Domus or the Architectural Review would. Keep answers to 2–4 sentences unless more depth is genuinely warranted.`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    })

    const text = message.content.find(b => b.type === "text")?.text || ""
    return Response.json({ response: text })

  } catch (error) {
    console.error("API error:", error)
    return Response.json({ error: "Failed to get response" }, { status: 500 })
  }
}
