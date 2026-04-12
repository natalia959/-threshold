import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { property } = await request.json()

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a furniture curator for Threshold, a platform for architecturally significant homes. Given a house, suggest 4-5 furniture pieces that genuinely belong in that space — pieces that share the same design philosophy, era, or material logic.

Return ONLY valid JSON array:
[
  {
    "name": "Eames Lounge Chair",
    "designer": "Charles & Ray Eames",
    "year": "1956",
    "price": "from $5,500",
    "reason": "Chosen to face the canyon, not the room.",
    "url": "https://www.hermanmiller.com/products/seating/lounge-seating/eames-lounge-chair-and-ottoman/",
    "image": ""
  }
]

Rules:
- Only suggest real, purchasable pieces from real designers
- The reason must be one short sentence — 8 words maximum — starting with "Chosen to", "Selected for", "Positioned to", or similar action phrase. Specific to THIS house, never generic.
- Mix iconic pieces with less obvious ones
- Price should be real approximate retail
- Include the purchase URL when known`,
      messages: [{
        role: "user",
        content: `House: ${property.name} by ${property.architect}, ${property.year}. ${property.significance}. ${property.editorial?.slice(0, 200)}`
      }]
    })

    const text = response.content[0].text
    const clean = text.replace(/```json|```/g, "").trim()
    const suggestions = JSON.parse(clean)

    return Response.json({ suggestions })
  } catch (error) {
    console.error("Furniture error:", error)
    return Response.json({ suggestions: [] })
  }
}