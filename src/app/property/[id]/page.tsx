'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

// Sample property data (would come from API)
const PROPERTIES: Record<string, PropertyData> = {
  'laksour-280': {
    id: 'laksour-280',
    name: 'Riad Laksour',
    neighborhood: 'Laksour',
    price: 4500000,
    sqm: 280,
    rooms: 8,
    verified: true,
    verificationLevel: 'gold',
    trustScore: 82,
    headline: 'Premier investment opportunity in the heart of historic Laksour',
    description: 'A magnificent 8-suite riad positioned in the most sought-after quartier of the Marrakech Medina. Original zellige tilework, hand-carved cedar ceilings, and a central courtyard with mature orange trees. 300 meters to Jemaa el-Fna, with excellent derb access for guest arrivals.',
    features: ['8 Suites', '280m²', 'Rooftop Terrace', '300m to Jemaa el-Fna'],
    // Public data
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
    // Forensic data (locked for public)
    forensicData: {
      titleType: 'Titre Foncier',
      heirCount: 1,
      vnaStatus: 'Approved',
      seismicChaining: true,
      pillarTilt: 0.8,
      humidity: 4,
      sharedWalls: 'Stable',
      structuralScore: 85,
      legalScore: 92,
      taxClearance: 'Quitus obtained',
      insuranceStatus: 'Valid until 2026',
    },
  },
  'mouassine-120': {
    id: 'mouassine-120',
    name: 'Dar Mouassine',
    neighborhood: 'Mouassine',
    price: 3200000,
    sqm: 120,
    rooms: 5,
    verified: true,
    verificationLevel: 'silver',
    trustScore: 75,
    headline: 'Turnkey boutique hotel in prestigious Mouassine quarter',
    description: 'An operating Maison d\'Hote with established booking history and existing license. Classic Moroccan architecture with modern amenities. Perfect for investors seeking immediate cash flow without renovation risk.',
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
    forensicData: {
      titleType: 'Melkia',
      heirCount: 3,
      vnaStatus: 'Pending',
      seismicChaining: true,
      pillarTilt: 1.2,
      humidity: 5,
      sharedWalls: 'Stable',
      structuralScore: 78,
      legalScore: 68,
      taxClearance: 'Pending verification',
      insuranceStatus: 'Valid until 2025',
    },
  },
  'kasbah-180': {
    id: 'kasbah-180',
    name: 'Riad Kasbah',
    neighborhood: 'Kasbah',
    price: 4800000,
    sqm: 180,
    rooms: 6,
    verified: true,
    verificationLevel: 'gold',
    trustScore: 91,
    headline: 'Meticulously restored palace with Atlas views',
    description: 'An exceptional property in the historic Kasbah quarter, featuring panoramic Atlas Mountain views from the rooftop terrace. Museum-quality restoration with heated pool, hammam, and private garden. Ideal for ultra-premium hospitality positioning.',
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
    forensicData: {
      titleType: 'Titre Foncier',
      heirCount: 1,
      vnaStatus: 'Approved',
      seismicChaining: true,
      pillarTilt: 0.5,
      humidity: 3,
      sharedWalls: 'Independent',
      structuralScore: 94,
      legalScore: 98,
      taxClearance: 'Quitus obtained',
      insuranceStatus: 'Valid until 2027',
    },
  },
};

interface PropertyData {
  id: string;
  name: string;
  neighborhood: string;
  price: number;
  sqm: number;
  rooms: number;
  verified: boolean;
  verificationLevel: string;
  trustScore: number;
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
  forensicData: {
    titleType: string;
    heirCount: number;
    vnaStatus: string;
    seismicChaining: boolean;
    pillarTilt: number;
    humidity: number;
    sharedWalls: string;
    structuralScore: number;
    legalScore: number;
    taxClearance: string;
    insuranceStatus: string;
  };
}

