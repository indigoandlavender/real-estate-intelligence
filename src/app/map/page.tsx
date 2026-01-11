'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface NeighborhoodData {
  name: string;
  count: number;
  avgPricePerSqm: number;
}

interface Stats {
  byNeighborhood: NeighborhoodData[];
  avgPricePerSqm: number;
}

// Marrakech neighborhood coordinates
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  'Laksour': { lat: 31.6295, lng: -7.9811 },
  'Riad Zitoun': { lat: 31.6248, lng: -7.9856 },
  'Mouassine': { lat: 31.6312, lng: -7.9892 },
  'Kasbah': { lat: 31.6180, lng: -7.9930 },
  'Mellah': { lat: 31.6210, lng: -7.9820 },
  'Kennaria': { lat: 31.6330, lng: -7.9850 },
  'Bab Doukkala': { lat: 31.6350, lng: -7.9950 },
  'Sidi Ben Slimane': { lat: 31.6380, lng: -7.9780 },
  'Arset': { lat: 31.6270, lng: -7.9920 },
  'Derb Dabachi': { lat: 31.6300, lng: -7.9870 },
  'Gueliz': { lat: 31.6380, lng: -8.0100 },
  'Hivernage': { lat: 31.6220, lng: -8.0150 },
  'Palmeraie': { lat: 31.6700, lng: -7.9600 },
  'Medina': { lat: 31.6295, lng: -7.9870 },
  'Unknown': { lat: 31.6295, lng: -7.9870 },
};

export default function MapPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodData | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats', city: 'Marrakech' }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
    setLoading(false);
  }

  function getColor(pricePerSqm: number, maxPrice: number): string {
    const ratio = pricePerSqm / maxPrice;
    if (ratio > 0.8) return '#ef4444'; // red - expensive
    if (ratio > 0.6) return '#f97316'; // orange
    if (ratio > 0.4) return '#f59e0b'; // amber
    if (ratio > 0.2) return '#84cc16'; // lime
    return '#22c55e'; // green - affordable
  }

  function getRadius(count: number, maxCount: number): number {
    const minRadius = 15;
    const maxRadius = 40;
    const ratio = count / maxCount;
    return minRadius + (maxRadius - minRadius) * ratio;
  }

  const maxPrice = stats?.byNeighborhood?.length
    ? Math.max(...stats.byNeighborhood.map(n => n.avgPricePerSqm))
    : 20000;

  const maxCount = stats?.byNeighborhood?.length
    ? Math.max(...stats.byNeighborhood.map(n => n.count))
    : 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-amber-500">TIFORT</Link>
            <p className="text-sm text-gray-400">Price/m² Map - Marrakech</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map */}
        <div className="flex-1 relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={[31.6295, -7.9870]}
              zoom={14}
              className="h-full w-full"
              style={{ background: '#1a1a2e' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              />

              {stats?.byNeighborhood?.map(neighborhood => {
                const coords = NEIGHBORHOOD_COORDS[neighborhood.name] || NEIGHBORHOOD_COORDS['Medina'];

                return (
                  <CircleMarker
                    key={neighborhood.name}
                    center={[coords.lat, coords.lng]}
                    radius={getRadius(neighborhood.count, maxCount)}
                    fillColor={getColor(neighborhood.avgPricePerSqm, maxPrice)}
                    fillOpacity={0.7}
                    color="white"
                    weight={2}
                    eventHandlers={{
                      click: () => setSelectedNeighborhood(neighborhood),
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong className="text-lg">{neighborhood.name}</strong>
                        <p className="text-amber-600 font-bold">
                          {neighborhood.avgPricePerSqm.toLocaleString()} MAD/m²
                        </p>
                        <p className="text-gray-500">{neighborhood.count} listings</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-lg rounded-xl p-4 border border-white/10 z-[1000]">
            <p className="text-white text-sm font-semibold mb-2">Price/m² Legend</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-gray-300">Premium (&gt;16k MAD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-gray-300">High (12-16k MAD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-gray-300">Mid (8-12k MAD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-lime-500" />
                <span className="text-gray-300">Value (4-8k MAD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-gray-300">Budget (&lt;4k MAD)</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3">Circle size = listing volume</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-white/5 border-l border-white/10 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Neighborhoods</h2>

            {loading ? (
              <p className="text-gray-400">Loading data...</p>
            ) : stats?.byNeighborhood && stats.byNeighborhood.length > 0 ? (
              <div className="space-y-3">
                {stats.byNeighborhood.map((n, i) => (
                  <button
                    key={n.name}
                    onClick={() => setSelectedNeighborhood(n)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selectedNeighborhood?.name === n.name
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
                          {i + 1}
                        </span>
                        <span className="text-white font-medium">{n.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{n.count}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColor(n.avgPricePerSqm, maxPrice) }}
                      />
                      <span className="text-amber-500 font-semibold">
                        {n.avgPricePerSqm.toLocaleString()} MAD/m²
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No data available</p>
                <Link
                  href="/"
                  className="text-amber-500 hover:text-amber-400 transition"
                >
                  Go scrape some listings →
                </Link>
              </div>
            )}

            {/* Stats Summary */}
            {stats && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2">Marrakech Average</h3>
                <p className="text-2xl font-bold text-amber-500">
                  {stats.avgPricePerSqm.toLocaleString()} MAD/m²
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Based on {stats.byNeighborhood.reduce((sum, n) => sum + n.count, 0)} listings
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  );
}
