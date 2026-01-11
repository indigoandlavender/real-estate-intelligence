// ============================================
// TIFORT: Intelligence Calculations
// The Logic Listeners
// ============================================

import { INTELLIGENCE_RULES } from '@/types/forensic';

// Input types for calculations
interface LegalInput {
  ownershipType: 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
  heirCount: number;
  vnaStatus: boolean;
  legalChainComplete: boolean;
  hasActiveDispute: boolean;
  hasMortgage: boolean;
  hasLiens: boolean;
}

interface StructuralInput {
  chainageScore: number;
  porteurScore: number;
  fissureScore: number;
  dampnessLevel: number;
  terraceScore: number;
  verticalityDegrees?: number;
}

interface FinancialInput {
  netYield: number;
  askingPricePerSqm: number;
  distanceToInfrastructureM?: number;
}

interface PropertyInput {
  neighborhood: string;
  alleyWidthM?: number;
  pricePerSqm: number;
  ownershipType?: 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
}

// ============================================
// SCORE CALCULATIONS
// ============================================

export function calculateOwnershipScore(ownershipType: LegalInput['ownershipType']): number {
  switch (ownershipType) {
    case 'titre_foncier': return 100;
    case 'requisition': return 70;
    case 'melkia': return 50;
    default: return 20;
  }
}

