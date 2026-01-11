'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TrustGauge from './TrustGauge';
import InvestorPDF from './InvestorPDF';
import ExpertTips from './ExpertTips';

// ============================================
// THE FORENSIC LOGIC TABLE
// "The Woman Who Knows" Algorithm
// Score starts at 100. Every Red Flag subtracts.
// ============================================

interface FormData {
  // LEGAL PILLAR
  titleType: 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
  heirCount: number;
  vnaStatus: boolean;

  // STRUCTURAL PILLAR
  pillarTilt: number;
  humidity: number;
  seismicChaining: boolean;
  sharedWallsLeaning: boolean;

  // MARKET PILLAR
  askingPrice: number;
  renovationEstimate: number;
  surfaceSqm: number;
  neighborhoodAvgPricePerSqm: number;
  alleyWidthM: number;
  distanceToLandmarkM: number;

  // FINANCIAL ENGINE
  roomRate: number;
  suiteCount: number;
  occupancyRate: number;
}

// ============================================
// TRUST SCORE CALCULATION (THE ALGORITHM)
// ============================================

interface ScoreBreakdown {
  total: number;
  legal: { score: number; deductions: string[] };
  structural: { score: number; deductions: string[] };
  market: { score: number; adjustments: string[] };
}

const calculateTrustScore = (data: FormData): ScoreBreakdown => {
  let score = 100;
  const legal = { score: 0, deductions: [] as string[] };
  const structural = { score: 0, deductions: [] as string[] };
  const market = { score: 0, adjustments: [] as string[] };

  // ===== 1. LEGAL PILLAR =====

  // Title Type
  if (data.titleType === 'melkia') {
    score -= 25;
    legal.deductions.push('Melkia (-25): 6-18 months to title, no bank financing');
  } else if (data.titleType === 'requisition') {
    score -= 15;
    legal.deductions.push('Requisition (-15): In process, uncertain timeline');
  } else if (data.titleType === 'unknown') {
    score -= 35;
    legal.deductions.push('Unknown title (-35): Maximum legal risk');
  }

  // Heirs > 5
  if (data.heirCount > 5) {
    score -= 15;
    legal.deductions.push(`${data.heirCount} Heirs (-15): High coordination risk`);
  }

  // VNA Not Obtained
  if (!data.vnaStatus && data.titleType !== 'titre_foncier') {
    score -= 10;
    legal.deductions.push('VNA Pending (-10): Administrative hurdle for foreigners');
  }

  legal.score = Math.max(0, 50 - legal.deductions.length * 15);

  // ===== 2. STRUCTURAL PILLAR =====

  // Seismic Chaining None
  if (!data.seismicChaining) {
    score -= 20;
    structural.deductions.push('No Seismic Chaining (-20): Post-2023 safety liability');
  }

  // Humidity > 7
  if (data.humidity > 7) {
    score -= 15;
    structural.deductions.push('High Humidity (-15): Rising damp in Tabia walls');
  }

  // Pillar Tilt > 2 degrees
  if (data.pillarTilt > 2) {
    score -= 20;
    structural.deductions.push(`Pillar Tilt ${data.pillarTilt}° (-20): Foundation movement detected`);
  }

  // Shared Walls Leaning
  if (data.sharedWallsLeaning) {
    score -= 10;
    structural.deductions.push('Shared Walls Leaning (-10): Neighbor structural risk');
  }

  structural.score = Math.max(0, 50 - structural.deductions.length * 15);

  // ===== 3. MARKET PILLAR =====

  const pricePerSqm = data.surfaceSqm > 0 ? data.askingPrice / data.surfaceSqm : 0;

  // Price/m² < Neighborhood Average = BONUS
  if (pricePerSqm > 0 && data.neighborhoodAvgPricePerSqm > 0 && pricePerSqm < data.neighborhoodAvgPricePerSqm) {
    score += 15;
    market.adjustments.push(`Below market (+15): ${Math.round(pricePerSqm).toLocaleString()} vs ${data.neighborhoodAvgPricePerSqm.toLocaleString()} MAD/m²`);
  }

  // Access: Darb < 1.5m
  if (data.alleyWidthM > 0 && data.alleyWidthM < 1.5) {
    score -= 10;
    market.adjustments.push('Narrow alley (-10): Increased labor costs');
  }

  // Proximity < 300m to Major Landmark = BONUS
  if (data.distanceToLandmarkM > 0 && data.distanceToLandmarkM < 300) {
    score += 10;
    market.adjustments.push('Near landmark (+10): WC2030 appreciation potential');
  }

  market.score = Math.min(100, Math.max(0, 50 + market.adjustments.filter(a => a.includes('+')).length * 10));

  return {
    total: Math.max(0, Math.min(100, score)),
    legal,
    structural,
    market,
  };
};

