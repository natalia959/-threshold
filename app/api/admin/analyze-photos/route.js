import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase-admin"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "threshold2024"
const client = new Anthropic()

async function describePhoto(url) {
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 80,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url },
          },
          {
            type: "text",
            text: "Describe what's visible in this architectural property photo in 10-15 words. Be specific about key features present: pool, infinity pool, city view, ocean view, canyon view, garden, terrace, courtyard, living room, bedroom, kitchen, bathroom, exterior, facade, staircase, fireplace, library, dining room, wine cellar, screening room, gym. Only mention what you can clearly see.",
          }
        ],
      }],
    })
    return response.content[0]?.text?.trim() || null
  } catch {
    return null
  }
}

export async function POST(request) {
  const auth = request.headers.get("x-admin-password")
  if (auth !== ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { propertyId } = await request.json().catch(() => ({}))

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"))

      try {
        // Fetch properties
        let query = supabaseAdmin.from("properties").select("id, name, photos")
        if (propertyId) query = query.eq("id", propertyId)
        else query = query.eq("published", true)

        const { data: properties, error } = await query
        if (error) { send({ error: error.message }); controller.close(); return }

        send({ status: "start", total: properties.length })

        for (const property of properties) {
          const photos = property.photos || []
          if (!photos.length) {
            send({ property: property.name, status: "skip", reason: "no photos" })
            continue
          }

          send({ property: property.name, status: "analyzing", count: photos.length })

          const descriptions = []
          for (let i = 0; i < photos.length; i++) {
            const desc = await describePhoto(photos[i])
            descriptions.push(desc)
            send({ property: property.name, photo: i, description: desc })
          }

          const { error: updateError } = await supabaseAdmin
            .from("properties")
            .update({ photo_descriptions: descriptions })
            .eq("id", property.id)

          if (updateError) {
            send({ property: property.name, status: "error", error: updateError.message })
          } else {
            send({ property: property.name, status: "done" })
          }
        }

        send({ status: "complete" })
      } catch (err) {
        send({ error: err.message })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  })
}
