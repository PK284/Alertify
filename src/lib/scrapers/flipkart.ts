import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ScrapeResult } from '../types'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '')
  const match = cleaned.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : null
}

export async function scrapeFlipkart(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 20000,
    })

    const $ = cheerio.load(response.data)

    // Product name
    const productName = (
      $('span.B_NuCI').text().trim() ||
      $('h1._6EBuvT').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Flipkart Product'
    )

    // Price selectors (Flipkart changes these frequently)
    let price: number | null = null

    // Try JSON-LD first
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}')
        const p = data?.offers?.price || data?.offers?.[0]?.price
        if (p && !price) price = parseFloat(p)
      } catch {}
    })

    if (!price) {
      const priceSelectors = [
        '._30jeq3._16Jk6d',  // main price
        '._30jeq3',            // alternate
        '.Cx1uMT ._30jeq3',
        '._25b18 ._30jeq3',
        '[class*="price"]',
      ]
      for (const sel of priceSelectors) {
        const text = $(sel).first().text().trim()
        if (text) {
          const p = parsePrice(text)
          if (p) { price = p; break }
        }
      }
    }

    // Stock check
    const pageText = response.data.toLowerCase()
    const outOfStock = pageText.includes('sold out') || pageText.includes('out of stock') || pageText.includes('currently out of stock')
    const inStock = !outOfStock && !!price

    return { success: true, productName, price, inStock }
  } catch (error: any) {
    console.error('[Flipkart scraper]', error.message)
    return { success: false, error: error.message }
  }
}
