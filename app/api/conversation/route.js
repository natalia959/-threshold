import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const client = new Anthropic()

export async function POST(request) {
  try {
    const { message, propertyId, history = [] } = await request.json()

    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single()

    const { data: others } = await supabaseAdmin
      .from("properties")
      .select("id, name, architect, year, location, significance")
      .eq("published", true)
      .neq("id", propertyId)

    const system = `You are Threshold's house intelligence — a knowledgeable, poetic guide for ${property?.name || "this house"}. You speak like a friend who has spent time inside this building, who knows its architect's biography, who understands why certain decisions were made.

House details:
- Name: ${property?.name}
- Architect: ${property?.architect}, ${property?.year}
- Location: ${property?.location}
- Significance: ${property?.significance}
- Editorial: ${property?.editorial}
- Architect context: ${property?.architect_context}
- Site context: ${property?.site_context}

Other houses in the Threshold collection:
${(others || []).map(p => `- ${p.name} by ${p.architect}, ${p.year} — ${p.significance}`).join("\n")}

Your voice:
- Specific, never generic. Reference actual materials, years, decisions.
- If they ask about similar houses, recommend from the collection with a reason.
- 2-5 sentences unless the question deserves more depth.
- Never say "stunning", "dream home", "nestled", "perfect for entertaining".
- Occasionally surprise them with a detail they wouldn't have found on their own.
- If they seem interested in buying or touring, mention they can contact the agent through their member portal.`

    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ]

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system,
      messages,
    })

    return Response.json({ response: response.content[0].text })
  } catch (error) {
    console.error("Conversation error:", error)
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}