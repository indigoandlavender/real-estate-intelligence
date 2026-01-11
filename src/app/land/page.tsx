'use client';

import Link from 'next/link';
import LandDevelopmentCalculator from '@/components/LandDevelopmentCalculator';

export default function LandAssessmentPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assess" className="text-xs uppercase tracking-widest text-gray-400 hover:text-black">
                Back
              </Link>
              <h1 className="font-display text-xl tracking-widest mt-1">Land Development</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/assess" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Riads
              </Link>
              <Link href="/intel" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Intel
              </Link>
              <Link href="/listings" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Listings
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="font-display text-3xl tracking-wide mb-2">Empty Land Alpha Engine</h2>
          <p className="text-gray-500">
            Calculate build potential, zoning coefficients, and TNB carrying costs for development land in Marrakech.
          </p>
        </div>

        {/* Zoning Legend */}
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Zoning Codes Reference</h3>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="p-3 bg-white border border-gray-200">
              <div className="font-mono font-bold text-lg mb-1">SD1</div>
              <div className="text-xs text-gray-500">Villas</div>
              <div className="text-[10px] text-gray-400 mt-1">CES 5% · COS 0.07</div>
            </div>
            <div className="p-3 bg-white border border-gray-200">
              <div className="font-mono font-bold text-lg mb-1">GH2</div>
              <div className="text-xs text-gray-500">Collective Housing</div>
              <div className="text-[10px] text-gray-400 mt-1">CES 40% · COS 1.2</div>
            </div>
            <div className="p-3 bg-white border border-gray-200">
              <div className="font-mono font-bold text-lg mb-1">SA1</div>
              <div className="text-xs text-gray-500">Tourist</div>
              <div className="text-[10px] text-gray-400 mt-1">CES 30% · COS 0.60</div>
            </div>
            <div className="p-3 bg-white border border-gray-200">
              <div className="font-mono font-bold text-lg mb-1">S1</div>
              <div className="text-xs text-gray-500">Services</div>
              <div className="text-[10px] text-gray-400 mt-1">CES 50% · COS 1.5</div>
            </div>
            <div className="p-3 bg-white border border-gray-200">
              <div className="font-mono font-bold text-lg mb-1">D1</div>
              <div className="text-xs text-gray-500">Industrial</div>
              <div className="text-[10px] text-gray-400 mt-1">CES 60% · COS 0.8</div>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <LandDevelopmentCalculator />

        {/* Knowledge Section */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200">
            <h4 className="font-display text-lg mb-3">TNB Reform 2026</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Equipped Zone</span>
                <span className="font-mono">15-30 MAD/m²</span>
              </div>
              <div className="flex justify-between">
                <span>Semi-Equipped</span>
                <span className="font-mono">5-15 MAD/m²</span>
              </div>
              <div className="flex justify-between">
                <span>Low-Equipped</span>
                <span className="font-mono">0.5-2 MAD/m²</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Buy before grid expansion to lock in low TNB rates.
            </p>
          </div>

          <div className="p-6 border border-gray-200">
            <h4 className="font-display text-lg mb-3">Bill 34.21 Deadline</h4>
            <p className="text-sm text-gray-600 mb-3">
              Subdivisions must complete infrastructure within 5 years of approval or face penalties.
            </p>
            <div className="p-3 bg-yellow-50 text-xs text-yellow-800">
              ⚠ Check subdivision approval date before purchasing
            </div>
          </div>

          <div className="p-6 border border-gray-200">
            <h4 className="font-display text-lg mb-3">Well Registry</h4>
            <p className="text-sm text-gray-600 mb-3">
              Rural land without a registered well is worth 40% less. Photograph the authorization plate.
            </p>
            <div className="p-3 bg-blue-50 text-xs text-blue-800">
              📷 Always verify well authorization number
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            PLF 2026 Compliant · Marrakech-Safi Region Zoning
          </p>
        </div>
      </div>
    </div>
  );
}
