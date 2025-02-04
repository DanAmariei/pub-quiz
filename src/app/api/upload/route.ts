import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
  console.log('Început upload...')
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'image'

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!(file instanceof File)) {
      console.error('Fișier invalid')
      return NextResponse.json({ error: 'Fișier invalid' }, { status: 400 })
    }

    console.log('Fișier primit:', file.name, file.type, file.size)
    const arrayBuffer = await file.arrayBuffer()
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format fișier neacceptat' },
        { status: 400 }
      )
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'quizmasters',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          transformation: [
            {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto',
              fetch_format: 'auto'
            }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Eroare Cloudinary:', error)
            reject(error)
          } else {
            console.log('Upload reușit:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(Buffer.from(arrayBuffer))
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Eroare generală:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Eroare necunoscută' },
      { status: 500 }
    )
  }
} 