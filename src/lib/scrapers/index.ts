import type { Site, ScrapeResult } from '../types'
import { scrapeAmul } from './amul'
import { scrapeAmazon } from './amazon'
import { scrapeFlipkart } from './flipkart'
import { scrapeGeneric } from './generic'

export async function scrape(url: string, site: Site): Promise<ScrapeResult> {
  switch (site) {
    case 'amul':
      return scrapeAmul(url)
    case 'amazon':
      return scrapeAmazon(url)
    case 'flipkart':
      return scrapeFlipkart(url)
    case 'myntra':
    case 'meesho':
    case 'other':
    default:
      return scrapeGeneric(url, site)
  }
}
