'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TrustGauge from './TrustGauge';
import InvestorPDF from './InvestorPDF';
import ExpertTips from './ExpertTips';

// ============================================
// THE FORENSIC LOGIC TABLE
// ============================================

interface FormData {
  titleType: 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
  heirCount: number;
  vnaStatus: boolean;
  pillarTilt: number;
  humidity: number;
  seismicChaining: boolean;
  sharedWallsLeaning: boolean;
  askingPrice: number;
  renovationEstimate: number;
  surfaceSqm: number;
  neighborhoodAvgPricePerSqm: number;
  alleyWidthM: number;
  distanceToLandmarkM: number;
  roomRate: number;
  suiteCount: number;
  occupancyRate: number;
}

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

  // LEGAL
  if (data.titleType === 'melkia') {
    score -= 25;
    legal.deductions.push('Melkia (-25): 6-18 months to title');
  } else if (data.titleType === 'requisition') {
    score -= 15;
    legal.deductions.push('Requisition (-15): In process');
  } else if (data.titleType === 'unknown') {
    score -= 35;
    legal.deductions.push('Unknown title (-35): Maximum risk');
  }

  if (data.heirCount > 5) {
    score -= 15;
    legal.deductions.push(`${data.heirCount} Heirs (-15): Coordination risk`);
  }

  if (!data.vnaStatus && data.titleType !== 'titre_foncier') {
    score -= 10;
    legal.deductions.push('VNA Pending (-10)');
  }

  legal.score = Math.max(0, 50 - legal.deductions.length * 15);

  // STRUCTURAL
  if (!data.seismicChaining) {
    score -= 20;
    structural.deductions.push('No Seismic Chaining (-20)');
  }

  if (data.humidity > 7) {
    score -= 15;
    structural.deductions.push('High Humidity (-15)');
  }

  if (data.pillarTilt > 2) {
    score -= 20;
    structural.deductions.push(`Pillar Tilt ${data.pillarTilt}° (-20)`);
  }

  if (data.sharedWallsLeaning) {
    score -= 10;
    structural.deductions.push('Shared Walls Leaning (-10)');
  }

  structural.score = Math.max(0, 50 - structural.deductions.length * 15);

  // MARKET
  const pricePerSqm = data.surfaceSqm > 0 ? data.askingPrice / data.surfaceSqm : 0;

  if (pricePerSqm > 0 && data.neighborhoodAvgPricePerSqm > 0 && pricePerSqm < data.neighborhoodAvgPricePerSqm) {
    score += 15;
    market.adjustments.push(`Below market (+15)`);
  }

  if (data.alleyWidthM > 0 && data.alleyWidthM < 1.5) {
    score -= 10;
    market.adjustments.push('Narrow alley (-10)');
  }

  if (data.distanceToLandmarkM > 0 && data.distanceToLandmarkM < 300) {
    score += 10;
    market.adjustments.push('Near landmark (+10)');
  }

  market.score = Math.min(100, Math.max(0, 50 + market.adjustments.filter(a => a.includes('+')).length * 10));

  return {
    total: Math.max(0, Math.min(100, score)),
    legal,
    structural,
    market,
  };
};

interface FinancialMetrics {
  purchasePrice: number;
  closingCosts: number;
  renovationBudget: number;
  ffAndE: number;
  totalAcquisitionCost: number;
  grossAnnualRevenue: number;
  staffing: number;
  utilities: number;
  marketing: number;
  management: number;
  totalOpEx: number;
  netOperatingIncome: number;
  taxOnProfit: number;
  netAfterTax: number;
  grossYield: number;
  netYield: number;
  investmentGrade: 'institutional' | 'moderate' | 'lifestyle';
  potentialTitledValue: number;
  foundValue: number;
}