export function calculateLegalScore(input: LegalInput): number {
  let score = calculateOwnershipScore(input.ownershipType);

  // Deductions
  if (input.heirCount > INTELLIGENCE_RULES.HEIR_HIGH_RISK_THRESHOLD) {
    score -= 15;
  }
  if (!input.vnaStatus && input.ownershipType !== 'titre_foncier') {
    score -= 10;
  }
  if (!input.legalChainComplete) {
    score -= 20;
  }
  if (input.hasActiveDispute) {
    score -= 30;
  }
  if (input.hasMortgage) {
    score -= 10;
  }
  if (input.hasLiens) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateSHSScore(input: StructuralInput): number {
  // Weighted SHS calculation matching schema.sql
  const score =
    (input.chainageScore || 5) * 3 +  // 30%
    (input.porteurScore || 5) * 2 +   // 20%
    (input.fissureScore || 5) * 2 +   // 20%
    (10 - (input.dampnessLevel || 5)) * 2 + // 20%
    (input.terraceScore || 5) * 1;    // 10%

  return Math.max(0, Math.min(100, score));
}

export function calculateTrustScore(
  legalScore: number,
  structuralScore: number,
  netYield: number
): number {
  const weights = INTELLIGENCE_RULES.TRUST_SCORE_WEIGHTS;
  const financialComponent = Math.min(netYield * 10, 100);

  return Math.round(
    (legalScore * weights.legal) +
    (structuralScore * weights.structural) +
    (financialComponent * weights.financial)
  );
}

// ============================================
// INTELLIGENCE FLAGS
// ============================================

export function flagUnderpricedArbitrage(input: PropertyInput): boolean {
  return (
    input.neighborhood === 'Laksour' &&
    input.pricePerSqm < INTELLIGENCE_RULES.LAKSOUR_UNDERPRICED_THRESHOLD
  );
}

export function flagAccessCostBuffer(alleyWidthM?: number): boolean {
  if (!alleyWidthM) return false;
  return alleyWidthM < INTELLIGENCE_RULES.NARROW_ALLEY_THRESHOLD;
}

export function calculateAlleyLaborBuffer(alleyWidthM?: number): number {
  if (!alleyWidthM) return 0;
  return alleyWidthM < INTELLIGENCE_RULES.NARROW_ALLEY_THRESHOLD
    ? INTELLIGENCE_RULES.NARROW_ALLEY_LABOR_BUFFER
    : 0;
}

export function flagDampnessCritical(dampnessLevel: number): boolean {
  return dampnessLevel > INTELLIGENCE_RULES.DAMPNESS_CRITICAL_THRESHOLD;
}

export function calculateDampnessRenovationBuffer(dampnessLevel: number): number {
  return dampnessLevel > INTELLIGENCE_RULES.DAMPNESS_CRITICAL_THRESHOLD
    ? INTELLIGENCE_RULES.DAMPNESS_RENOVATION_BUFFER
    : 0;
}

export function flagHeirRisk(heirCount: number): boolean {
  return heirCount > INTELLIGENCE_RULES.HEIR_HIGH_RISK_THRESHOLD;
}

export function flagVerticalityCritical(verticalityDegrees?: number): boolean {
  if (!verticalityDegrees) return false;
  return verticalityDegrees > 2.0;
}

export function flagWC2030Proximity(distanceToInfrastructureM?: number): boolean {
  if (!distanceToInfrastructureM) return false;
  return distanceToInfrastructureM < INTELLIGENCE_RULES.WC2030_PROXIMITY_TIERS.TIER_1.distance;
}

export function calculateWC2030AppreciationFactor(distanceToInfrastructureM?: number): number {
  if (!distanceToInfrastructureM) return 0;

  const tiers = INTELLIGENCE_RULES.WC2030_PROXIMITY_TIERS;

  if (distanceToInfrastructureM < tiers.TIER_1.distance) {
    return tiers.TIER_1.appreciation;
  }
  if (distanceToInfrastructureM < tiers.TIER_2.distance) {
    return tiers.TIER_2.appreciation;
  }
  if (distanceToInfrastructureM < tiers.TIER_3.distance) {
    return tiers.TIER_3.appreciation;
  }
  return 0;
}

export function flagTitreConversionOpportunity(input: PropertyInput): boolean {
  return (
    input.ownershipType === 'melkia' &&
    input.pricePerSqm < INTELLIGENCE_RULES.TITRE_CONVERSION_PRICE_THRESHOLD
  );
}

// ============================================
// FINANCIAL CALCULATIONS
// ============================================

export function calculateGrossAnnualIncome(
  targetAdr: number,
  suiteCount: number,
  occupancyRate: number = 0.65
): number {
  return targetAdr * suiteCount * 365 * occupancyRate;
}

export function calculateTotalAcquisitionCost(
  askingPrice: number,
  renovationEstimate: number
): number {
  const taxes = INTELLIGENCE_RULES.TAXES;
  const notaryFees = askingPrice * taxes.NOTARY;
  const registrationTax = askingPrice * taxes.REGISTRATION;
  return askingPrice + renovationEstimate + notaryFees + registrationTax;
}

export function calculateNetOperatingIncome(
  grossIncome: number,
  operatingExpenseRatio: number = 0.35
): number {
  return grossIncome * (1 - operatingExpenseRatio);
}

export function calculateGrossYield(
  grossAnnualIncome: number,
  totalAcquisitionCost: number
): number {
  if (totalAcquisitionCost === 0) return 0;
  return (grossAnnualIncome / totalAcquisitionCost) * 100;
}

export function calculateNetYield(
  netOperatingIncome: number,
  totalAcquisitionCost: number
): number {
  if (totalAcquisitionCost === 0) return 0;
  return (netOperatingIncome / totalAcquisitionCost) * 100;
}

export function calculatePaybackYears(
  totalAcquisitionCost: number,
  netOperatingIncome: number
): number {
  if (netOperatingIncome === 0) return Infinity;
  return totalAcquisitionCost / netOperatingIncome;
}

export function calculateProjectedExitValue(
  totalAcquisitionCost: number,
  exitMultiplier: number = 1.20,
  wc2030Factor: number = 0
): number {
  return totalAcquisitionCost * exitMultiplier * (1 + wc2030Factor);
}

// ============================================
// COMPLETE INTELLIGENCE REPORT
// ============================================

export interface IntelligenceReport {
  trustScore: number;
  legalScore: number;
  structuralScore: number;
  financialScore: number;

  flags: {
    underpricedArbitrage: boolean;
    accessCostBuffer: boolean;
    wc2030Proximity: boolean;
    heirRisk: boolean;
    dampnessCritical: boolean;
    verticalityCritical: boolean;
    titreConversionOpportunity: boolean;
  };

  buffers: {
    alleyLaborBuffer: number;
    dampnessRenovationBuffer: number;
    wc2030AppreciationFactor: number;
  };

  financials: {
    grossAnnualIncome: number;
    netOperatingIncome: number;
    totalAcquisitionCost: number;
    grossYield: number;
    netYield: number;
    paybackYears: number;
    projectedExitValue: number;
  };
}

export function generateIntelligenceReport(
  property: PropertyInput,
  legal: LegalInput | null,
  structural: StructuralInput | null,
  financial: FinancialInput | null
): IntelligenceReport {
  // Calculate scores
  const legalScore = legal ? calculateLegalScore(legal) : 50;
  const structuralScore = structural ? calculateSHSScore(structural) : 50;
  const netYield = financial?.netYield || 5;
  const trustScore = calculateTrustScore(legalScore, structuralScore, netYield);

  // Generate flags
  const flags = {
    underpricedArbitrage: flagUnderpricedArbitrage(property),
    accessCostBuffer: flagAccessCostBuffer(property.alleyWidthM),
    wc2030Proximity: flagWC2030Proximity(financial?.distanceToInfrastructureM),
    heirRisk: legal ? flagHeirRisk(legal.heirCount) : false,
    dampnessCritical: structural ? flagDampnessCritical(structural.dampnessLevel) : false,
    verticalityCritical: structural ? flagVerticalityCritical(structural.verticalityDegrees) : false,
    titreConversionOpportunity: flagTitreConversionOpportunity(property),
  };

  // Calculate buffers
  const buffers = {
    alleyLaborBuffer: calculateAlleyLaborBuffer(property.alleyWidthM),
    dampnessRenovationBuffer: structural
      ? calculateDampnessRenovationBuffer(structural.dampnessLevel)
      : 0,
    wc2030AppreciationFactor: calculateWC2030AppreciationFactor(
      financial?.distanceToInfrastructureM
    ),
  };

  return {
    trustScore,
    legalScore,
    structuralScore,
    financialScore: Math.min(netYield * 10, 100),
    flags,
    buffers,
    financials: {
      grossAnnualIncome: 0,
      netOperatingIncome: 0,
      totalAcquisitionCost: 0,
      grossYield: 0,
      netYield,
      paybackYears: 0,
      projectedExitValue: 0,
    },
  };
}
