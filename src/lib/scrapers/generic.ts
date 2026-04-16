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

/**
 * Generic scraper — tries JSON-LD, then meta tags, then common CSS selectors.
 * Works for Myntra, Meesho, and any other site.
 */
export async function scrapeGeneric(url: string, site: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 20000,
    })

    const $ = cheerio.load(response.data)

    // Product name
    const productName = (
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      `${site} Product`
    )

    // Try JSON-LD first
    let price: number | null = null
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}')
        const p =
          data?.offers?.price ||
          data?.offers?.[0]?.price ||
          data?.price
        if (p && !price) price = parseFloat(p)
      } catch {}
    })

    // Meta tags
    if (!price) {
      const metaPrice =
        $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content')
      if (metaPrice) price = parseFloat(metaPrice)
    }

    // Common CSS selectors
    if (!price) {
      const commonSelectors = [
        // Myntra
        '.pdp-price strong',
        '.pdp-discount-container .pdp-price',
        // Meesho
        '.sc-eDvSVe', // may change
        // Generic
        '[class*="price"][class*="current"]',
        '[class*="selling-price"]',
        '[class*="offer-price"]',
        '.price',
        '#price',
        '[itemprop="price"]',
      ]
      for (const sel of commonSelectors) {
        const text = $(sel).first().text().trim()
        if (text) {
          const p = parsePrice(text)
          if (p && p > 0) { price = p; break }
        }
      }
    }

    // Stock
    const pageText = response.data.toLowerCase()
    const outOfStock = pageText.includes('sold out') || pageText.includes('out of stock')
    const inStock = !outOfStock

    return { success: true, productName, price, inStock }
  } catch (error: any) {
    console.error(`[${site} scraper]`, error.message)
    return { success: false, error: `Could not fetch page. Site may be blocking requests.` }
  }
}
