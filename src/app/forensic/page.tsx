'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  calculateLegalScore,
  calculateSHSScore,
  calculateTrustScore,
  flagUnderpricedArbitrage,
  flagAccessCostBuffer,
  flagHeirRisk,
  flagDampnessCritical,
  flagVerticalityCritical,
  flagWC2030Proximity,
  flagTitreConversionOpportunity,
  calculateAlleyLaborBuffer,
  calculateDampnessRenovationBuffer,
  calculateWC2030AppreciationFactor,
  calculateGrossAnnualIncome,
  calculateTotalAcquisitionCost,
  calculateNetOperatingIncome,
  calculateGrossYield,
  calculateNetYield,
  calculatePaybackYears,
} from '@/lib/intelligence';

export default function ForensicPage() {
  const [activeTab, setActiveTab] = useState<'property' | 'legal' | 'structural' | 'financial'>('property');

  // Property State
  const [property, setProperty] = useState({
    title: '',
    neighborhood: 'Laksour',
    propertyType: 'riad' as const,
    condition: 'to_renovate' as const,
    surfaceTotalSqm: 0,
    price: 0,
    alleyWidthM: 2,
    floors: 2,
    suites: 4,
  });

  // Legal State
  const [legal, setLegal] = useState({
    ownershipType: 'unknown' as 'titre_foncier' | 'melkia' | 'requisition' | 'unknown',
    titreFoncierNumber: '',
    melkiaReference: '',
    heirCount: 1,
    heirNotes: '',
    vnaStatus: false,
    legalChainComplete: false,
    chainGapYears: '',
    hasActiveDispute: false,
    disputeDetails: '',
    hasMortgage: false,
    mortgageAmount: 0,
    hasLiens: false,
  });

  // Structural State
  const [structural, setStructural] = useState({
    wallComposition: 'tabia' as 'tabia' | 'brick' | 'reinforced_concrete' | 'mixed' | 'unknown',
    wallThicknessCm: 40,
    hasSeismicChaining: false,
    chainageScore: 5,
    porteurScore: 5,
    fissureScore: 5,
    dampnessLevel: 5,
    capillaryRiseHeightCm: 0,
    verticalityDegrees: 0,
    foundationDepthCm: 0,
    tassementScore: 5,
    terraceWaterproof: false,
    terraceScore: 5,
    electricalConformity: false,
    electricalScore: 5,
    waterPressureScore: 5,
    plumbingAgeYears: 0,
  });

  // Financial State
  const [financial, setFinancial] = useState({
    targetAdr: 1200,
    targetOccupancyRate: 65,
    renovationEstimatePerSqm: 8000,
    renovationTimelineMonths: 12,
    exitMultiplier: 1.20,
    distanceToInfrastructureM: 1000,
  });

  // Calculate derived values
  const pricePerSqm = property.surfaceTotalSqm > 0 ? property.price / property.surfaceTotalSqm : 0;
  const totalRenovation = property.surfaceTotalSqm * financial.renovationEstimatePerSqm;

  // Calculate scores
  const legalScore = calculateLegalScore({
    ownershipType: legal.ownershipType,
    heirCount: legal.heirCount,
    vnaStatus: legal.vnaStatus,
    legalChainComplete: legal.legalChainComplete,
    hasActiveDispute: legal.hasActiveDispute,
    hasMortgage: legal.hasMortgage,
    hasLiens: legal.hasLiens,
  });

  const shsScore = calculateSHSScore({
    chainageScore: structural.chainageScore,
    porteurScore: structural.porteurScore,
    fissureScore: structural.fissureScore,
    dampnessLevel: structural.dampnessLevel,
    terraceScore: structural.terraceScore,
    verticalityDegrees: structural.verticalityDegrees,
  });

  // Financial calculations
  const grossAnnualIncome = calculateGrossAnnualIncome(
    financial.targetAdr,
    property.suites,
    financial.targetOccupancyRate / 100
  );
  const totalAcquisitionCost = calculateTotalAcquisitionCost(property.price, totalRenovation);
  const netOperatingIncome = calculateNetOperatingIncome(grossAnnualIncome);
  const grossYield = calculateGrossYield(grossAnnualIncome, totalAcquisitionCost);
  const netYield = calculateNetYield(netOperatingIncome, totalAcquisitionCost);
  const paybackYears = calculatePaybackYears(totalAcquisitionCost, netOperatingIncome);

  const trustScore = calculateTrustScore(legalScore, shsScore, netYield);

  // Intelligence flags
  const flags = {
    underpricedArbitrage: flagUnderpricedArbitrage({
      neighborhood: property.neighborhood,
      pricePerSqm,
      ownershipType: legal.ownershipType,
    }),
    accessCostBuffer: flagAccessCostBuffer(property.alleyWidthM),
    heirRisk: flagHeirRisk(legal.heirCount),
    dampnessCritical: flagDampnessCritical(structural.dampnessLevel),
    verticalityCritical: flagVerticalityCritical(structural.verticalityDegrees),
    wc2030Proximity: flagWC2030Proximity(financial.distanceToInfrastructureM),
    titreConversion: flagTitreConversionOpportunity({
      neighborhood: property.neighborhood,
      pricePerSqm,
      ownershipType: legal.ownershipType,
    }),
  };

  // Buffers
  const alleyLaborBuffer = calculateAlleyLaborBuffer(property.alleyWidthM);
  const dampnessRenovationBuffer = calculateDampnessRenovationBuffer(structural.dampnessLevel);
  const wc2030Factor = calculateWC2030AppreciationFactor(financial.distanceToInfrastructureM);

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const neighborhoods = [
    'Laksour', 'Riad Zitoun', 'Mouassine', 'Kasbah', 'Mellah',
    'Kennaria', 'Bab Doukkala', 'Sidi Ben Slimane', 'Derb Dabachi',
    'Gueliz', 'Hivernage', 'Palmeraie'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">TIFORT</h1>
            <p className="text-sm text-gray-400">Forensic Property Intelligence</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/map" className="text-gray-300 hover:text-white">Map</Link>
            <Link href="/forensic" className="text-amber-500">Forensic Entry</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Trust Score Dashboard */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className={`text-5xl font-bold ${getTrustColor(trustScore)}`}>
                {trustScore}
              </div>
              <div className="text-sm text-gray-400 mt-1">TRUST SCORE</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${getTrustColor(legalScore)}`}>
                {legalScore}
              </div>
              <div className="text-sm text-gray-400 mt-1">Legal (40%)</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${getTrustColor(shsScore)}`}>
                {shsScore}
              </div>
              <div className="text-sm text-gray-400 mt-1">SHS (35%)</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${getTrustColor(netYield * 10)}`}>
                {netYield.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">Net Yield (25%)</div>
            </div>
          </div>

          {/* Intelligence Flags */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-2">INTELLIGENCE FLAGS</div>
            <div className="flex flex-wrap gap-2">
              {flags.underpricedArbitrage && (
                <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                  Laksour Arbitrage
                </span>
              )}
              {flags.accessCostBuffer && (
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">
                  +15% Access Buffer
                </span>
              )}
              {flags.heirRisk && (
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">
                  Heir Risk ({legal.heirCount})
                </span>
              )}
              {flags.dampnessCritical && (
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">
                  +20% Dampness Buffer
                </span>
              )}
              {flags.verticalityCritical && (
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">
                  Verticality Critical
                </span>
              )}
              {flags.wc2030Proximity && (
                <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                  WC2030 Zone (+{(wc2030Factor * 100).toFixed(1)}%)
                </span>
              )}
              {flags.titreConversion && (
                <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
                  Titre Conversion Opportunity
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['property', 'legal', 'structural', 'financial'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Property Tab */}
        {activeTab === 'property' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={property.title}
                  onChange={(e) => setProperty({ ...property, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="e.g. Riad Laksour 200m²"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Neighborhood</label>
                <select
                  value={property.neighborhood}
                  onChange={(e) => setProperty({ ...property, neighborhood: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Property Type</label>
                <select
                  value={property.propertyType}
                  onChange={(e) => setProperty({ ...property, propertyType: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="riad">Riad</option>
                  <option value="dar">Dar</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="terrain">Terrain</option>
                  <option value="commerce">Commerce</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Condition</label>
                <select
                  value={property.condition}
                  onChange={(e) => setProperty({ ...property, condition: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="new">New</option>
                  <option value="renovated">Renovated</option>
                  <option value="habitable">Habitable</option>
                  <option value="to_renovate">To Renovate</option>
                  <option value="ruin">Ruin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Surface (m²)</label>
                <input
                  type="number"
                  value={property.surfaceTotalSqm}
                  onChange={(e) => setProperty({ ...property, surfaceTotalSqm: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price (MAD)</label>
                <input
                  type="number"
                  value={property.price}
                  onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alley Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={property.alleyWidthM}
                  onChange={(e) => setProperty({ ...property, alleyWidthM: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
                {alleyLaborBuffer > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    +15% labor buffer applied (narrow alley)
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Floors</label>
                <input
                  type="number"
                  value={property.floors}
                  onChange={(e) => setProperty({ ...property, floors: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Suites (for yield)</label>
                <input
                  type="number"
                  value={property.suites}
                  onChange={(e) => setProperty({ ...property, suites: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Price per m²</div>
                <div className="text-2xl font-bold text-amber-400">
                  {pricePerSqm.toLocaleString()} MAD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Tab */}
        {activeTab === 'legal' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-red-400">Category A: Legal Red-Tape</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ownership Type</label>
                <select
                  value={legal.ownershipType}
                  onChange={(e) => setLegal({ ...legal, ownershipType: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="titre_foncier">Titre Foncier (100%)</option>
                  <option value="requisition">Requisition (70%)</option>
                  <option value="melkia">Melkia (50%)</option>
                  <option value="unknown">Unknown (20%)</option>
                </select>
              </div>

              {legal.ownershipType === 'titre_foncier' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Titre Foncier Number</label>
                  <input
                    type="text"
                    value={legal.titreFoncierNumber}
                    onChange={(e) => setLegal({ ...legal, titreFoncierNumber: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="e.g. 12345/M"
                  />
                </div>
              )}

              {legal.ownershipType === 'melkia' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Melkia Reference</label>
                  <input
                    type="text"
                    value={legal.melkiaReference}
                    onChange={(e) => setLegal({ ...legal, melkiaReference: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Heir Count</label>
                <input
                  type="number"
                  value={legal.heirCount}
                  onChange={(e) => setLegal({ ...legal, heirCount: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
                {flags.heirRisk && (
                  <div className="text-xs text-red-400 mt-1">
                    High heir coordination risk (&gt;5 heirs)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Chain Gap Years</label>
                <input
                  type="text"
                  value={legal.chainGapYears}
                  onChange={(e) => setLegal({ ...legal, chainGapYears: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="e.g. 1987-1992 missing"
                />
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legal.vnaStatus}
                    onChange={(e) => setLegal({ ...legal, vnaStatus: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>VNA Approved</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legal.legalChainComplete}
                    onChange={(e) => setLegal({ ...legal, legalChainComplete: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>Legal Chain Complete</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legal.hasActiveDispute}
                    onChange={(e) => setLegal({ ...legal, hasActiveDispute: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-red-400">Active Dispute</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legal.hasMortgage}
                    onChange={(e) => setLegal({ ...legal, hasMortgage: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>Has Mortgage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legal.hasLiens}
                    onChange={(e) => setLegal({ ...legal, hasLiens: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>Has Liens</span>
                </label>
              </div>

              {legal.hasActiveDispute && (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Dispute Details</label>
                  <textarea
                    value={legal.disputeDetails}
                    onChange={(e) => setLegal({ ...legal, disputeDetails: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    rows={3}
                  />
                </div>
              )}

              <div className="col-span-2 bg-gray-700 rounded p-4 mt-4">
                <div className="text-sm text-gray-400">Legal Score</div>
                <div className={`text-3xl font-bold ${getTrustColor(legalScore)}`}>
                  {legalScore}/100
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structural Tab */}
        {activeTab === 'structural' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Category B: Structural Sore Points</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Wall Composition</label>
                <select
                  value={structural.wallComposition}
                  onChange={(e) => setStructural({ ...structural, wallComposition: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="tabia">Tabia (Traditional Adobe)</option>
                  <option value="brick">Brick</option>
                  <option value="reinforced_concrete">Reinforced Concrete</option>
                  <option value="mixed">Mixed</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Wall Thickness (cm)</label>
                <input
                  type="number"
                  value={structural.wallThicknessCm}
                  onChange={(e) => setStructural({ ...structural, wallThicknessCm: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={structural.hasSeismicChaining}
                    onChange={(e) => setStructural({ ...structural, hasSeismicChaining: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>Has Seismic Chaining (2026 Norms)</span>
                </label>
              </div>

              {/* Score Sliders */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Chainage Score: {structural.chainageScore}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.chainageScore}
                  onChange={(e) => setStructural({ ...structural, chainageScore: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Porteur Score: {structural.porteurScore}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.porteurScore}
                  onChange={(e) => setStructural({ ...structural, porteurScore: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Fissure Score: {structural.fissureScore}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.fissureScore}
                  onChange={(e) => setStructural({ ...structural, fissureScore: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Dampness Level: {structural.dampnessLevel}/10
                  {flags.dampnessCritical && <span className="text-red-400 ml-2">CRITICAL</span>}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.dampnessLevel}
                  onChange={(e) => setStructural({ ...structural, dampnessLevel: Number(e.target.value) })}
                  className="w-full"
                />
                {dampnessRenovationBuffer > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    +20% renovation buffer applied
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Verticality (degrees)</label>
                <input
                  type="number"
                  step="0.1"
                  value={structural.verticalityDegrees}
                  onChange={(e) => setStructural({ ...structural, verticalityDegrees: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
                {flags.verticalityCritical && (
                  <div className="text-xs text-red-400 mt-1">
                    Critical: &gt;2.0 degrees lean
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Terrace Score: {structural.terraceScore}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.terraceScore}
                  onChange={(e) => setStructural({ ...structural, terraceScore: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Electrical Score: {structural.electricalScore}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={structural.electricalScore}
                  onChange={(e) => setStructural({ ...structural, electricalScore: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structural.terraceWaterproof}
                  onChange={(e) => setStructural({ ...structural, terraceWaterproof: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>Terrace Waterproof</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structural.electricalConformity}
                  onChange={(e) => setStructural({ ...structural, electricalConformity: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>Electrical Conformity</span>
              </label>

              <div className="col-span-2 bg-gray-700 rounded p-4 mt-4">
                <div className="text-sm text-gray-400">SHS (Structural Health Score)</div>
                <div className={`text-3xl font-bold ${getTrustColor(shsScore)}`}>
                  {shsScore}/100
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-green-400">Category C: Financial Cold Truth</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target ADR (MAD/night)</label>
                <input
                  type="number"
                  value={financial.targetAdr}
                  onChange={(e) => setFinancial({ ...financial, targetAdr: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Occupancy (%)</label>
                <input
                  type="number"
                  value={financial.targetOccupancyRate}
                  onChange={(e) => setFinancial({ ...financial, targetOccupancyRate: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Renovation (MAD/m²)</label>
                <input
                  type="number"
                  value={financial.renovationEstimatePerSqm}
                  onChange={(e) => setFinancial({ ...financial, renovationEstimatePerSqm: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Renovation Timeline (months)</label>
                <input
                  type="number"
                  value={financial.renovationTimelineMonths}
                  onChange={(e) => setFinancial({ ...financial, renovationTimelineMonths: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Exit Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={financial.exitMultiplier}
                  onChange={(e) => setFinancial({ ...financial, exitMultiplier: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Distance to WC2030 Infrastructure (m)</label>
                <input
                  type="number"
                  value={financial.distanceToInfrastructureM}
                  onChange={(e) => setFinancial({ ...financial, distanceToInfrastructureM: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
                {wc2030Factor > 0 && (
                  <div className="text-xs text-blue-400 mt-1">
                    +{(wc2030Factor * 100).toFixed(1)}% WC2030 appreciation factor
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="col-span-2 mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400">Total Renovation</div>
                  <div className="text-xl font-bold text-white">
                    {totalRenovation.toLocaleString()} MAD
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400">Total Acquisition Cost</div>
                  <div className="text-xl font-bold text-white">
                    {totalAcquisitionCost.toLocaleString()} MAD
                  </div>
                  <div className="text-xs text-gray-500">
                    (incl. 6% notary + 4% registration)
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400">Gross Annual Income</div>
                  <div className="text-xl font-bold text-white">
                    {grossAnnualIncome.toLocaleString()} MAD
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-4">
                  <div className="text-sm text-gray-400">Net Operating Income</div>
                  <div className="text-xl font-bold text-white">
                    {netOperatingIncome.toLocaleString()} MAD
                  </div>
                  <div className="text-xs text-gray-500">
                    (after 35% OpEx)
                  </div>
                </div>

                <div className="bg-green-900 rounded p-4">
                  <div className="text-sm text-green-300">Gross Yield</div>
                  <div className="text-xl font-bold text-green-400">
                    {grossYield.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-green-900 rounded p-4">
                  <div className="text-sm text-green-300">Net Yield</div>
                  <div className="text-xl font-bold text-green-400">
                    {netYield.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-4 col-span-3">
                  <div className="text-sm text-gray-400">Payback Period</div>
                  <div className="text-2xl font-bold text-amber-400">
                    {paybackYears.toFixed(1)} years
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
            Save as Draft
          </button>
          <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-medium">
            Save to Database
          </button>
        </div>
      </div>
    </div>
  );
}
