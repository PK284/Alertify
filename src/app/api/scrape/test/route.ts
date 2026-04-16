import { NextResponse } from 'next/server'
import { scrape } from '@/lib/scrapers'
import type { Site } from '@/lib/types'

// POST /api/scrape/test
// Tests a URL scrape without auth (used in the wizard for live preview)
export async function POST(request: Request) {
  const body = await request.json()
  const { url, site } = body

  if (!url || !site) {
    return NextResponse.json({ error: 'url and site are required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const result = await scrape(url, site as Site)
  return NextResponse.json(result)
}
