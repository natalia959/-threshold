export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, budget, verification, looking } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Threshold <onboarding@resend.dev>",
        to: "natalia@threshold.estate",
        subject: `New Verified Access Application — ${name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0f0f0f;">
            <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #999; margin-bottom: 8px;">Threshold Verified</div>
            <h1 style="font-size: 28px; font-weight: 400; margin: 0 0 32px;">New Application</h1>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f0ece6;">
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999; width: 40%;">Name</td>
                <td style="padding: 12px 0; font-size: 15px;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0ece6;">
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999;">Email</td>
                <td style="padding: 12px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #0f0f0f;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f0ece6;">
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999;">Phone</td>
                <td style="padding: 12px 0; font-size: 15px;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0ece6;">
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999;">Budget</td>
                <td style="padding: 12px 0; font-size: 15px;">${budget}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0ece6;">
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999;">Verification</td>
                <td style="padding: 12px 0; font-size: 15px;">${verification}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #999; vertical-align: top;">Looking for</td>
                <td style="padding: 12px 0; font-size: 15px; line-height: 1.6;">${looking || "—"}</td>
              </tr>
            </table>

            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f0ece6; font-size: 11px; color: #bbb; letter-spacing: 0.05em;">
              Submitted via threshold.estate
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Resend error:", err)
      return Response.json({ error: "Failed to send email" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Submit error:", error)
    return Response.json({ error: "Submission failed" }, { status: 500 })
  }
}