// ============================================
// FINANCIAL ENGINE (2026 MOROCCO TAX LAW)
// ============================================

interface FinancialMetrics {
  // Acquisition
  purchasePrice: number;
  closingCosts: number;
  renovationBudget: number;
  ffAndE: number;
  totalAcquisitionCost: number;

  // Revenue
  grossAnnualRevenue: number;

  // Expenses (OpEx 35%)
  staffing: number;
  utilities: number;
  marketing: number;
  management: number;
  totalOpEx: number;

  // Net
  netOperatingIncome: number;
  taxOnProfit: number;
  netAfterTax: number;

  // Yields
  grossYield: number;
  netYield: number;
  investmentGrade: 'institutional' | 'moderate' | 'lifestyle';

  // Arbitrage (Melkia to Titre)
  potentialTitledValue: number;
  foundValue: number;
}

const calculateFinancials = (data: FormData): FinancialMetrics => {
  // ===== TOTAL ACQUISITION COST =====
  const purchasePrice = data.askingPrice;
  const closingCosts = purchasePrice * 0.07; // 7%: Registration 4% + Conservation 1.5% + Notary 1% + stamps
  const renovationBudget = data.renovationEstimate;
  const ffAndE = renovationBudget * 0.12; // 12% of renovation for furnishing
  const totalAcquisitionCost = purchasePrice + closingCosts + renovationBudget + ffAndE;

  // ===== GROSS REVENUE =====
  const occupancy = data.occupancyRate / 100;
  const annualNights = 365 * occupancy;
  const grossAnnualRevenue = data.roomRate * data.suiteCount * annualNights;

  // ===== OPERATING EXPENSES (35% Rule) =====
  const totalOpEx = grossAnnualRevenue * 0.35;
  const staffing = totalOpEx * 0.40; // 40% of OpEx
  const utilities = totalOpEx * 0.15; // 15% of OpEx
  const marketing = totalOpEx * 0.30; // 30% of OpEx (OTA fees)
  const management = totalOpEx * 0.15; // 15% of OpEx

  // ===== NET OPERATING INCOME =====
  const netOperatingIncome = grossAnnualRevenue - totalOpEx;

  // ===== 2026 TAX FILTER =====
  // Corporate rate for Maison d'Hôte: ~15% on net profit
  const taxOnProfit = netOperatingIncome * 0.15;
  const netAfterTax = netOperatingIncome - taxOnProfit;

  // ===== YIELDS =====
  const grossYield = totalAcquisitionCost > 0 ? (grossAnnualRevenue / totalAcquisitionCost) * 100 : 0;
  const netYield = totalAcquisitionCost > 0 ? (netAfterTax / totalAcquisitionCost) * 100 : 0;

  // Investment Grade Classification
  let investmentGrade: 'institutional' | 'moderate' | 'lifestyle' = 'moderate';
  if (netYield >= 8) {
    investmentGrade = 'institutional';
  } else if (netYield < 5) {
    investmentGrade = 'lifestyle';
  }

  // ===== ARBITRAGE CALCULATION =====
  // If Melkia → Titre, property can be valued at 4.5% Cap Rate
  const capRate = 0.045;
  const potentialTitledValue = netOperatingIncome / capRate;
  const foundValue = potentialTitledValue - totalAcquisitionCost;

  return {
    purchasePrice,
    closingCosts,
    renovationBudget,
    ffAndE,
    totalAcquisitionCost,
    grossAnnualRevenue,
    staffing,
    utilities,
    marketing,
    management,
    totalOpEx,
    netOperatingIncome,
    taxOnProfit,
    netAfterTax,
    grossYield,
    netYield,
    investmentGrade,
    potentialTitledValue,
    foundValue,
  };
};

