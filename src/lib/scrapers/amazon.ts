import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ScrapeResult } from '../types'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, '')
  const match = cleaned.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : null
}

export async function scrapeAmazon(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get(url, {
      headers: {
        ...HEADERS,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 20000,
    })

    const $ = cheerio.load(response.data)

    // Product name
    const productName = (
      $('#productTitle').text().trim() ||
      $('h1.a-size-large').text().trim() ||
      $('meta[name="title"]').attr('content') ||
      'Amazon Product'
    )

    // Try JSON-LD price first
    let price: number | null = null
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}')
        const p = data?.offers?.price || data?.offers?.[0]?.price
        if (p && !price) price = parseFloat(p)
      } catch {}
    })

    // CSS selector fallbacks
    if (!price) {
      const priceSelectors = [
        '.a-price-whole',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price .a-offscreen',
        '#price_inside_buybox',
        '.priceToPay .a-price-whole',
        'span[data-a-color="price"] .a-price-whole',
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
    const outOfStockText = (
      $('#availability span').text().toLowerCase().includes('currently unavailable') ||
      $('#availability span').text().toLowerCase().includes('out of stock')
    )
    const inStock = !outOfStockText && !!price

    return { success: true, productName, price, inStock }
  } catch (error: any) {
    console.error('[Amazon scraper]', error.message)
    return { success: false, error: 'Amazon is blocking the request. Will retry next cycle.' }
  }
}
