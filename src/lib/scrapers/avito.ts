// TIFORT - Avito Scraper
// Scrapes real estate listings from avito.ma

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Listing } from '@/types';

const BASE_URL = 'https://www.avito.ma';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ScrapeResult {
  listings: Partial<Listing>[];
  totalFound: number;
  errors: string[];
}

export async function scrapeAvitoListings(
  city: string = 'marrakech',
  category: string = 'immobilier',
  maxPages: number = 5
): Promise<ScrapeResult> {
  const listings: Partial<Listing>[] = [];
  const errors: string[] = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      // Avito URL structure
      const url = `${BASE_URL}/fr/${city}/${category}${page > 1 ? `?o=${page}` : ''}`;

      console.log(`[Avito] Scraping page ${page}: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Find listing cards - Avito uses various class patterns
      const listingCards = $('[data-testid="listing-card"], .sc-listing-item, .listing-card, a[href*="/vi/"]');

      if (listingCards.length === 0) {
        console.log(`[Avito] No listings found on page ${page}`);
        break;
      }

      listingCards.each((_, element) => {
        try {
          const $el = $(element);

          // Find the link element
          const linkEl = $el.is('a') ? $el : $el.find('a').first();
          const listingUrl = linkEl.attr('href');

          // Extract title
          const title = $el.find('[data-testid="listing-title"], .listing-title, h2, h3').first().text().trim()
            || $el.find('span').first().text().trim();

          // Extract price
          const priceText = $el.find('[data-testid="listing-price"], .listing-price, .price').first().text().trim();
          const price = parsePrice(priceText);

          // Extract location
          const locationText = $el.find('[data-testid="listing-location"], .listing-location, .location').first().text().trim();
          const neighborhood = extractNeighborhood(locationText, city);

          // Extract image
          const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

          // Extract surface if available
          const detailsText = $el.find('.listing-details, .details').text();
          const surface = parseSurface(detailsText);

          if (title && price > 0 && listingUrl) {
            const listing: Partial<Listing> = {
              id: generateId('avito', listingUrl),
              source: 'avito',
              sourceId: extractSourceId(listingUrl),
              url: listingUrl.startsWith('http') ? listingUrl : `${BASE_URL}${listingUrl}`,
              title,
              propertyType: detectPropertyType(title),
              transactionType: detectTransactionType(title, priceText),
              city: capitalizeFirst(city),
              neighborhood,
              price,
              currency: 'MAD',
              surfaceTotal: surface,
              pricePerSqm: surface > 0 ? Math.round(price / surface) : undefined,
              images: imageUrl ? [imageUrl] : [],
              scrapedAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
            };

            listings.push(listing);
          }
        } catch (err) {
          errors.push(`Error parsing Avito listing: ${err}`);
        }
      });

      // Rate limiting - be respectful
      await delay(2000 + Math.random() * 1500);

    } catch (err) {
      errors.push(`Error scraping Avito page ${page}: ${err}`);
      console.error(`[Avito] Error on page ${page}:`, err);
    }
  }

  return {
    listings,
    totalFound: listings.length,
    errors,
  };
}

export async function scrapeAvitoDetails(listingUrl: string): Promise<Partial<Listing> | null> {
  try {
    const response = await axios.get(listingUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const title = $('h1, [data-testid="ad-title"]').first().text().trim();
    const description = $('[data-testid="ad-description"], .ad-description, #description').text().trim();

    const priceText = $('[data-testid="ad-price"], .ad-price').first().text().trim();
    const price = parsePrice(priceText);

    // Extract property details
    const details: Record<string, string> = {};
    $('[data-testid="ad-params"] li, .ad-params li, .property-details li').each((_, el) => {
      const label = $(el).find('span').first().text().trim().toLowerCase();
      const value = $(el).find('span').last().text().trim();
      if (label && value && label !== value) {
        details[label] = value;
      }
    });

    // Extract images
    const images: string[] = [];
    $('[data-testid="gallery-image"] img, .gallery img, .ad-images img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    return {
      url: listingUrl,
      title,
      description,
      price,
      currency: 'MAD',
      surfaceTotal: parseSurface(details['surface'] || details['superficie'] || ''),
      bedrooms: parseInt(details['chambres'] || details['pièces'] || '0'),
      bathrooms: parseInt(details['salles de bain'] || '0'),
      images,
      scrapedAt: new Date(),
      updatedAt: new Date(),
    };

  } catch (err) {
    console.error(`[Avito] Error scraping details: ${err}`);
    return null;
  }
}

// Utility functions
function parsePrice(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
}

function parseSurface(text: string): number {
  if (!text) return 0;
  const match = text.match(/(\d+)\s*m/i);
  return match ? parseInt(match[1]) : 0;
}

function extractNeighborhood(location: string, city: string): string {
  const neighborhoods = [
    'Laksour', 'Riad Zitoun', 'Mouassine', 'Kasbah', 'Mellah',
    'Kennaria', 'Bab Doukkala', 'Gueliz', 'Hivernage', 'Palmeraie',
    'Medina', 'Sidi Ben Slimane', 'Derb Dabachi', 'Arset',
    'Agdal', 'Semlalia', 'Menara', 'Sidi Youssef Ben Ali',
  ];

  for (const n of neighborhoods) {
    if (location.toLowerCase().includes(n.toLowerCase())) {
      return n;
    }
  }

  // If city is in location, remove it and return what's left
  const withoutCity = location.replace(new RegExp(city, 'gi'), '').trim();
  return withoutCity.split(',')[0]?.trim() || 'Medina';
}

function extractSourceId(url: string): string {
  // Avito URLs often have format /vi/xxxxx.htm
  const match = url.match(/vi\/(\d+)/);
  return match ? match[1] : url.split('/').pop() || url;
}

function generateId(source: string, identifier: string): string {
  const hash = identifier.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `${source}_${Math.abs(hash).toString(36)}`;
}

function detectPropertyType(title: string): Listing['propertyType'] {
  const lower = title.toLowerCase();
  if (lower.includes('riad')) return 'riad';
  if (lower.includes('dar')) return 'dar';
  if (lower.includes('appartement') || lower.includes('appart')) return 'apartment';
  if (lower.includes('villa')) return 'villa';
  if (lower.includes('terrain')) return 'terrain';
  if (lower.includes('local') || lower.includes('commerce') || lower.includes('bureau')) return 'commerce';
  return 'other';
}

function detectTransactionType(title: string, price: string): 'sale' | 'rent' {
  const lower = (title + ' ' + price).toLowerCase();
  if (lower.includes('louer') || lower.includes('location') || lower.includes('/mois') || lower.includes('mensuel')) {
    return 'rent';
  }
  return 'sale';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