export default function PropertyPage() {
  const params = useParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');

  const property = PROPERTIES[params.id as string];

  useEffect(() => {
    // Check for forensic access cookie/token
    const forensicToken = document.cookie.split('; ').find(row => row.startsWith('forensic-access='));
    if (forensicToken) {
      setHasAccess(true);
    }
  }, []);

  const handleAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, this would be an API call)
    if (accessCode === 'Melkia 2.02026') {
      document.cookie = 'forensic-access=verified; max-age=86400; path=/';
      setHasAccess(true);
      setShowAccessModal(false);
    } else {
      setAccessError('Invalid access code');
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Property Not Found</h1>
          <Link href="/" className="text-gray-400 hover:text-white">
            Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 max-w-md w-full p-8"
          >
            <h3 className="font-display text-2xl tracking-wide mb-4">Request Full Audit</h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter your access code to view the complete forensic analysis including structural health, legal verification, and tax compliance data.
            </p>
            <form onSubmit={handleAccessRequest}>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access Code"
                className="w-full px-4 py-3 bg-black border border-white/20 text-white mb-4 focus:outline-none focus:border-white/40"
              />
              {accessError && (
                <p className="text-red-400 text-sm mb-4">{accessError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100"
                >
                  Verify Access
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccessModal(false)}
                  className="px-6 py-3 border border-white/20 text-sm tracking-widest hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-600 mt-6">
              Don&apos;t have access? Contact us to schedule a verification walkthrough.
            </p>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-[0.2em]">
            Melkia 2.0
          </Link>
          <Link href="/" className="text-sm tracking-widest text-gray-400 hover:text-white">
            Back to Collection
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <p className="text-xs tracking-[0.3em] text-gray-500">
                {property.neighborhood.toUpperCase()}
              </p>
              {property.verified && (
                <span className={`px-3 py-1 text-[10px] tracking-widest font-medium ${
                  property.verificationLevel === 'gold'
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-300 text-black'
                }`}>
                  {property.verificationLevel === 'gold' ? 'GOLD VERIFIED' : 'VERIFIED'}
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl tracking-wide mb-4">{property.name}</h1>
            <p className="text-xl text-gray-400 max-w-2xl">{property.headline}</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-16">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xs tracking-[0.3em] text-gray-500 mb-4">OVERVIEW</h2>
              <p className="text-gray-300 leading-relaxed">{property.description}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                {property.features.map((f) => (
                  <span key={f} className="px-4 py-2 border border-white/10 text-sm">
                    {f}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Market Context - Public */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xs tracking-[0.3em] text-gray-500 mb-6">MARKET CONTEXT</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 border border-white/10">
                  <p className="text-xs text-gray-500 mb-2">PROJECTED YIELD</p>
                  <p className="font-display text-3xl">{property.publicData.projectedYield}</p>
                </div>
                <div className="p-6 border border-white/10">
                  <p className="text-xs text-gray-500 mb-2">2030 IMPACT</p>
                  <p className="font-display text-3xl text-green-400">{property.publicData.wc2030Impact}</p>
                </div>
                <div className="p-6 border border-white/10">
                  <p className="text-xs text-gray-500 mb-2">DISTANCE TO PLAZA</p>
                  <p className="font-display text-2xl">{property.publicData.distanceToPlaza}</p>
                </div>
                <div className="p-6 border border-white/10">
                  <p className="text-xs text-gray-500 mb-2">PARKING ACCESS</p>
                  <p className="font-display text-2xl">{property.publicData.distanceToParking}</p>
                </div>
              </div>
            </motion.section>

            {/* Property Details - Public */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xs tracking-[0.3em] text-gray-500 mb-6">PROPERTY DETAILS</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Built', value: property.publicData.yearBuilt },
                  { label: 'Last Renovated', value: property.publicData.lastRenovated },
                  { label: 'Floors', value: property.publicData.floors },
                  { label: 'Orientation', value: property.publicData.orientation },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-gray-500">{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Forensic Data - Locked/Blurred */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs tracking-[0.3em] text-gray-500">STRUCTURAL HEALTH</h2>
                {!hasAccess && (
                  <span className="text-xs tracking-widest text-amber-500">RESTRICTED</span>
                )}
              </div>

              <div className={`relative ${!hasAccess ? 'select-none' : ''}`}>
                {!hasAccess && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/20 z-10 flex items-center justify-center">
                    <button
                      onClick={() => setShowAccessModal(true)}
                      className="px-8 py-4 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100"
                    >
                      Request Full Audit
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Seismic Chaining', value: property.forensicData.seismicChaining ? 'Present' : 'Absent' },
                    { label: 'Pillar Tilt', value: `${property.forensicData.pillarTilt}°` },
                    { label: 'Humidity Level', value: `${property.forensicData.humidity}/10` },
                    { label: 'Shared Walls', value: property.forensicData.sharedWalls },
                    { label: 'Structural Score', value: `${property.forensicData.structuralScore}/100` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={!hasAccess ? 'blur-sm' : ''}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Legal Risk - Locked/Blurred */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs tracking-[0.3em] text-gray-500">LEGAL VERIFICATION</h2>
                {!hasAccess && (
                  <span className="text-xs tracking-widest text-amber-500">RESTRICTED</span>
                )}
              </div>

              <div className={`relative ${!hasAccess ? 'select-none' : ''}`}>
                {!hasAccess && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/20 z-10 flex items-center justify-center">
                    <button
                      onClick={() => setShowAccessModal(true)}
                      className="px-8 py-4 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100"
                    >
                      Request Full Audit
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Title Type', value: property.forensicData.titleType },
                    { label: 'Heir Count', value: property.forensicData.heirCount },
                    { label: 'VNA Status', value: property.forensicData.vnaStatus },
                    { label: 'Tax Clearance', value: property.forensicData.taxClearance },
                    { label: 'Insurance', value: property.forensicData.insuranceStatus },
                    { label: 'Legal Score', value: `${property.forensicData.legalScore}/100` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={!hasAccess ? 'blur-sm' : ''}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32"
            >
              <div className="border border-white/10 p-8">
                <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">ASKING PRICE</p>
                <p className="font-display text-4xl mb-1">
                  {(property.price / 1000000).toFixed(1)}M MAD
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {Math.round(property.price / property.sqm).toLocaleString()} MAD/m²
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Surface</span>
                    <span>{property.sqm} m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Suites</span>
                    <span>{property.rooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trust Score</span>
                    <span className={
                      property.trustScore >= 80 ? 'text-green-400' :
                      property.trustScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {property.trustScore}/100
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAccessModal(true)}
                  className="w-full py-4 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100 mb-3"
                >
                  Request Full Audit
                </button>
                <Link
                  href="/assess"
                  className="block w-full py-4 border border-white/20 text-center text-sm tracking-widest hover:bg-white/5"
                >
                  Start Your Own Audit
                </Link>
              </div>

              {/* Verification Status */}
              {property.verified && (
                <div className="mt-6 p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      property.verificationLevel === 'gold' ? 'bg-amber-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm tracking-widest">
                      {property.verificationLevel === 'gold' ? 'GOLD VERIFIED' : 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This property has undergone our forensic verification process including structural assessment, legal title analysis, and PLF 2026 tax compliance review.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-xs text-gray-600 tracking-widest">
            Melkia 2.0 · LAKSOUR REAL ESTATE · MEDINA INVESTMENT
          </p>
        </div>
      </footer>
    </div>
  );
}
