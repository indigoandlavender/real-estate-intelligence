'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalListings: number;
  avgPrice: number;
  avgPricePerSqm: number;
  medianPrice: number;
  byPropertyType: { type: string; count: number; avgPrice: number; avgPricePerSqm: number }[];
  byNeighborhood: { name: string; count: number; avgPricePerSqm: number }[];
}

interface Summary {
  totalListings: number;
  activeListings: number;
  cities: string[];
  sources: string[];
  propertyTypes: string[];
  lastScraped: string | null;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Get summary
      const summaryRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summary' }),
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.summary);
      }

      // Get stats for Marrakech
      const statsRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats', city: 'Marrakech' }),
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  async function runScrape() {
    setScraping(true);
    setScrapeResult(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'all',
          city: 'marrakech',
          propertyType: 'riads',
          maxPages: 3,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setScrapeResult(`Found ${data.summary.totalFound} listings. Added: ${data.summary.newListings}, Updated: ${data.summary.updatedListings}`);
        loadData();
      } else {
        setScrapeResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setScrapeResult(`Failed: ${err}`);
    }

    setScraping(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">TIFORT</h1>
            <p className="text-sm text-gray-400">Morocco Real Estate Intelligence</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/map" className="text-gray-300 hover:text-white transition">
              Map
            </Link>
            <button
              onClick={runScrape}
              disabled={scraping}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 text-black font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {scraping ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scraping...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Scrape Now
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Scrape Result */}
        {scrapeResult && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
            <p className="text-amber-400">{scrapeResult}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Listings"
            value={summary?.totalListings || 0}
            icon="📊"
          />
          <StatCard
            label="Avg Price/m²"
            value={stats?.avgPricePerSqm ? `${stats.avgPricePerSqm.toLocaleString()} MAD` : '-'}
            icon="💰"
          />
          <StatCard
            label="Median Price"
            value={stats?.medianPrice ? `${(stats.medianPrice / 1000000).toFixed(1)}M MAD` : '-'}
            icon="🏠"
          />
          <StatCard
            label="Data Sources"
            value={summary?.sources?.length || 0}
            icon="🔗"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Neighborhoods Ranking */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Price/m² by Neighborhood</h2>
            {stats?.byNeighborhood && stats.byNeighborhood.length > 0 ? (
              <div className="space-y-3">
                {stats.byNeighborhood.slice(0, 10).map((n, i) => (
                  <div key={n.name} className="flex items-center gap-4">
                    <span className="w-6 text-gray-500 text-sm">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-white">{n.name}</span>
                        <span className="text-amber-500 font-semibold">
                          {n.avgPricePerSqm.toLocaleString()} MAD/m²
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                          style={{
                            width: `${(n.avgPricePerSqm / (stats.byNeighborhood[0]?.avgPricePerSqm || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm w-16 text-right">
                      {n.count} listings
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No data yet. Click &quot;Scrape Now&quot; to collect listings.</p>
            )}
          </div>

          {/* Property Types */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">By Property Type</h2>
            {stats?.byPropertyType && stats.byPropertyType.length > 0 ? (
              <div className="space-y-4">
                {stats.byPropertyType.map(t => (
                  <div key={t.type} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white capitalize font-medium">{t.type}</span>
                      <span className="text-gray-400 text-sm">{t.count} listings</span>
                    </div>
                    <div className="text-amber-500 font-semibold">
                      {t.avgPricePerSqm > 0 ? `${t.avgPricePerSqm.toLocaleString()} MAD/m²` : '-'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Avg: {(t.avgPrice / 1000000).toFixed(2)}M MAD
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No data yet.</p>
            )}
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-8 bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Data Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SourceCard name="Mubawab" status="active" url="mubawab.ma" color="blue" />
            <SourceCard name="Avito" status="active" url="avito.ma" color="red" />
            <SourceCard name="Field Audits" status="active" url="TIFORT-FIELD" color="amber" />
            <SourceCard name="Manual Entry" status="coming" url="Admin Panel" color="gray" />
          </div>
          {summary?.lastScraped && (
            <p className="mt-4 text-gray-400 text-sm">
              Last updated: {new Date(summary.lastScraped).toLocaleString()}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/map"
            className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border border-amber-500/30 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="text-lg font-semibold text-white">Price Map</h3>
            <p className="text-gray-400 text-sm">View price/m² by neighborhood on interactive map</p>
          </Link>
          <Link
            href="/dashboard"
            className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 border border-blue-500/30 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <p className="text-gray-400 text-sm">Deep dive into market trends and opportunities</p>
          </Link>
          <Link
            href="/api/listings?city=Marrakech&stats=true"
            className="bg-gradient-to-br from-green-500/20 to-teal-600/20 hover:from-green-500/30 hover:to-teal-600/30 border border-green-500/30 rounded-2xl p-6 transition"
          >
            <div className="text-3xl mb-2">🔌</div>
            <h3 className="text-lg font-semibold text-white">API Access</h3>
            <p className="text-gray-400 text-sm">Raw JSON data for developers</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>TIFORT - Bridging Morocco&apos;s Real Estate Trust Gap</p>
          <p className="mt-1">Marrakech → Morocco → Tunisia → Beyond</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

function SourceCard({ name, status, url, color }: { name: string; status: 'active' | 'coming'; url: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 border-blue-500/30',
    red: 'bg-red-500/20 border-red-500/30',
    amber: 'bg-amber-500/20 border-amber-500/30',
    gray: 'bg-gray-500/20 border-gray-500/30',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{name}</span>
        <span className={`text-xs px-2 py-1 rounded ${status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {status === 'active' ? 'Active' : 'Coming'}
        </span>
      </div>
      <p className="text-gray-400 text-sm">{url}</p>
    </div>
  );
}
