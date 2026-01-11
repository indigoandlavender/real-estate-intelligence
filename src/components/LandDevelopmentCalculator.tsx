'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ZoningCode,
  ZONING_SPECS,
  InfrastructureLevel,
  TNB_RATES_2026,
  VNAStatus,
  calculateBuildPotential,
  calculateTNB,
  calculateBill3421Status,
  calculateLandRiskScore,
  determineInfrastructureLevel,
} from '@/types/land';

interface LandDevelopmentCalculatorProps {
  onCalculate?: (result: ReturnType<typeof calculateBuildPotential>) => void;
}

export default function LandDevelopmentCalculator({ onCalculate }: LandDevelopmentCalculatorProps) {
  // Basic inputs
  const [plotSize, setPlotSize] = useState(1000);
  const [zoningCode, setZoningCode] = useState<ZoningCode>('GH2');
  const [pricePerSqmLand, setPricePerSqmLand] = useState(3000);
  const [pricePerSqmBuilt, setPricePerSqmBuilt] = useState(15000);
  const [constructionCostPerSqm, setConstructionCostPerSqm] = useState(8000);

  // Title
  const [titleType, setTitleType] = useState<'titre_foncier' | 'melkia' | 'requisition'>('titre_foncier');
  const [heirCount, setHeirCount] = useState(1);

  // VNA
  const [vnaStatus, setVnaStatus] = useState<VNAStatus>('not_required');

  // Utilities
  const [waterGrid, setWaterGrid] = useState(true);
  const [electricGrid, setElectricGrid] = useState(true);
  const [sewer, setSewer] = useState(true);
  const [pavedRoad, setPavedRoad] = useState(true);
  const [fiberOptics, setFiberOptics] = useState(false);

  // Bill 34.21
  const [isSubdivision, setIsSubdivision] = useState(false);
  const [subdivisionYear, setSubdivisionYear] = useState(2023);
  const [infrastructureComplete, setInfrastructureComplete] = useState(false);

  // Well
  const [hasWell, setHasWell] = useState(false);
  const [wellRegistered, setWellRegistered] = useState(false);

  // Calculations
  const utilities = { waterGrid, electricGrid, sewer, pavedRoadAccess: pavedRoad, fiberOptics };
  const infrastructureLevel = useMemo(() => determineInfrastructureLevel(utilities), [utilities]);

  const buildPotential = useMemo(() => calculateBuildPotential({
    plotSize,
    zoningCode,
    pricePerSqmLand,
    pricePerSqmBuilt,
    constructionCostPerSqm,
  }), [plotSize, zoningCode, pricePerSqmLand, pricePerSqmBuilt, constructionCostPerSqm]);

  const tnbCalc = useMemo(() => calculateTNB(plotSize, infrastructureLevel), [plotSize, infrastructureLevel]);

  const bill3421 = useMemo(() => calculateBill3421Status(
    isSubdivision,
    isSubdivision ? new Date(subdivisionYear, 0, 1) : undefined,
    infrastructureComplete
  ), [isSubdivision, subdivisionYear, infrastructureComplete]);

  const riskAssessment = useMemo(() => calculateLandRiskScore({
    plotSize,
    titleType,
    heirCount,
    vnaDetails: { status: vnaStatus },
    infrastructureLevel,
    bill3421,
    hasWell,
    wellRegistered,
  }), [plotSize, titleType, heirCount, vnaStatus, infrastructureLevel, bill3421, hasWell, wellRegistered]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Risk Score Header */}
      <div className={`p-6 border-2 ${
        riskAssessment.score >= 70 ? 'border-green-600 bg-green-50' :
        riskAssessment.score >= 40 ? 'border-yellow-500 bg-yellow-50' :
        'border-red-600 bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-gray-500">LAND RISK SCORE</div>
            <div className={`font-display text-5xl mt-1 ${getRiskColor(riskAssessment.score)}`}>
              {riskAssessment.score}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-gray-500 mb-2">BUILD POTENTIAL</div>
            <div className="font-display text-2xl">{buildPotential.maxFloorArea.toLocaleString()} m²</div>
            <div className="text-xs text-gray-500">{buildPotential.summaryText}</div>
          </div>
        </div>

        {riskAssessment.factors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-[10px] tracking-widest text-gray-500 mb-2">RISK FACTORS</div>
            <div className="flex flex-wrap gap-2">
              {riskAssessment.factors.map((factor, i) => (
                <span key={i} className="px-2 py-1 bg-white text-xs text-gray-600 border border-gray-200">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Plot & Zoning */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Plot & Zoning</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Plot Size (m²)</label>
                <input
                  type="number"
                  value={plotSize}
                  onChange={(e) => setPlotSize(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 text-lg font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Zoning Code</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(ZONING_SPECS) as ZoningCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => setZoningCode(code)}
                      className={`p-3 text-center border transition-all ${
                        zoningCode === code
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-mono text-sm font-bold">{code}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 p-3 bg-gray-50 text-xs">
                  <div className="font-medium">{ZONING_SPECS[zoningCode].name}</div>
                  <div className="text-gray-500 mt-1">{ZONING_SPECS[zoningCode].description}</div>
                  <div className="mt-2 flex gap-4 text-gray-600">
                    <span>CES: {ZONING_SPECS[zoningCode].cesPercent}%</span>
                    <span>COS: {ZONING_SPECS[zoningCode].cos}</span>
                    <span>Max: {ZONING_SPECS[zoningCode].maxFloors} floors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Title Status</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['titre_foncier', 'melkia', 'requisition'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTitleType(type)}
                    className={`p-3 text-center border transition-all ${
                      titleType === type
                        ? type === 'titre_foncier' ? 'border-green-600 bg-green-50'
                        : type === 'melkia' ? 'border-yellow-500 bg-yellow-50'
                        : 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {type === 'titre_foncier' ? 'Titre Foncier' :
                       type === 'melkia' ? 'Melkia' : 'Requisition'}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Number of Heirs</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setHeirCount(Math.max(1, heirCount - 1))}
                    className="w-10 h-10 border border-gray-300 text-xl"
                  >-</button>
                  <span className={`font-mono text-2xl ${heirCount > 3 ? 'text-red-600' : ''}`}>{heirCount}</span>
                  <button
                    onClick={() => setHeirCount(heirCount + 1)}
                    className="w-10 h-10 border border-gray-300 text-xl"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* VNA Status */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">VNA Status (Rural Land)</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['not_required', 'acquired', 'pending', 'non_eligible'] as VNAStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setVnaStatus(status)}
                  className={`p-3 text-center border transition-all ${
                    vnaStatus === status
                      ? status === 'acquired' || status === 'not_required' ? 'border-green-600 bg-green-50'
                      : status === 'pending' ? 'border-yellow-500 bg-yellow-50'
                      : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xs font-medium capitalize">{status.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Utilities */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              Utilities · Infrastructure: <span className={
                infrastructureLevel === 'equipped' ? 'text-green-600' :
                infrastructureLevel === 'semi_equipped' ? 'text-yellow-600' :
                'text-red-600'
              }>{infrastructureLevel.replace('_', ' ').toUpperCase()}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'water', label: 'Water Grid', value: waterGrid, setter: setWaterGrid },
                { key: 'electric', label: 'Electric Grid', value: electricGrid, setter: setElectricGrid },
                { key: 'sewer', label: 'Sewer', value: sewer, setter: setSewer },
                { key: 'road', label: 'Paved Road', value: pavedRoad, setter: setPavedRoad },
                { key: 'fiber', label: 'Fiber Optics', value: fiberOptics, setter: setFiberOptics },
              ].map((util) => (
                <button
                  key={util.key}
                  onClick={() => util.setter(!util.value)}
                  className={`p-3 text-left border transition-all ${
                    util.value ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={util.value ? 'text-green-600' : 'text-gray-300'}>
                      {util.value ? '✓' : '○'}
                    </span>
                    <span className="text-xs">{util.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Well (Rural) */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Well Registry (Rural Land)</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setHasWell(!hasWell)}
                className={`flex-1 p-3 border transition-all ${
                  hasWell ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-xs">Has Well: {hasWell ? 'YES' : 'NO'}</div>
              </button>
              {hasWell && (
                <button
                  onClick={() => setWellRegistered(!wellRegistered)}
                  className={`flex-1 p-3 border transition-all ${
                    wellRegistered ? 'border-green-600 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="text-xs">Registered: {wellRegistered ? 'YES' : 'NO'}</div>
                </button>
              )}
            </div>
            {hasWell && !wellRegistered && (
              <div className="mt-2 text-xs text-red-600">
                ⚠ Unregistered well: Land value -40%
              </div>
            )}
          </div>

          {/* Bill 34.21 */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Bill 34.21 (Subdivision)</h3>

            <button
              onClick={() => setIsSubdivision(!isSubdivision)}
              className={`w-full p-3 border mb-4 ${
                isSubdivision ? 'border-black bg-black text-white' : 'border-gray-200'
              }`}
            >
              <div className="text-xs">Is Subdivision: {isSubdivision ? 'YES' : 'NO'}</div>
            </button>

            {isSubdivision && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Approval Year</label>
                  <input
                    type="number"
                    value={subdivisionYear}
                    onChange={(e) => setSubdivisionYear(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 text-sm"
                  />
                </div>

                <button
                  onClick={() => setInfrastructureComplete(!infrastructureComplete)}
                  className={`w-full p-3 border ${
                    infrastructureComplete ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-xs">Infrastructure Complete: {infrastructureComplete ? 'YES' : 'NO'}</div>
                </button>

                <div className={`p-3 text-xs ${
                  bill3421.complianceStatus === 'compliant' ? 'bg-green-50 text-green-800' :
                  bill3421.complianceStatus === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  bill3421.complianceStatus === 'violation' ? 'bg-red-50 text-red-800' :
                  'bg-gray-50'
                }`}>
                  {bill3421.complianceStatus === 'violation' && '⚠ DEADLINE PASSED'}
                  {bill3421.complianceStatus === 'warning' && `⚠ ${bill3421.daysRemaining} days remaining`}
                  {bill3421.complianceStatus === 'compliant' && infrastructureComplete && '✓ Compliant'}
                  {bill3421.complianceStatus === 'compliant' && !infrastructureComplete && `${bill3421.daysRemaining} days remaining`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Build Potential */}
          <div className="p-6 border-2 border-black">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Build Potential (Alpha Engine)</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50">
                  <div className="text-[10px] text-gray-500">MAX FOOTPRINT</div>
                  <div className="font-display text-2xl">{buildPotential.maxFootprint.toLocaleString()} m²</div>
                  <div className="text-xs text-gray-500">{buildPotential.footprintPercent}% of plot</div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="text-[10px] text-gray-500">BUILDABLE AREA</div>
                  <div className="font-display text-2xl">{buildPotential.maxFloorArea.toLocaleString()} m²</div>
                  <div className="text-xs text-gray-500">{buildPotential.floorsByFloor.length} floors</div>
                </div>
              </div>

              {buildPotential.maxUnits && (
                <div className="p-4 bg-blue-50 border border-blue-200">
                  <div className="text-[10px] text-blue-600">UNIT POTENTIAL (GH2)</div>
                  <div className="font-display text-3xl text-blue-700">{buildPotential.maxUnits} apartments</div>
                  <div className="text-xs text-blue-600">~{buildPotential.unitSizeEstimate}m² each</div>
                </div>
              )}

              {buildPotential.maxRooms && (
                <div className="p-4 bg-purple-50 border border-purple-200">
                  <div className="text-[10px] text-purple-600">HOTEL POTENTIAL (SA1)</div>
                  <div className="font-display text-3xl text-purple-700">{buildPotential.maxRooms} rooms</div>
                  <div className="text-xs text-purple-600">Boutique hotel capacity</div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-[10px] text-gray-500 mb-2">FLOOR BREAKDOWN</div>
                <div className="flex gap-2">
                  {buildPotential.floorsByFloor.map((area, i) => (
                    <div key={i} className="flex-1 p-2 bg-gray-100 text-center">
                      <div className="text-[9px] text-gray-500">F{i}</div>
                      <div className="font-mono text-sm">{area}m²</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Financial Analysis</h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Land Price (MAD/m²)</label>
                <input
                  type="number"
                  value={pricePerSqmLand}
                  onChange={(e) => setPricePerSqmLand(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Built Value (MAD/m²)</label>
                <input
                  type="number"
                  value={pricePerSqmBuilt}
                  onChange={(e) => setPricePerSqmBuilt(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Construction Cost (MAD/m²)</label>
                <input
                  type="number"
                  value={constructionCostPerSqm}
                  onChange={(e) => setConstructionCostPerSqm(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Land Value</span>
                <span className="font-mono">{buildPotential.landValue.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Construction Cost</span>
                <span className="font-mono">{buildPotential.constructionCost.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                <span>Total Investment</span>
                <span className="font-mono">{buildPotential.totalInvestment.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Projected Built Value</span>
                <span className="font-mono">{buildPotential.projectedBuiltValue.toLocaleString()} MAD</span>
              </div>
              <div className={`flex justify-between py-3 ${buildPotential.builtValueAlpha > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className="font-medium">Built-Value Alpha</span>
                <span className={`font-mono font-bold ${buildPotential.builtValueAlpha > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {buildPotential.builtValueAlpha > 0 ? '+' : ''}{buildPotential.builtValueAlpha.toLocaleString()} MAD
                  <span className="text-xs ml-2">({buildPotential.alphaPercent}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* TNB Tax */}
          <div className="p-6 border border-gray-200">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              TNB Tax (Carrying Cost)
            </h3>

            <div className="p-4 bg-gray-50 mb-4">
              <div className="text-[10px] text-gray-500">INFRASTRUCTURE LEVEL</div>
              <div className="font-mono text-lg capitalize">{infrastructureLevel.replace('_', ' ')}</div>
              <div className="text-xs text-gray-500">{TNB_RATES_2026[infrastructureLevel].description}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-yellow-50">
                <div className="text-[10px] text-gray-500">ANNUAL</div>
                <div className="font-mono text-lg">{tnbCalc.annualTax.toLocaleString()}</div>
                <div className="text-[9px] text-gray-500">MAD/year</div>
              </div>
              <div className="p-3 bg-yellow-50">
                <div className="text-[10px] text-gray-500">MONTHLY</div>
                <div className="font-mono text-lg">{tnbCalc.monthlyCarrying.toLocaleString()}</div>
                <div className="text-[9px] text-gray-500">MAD/month</div>
              </div>
              <div className="p-3 bg-red-50">
                <div className="text-[10px] text-gray-500">5-YEAR HOLD</div>
                <div className="font-mono text-lg text-red-600">{tnbCalc.fiveYearCost.toLocaleString()}</div>
                <div className="text-[9px] text-gray-500">MAD total</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Rate: {tnbCalc.appliedRate} MAD/m² (2026 Marrakech rates)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