const calculateFinancials = (data: FormData): FinancialMetrics => {
  const purchasePrice = data.askingPrice;
  const closingCosts = purchasePrice * 0.07;
  const renovationBudget = data.renovationEstimate;
  const ffAndE = renovationBudget * 0.12;
  const totalAcquisitionCost = purchasePrice + closingCosts + renovationBudget + ffAndE;

  const occupancy = data.occupancyRate / 100;
  const annualNights = 365 * occupancy;
  const grossAnnualRevenue = data.roomRate * data.suiteCount * annualNights;

  const totalOpEx = grossAnnualRevenue * 0.35;
  const staffing = totalOpEx * 0.40;
  const utilities = totalOpEx * 0.15;
  const marketing = totalOpEx * 0.30;
  const management = totalOpEx * 0.15;

  const netOperatingIncome = grossAnnualRevenue - totalOpEx;
  const taxOnProfit = netOperatingIncome * 0.15;
  const netAfterTax = netOperatingIncome - taxOnProfit;

  const grossYield = totalAcquisitionCost > 0 ? (grossAnnualRevenue / totalAcquisitionCost) * 100 : 0;
  const netYield = totalAcquisitionCost > 0 ? (netAfterTax / totalAcquisitionCost) * 100 : 0;

  let investmentGrade: 'institutional' | 'moderate' | 'lifestyle' = 'moderate';
  if (netYield >= 8) investmentGrade = 'institutional';
  else if (netYield < 5) investmentGrade = 'lifestyle';

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

interface StepProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  breakdown: ScoreBreakdown;
}

