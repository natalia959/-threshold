import sharp from 'sharp'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ color: '#f0eeeb' })

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('fetch failed')
    const buffer = Buffer.from(await res.arrayBuffer())

    const img = sharp(buffer)
    const { width, height } = await img.metadata()

    // Sample a small patch from each corner, average them all
    const patchW = Math.min(20, width)
    const patchH = Math.min(20, height)

    const corners = [
      { left: 0, top: 0 },
      { left: width - patchW, top: 0 },
      { left: 0, top: height - patchH },
      { left: width - patchW, top: height - patchH },
    ]

    let r = 0, g = 0, b = 0, count = 0
    for (const corner of corners) {
      const { data } = await img
        .clone()
        .extract({ left: corner.left, top: corner.top, width: patchW, height: patchH })
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // flatten transparency to white
        .raw()
        .toBuffer({ resolveWithObject: true })
      for (let i = 0; i < data.length; i += 3) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
      }
    }

    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    return Response.json({ color: `rgb(${r},${g},${b})` }, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    })
  } catch {
    return Response.json({ color: '#f0eeeb' })
  }
}
