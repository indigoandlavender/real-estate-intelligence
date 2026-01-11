// TIFORT - Data Storage
// File-based storage (migrate to Supabase later)

import fs from 'fs';
import path from 'path';
import { Listing, Neighborhood, MarketStats } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'src/data');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ============================================
// LISTINGS
// ============================================

export function getListings(): Listing[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'listings.json');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveListings(listings: Listing[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'listings.json');
  fs.writeFileSync(filePath, JSON.stringify(listings, null, 2));
}

export function addListings(newListings: Partial<Listing>[]): { added: number; updated: number } {
  const existing = getListings();
  const existingMap = new Map(existing.map(l => [l.id, l]));

  let added = 0;
  let updated = 0;

  for (const listing of newListings) {
    if (!listing.id) continue;

    if (existingMap.has(listing.id)) {
      // Update existing
      const current = existingMap.get(listing.id)!;
      existingMap.set(listing.id, {
        ...current,
        ...listing,
        updatedAt: new Date(),
      } as Listing);
      updated++;
    } else {
      // Add new
      existingMap.set(listing.id, listing as Listing);
      added++;
    }
  }

  saveListings(Array.from(existingMap.values()));

  return { added, updated };
}

export function getListingsByCity(city: string): Listing[] {
  return getListings().filter(l =>
    l.city.toLowerCase() === city.toLowerCase()
  );
}

export function getListingsByNeighborhood(neighborhood: string): Listing[] {
  return getListings().filter(l =>
    l.neighborhood.toLowerCase() === neighborhood.toLowerCase()
  );
}

export function getActiveListings(): Listing[] {
  return getListings().filter(l => l.isActive);
}

// ============================================
// MARKET STATISTICS
// ============================================

export function calculateMarketStats(city: string): MarketStats {
  const listings = getListingsByCity(city).filter(l => l.isActive && l.transactionType === 'sale');

  if (listings.length === 0) {
    return {
      city,
      date: new Date(),
      totalListings: 0,
      newListings: 0,
      soldListings: 0,
      avgPrice: 0,
      medianPrice: 0,
      avgPricePerSqm: 0,
      byPropertyType: [],
      byNeighborhood: [],
    };
  }

  // Calculate prices
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  const pricesPerSqm = listings
    .filter(l => l.pricePerSqm && l.pricePerSqm > 0)
    .map(l => l.pricePerSqm!);

  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const medianPrice = prices[Math.floor(prices.length / 2)];
  const avgPricePerSqm = pricesPerSqm.length > 0
    ? Math.round(pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length)
    : 0;

  // By property type
  const typeMap = new Map<string, Listing[]>();
  listings.forEach(l => {
    const type = l.propertyType;
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(l);
  });

  const byPropertyType = Array.from(typeMap.entries()).map(([type, items]) => {
    const typePrices = items.map(l => l.price);
    const typePricesPerSqm = items.filter(l => l.pricePerSqm).map(l => l.pricePerSqm!);
    return {
      type,
      count: items.length,
      avgPrice: Math.round(typePrices.reduce((a, b) => a + b, 0) / typePrices.length),
      avgPricePerSqm: typePricesPerSqm.length > 0
        ? Math.round(typePricesPerSqm.reduce((a, b) => a + b, 0) / typePricesPerSqm.length)
        : 0,
    };
  });

  // By neighborhood
  const neighborhoodMap = new Map<string, Listing[]>();
  listings.forEach(l => {
    const n = l.neighborhood;
    if (!neighborhoodMap.has(n)) neighborhoodMap.set(n, []);
    neighborhoodMap.get(n)!.push(l);
  });

  const byNeighborhood = Array.from(neighborhoodMap.entries())
    .map(([name, items]) => {
      const nPricesPerSqm = items.filter(l => l.pricePerSqm).map(l => l.pricePerSqm!);
      return {
        name,
        count: items.length,
        avgPricePerSqm: nPricesPerSqm.length > 0
          ? Math.round(nPricesPerSqm.reduce((a, b) => a + b, 0) / nPricesPerSqm.length)
          : 0,
      };
    })
    .sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm);

  // Count new listings (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newListings = listings.filter(l =>
    new Date(l.scrapedAt) > oneDayAgo
  ).length;

  return {
    city,
    date: new Date(),
    totalListings: listings.length,
    newListings,
    soldListings: 0, // Would need historical tracking
    avgPrice,
    medianPrice,
    avgPricePerSqm,
    byPropertyType,
    byNeighborhood,
  };
}

// ============================================
// SCRAPE LOG
// ============================================

interface ScrapeLog {
  id: string;
  source: string;
  city: string;
  startedAt: Date;
  completedAt?: Date;
  totalFound: number;
  newListings: number;
  updatedListings: number;
  errors: string[];
  status: 'running' | 'completed' | 'failed';
}

export function getScrapeLog(): ScrapeLog[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'scrape_log.json');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addScrapeLog(log: ScrapeLog): void {
  const logs = getScrapeLog();
  logs.unshift(log); // Add to beginning

  // Keep only last 100 logs
  const trimmed = logs.slice(0, 100);

  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'scrape_log.json');
  fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2));
}

export function updateScrapeLog(id: string, updates: Partial<ScrapeLog>): void {
  const logs = getScrapeLog();
  const index = logs.findIndex(l => l.id === id);

  if (index !== -1) {
    logs[index] = { ...logs[index], ...updates };

    ensureDataDir();
    const filePath = path.join(DATA_DIR, 'scrape_log.json');
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
  }
}
