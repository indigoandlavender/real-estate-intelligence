'use client';

import { useState } from 'react';
import Link from 'next/link';

type PropertyType = 'all' | 'unrenovated' | 'renovated' | 'land';

interface Property {
  id: number;
  name: string;
  neighborhood: string;
  type: 'unrenovated' | 'renovated' | 'land';
  price: number;
  sqm: number;
  rooms?: number;
  titleType: 'titre' | 'melkia' | 'requisition';
  trustScore?: number;
  notes: string;
}

const PROPERTIES: Property[] = [
  {
    id: 1,
    name: 'Riad Laksour',
    neighborhood: 'Laksour',
    type: 'unrenovated',
    price: 4500000,
    sqm: 280,
    rooms: 8,
    titleType: 'melkia',
    trustScore: 62,
    notes: 'Strong bones. 3 heirs. Narrow derb access.',
  },
  {
    id: 2,
    name: 'Dar Mouassine',
    neighborhood: 'Mouassine',
    type: 'renovated',
    price: 3200000,
    sqm: 120,
    rooms: 5,
    titleType: 'titre',
    trustScore: 85,
    notes: 'Turnkey. Operating as Maison d\'Hote.',
  },
  {
    id: 3,
    name: 'Terrain Kennaria',
    neighborhood: 'Kennaria',
    type: 'land',
    price: 1800000,
    sqm: 150,
    titleType: 'titre',
    notes: 'VNA Definitive. Approved for 3-floor construction.',
  },
  {
    id: 4,
    name: 'Riad Zitoun',
    neighborhood: 'Riad Zitoun',
    type: 'unrenovated',
    price: 3600000,
    sqm: 200,
    rooms: 6,
    titleType: 'requisition',
    trustScore: 48,
    notes: 'Requisition in progress. Humidity issues.',
  },
  {
    id: 5,
    name: 'Fondouk Mellah',
    neighborhood: 'Mellah',
    type: 'unrenovated',
    price: 2200000,
    sqm: 350,
    rooms: 12,
    titleType: 'melkia',
    trustScore: 35,
    notes: 'Complex ownership. 8 heirs. High potential.',
  },
  {
    id: 6,
    name: 'Dar Kasbah',
    neighborhood: 'Kasbah',
    type: 'renovated',
    price: 4800000,
    sqm: 180,
    rooms: 6,
    titleType: 'titre',
    trustScore: 91,
    notes: 'Premium finish. Pool. Terrace views.',
  },
  {
    id: 7,
    name: 'Terrain Sidi Ben Slimane',
    neighborhood: 'Sidi Ben Slimane',
    type: 'land',
    price: 950000,
    sqm: 120,
    titleType: 'melkia',
    notes: 'Emerging area. VNA Provisoire only.',
  },
  {
    id: 8,
    name: 'Riad Bab Doukkala',
    neighborhood: 'Bab Doukkala',
    type: 'unrenovated',
    price: 1800000,
    sqm: 220,
    rooms: 7,
    titleType: 'titre',
    trustScore: 72,
    notes: 'Good structure. Wide alley access.',
  },
];

export default function ListingsPage() {
  const [filter, setFilter] = useState<PropertyType>('all');
  const [sortBy, setSortBy] = useState<'price' | 'sqm' | 'score'>('price');

  const filteredProperties = PROPERTIES
    .filter((p) => filter === 'all' || p.type === filter)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'sqm') return b.sqm - a.sqm;
      if (sortBy === 'score') return (b.trustScore || 0) - (a.trustScore || 0);
      return 0;
    });

  const unrenovatedCount = PROPERTIES.filter((p) => p.type === 'unrenovated').length;
  const renovatedCount = PROPERTIES.filter((p) => p.type === 'renovated').length;
  const landCount = PROPERTIES.filter((p) => p.type === 'land').length;

  const getTitleLabel = (type: Property['titleType']) => {
    switch (type) {
      case 'titre': return 'Titre';
      case 'melkia': return 'Melkia';
      case 'requisition': return 'Requisition';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assess" className="text-xs uppercase tracking-widest text-gray-400 hover:text-black">
                Back
              </Link>
              <h1 className="font-display text-xl tracking-widest mt-1">Listings</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/map" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Map
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4 border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: PROPERTIES.length },
              { key: 'unrenovated', label: 'Unrenovated', count: unrenovatedCount },
              { key: 'renovated', label: 'Renovated', count: renovatedCount },
              { key: 'land', label: 'Land', count: landCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as PropertyType)}
                className={`pb-3 text-xs uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
                  filter === tab.key
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label} <span className="text-gray-300">({tab.count})</span>
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'sqm' | 'score')}
            className="text-xs uppercase tracking-widest bg-transparent border-0 focus:outline-none text-gray-500 cursor-pointer"
          >
            <option value="price">Price</option>
            <option value="sqm">Size</option>
            <option value="score">Score</option>
          </select>
        </div>

        {/* Listings */}
        <div className="space-y-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="border border-gray-200 p-6 hover:border-gray-400 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg">{property.name}</h3>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                      property.type === 'unrenovated' ? 'bg-gray-100' :
                      property.type === 'renovated' ? 'bg-green-50 text-green-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {property.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{property.neighborhood}</div>

                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">Price</span>
                      <div className="font-medium">{(property.price / 1000000).toFixed(1)}M MAD</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Surface</span>
                      <div className="font-medium">{property.sqm} m²</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Price/m²</span>
                      <div className="font-medium">{Math.round(property.price / property.sqm).toLocaleString()} MAD</div>
                    </div>
                    {property.rooms && (
                      <div>
                        <span className="text-gray-400">Rooms</span>
                        <div className="font-medium">{property.rooms}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Title</span>
                      <div className={`font-medium ${
                        property.titleType === 'titre' ? 'text-green-600' :
                        property.titleType === 'melkia' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {getTitleLabel(property.titleType)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="w-1 bg-gray-200 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{property.notes}</p>
                  </div>
                </div>

                {property.trustScore !== undefined && (
                  <div className="text-right">
                    <div className={`font-display text-3xl ${
                      property.trustScore >= 70 ? 'text-green-600' :
                      property.trustScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {property.trustScore}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400">Trust</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No properties found
          </div>
        )}

        {/* Summary */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-display text-2xl">{unrenovatedCount}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Unrenovated</div>
            </div>
            <div>
              <div className="font-display text-2xl">{renovatedCount}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Renovated</div>
            </div>
            <div>
              <div className="font-display text-2xl">{landCount}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Land</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
