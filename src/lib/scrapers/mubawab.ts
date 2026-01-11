// TIFORT - Mubawab Scraper
// Scrapes real estate listings from mubawab.ma

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Listing } from '@/types';

const BASE_URL = 'https://www.mubawab.ma';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ScrapeResult {
  listings: Partial<Listing>[];
  totalFound: number;
  errors: string[];
}

export async function scrapeMubawabListings(
  city: string = 'marrakech',
  propertyType: string = 'riads',
  maxPages: number = 5
): Promise<ScrapeResult> {
  const listings: Partial<Listing>[] = [];
  const errors: string[] = [];

  // Property type mapping
  const typeMap: Record<string, string> = {
    riads: 'riads',
    appartements: 'appartements',
    villas: 'villas',
    maisons: 'maisons',
    terrains: 'terrains',
    bureaux: 'bureaux',
    locaux: 'locaux-commerciaux',
  };

  const urlType = typeMap[propertyType] || propertyType;

  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = `${BASE_URL}/fr/${urlType}--${city}--a-vendre${page > 1 ? `:p:${page}` : ''}`;

      console.log(`[Mubawab] Scraping page ${page}: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Find listing cards
      const listingCards = $('li.listingBox, div.listingBox, article.listing-item');

      if (listingCards.length === 0) {
        console.log(`[Mubawab] No listings found on page ${page}`);
        break;
      }

      listingCards.each((_, element) => {
        try {
          const $el = $(element);

          // Extract data from listing card
          const titleEl = $el.find('h2 a, .listingTit a, .title a').first();
          const title = titleEl.text().trim();
          const listingUrl = titleEl.attr('href');

          const priceText = $el.find('.priceTag, .price, .listingPrice').first().text().trim();
          const price = parsePrice(priceText);

          const locationText = $el.find('.listingLocation, .location, .adress').first().text().trim();
          const neighborhood = extractNeighborhood(locationText);

          const surfaceText = $el.find('.listingDetails li, .details span, .surface').first().text().trim();
          const surface = parseSurface(surfaceText);

          const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

          if (title && price > 0) {
            const listing: Partial<Listing> = {
              id: generateId('mubawab', listingUrl || title),
              source: 'mubawab',
              sourceId: extractSourceId(listingUrl || ''),
              url: listingUrl ? (listingUrl.startsWith('http') ? listingUrl : `${BASE_URL}${listingUrl}`) : '',
              title,
              propertyType: mapPropertyType(propertyType),
              transactionType: 'sale',
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
          errors.push(`Error parsing listing: ${err}`);
        }
      });

      // Rate limiting
      await delay(1500 + Math.random() * 1000);

    } catch (err) {
      errors.push(`Error scraping page ${page}: ${err}`);
      console.error(`[Mubawab] Error on page ${page}:`, err);
    }
  }

  return {
    listings,
    totalFound: listings.length,
    errors,
  };
}

export async function scrapeMubawabDetails(listingUrl: string): Promise<Partial<Listing> | null> {
  try {
    const response = await axios.get(listingUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extract detailed information
    const title = $('h1').first().text().trim();
    const description = $('.blockProp, .description, #description').text().trim();

    const priceText = $('.priceTag, .property-price, .price').first().text().trim();
    const price = parsePrice(priceText);

    // Extract features
    const features: Record<string, string> = {};
    $('.adMainFeature li, .details-item, .feature-item').each((_, el) => {
      const text = $(el).text().trim();
      const [key, value] = text.split(':').map(s => s.trim());
      if (key && value) {
        features[key.toLowerCase()] = value;
      }
    });

    // Extract images
    const images: string[] = [];
    $('.adGallery img, .property-gallery img, .carousel img').each((_, el) => {
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
      surfaceTotal: parseSurface(features['surface'] || features['superficie'] || ''),
      bedrooms: parseInt(features['chambres'] || features['pieces'] || '0'),
      bathrooms: parseInt(features['salles de bain'] || '0'),
      images,
      scrapedAt: new Date(),
      updatedAt: new Date(),
    };

  } catch (err) {
    console.error(`[Mubawab] Error scraping details: ${err}`);
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

function extractNeighborhood(location: string): string {
  // Common Marrakech neighborhoods
  const neighborhoods = [
    'Laksour', 'Riad Zitoun', 'Mouassine', 'Kasbah', 'Mellah',
    'Kennaria', 'Bab Doukkala', 'Gueliz', 'Hivernage', 'Palmeraie',
    'Medina', 'Sidi Ben Slimane', 'Derb Dabachi', 'Arset',
  ];

  for (const n of neighborhoods) {
    if (location.toLowerCase().includes(n.toLowerCase())) {
      return n;
    }
  }

  return location.split(',')[0]?.trim() || 'Unknown';
}

function extractSourceId(url: string): string {
  const match = url.match(/(\d+)\.htm/);
  return match ? match[1] : url;
}

function generateId(source: string, identifier: string): string {
  const hash = identifier.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `${source}_${Math.abs(hash).toString(36)}`;
}

function mapPropertyType(type: string): Listing['propertyType'] {
  const map: Record<string, Listing['propertyType']> = {
    riads: 'riad',
    appartements: 'apartment',
    villas: 'villa',
    maisons: 'dar',
    terrains: 'terrain',
    bureaux: 'commerce',
    locaux: 'commerce',
  };
  return map[type] || 'other';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
