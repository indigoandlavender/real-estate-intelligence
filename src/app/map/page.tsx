'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW5kaWdvYW5kbGF2ZW5kZXIiLCJhIjoiY21kN3B0OTZvMGllNjJpcXY0MnZlZHVlciJ9.1-jV-Pze3d7HZseOAhmkCg';

// Marrakech neighborhoods with heat scores
const NEIGHBORHOODS = [
  { name: 'Laksour', lat: 31.6295, lng: -7.9811, heat: 'hot', pricePerSqm: 22000, properties: 12 },
  { name: 'Mouassine', lat: 31.6312, lng: -7.9892, heat: 'hot', pricePerSqm: 20000, properties: 8 },
  { name: 'Riad Zitoun', lat: 31.6248, lng: -7.9856, heat: 'warm', pricePerSqm: 18000, properties: 15 },
  { name: 'Kasbah', lat: 31.6180, lng: -7.9930, heat: 'warm', pricePerSqm: 16000, properties: 6 },
  { name: 'Kennaria', lat: 31.6330, lng: -7.9850, heat: 'emerging', pricePerSqm: 14000, properties: 9 },
  { name: 'Sidi Ben Slimane', lat: 31.6380, lng: -7.9780, heat: 'emerging', pricePerSqm: 12000, properties: 5 },
  { name: 'Mellah', lat: 31.6210, lng: -7.9820, heat: 'caution', pricePerSqm: 10000, properties: 4 },
  { name: 'Bab Doukkala', lat: 31.6350, lng: -7.9950, heat: 'cold', pricePerSqm: 8000, properties: 3 },
];

// Sample properties for the map
const PROPERTIES = [
  { id: 1, name: 'Riad Laksour 280m²', lat: 31.6290, lng: -7.9815, type: 'unrenovated', price: 4500000, sqm: 280 },
  { id: 2, name: 'Dar Mouassine 120m²', lat: 31.6318, lng: -7.9888, type: 'renovated', price: 3200000, sqm: 120 },
  { id: 3, name: 'Terrain Kennaria', lat: 31.6335, lng: -7.9845, type: 'land', price: 1800000, sqm: 150 },
  { id: 4, name: 'Riad Zitoun 200m²', lat: 31.6252, lng: -7.9860, type: 'unrenovated', price: 3600000, sqm: 200 },
  { id: 5, name: 'Fondouk Mellah', lat: 31.6215, lng: -7.9825, type: 'unrenovated', price: 2200000, sqm: 350 },
];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<typeof NEIGHBORHOODS[0] | null>(null);
  const [filter, setFilter] = useState<'all' | 'renovated' | 'unrenovated' | 'land'>('all');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-7.9870, 31.6295],
        zoom: 14,
        pitch: 0,
      });

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add neighborhood heat zones
        NEIGHBORHOODS.forEach((n) => {
          const color = n.heat === 'hot' ? '#dc2626' :
                       n.heat === 'warm' ? '#f97316' :
                       n.heat === 'emerging' ? '#22c55e' :
                       n.heat === 'caution' ? '#eab308' : '#9ca3af';

          // Add circle for neighborhood
          const el = document.createElement('div');
          el.className = 'neighborhood-marker';
          el.style.width = '60px';
          el.style.height = '60px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = color;
          el.style.opacity = '0.3';
          el.style.cursor = 'pointer';
          el.style.border = `2px solid ${color}`;

          el.addEventListener('click', () => setSelectedNeighborhood(n));

          new mapboxgl.default.Marker(el)
            .setLngLat([n.lng, n.lat])
            .addTo(map.current!);
        });

        // Add property markers
        PROPERTIES.forEach((p) => {
          const el = document.createElement('div');
          el.className = 'property-marker';
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = p.type === 'renovated' ? '#22c55e' :
                                     p.type === 'land' ? '#eab308' : '#1a1a1a';
          el.style.border = '2px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

          const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: sans-serif; padding: 4px;">
              <div style="font-weight: 600; font-size: 12px;">${p.name}</div>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">
                ${(p.price / 1000000).toFixed(1)}M MAD · ${Math.round(p.price / p.sqm).toLocaleString()} MAD/m²
              </div>
            </div>
          `);

          new mapboxgl.default.Marker(el)
            .setLngLat([p.lng, p.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  const getHeatLabel = (heat: string) => {
    switch (heat) {
      case 'hot': return 'Premium Zone';
      case 'warm': return 'Strong Demand';
      case 'emerging': return 'Emerging';
      case 'caution': return 'Caution';
      default: return 'Low Activity';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-20 bg-[#faf9f7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assess" className="text-xs uppercase tracking-widest text-gray-400 hover:text-black">
                Back
              </Link>
              <h1 className="font-display text-xl tracking-widest mt-1">Marrakech</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/listings" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                List View
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Map */}
        <div ref={mapContainer} className="flex-1" />

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
              Heat Map Legend
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span>Premium Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Strong Demand</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Emerging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Caution</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Low Activity</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
                Property Types
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-black border-2 border-white" />
                  <span>Unrenovated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  <span>Renovated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white" />
                  <span>Land</span>
                </div>
              </div>
            </div>

            {selectedNeighborhood && (
              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Selected Zone
                </div>
                <h3 className="font-display text-lg">{selectedNeighborhood.name}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span>{getHeatLabel(selectedNeighborhood.heat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Price/m²</span>
                    <span>{selectedNeighborhood.pricePerSqm.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Listings</span>
                    <span>{selectedNeighborhood.properties}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">
                Neighborhoods
              </div>
              <div className="space-y-3">
                {NEIGHBORHOODS.sort((a, b) => b.pricePerSqm - a.pricePerSqm).map((n) => (
                  <button
                    key={n.name}
                    onClick={() => setSelectedNeighborhood(n)}
                    className={`w-full text-left p-3 border transition-all ${
                      selectedNeighborhood?.name === n.name
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{n.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        n.heat === 'hot' ? 'bg-red-600' :
                        n.heat === 'warm' ? 'bg-orange-500' :
                        n.heat === 'emerging' ? 'bg-green-500' :
                        n.heat === 'caution' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {n.pricePerSqm.toLocaleString()} MAD/m²
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Mapbox CSS */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet" />
    </div>
  );
}
