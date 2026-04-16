import axios from 'axios'
import * as cheerio from 'cheerio'
import type { ScrapeResult } from '../types'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}

export async function scrapeAmul(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
    })

    const $ = cheerio.load(response.data)
    
    // Extract product name
    let productName = $('h1.product-title, h1.product_title, h1').first().text().trim()
    if (!productName) {
      productName = $('meta[property="og:title"]').attr('content') || 'Amul Product'
    }

    // Check stock status
    // Look for "Add to Cart" button vs "Out of Stock" / "Notify Me"
    const pageText = response.data.toLowerCase()
    
    const addToCartPresent = (
      $('button:contains("Add to Cart"), button:contains("Add To Cart"), button:contains("BUY NOW"), input[value*="Add to Cart"]').length > 0 ||
      pageText.includes('add to cart') ||
      pageText.includes('add_to_cart')
    )

    const outOfStockPresent = (
      $('button:contains("Out of Stock"), button:contains("Notify Me"), .out-of-stock, .outofstock').length > 0 ||
      pageText.includes('out of stock') ||
      pageText.includes('sold out') ||
      pageText.includes('notify me') ||
      pageText.includes('currently unavailable')
    )

    // Determine stock status
    let inStock: boolean
    if (addToCartPresent && !outOfStockPresent) {
      inStock = true
    } else if (outOfStockPresent) {
      inStock = false
    } else {
      // Default: if can't determine, assume out of stock (safer)
      inStock = false
    }

    // Try to extract price
    let price: number | null = null
    const priceSelectors = [
      '.price, .product-price, .current-price, [data-product-price]',
      'span.price, p.price',
      '.woocommerce-Price-amount',
    ]
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim()
      if (priceText) {
        const match = priceText.match(/[\d,]+\.?\d*/)
        if (match) {
          price = parseFloat(match[0].replace(',', ''))
          break
        }
      }
    }

    // Try JSON-LD
    if (!price) {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).html() || '{}')
          const offerPrice = data?.offers?.price || data?.price
          if (offerPrice) price = parseFloat(offerPrice)
        } catch {}
      })
    }

    return { success: true, productName, inStock, price }
  } catch (error: any) {
    console.error('[Amul scraper]', error.message)
    return { success: false, error: error.message }
  }
}
