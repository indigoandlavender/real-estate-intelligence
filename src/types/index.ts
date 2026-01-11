// TIFORT Data Types

export interface Listing {
  id: string;
  source: 'mubawab' | 'avito' | 'manual' | 'field_audit';
  sourceId: string;
  url: string;

  // Property details
  title: string;
  description: string;
  propertyType: 'riad' | 'dar' | 'apartment' | 'villa' | 'terrain' | 'commerce' | 'other';
  transactionType: 'sale' | 'rent';

  // Location
  city: string;
  neighborhood: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  // Pricing
  price: number;
  currency: 'MAD' | 'EUR' | 'USD';
  pricePerSqm?: number;

  // Size
  surfaceTotal?: number;
  surfaceHabitable?: number;
  surfaceTerrain?: number;

  // Features
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  hasPool?: boolean;
  hasGarage?: boolean;
  hasTerrace?: boolean;

  // Status
  legalStatus?: 'titre_foncier' | 'melkia' | 'unknown';
  condition?: 'new' | 'renovated' | 'to_renovate' | 'ruin';

  // Media
  images: string[];

  // Metadata
  postedAt?: Date;
  scrapedAt: Date;
  updatedAt: Date;
  isActive: boolean;

  // TIFORT specific
  shsScore?: number; // From field audit
  auditId?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  nameAr?: string;
  city: string;

  // Geographic
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  centerLat: number;
  centerLng: number;

  // Statistics (calculated)
  avgPricePerSqm: number;
  medianPrice: number;
  listingCount: number;
  avgDaysOnMarket: number;

  // Classification
  tier: 'premium' | 'mid' | 'budget' | 'emerging';
  investmentScore: number; // 0-100

  updatedAt: Date;
}

export interface MarketStats {
  city: string;
  date: Date;

  // Volume
  totalListings: number;
  newListings: number;
  soldListings: number;

  // Pricing
  avgPrice: number;
  medianPrice: number;
  avgPricePerSqm: number;

  // By type
  byPropertyType: {
    type: string;
    count: number;
    avgPrice: number;
    avgPricePerSqm: number;
  }[];

  // By neighborhood
  byNeighborhood: {
    name: string;
    count: number;
    avgPricePerSqm: number;
  }[];
}

export interface ScrapedData {
  source: string;
  scrapedAt: Date;
  totalFound: number;
  newListings: number;
  updatedListings: number;
  errors: string[];
}

// Marrakech Neighborhoods for mapping
export const MARRAKECH_NEIGHBORHOODS = [
  { name: 'Laksour', lat: 31.6295, lng: -7.9811, tier: 'premium' },
  { name: 'Riad Zitoun', lat: 31.6248, lng: -7.9856, tier: 'premium' },
  { name: 'Mouassine', lat: 31.6312, lng: -7.9892, tier: 'premium' },
  { name: 'Kasbah', lat: 31.6180, lng: -7.9930, tier: 'premium' },
  { name: 'Mellah', lat: 31.6210, lng: -7.9820, tier: 'mid' },
  { name: 'Kennaria', lat: 31.6330, lng: -7.9850, tier: 'mid' },
  { name: 'Bab Doukkala', lat: 31.6350, lng: -7.9950, tier: 'mid' },
  { name: 'Sidi Ben Slimane', lat: 31.6380, lng: -7.9780, tier: 'mid' },
  { name: 'Arset El Maach', lat: 31.6270, lng: -7.9920, tier: 'budget' },
  { name: 'Derb Dabachi', lat: 31.6300, lng: -7.9870, tier: 'mid' },
  { name: 'Gueliz', lat: 31.6380, lng: -8.0100, tier: 'premium' },
  { name: 'Hivernage', lat: 31.6220, lng: -8.0150, tier: 'premium' },
  { name: 'Palmeraie', lat: 31.6700, lng: -7.9600, tier: 'premium' },
] as const;
