import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images')
    const entries = await fs.readdir(dir)
    const images = entries.filter((entry) =>
      allowedExtensions.has(path.extname(entry).toLowerCase())
    )
    return NextResponse.json(images)
  } catch {
    return NextResponse.json(
      { error: 'Не удалось прочитать каталог изображений' },
      { status: 500 }
    )
  }
}
