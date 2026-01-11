'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  VocationCode,
  VOCATION_ZONES,
  MedinaZoningAssessment,
  calculateMedinaZoningScore,
  getMedinaComplianceWarnings,
} from '@/types/medina';

interface MedinaZoningDecoderProps {
  onChange?: (assessment: MedinaZoningAssessment, score: number) => void;
  darkMode?: boolean;
}

export default function MedinaZoningDecoder({ onChange, darkMode = false }: MedinaZoningDecoderProps) {
  // Vocation
  const [vocationCode, setVocationCode] = useState<VocationCode>('MH');

  // Current and intended use
  const [currentUse, setCurrentUse] = useState<'residential' | 'commercial' | 'hospitality' | 'mixed' | 'vacant'>('residential');
  const [intendedUse, setIntendedUse] = useState<'residential' | 'commercial' | 'hospitality' | 'mixed'>('hospitality');

  // Volume compliance (70/30 Rule)
  const [patioOpen, setPatioOpen] = useState(true);
  const [coveredPatioArea, setCoveredPatioArea] = useState(0);
  const [buildingHeight, setBuildingHeight] = useState(7);
  const [nearestMinaretHeight, setNearestMinaretHeight] = useState(8);
  const [neighborWindowHigher, setNeighborWindowHigher] = useState(false);

  // Land audit (for ruins/empty land)
  const [isLandOrRuins, setIsLandOrRuins] = useState(false);
  const [droitDeReconstruction, setDroitDeReconstruction] = useState(false);
  const [archaeologicalRisk, setArchaeologicalRisk] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [hasSabats, setHasSabats] = useState(false);
  const [sabatsOnTitle, setSabatsOnTitle] = useState(false);

  // Calculate assessment and score
  const [assessment, setAssessment] = useState<MedinaZoningAssessment | null>(null);
  const [score, setScore] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const newAssessment: MedinaZoningAssessment = {
      vocationCode,
      vocationZone: VOCATION_ZONES[vocationCode],
      volumeCompliance: {
        patioOpen,
        coveredPatioArea,
        buildingHeight,
        nearestMinaretHeight,
        neighborWindowHigher,
        heightCompliant: buildingHeight <= nearestMinaretHeight,
        patioCompliant: patioOpen && coveredPatioArea <= 30,
      },
      currentUse,
      intendedUse,
      complianceIssues: [],
      valueUpliftPotential: vocationCode === 'H' && intendedUse === 'hospitality',
      wc2030AuditRisk: (currentUse === 'hospitality' && vocationCode === 'H') ? 'high' : 'low',
    };

    if (isLandOrRuins) {
      const archaeologicalBuffer = archaeologicalRisk === 'high' ? 20 :
                                   archaeologicalRisk === 'medium' ? 10 :
                                   archaeologicalRisk === 'low' ? 5 : 0;
      newAssessment.landAudit = {
        propertyType: 'ruins',
        droitDeReconstruction,
        archaeologicalRisk,
        archaeologicalBuffer,
        hasSabats,
        sabatsOnTitle: hasSabats ? sabatsOnTitle : false,
        greenSpaceOnly: !droitDeReconstruction,
      };
    }

    const newScore = calculateMedinaZoningScore(newAssessment);
    const newWarnings = getMedinaComplianceWarnings(newAssessment);

    setAssessment(newAssessment);
    setScore(newScore);
    setWarnings(newWarnings);

    if (onChange) {
      onChange(newAssessment, newScore);
    }
  }, [
    vocationCode, currentUse, intendedUse, patioOpen, coveredPatioArea,
    buildingHeight, nearestMinaretHeight, neighborWindowHigher,
    isLandOrRuins, droitDeReconstruction, archaeologicalRisk, hasSabats, sabatsOnTitle,
    onChange
  ]);

  const bgColor = darkMode ? 'bg-[#111]' : 'bg-white';
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200';
  const textColor = darkMode ? 'text-white' : 'text-black';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-black' : 'bg-gray-50';

  return (
    <div className={`${bgColor} border ${borderColor} p-8`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`font-display text-xl tracking-wide ${textColor}`}>Medina Zoning Decoder</h2>
          <p className={`text-xs ${mutedText} mt-1`}>PAV 2026 Compliance Assessment</p>
        </div>
        <div className="text-right">
          <div className={`font-display text-4xl ${
            score >= 70 ? 'text-green-500' :
            score >= 40 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {score}
          </div>
          <div className={`text-[10px] uppercase tracking-widest ${mutedText}`}>Zoning Score</div>
        </div>
      </div>

      {/* Vocation Zone Selection */}
      <div className="mb-8">
        <label className={`block text-xs uppercase tracking-widest ${mutedText} mb-4`}>
          Vocation Code (PAV 2026)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(VOCATION_ZONES) as VocationCode[]).map((code) => {
            const zone = VOCATION_ZONES[code];
            const isSelected = vocationCode === code;
            return (
              <button
                key={code}
                onClick={() => setVocationCode(code)}
                className={`p-4 text-left border transition-all ${
                  isSelected
                    ? darkMode ? 'border-white bg-white/5' : 'border-black bg-gray-50'
                    : `${borderColor} hover:border-gray-400`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-display text-lg ${textColor}`}>{code}</span>
                  <span className={`text-[10px] px-2 py-1 ${
                    zone.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    zone.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {zone.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className={`text-xs ${textColor}`}>{zone.name}</div>
                <div className={`text-xs ${mutedText} mt-1`}>{zone.meaning}</div>
              </button>
            );
          })}
        </div>
        {assessment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 p-4 border ${borderColor}`}
          >
            <p className={`text-sm ${textColor}`}>{VOCATION_ZONES[vocationCode].implications}</p>
          </motion.div>
        )}
      </div>

      {/* Current vs Intended Use */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className={`block text-xs uppercase tracking-widest ${mutedText} mb-3`}>
            Current Use
          </label>
          <select
            value={currentUse}
            onChange={(e) => setCurrentUse(e.target.value as typeof currentUse)}
            className={`w-full p-3 ${inputBg} border ${borderColor} ${textColor} text-sm`}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="hospitality">Guest House/Hotel</option>
            <option value="mixed">Mixed Use</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>
        <div>
          <label className={`block text-xs uppercase tracking-widest ${mutedText} mb-3`}>
            Intended Use
          </label>
          <select
            value={intendedUse}
            onChange={(e) => setIntendedUse(e.target.value as typeof intendedUse)}
            className={`w-full p-3 ${inputBg} border ${borderColor} ${textColor} text-sm`}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="hospitality">Guest House/Hotel</option>
            <option value="mixed">Mixed Use</option>
          </select>
        </div>
      </div>

      {/* WC2030 Audit Risk Alert */}
      {currentUse === 'hospitality' && vocationCode === 'H' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 border-2 border-red-500 bg-red-500/10"
        >
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">!</span>
            <div>
              <div className={`font-medium ${textColor}`}>WC2030 Audit Risk: HIGH</div>
              <p className={`text-sm ${mutedText} mt-1`}>
                Operating as Guest House in Zone Habitat. Government is auditing licenses ahead of World Cup.
                License may be revoked. Consider this a Value Uplift opportunity if you can convert to Zone MH.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 70/30 Rule - Volume Compliance */}
      <div className="mb-8 p-6 border border-dashed border-gray-300 dark:border-gray-700">
        <h3 className={`text-xs uppercase tracking-widest ${mutedText} mb-4`}>
          The Coefficient Trap (Volume Rules)
        </h3>

        <div className="space-y-4">
          {/* Patio Rule */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${textColor}`}>Is the patio open (uncovered)?</div>
              <div className={`text-xs ${mutedText}`}>70/30 Rule: Patio must remain open</div>
            </div>
            <button
              onClick={() => setPatioOpen(!patioOpen)}
              className={`px-4 py-2 text-sm ${
                patioOpen
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {patioOpen ? 'YES' : 'NO'}
            </button>
          </div>

          {!patioOpen && (
            <div>
              <label className={`block text-xs ${mutedText} mb-2`}>
                Covered patio area (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={coveredPatioArea}
                onChange={(e) => setCoveredPatioArea(Number(e.target.value))}
                className="w-full"
              />
              <div className={`text-sm ${textColor} mt-1`}>
                {coveredPatioArea}% covered {coveredPatioArea > 30 && <span className="text-red-500">(Non-Compliant)</span>}
              </div>
            </div>
          )}

          {/* Height Ceiling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${mutedText} mb-2`}>Building Height (m)</label>
              <input
                type="number"
                step="0.5"
                value={buildingHeight}
                onChange={(e) => setBuildingHeight(Number(e.target.value))}
                className={`w-full p-3 ${inputBg} border ${borderColor} ${textColor} text-sm`}
              />
            </div>
            <div>
              <label className={`block text-xs ${mutedText} mb-2`}>Nearest Minaret Base (m)</label>
              <input
                type="number"
                step="0.5"
                value={nearestMinaretHeight}
                onChange={(e) => setNearestMinaretHeight(Number(e.target.value))}
                className={`w-full p-3 ${inputBg} border ${borderColor} ${textColor} text-sm`}
              />
            </div>
          </div>
          {buildingHeight > nearestMinaretHeight && (
            <p className="text-sm text-red-500">Height exceeds minaret reference. Non-compliant.</p>
          )}

          {/* Neighbor Window */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${textColor}`}>Neighboring window higher than terrace?</div>
              <div className={`text-xs ${mutedText}`}>Privacy and value impact assessment</div>
            </div>
            <button
              onClick={() => setNeighborWindowHigher(!neighborWindowHigher)}
              className={`px-4 py-2 text-sm ${
                neighborWindowHigher
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {neighborWindowHigher ? 'YES' : 'NO'}
            </button>
          </div>
        </div>
      </div>

      {/* Land/Ruins Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xs uppercase tracking-widest ${mutedText}`}>
            Empty Land / Ruins Audit
          </h3>
          <button
            onClick={() => setIsLandOrRuins(!isLandOrRuins)}
            className={`px-4 py-2 text-xs uppercase tracking-widest ${
              isLandOrRuins
                ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                : `border ${borderColor} ${textColor}`
            }`}
          >
            {isLandOrRuins ? 'Active' : 'Enable'}
          </button>
        </div>

        {isLandOrRuins && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-6 border ${borderColor} space-y-4`}
          >
            {/* Droit de Reconstruction */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${textColor}`}>Droit de Reconstruction?</div>
                <div className={`text-xs ${mutedText}`}>Certificate proving prior structure exists</div>
              </div>
              <button
                onClick={() => setDroitDeReconstruction(!droitDeReconstruction)}
                className={`px-4 py-2 text-sm ${
                  droitDeReconstruction
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {droitDeReconstruction ? 'YES' : 'NO'}
              </button>
            </div>
            {!droitDeReconstruction && (
              <p className="text-sm text-red-500 p-3 bg-red-500/10">
                Without reconstruction rights, this land may only be used as green space or public square.
              </p>
            )}

            {/* Archaeological Risk */}
            <div>
              <label className={`block text-xs ${mutedText} mb-2`}>Archaeological Risk</label>
              <select
                value={archaeologicalRisk}
                onChange={(e) => setArchaeologicalRisk(e.target.value as typeof archaeologicalRisk)}
                className={`w-full p-3 ${inputBg} border ${borderColor} ${textColor} text-sm`}
              >
                <option value="none">None - Modern area</option>
                <option value="low">Low - Unlikely finds (+5% timeline)</option>
                <option value="medium">Medium - Possible remains (+10% timeline)</option>
                <option value="high">High - Almoravid/Almohad zone (+20% timeline)</option>
              </select>
            </div>

            {/* Sabats */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${textColor}`}>Property claims Sabats (bridge/passage)?</div>
                <div className={`text-xs ${mutedText}`}>Common samsar trick - verify on title</div>
              </div>
              <button
                onClick={() => setHasSabats(!hasSabats)}
                className={`px-4 py-2 text-sm ${
                  hasSabats
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {hasSabats ? 'YES' : 'NO'}
              </button>
            </div>

            {hasSabats && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-yellow-500">
                <div>
                  <div className={`text-sm ${textColor}`}>Sabats verified on Title?</div>
                  <div className={`text-xs ${mutedText}`}>Must be recorded on official title</div>
                </div>
                <button
                  onClick={() => setSabatsOnTitle(!sabatsOnTitle)}
                  className={`px-4 py-2 text-sm ${
                    sabatsOnTitle
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {sabatsOnTitle ? 'YES' : 'NO'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className={`text-xs uppercase tracking-widest ${mutedText}`}>
            Compliance Warnings ({warnings.length})
          </h3>
          {warnings.map((warning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 text-sm ${
                warning.includes('CRITICAL') || warning.includes('NO RECONSTRUCTION')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : warning.includes('HIGH')
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                  : `${darkMode ? 'bg-white/5' : 'bg-gray-50'} border ${borderColor} ${textColor}`
              }`}
            >
              {warning}
            </motion.div>
          ))}
        </div>
      )}

      {/* Value Uplift Opportunity */}
      {assessment?.valueUpliftPotential && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-6 border-2 border-green-500 bg-green-500/10"
        >
          <div className={`font-display text-lg ${textColor} mb-2`}>Value Uplift Opportunity</div>
          <p className={`text-sm ${mutedText}`}>
            This property is zoned Residential (H) but your intended use is Hospitality.
            Converting to Zone MH creates significant value. This is the arbitrage that Agenz cannot see.
          </p>
        </motion.div>
      )}
    </div>
  );
}
