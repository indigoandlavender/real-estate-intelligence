import { NextResponse } from 'next/server';

// Public property data - safe to expose
interface PublicProperty {
  id: string;
  name: string;
  neighborhood: string;
  price: number;
  sqm: number;
  rooms: number;
  verified: boolean;
  verificationLevel: 'gold' | 'silver' | 'none';
  headline: string;
  description: string;
  features: string[];
  publicData: {
    yearBuilt: string;
    lastRenovated: string;
    orientation: string;
    floors: number;
    distanceToPlaza: string;
    distanceToParking: string;
    projectedYield: string;
    wc2030Impact: string;
  };
  // Medina zoning (public portion)
  medinaZoning?: {
    vocationCode: 'MH' | 'H' | 'P' | 'C';
    vocationName: string;
  };
}

// Sample data - in production, this would come from a database
const PUBLIC_PROPERTIES: PublicProperty[] = [
  {
    id: 'laksour-280',
    name: 'Riad Laksour',
    neighborhood: 'Laksour',
    price: 4500000,
    sqm: 280,
    rooms: 8,
    verified: true,
    verificationLevel: 'gold',
    headline: 'Premier investment opportunity in the heart of historic Laksour',
    description: 'A magnificent 8-suite riad positioned in the most sought-after quartier of the Marrakech Medina. Original zellige tilework, hand-carved cedar ceilings, and a central courtyard with mature orange trees.',
    features: ['8 Suites', '280m²', 'Rooftop Terrace', '300m to Jemaa el-Fna'],
    publicData: {
      yearBuilt: '18th Century',
      lastRenovated: '2019',
      orientation: 'South-facing courtyard',
      floors: 3,
      distanceToPlaza: '300m',
      distanceToParking: '150m',
      projectedYield: '8.4%',
      wc2030Impact: '+35% projected',
    },
    medinaZoning: {
      vocationCode: 'MH',
      vocationName: 'Zone Maison d\'Hôte',
    },
  },
  {
    id: 'mouassine-120',
    name: 'Dar Mouassine',
    neighborhood: 'Mouassine',
    price: 3200000,
    sqm: 120,
    rooms: 5,
    verified: true,
    verificationLevel: 'silver',
    headline: 'Turnkey boutique hotel in prestigious Mouassine quarter',
    description: 'An operating Maison d\'Hote with established booking history and existing license. Classic Moroccan architecture with modern amenities.',
    features: ['5 Suites', '120m²', 'Operating License', 'Fountain Courtyard'],
    publicData: {
      yearBuilt: '19th Century',
      lastRenovated: '2021',
      orientation: 'East-facing courtyard',
      floors: 2,
      distanceToPlaza: '450m',
      distanceToParking: '200m',
      projectedYield: '7.8%',
      wc2030Impact: '+30% projected',
    },
    medinaZoning: {
      vocationCode: 'H',
      vocationName: 'Zone Habitat',
    },
  },
  {
    id: 'kasbah-180',
    name: 'Riad Kasbah',
    neighborhood: 'Kasbah',
    price: 4800000,
    sqm: 180,
    rooms: 6,
    verified: true,
    verificationLevel: 'gold',
    headline: 'Meticulously restored palace with Atlas views',
    description: 'An exceptional property in the historic Kasbah quarter, featuring panoramic Atlas Mountain views from the rooftop terrace.',
    features: ['6 Suites', '180m²', 'Private Pool', 'Historic Certification'],
    publicData: {
      yearBuilt: '17th Century',
      lastRenovated: '2022',
      orientation: 'North-facing terrace',
      floors: 3,
      distanceToPlaza: '600m',
      distanceToParking: '100m',
      projectedYield: '9.2%',
      wc2030Impact: '+40% projected',
    },
    medinaZoning: {
      vocationCode: 'MH',
      vocationName: 'Zone Maison d\'Hôte',
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get('neighborhood');
  const id = searchParams.get('id');

  let results = PUBLIC_PROPERTIES;

  if (id) {
    const property = results.find(p => p.id === id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    return NextResponse.json(property);
  }

  if (neighborhood) {
    results = results.filter(p =>
      p.neighborhood.toLowerCase() === neighborhood.toLowerCase()
    );
  }

  return NextResponse.json({
    count: results.length,
    properties: results,
  });
}