// ============================================
// STEP COMPONENTS
// ============================================

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  breakdown: ScoreBreakdown;
}

function LegalStep({ data, onChange, breakdown }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Legal Pillar</h2>
        <p className="text-gray-500 text-sm mt-1">The Trust Foundation</p>
      </div>

      {/* Title Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Ownership Document
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'titre_foncier', label: 'Titre Foncier', desc: 'Gold Standard', points: '+0' },
            { value: 'melkia', label: 'Melkia', desc: '6-18 months to title', points: '-25' },
            { value: 'requisition', label: 'Requisition', desc: 'In process', points: '-15' },
            { value: 'unknown', label: 'Unknown', desc: 'Maximum risk', points: '-35' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ titleType: option.value as FormData['titleType'] })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.titleType === option.value
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-white">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
              <div className={`text-xs mt-1 font-mono ${
                option.points === '+0' ? 'text-green-400' : 'text-red-400'
              }`}>
                {option.points}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Heir Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Heirs
          {data.heirCount > 5 && (
            <span className="ml-2 text-red-400 text-xs font-mono">-15 pts</span>
          )}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange({ heirCount: Math.max(1, data.heirCount - 1) })}
            className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-transform"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <span className={`text-5xl font-bold ${
              data.heirCount > 5 ? 'text-red-400' : 'text-white'
            }`}>
              {data.heirCount}
            </span>
            <div className="text-gray-500 text-sm">heirs</div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ heirCount: data.heirCount + 1 })}
            className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-transform"
          >
            +
          </button>
        </div>
      </div>

      {/* VNA Status */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          VNA Status
          {!data.vnaStatus && data.titleType !== 'titre_foncier' && (
            <span className="ml-2 text-red-400 text-xs font-mono">-10 pts</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ vnaStatus: true })}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.vnaStatus
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">✓</div>
            <div className="font-medium text-white">Approved</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ vnaStatus: false })}
            className={`p-4 rounded-xl border-2 transition-all ${
              !data.vnaStatus
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">⏳</div>
            <div className="font-medium text-white">Pending</div>
          </button>
        </div>
      </div>

      {/* Deductions Summary */}
      {breakdown.legal.deductions.length > 0 && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl">
          <div className="text-xs text-red-400 font-medium mb-2">LEGAL DEDUCTIONS</div>
          {breakdown.legal.deductions.map((d, i) => (
            <div key={i} className="text-sm text-red-300/80 mt-1">{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function StructuralStep({ data, onChange, breakdown }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Structural Pillar</h2>
        <p className="text-gray-500 text-sm mt-1">The Builder's Truth</p>
      </div>

      {/* Pillar Tilt */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pillar Tilt
          {data.pillarTilt > 2 && (
            <span className="ml-2 text-red-400 text-xs font-mono">-20 pts</span>
          )}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={data.pillarTilt}
          onChange={(e) => onChange({ pillarTilt: parseFloat(e.target.value) })}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0° Plumb</span>
          <span>2° Limit</span>
          <span>5° Critical</span>
        </div>
        <div className={`text-center mt-3 text-4xl font-bold ${
          data.pillarTilt > 2 ? 'text-red-400' : data.pillarTilt > 1 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {data.pillarTilt.toFixed(1)}°
        </div>
      </div>

      {/* Humidity */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Humidity Level
          {data.humidity > 7 && (
            <span className="ml-2 text-red-400 text-xs font-mono">-15 pts</span>
          )}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={data.humidity}
          onChange={(e) => onChange({ humidity: parseInt(e.target.value) })}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0 Dry</span>
          <span>7 Limit</span>
          <span>10 Flooded</span>
        </div>
        <div className={`text-center mt-3 text-4xl font-bold ${
          data.humidity > 7 ? 'text-red-400' : data.humidity > 5 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {data.humidity}/10
        </div>
      </div>

      {/* Seismic Chaining */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Seismic Chaining (2026 Norms)
          {!data.seismicChaining && (
            <span className="ml-2 text-red-400 text-xs font-mono">-20 pts</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ seismicChaining: true })}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.seismicChaining
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">🔗</div>
            <div className="font-medium text-white">Present</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ seismicChaining: false })}
            className={`p-4 rounded-xl border-2 transition-all ${
              !data.seismicChaining
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">⚠️</div>
            <div className="font-medium text-white">Absent</div>
          </button>
        </div>
      </div>

      {/* Shared Walls */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Shared Walls Condition
          {data.sharedWallsLeaning && (
            <span className="ml-2 text-red-400 text-xs font-mono">-10 pts</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ sharedWallsLeaning: false })}
            className={`p-4 rounded-xl border-2 transition-all ${
              !data.sharedWallsLeaning
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">✓</div>
            <div className="font-medium text-white">Stable</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ sharedWallsLeaning: true })}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.sharedWallsLeaning
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">↗️</div>
            <div className="font-medium text-white">Leaning</div>
          </button>
        </div>
      </div>

      {/* Deductions Summary */}
      {breakdown.structural.deductions.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-xl">
          <div className="text-xs text-yellow-400 font-medium mb-2">STRUCTURAL DEDUCTIONS</div>
          {breakdown.structural.deductions.map((d, i) => (
            <div key={i} className="text-sm text-yellow-300/80 mt-1">{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketStep({ data, onChange, breakdown }: StepProps) {
  const pricePerSqm = data.surfaceSqm > 0 ? Math.round(data.askingPrice / data.surfaceSqm) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Market Pillar</h2>
        <p className="text-gray-500 text-sm mt-1">The Cold Truth</p>
      </div>

      {/* Surface */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Surface (m²)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.surfaceSqm || ''}
          onChange={(e) => onChange({ surfaceSqm: parseInt(e.target.value) || 0 })}
          placeholder="200"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Asking Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Asking Price (MAD)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.askingPrice || ''}
          onChange={(e) => onChange({ askingPrice: parseInt(e.target.value) || 0 })}
          placeholder="4,500,000"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
        {pricePerSqm > 0 && (
          <div className="mt-2 text-sm font-mono text-amber-400">
            = {pricePerSqm.toLocaleString()} MAD/m²
          </div>
        )}
      </div>

      {/* Neighborhood Average */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Neighborhood Avg Price/m²
          {pricePerSqm > 0 && data.neighborhoodAvgPricePerSqm > 0 && pricePerSqm < data.neighborhoodAvgPricePerSqm && (
            <span className="ml-2 text-green-400 text-xs font-mono">+15 pts</span>
          )}
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={data.neighborhoodAvgPricePerSqm || ''}
          onChange={(e) => onChange({ neighborhoodAvgPricePerSqm: parseInt(e.target.value) || 0 })}
          placeholder="18,000 (Laksour benchmark)"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Renovation Estimate */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Renovation Estimate (MAD)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.renovationEstimate || ''}
          onChange={(e) => onChange({ renovationEstimate: parseInt(e.target.value) || 0 })}
          placeholder="1,600,000"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Alley Width */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Derb/Alley Width (m)
          {data.alleyWidthM > 0 && data.alleyWidthM < 1.5 && (
            <span className="ml-2 text-red-400 text-xs font-mono">-10 pts</span>
          )}
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={data.alleyWidthM || ''}
          onChange={(e) => onChange({ alleyWidthM: parseFloat(e.target.value) || 0 })}
          placeholder="1.5"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Distance to Landmark */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Distance to Major Landmark (m)
          {data.distanceToLandmarkM > 0 && data.distanceToLandmarkM < 300 && (
            <span className="ml-2 text-green-400 text-xs font-mono">+10 pts</span>
          )}
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={data.distanceToLandmarkM || ''}
          onChange={(e) => onChange({ distanceToLandmarkM: parseInt(e.target.value) || 0 })}
          placeholder="250"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Market Adjustments Summary */}
      {breakdown.market.adjustments.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="text-xs text-gray-400 font-medium mb-2">MARKET ADJUSTMENTS</div>
          {breakdown.market.adjustments.map((a, i) => (
            <div key={i} className={`text-sm mt-1 ${
              a.includes('+') ? 'text-green-400' : 'text-red-400'
            }`}>{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinancialStep({ data, onChange, financials }: StepProps & { financials: FinancialMetrics }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Financial Engine</h2>
        <p className="text-gray-500 text-sm mt-1">2026 Morocco Tax Law</p>
      </div>

      {/* Suite Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Number of Suites</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange({ suiteCount: Math.max(1, data.suiteCount - 1) })}
            className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 text-white text-2xl hover:bg-gray-700"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <span className="text-5xl font-bold text-white">{data.suiteCount}</span>
            <div className="text-gray-500 text-sm">suites</div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ suiteCount: data.suiteCount + 1 })}
            className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 text-white text-2xl hover:bg-gray-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Room Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Room Rate (MAD/night)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.roomRate || ''}
          onChange={(e) => onChange({ roomRate: parseInt(e.target.value) || 0 })}
          placeholder="1,200"
          className="w-full px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white text-xl focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Occupancy Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target Occupancy: {data.occupancyRate}%
        </label>
        <input
          type="range"
          min="40"
          max="85"
          step="5"
          value={data.occupancyRate}
          onChange={(e) => onChange({ occupancyRate: parseInt(e.target.value) })}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>40% Conservative</span>
          <span>65% Market</span>
          <span>85% Optimistic</span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-8 space-y-4">
        {/* TAC Breakdown */}
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Total Acquisition Cost</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Purchase Price</span>
              <span className="text-white">{financials.purchasePrice.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Closing Costs (7%)</span>
              <span className="text-white">{Math.round(financials.closingCosts).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Renovation</span>
              <span className="text-white">{financials.renovationBudget.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FF&E (12%)</span>
              <span className="text-white">{Math.round(financials.ffAndE).toLocaleString()} MAD</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-amber-400">Total Investment</span>
                <span className="text-amber-400">{Math.round(financials.totalAcquisitionCost).toLocaleString()} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Yield */}
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Annual Cash Flow</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Gross Revenue</span>
              <span className="text-white">{Math.round(financials.grossAnnualRevenue).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">OpEx (35%)</span>
              <span className="text-red-400">-{Math.round(financials.totalOpEx).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">NOI</span>
              <span className="text-white">{Math.round(financials.netOperatingIncome).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax (15%)</span>
              <span className="text-red-400">-{Math.round(financials.taxOnProfit).toLocaleString()} MAD</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-green-400">Net After Tax</span>
                <span className="text-green-400">{Math.round(financials.netAfterTax).toLocaleString()} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Card */}
        <div className={`p-6 rounded-xl text-center ${
          financials.investmentGrade === 'institutional'
            ? 'bg-green-900/30 border-2 border-green-500'
            : financials.investmentGrade === 'lifestyle'
            ? 'bg-red-900/30 border-2 border-red-500'
            : 'bg-yellow-900/30 border-2 border-yellow-500'
        }`}>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Net Yield</div>
          <div className={`text-5xl font-bold mt-2 ${
            financials.investmentGrade === 'institutional'
              ? 'text-green-400'
              : financials.investmentGrade === 'lifestyle'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {financials.netYield.toFixed(1)}%
          </div>
          <div className={`text-sm font-medium mt-2 ${
            financials.investmentGrade === 'institutional'
              ? 'text-green-400'
              : financials.investmentGrade === 'lifestyle'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {financials.investmentGrade === 'institutional' && 'INSTITUTIONAL GRADE'}
            {financials.investmentGrade === 'moderate' && 'MODERATE RETURN'}
            {financials.investmentGrade === 'lifestyle' && 'LIFESTYLE ASSET ONLY'}
          </div>
        </div>

        {/* Arbitrage Calculation */}
        {data.titleType === 'melkia' && financials.foundValue > 0 && (
          <div className="p-4 bg-purple-900/30 border border-purple-500 rounded-xl">
            <div className="text-xs text-purple-400 uppercase tracking-wider mb-2">
              Melkia → Titre Arbitrage
            </div>
            <div className="text-sm text-gray-300">
              If titled at 4.5% Cap Rate:
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              +{Math.round(financials.foundValue).toLocaleString()} MAD
            </div>
            <div className="text-xs text-gray-500 mt-1">
              "Found Value" potential
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TrustCalculator() {
  const [step, setStep] = useState(0);
  const [showPDF, setShowPDF] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [formData, setFormData] = useState<FormData>({
    titleType: 'unknown',
    heirCount: 1,
    vnaStatus: false,
    pillarTilt: 0,
    humidity: 3,
    seismicChaining: false,
    sharedWallsLeaning: false,
    askingPrice: 0,
    renovationEstimate: 0,
    surfaceSqm: 0,
    neighborhoodAvgPricePerSqm: 18000,
    alleyWidthM: 2,
    distanceToLandmarkM: 500,
    roomRate: 1200,
    suiteCount: 6,
    occupancyRate: 65,
  });

  const breakdown = useMemo(() => calculateTrustScore(formData), [formData]);
  const financials = useMemo(() => calculateFinancials(formData), [formData]);

  const handleChange = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = [
    { title: 'Legal', icon: '⚖️' },
    { title: 'Structure', icon: '🏛️' },
    { title: 'Market', icon: '📊' },
    { title: 'Yield', icon: '💰' },
  ];

  const pdfData = {
    propertyName: propertyName || `Riad ${formData.surfaceSqm}m²`,
    neighborhood: 'Laksour',
    trustScore: breakdown.total,
    netYield: financials.netYield,
    investmentGrade: financials.investmentGrade,
    titleType: formData.titleType,
    heirCount: formData.heirCount,
    vnaStatus: formData.vnaStatus,
    pillarTilt: formData.pillarTilt,
    humidity: formData.humidity,
    seismicChaining: formData.seismicChaining,
    surfaceSqm: formData.surfaceSqm,
    askingPrice: formData.askingPrice,
    renovationEstimate: formData.renovationEstimate,
    totalAcquisitionCost: financials.totalAcquisitionCost,
    grossAnnualRevenue: financials.grossAnnualRevenue,
    netAfterTax: financials.netAfterTax,
    foundValue: financials.foundValue,
    suiteCount: formData.suiteCount,
    roomRate: formData.roomRate,
    occupancyRate: formData.occupancyRate,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* PDF Modal */}
      {showPDF && (
        <InvestorPDF data={pdfData} onClose={() => setShowPDF(false)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-amber-500">TIFORT</h1>
              <p className="text-[10px] text-gray-500 tracking-wider">THE WOMAN WHO KNOWS</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/glossary"
                className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-600"
              >
                Glossary
              </Link>
              <button
                onClick={() => setShowPDF(true)}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-500"
              >
                PDF
              </button>
              <div className="text-right">
                <div className={`text-3xl font-bold tabular-nums ${
                  breakdown.total >= 70 ? 'text-green-500' :
                  breakdown.total >= 40 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {breakdown.total}
                </div>
                <div className="text-[10px] text-gray-500 tracking-wider">TRUST</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Property Name Input */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <input
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          placeholder="Property Name (e.g. Riad Laksour 200m²)"
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-center focus:outline-none focus:border-amber-500 placeholder-gray-500"
        />
      </div>

      {/* Trust Gauge */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <TrustGauge score={breakdown.total} />
      </div>

      {/* Step Indicators */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-1">
          {steps.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setStep(i)}
              className={`flex-1 py-3 px-2 rounded-lg text-center transition-all ${
                i === step
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              <span className="block text-[10px] mt-1 font-medium">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-lg mx-auto px-4 pb-32">
        {step === 0 && <LegalStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 1 && <StructuralStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 2 && <MarketStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 3 && <FinancialStep data={formData} onChange={handleChange} breakdown={breakdown} financials={financials} />}

        {/* Expert Tips Sidebar */}
        <div className="mt-6">
          <ExpertTips
            section={step === 0 ? 'legal' : step === 1 ? 'structural' : step === 2 ? 'market' : 'financial'}
            data={{
              titleType: formData.titleType,
              heirCount: formData.heirCount,
              vnaStatus: formData.vnaStatus,
              pillarTilt: formData.pillarTilt,
              humidity: formData.humidity,
              seismicChaining: formData.seismicChaining,
              alleyWidthM: formData.alleyWidthM,
              askingPrice: formData.askingPrice,
              surfaceSqm: formData.surfaceSqm,
            }}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 active:scale-[0.98] transition-all"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-4 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-500 active:scale-[0.98] transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              className="flex-1 py-4 rounded-xl bg-green-600 text-white font-medium hover:bg-green-500 active:scale-[0.98] transition-all"
            >
              Save Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