function LegalStep({ data, onChange, breakdown }: StepProps) {
  return (
    <div className="space-y-10">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl tracking-wide">Legal Pillar</h2>
        <p className="text-sm text-gray-500 mt-2">The Trust Foundation</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Ownership Document
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'titre_foncier', label: 'Titre Foncier', desc: 'Gold Standard', points: '+0' },
            { value: 'melkia', label: 'Melkia', desc: '6-18 months', points: '-25' },
            { value: 'requisition', label: 'Requisition', desc: 'In process', points: '-15' },
            { value: 'unknown', label: 'Unknown', desc: 'Maximum risk', points: '-35' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ titleType: option.value as FormData['titleType'] })}
              className={`p-5 border text-left transition-all ${
                data.titleType === option.value
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-60 mt-1">{option.desc}</div>
              <div className={`text-xs mt-2 font-mono ${
                data.titleType === option.value
                  ? 'opacity-60'
                  : option.points === '+0' ? 'text-green-600' : 'text-red-600'
              }`}>
                {option.points}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Number of Heirs
          {data.heirCount > 5 && <span className="ml-2 text-red-600">-15</span>}
        </label>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onChange({ heirCount: Math.max(1, data.heirCount - 1) })}
            className="w-14 h-14 border border-gray-300 text-xl hover:bg-gray-50"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <span className={`font-display text-5xl ${data.heirCount > 5 ? 'text-red-600' : ''}`}>
              {data.heirCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ heirCount: data.heirCount + 1 })}
            className="w-14 h-14 border border-gray-300 text-xl hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          VNA Status
          {!data.vnaStatus && data.titleType !== 'titre_foncier' && <span className="ml-2 text-red-600">-10</span>}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChange({ vnaStatus: true })}
            className={`p-5 border transition-all ${
              data.vnaStatus ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Approved</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ vnaStatus: false })}
            className={`p-5 border transition-all ${
              !data.vnaStatus ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Pending</div>
          </button>
        </div>
      </div>

      {breakdown.legal.deductions.length > 0 && (
        <div className="border-t pt-6">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Deductions</div>
          {breakdown.legal.deductions.map((d, i) => (
            <div key={i} className="text-sm text-red-600 mt-1">{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function StructuralStep({ data, onChange, breakdown }: StepProps) {
  return (
    <div className="space-y-10">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl tracking-wide">Structural Pillar</h2>
        <p className="text-sm text-gray-500 mt-2">The Builder&apos;s Truth</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Pillar Tilt {data.pillarTilt > 2 && <span className="ml-2 text-red-600">-20</span>}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={data.pillarTilt}
          onChange={(e) => onChange({ pillarTilt: parseFloat(e.target.value) })}
          className="w-full h-1 appearance-none cursor-pointer bg-gray-200"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-3">
          <span>0° Plumb</span>
          <span>2° Limit</span>
          <span>5° Critical</span>
        </div>
        <div className={`text-center mt-4 font-display text-4xl ${
          data.pillarTilt > 2 ? 'text-red-600' : ''
        }`}>
          {data.pillarTilt.toFixed(1)}°
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Humidity Level {data.humidity > 7 && <span className="ml-2 text-red-600">-15</span>}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={data.humidity}
          onChange={(e) => onChange({ humidity: parseInt(e.target.value) })}
          className="w-full h-1 appearance-none cursor-pointer bg-gray-200"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-3">
          <span>0 Dry</span>
          <span>7 Limit</span>
          <span>10 Flooded</span>
        </div>
        <div className={`text-center mt-4 font-display text-4xl ${
          data.humidity > 7 ? 'text-red-600' : ''
        }`}>
          {data.humidity}/10
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Seismic Chaining {!data.seismicChaining && <span className="ml-2 text-red-600">-20</span>}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChange({ seismicChaining: true })}
            className={`p-5 border transition-all ${
              data.seismicChaining ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Present</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ seismicChaining: false })}
            className={`p-5 border transition-all ${
              !data.seismicChaining ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Absent</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
          Shared Walls {data.sharedWallsLeaning && <span className="ml-2 text-red-600">-10</span>}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChange({ sharedWallsLeaning: false })}
            className={`p-5 border transition-all ${
              !data.sharedWallsLeaning ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Stable</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ sharedWallsLeaning: true })}
            className={`p-5 border transition-all ${
              data.sharedWallsLeaning ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-sm">Leaning</div>
          </button>
        </div>
      </div>

      {breakdown.structural.deductions.length > 0 && (
        <div className="border-t pt-6">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Deductions</div>
          {breakdown.structural.deductions.map((d, i) => (
            <div key={i} className="text-sm text-red-600 mt-1">{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketStep({ data, onChange, breakdown }: StepProps) {
  const pricePerSqm = data.surfaceSqm > 0 ? Math.round(data.askingPrice / data.surfaceSqm) : 0;

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl tracking-wide">Market Pillar</h2>
        <p className="text-sm text-gray-500 mt-2">The Cold Truth</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Surface (m²)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.surfaceSqm || ''}
          onChange={(e) => onChange({ surfaceSqm: parseInt(e.target.value) || 0 })}
          placeholder="200"
          className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Asking Price (MAD)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.askingPrice || ''}
          onChange={(e) => onChange({ askingPrice: parseInt(e.target.value) || 0 })}
          placeholder="4,500,000"
          className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
        />
        {pricePerSqm > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            = {pricePerSqm.toLocaleString()} MAD/m²
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
          Neighborhood Avg/m²
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={data.neighborhoodAvgPricePerSqm || ''}
          onChange={(e) => onChange({ neighborhoodAvgPricePerSqm: parseInt(e.target.value) || 0 })}
          placeholder="18,000"
          className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Renovation Estimate (MAD)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.renovationEstimate || ''}
          onChange={(e) => onChange({ renovationEstimate: parseInt(e.target.value) || 0 })}
          placeholder="1,600,000"
          className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
            Alley Width (m) {data.alleyWidthM > 0 && data.alleyWidthM < 1.5 && <span className="text-red-600">-10</span>}
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={data.alleyWidthM || ''}
            onChange={(e) => onChange({ alleyWidthM: parseFloat(e.target.value) || 0 })}
            placeholder="1.5"
            className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
            Landmark (m) {data.distanceToLandmarkM > 0 && data.distanceToLandmarkM < 300 && <span className="text-green-600">+10</span>}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={data.distanceToLandmarkM || ''}
            onChange={(e) => onChange({ distanceToLandmarkM: parseInt(e.target.value) || 0 })}
            placeholder="250"
            className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {breakdown.market.adjustments.length > 0 && (
        <div className="border-t pt-6">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Adjustments</div>
          {breakdown.market.adjustments.map((a, i) => (
            <div key={i} className={`text-sm mt-1 ${a.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinancialStep({ data, onChange, financials }: StepProps & { financials: FinancialMetrics }) {
  return (
    <div className="space-y-10">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl tracking-wide">Financial Engine</h2>
        <p className="text-sm text-gray-500 mt-2">2026 Morocco Tax Law</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">Number of Suites</label>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onChange({ suiteCount: Math.max(1, data.suiteCount - 1) })}
            className="w-14 h-14 border border-gray-300 text-xl hover:bg-gray-50"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <span className="font-display text-5xl">{data.suiteCount}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ suiteCount: data.suiteCount + 1 })}
            className="w-14 h-14 border border-gray-300 text-xl hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Room Rate (MAD/night)</label>
        <input
          type="number"
          inputMode="numeric"
          value={data.roomRate || ''}
          onChange={(e) => onChange({ roomRate: parseInt(e.target.value) || 0 })}
          placeholder="1,200"
          className="w-full px-4 py-4 border border-gray-200 text-lg focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
          Target Occupancy: {data.occupancyRate}%
        </label>
        <input
          type="range"
          min="40"
          max="85"
          step="5"
          value={data.occupancyRate}
          onChange={(e) => onChange({ occupancyRate: parseInt(e.target.value) })}
          className="w-full h-1 appearance-none cursor-pointer bg-gray-200"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-3">
          <span>40%</span>
          <span>65%</span>
          <span>85%</span>
        </div>
      </div>

      <div className="border-t pt-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">Total Acquisition Cost</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Purchase</span>
              <span>{financials.purchasePrice.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Closing (7%)</span>
              <span>{Math.round(financials.closingCosts).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Renovation</span>
              <span>{financials.renovationBudget.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">FF&E (12%)</span>
              <span>{Math.round(financials.ffAndE).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span>Total</span>
              <span>{Math.round(financials.totalAcquisitionCost).toLocaleString()} MAD</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">Annual Cash Flow</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Gross Revenue</span>
              <span>{Math.round(financials.grossAnnualRevenue).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">OpEx (35%)</span>
              <span className="text-red-600">-{Math.round(financials.totalOpEx).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (15%)</span>
              <span className="text-red-600">-{Math.round(financials.taxOnProfit).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span>Net After Tax</span>
              <span className="text-green-600">{Math.round(financials.netAfterTax).toLocaleString()} MAD</span>
            </div>
          </div>
        </div>

        <div className={`p-8 text-center border-2 ${
          financials.investmentGrade === 'institutional' ? 'border-green-600' :
          financials.investmentGrade === 'lifestyle' ? 'border-red-600' : 'border-gray-300'
        }`}>
          <div className="text-xs uppercase tracking-widest text-gray-500">Net Yield</div>
          <div className={`font-display text-5xl mt-2 ${
            financials.investmentGrade === 'institutional' ? 'text-green-600' :
            financials.investmentGrade === 'lifestyle' ? 'text-red-600' : ''
          }`}>
            {financials.netYield.toFixed(1)}%
          </div>
          <div className={`text-xs uppercase tracking-widest mt-3 ${
            financials.investmentGrade === 'institutional' ? 'text-green-600' :
            financials.investmentGrade === 'lifestyle' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {financials.investmentGrade === 'institutional' && 'Institutional Grade'}
            {financials.investmentGrade === 'moderate' && 'Moderate Return'}
            {financials.investmentGrade === 'lifestyle' && 'Lifestyle Only'}
          </div>
        </div>

        {data.titleType === 'melkia' && financials.foundValue > 0 && (
          <div className="p-6 border border-gray-300">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              Melkia to Titre Arbitrage
            </div>
            <div className="font-display text-2xl">
              +{Math.round(financials.foundValue).toLocaleString()} MAD
            </div>
            <div className="text-xs text-gray-500 mt-1">Found Value at 4.5% Cap Rate</div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  const steps = ['Legal', 'Structure', 'Market', 'Yield'];

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
    <div className="min-h-screen bg-[#faf9f7]">
      {showPDF && <InvestorPDF data={pdfData} onClose={() => setShowPDF(false)} />}

      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-gray-200">
        <div className="max-w-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl tracking-widest">TIFORT</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/glossary" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Glossary
              </Link>
              <Link href="/listings" className="text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                Listings
              </Link>
              <button
                onClick={() => setShowPDF(true)}
                className="text-xs uppercase tracking-widest text-gray-500 hover:text-black"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-10">
        <input
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          placeholder="Property Name"
          className="w-full px-0 py-3 bg-transparent border-b border-gray-200 text-center font-display text-lg focus:outline-none focus:border-black placeholder-gray-300"
        />
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">
        <TrustGauge score={breakdown.total} />
      </div>

      <div className="max-w-xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-between border-b border-gray-200">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 py-4 text-xs uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
                i === step
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-40">
        {step === 0 && <LegalStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 1 && <StructuralStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 2 && <MarketStep data={formData} onChange={handleChange} breakdown={breakdown} />}
        {step === 3 && <FinancialStep data={formData} onChange={handleChange} breakdown={breakdown} financials={financials} />}

        <div className="mt-12">
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

      <div className="fixed bottom-0 left-0 right-0 bg-[#faf9f7] border-t border-gray-200 p-6">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 border border-gray-300 text-sm uppercase tracking-widest hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800"
            >
              Continue
            </button>
          ) : (
            <button className="flex-1 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800">
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
