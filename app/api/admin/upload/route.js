export async function POST(request) {
    try {
      const formData = await request.formData()
      const file = formData.get('file')
      
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME
      const apiKey = process.env.CLOUDINARY_API_KEY
      const apiSecret = process.env.CLOUDINARY_API_SECRET
      
      const timestamp = Math.round(Date.now() / 1000)
      const folder = 'threshold/properties'
      
      // Generate signature
      const crypto = await import('crypto')
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex')
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', dataUri)
      uploadFormData.append('api_key', apiKey)
      uploadFormData.append('timestamp', timestamp)
      uploadFormData.append('signature', signature)
      uploadFormData.append('folder', folder)
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      })
      
      const data = await res.json()
      
      if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
      
      return Response.json({ url: data.secure_url, publicId: data.public_id })
    } catch (error) {
      console.error('Upload error:', error)
      return Response.json({ error: 'Upload failed' }, { status: 500 })
    }
  }