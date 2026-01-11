// Empty Land / Raw Development Types
// Zoning codes, coefficients, TNB tax, and build potential

// ============================================
// ZONING CODES
// ============================================

export type ZoningCode = 'SD1' | 'GH2' | 'SA1' | 'S1' | 'D1';

export interface ZoningSpec {
  code: ZoningCode;
  name: string;
  description: string;
  cesPercent: number;      // Ground Coverage (Coefficient d'Emprise au Sol)
  cos: number;             // Floor Area Ratio (Coefficient d'Occupation du Sol)
  maxFloors: number;
  minPlotSize: number;     // m²
  typicalUse: string[];
}

export const ZONING_SPECS: Record<ZoningCode, ZoningSpec> = {
  SD1: {
    code: 'SD1',
    name: 'Secteur de Villas',
    description: 'Low-density villa zone. Individual luxury homes.',
    cesPercent: 5,
    cos: 0.07,
    maxFloors: 2,
    minPlotSize: 1000,
    typicalUse: ['Private Villas', 'Guest Houses', 'Luxury Residential'],
  },
  GH2: {
    code: 'GH2',
    name: 'Groupement d\'Habitation',
    description: 'Medium-density collective housing.',
    cesPercent: 40,
    cos: 1.2,
    maxFloors: 4,
    minPlotSize: 250,
    typicalUse: ['Apartment Buildings', 'Residential Complexes', 'Mixed Residential'],
  },
  SA1: {
    code: 'SA1',
    name: 'Secteur d\'Activité Touristique',
    description: 'Tourist activity zone. Hotels and resorts.',
    cesPercent: 30,
    cos: 0.60,
    maxFloors: 3,
    minPlotSize: 2000,
    typicalUse: ['Boutique Hotels', 'Resorts', 'Tourist Complexes'],
  },
  S1: {
    code: 'S1',
    name: 'Secteur Services',
    description: 'Commercial and service activities.',
    cesPercent: 50,
    cos: 1.5,
    maxFloors: 5,
    minPlotSize: 500,
    typicalUse: ['Offices', 'Commercial', 'Mixed-Use'],
  },
  D1: {
    code: 'D1',
    name: 'Secteur Industriel',
    description: 'Light industrial and logistics.',
    cesPercent: 60,
    cos: 0.8,
    maxFloors: 2,
    minPlotSize: 1000,
    typicalUse: ['Warehouses', 'Light Manufacturing', 'Logistics'],
  },
};

// ============================================
// TNB TAX (Taxe sur les Terrains Non Bâtis)
// 2026 Marrakech Rates
// ============================================

export type InfrastructureLevel = 'equipped' | 'semi_equipped' | 'low_equipped';

export interface TNBRates {
  level: InfrastructureLevel;
  minRate: number;  // MAD/m²
  maxRate: number;  // MAD/m²
  description: string;
}

export const TNB_RATES_2026: Record<InfrastructureLevel, TNBRates> = {
  equipped: {
    level: 'equipped',
    minRate: 15,
    maxRate: 30,
    description: 'Full infrastructure: paved roads, water, electricity, sewer, fiber',
  },
  semi_equipped: {
    level: 'semi_equipped',
    minRate: 5,
    maxRate: 15,
    description: 'Partial infrastructure: some utilities, unpaved roads',
  },
  low_equipped: {
    level: 'low_equipped',
    minRate: 0.5,
    maxRate: 2,
    description: 'Minimal infrastructure: no paved roads, limited utilities',
  },
};

// ============================================
// UTILITY VERIFICATION
// ============================================

export interface UtilityVerification {
  waterGrid: boolean;
  waterGridDistance?: number;      // meters to nearest connection
  electricGrid: boolean;
  electricGridDistance?: number;
  fiberOptics: boolean;
  fiberOpticsDistance?: number;
  sewer: boolean;
  sewerDistance?: number;
  pavedRoadAccess: boolean;
  roadWidth?: number;              // meters
}

export function determineInfrastructureLevel(utilities: UtilityVerification): InfrastructureLevel {
  const utilityCount = [
    utilities.waterGrid,
    utilities.electricGrid,
    utilities.sewer,
    utilities.pavedRoadAccess,
  ].filter(Boolean).length;

  if (utilityCount >= 3 && utilities.pavedRoadAccess) return 'equipped';
  if (utilityCount >= 2) return 'semi_equipped';
  return 'low_equipped';
}

// ============================================
// VNA STATUS (Vocation Non-Agricole)
// For rural land / land outside urban perimeter
// ============================================

export type VNAStatus = 'acquired' | 'pending' | 'non_eligible' | 'not_required';

export interface VNADetails {
  status: VNAStatus;
  applicationDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  restrictions?: string[];
}

// ============================================
// BILL 34.21 COMPLIANCE
// Infrastructure deadline for subdivisions
// ============================================

export interface Bill3421Compliance {
  isSubdivision: boolean;
  subdivisionApprovalDate?: Date;
  infrastructureDeadline?: Date;    // 5 years from approval
  infrastructureComplete: boolean;
  daysRemaining?: number;
  complianceStatus: 'compliant' | 'warning' | 'violation' | 'not_applicable';
}

export function calculateBill3421Status(
  isSubdivision: boolean,
  approvalDate?: Date,
  infrastructureComplete?: boolean
): Bill3421Compliance {
  if (!isSubdivision) {
    return {
      isSubdivision: false,
      infrastructureComplete: false,
      complianceStatus: 'not_applicable',
    };
  }

  if (!approvalDate) {
    return {
      isSubdivision: true,
      infrastructureComplete: infrastructureComplete || false,
      complianceStatus: 'warning',
    };
  }

  const deadline = new Date(approvalDate);
  deadline.setFullYear(deadline.getFullYear() + 5);

  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let complianceStatus: Bill3421Compliance['complianceStatus'];
  if (infrastructureComplete) {
    complianceStatus = 'compliant';
  } else if (daysRemaining < 0) {
    complianceStatus = 'violation';
  } else if (daysRemaining < 365) {
    complianceStatus = 'warning';
  } else {
    complianceStatus = 'compliant';
  }

  return {
    isSubdivision: true,
    subdivisionApprovalDate: approvalDate,
    infrastructureDeadline: deadline,
    infrastructureComplete: infrastructureComplete || false,
    daysRemaining: Math.max(0, daysRemaining),
    complianceStatus,
  };
}

// ============================================
// BUILD POTENTIAL CALCULATOR
// The Alpha Engine
// ============================================

export interface BuildPotentialInput {
  plotSize: number;               // m²
  zoningCode: ZoningCode;
  pricePerSqmLand: number;        // MAD
  pricePerSqmBuilt: number;       // MAD (estimated value of built space)
  constructionCostPerSqm: number; // MAD
}

export interface BuildPotentialOutput {
  zoningSpec: ZoningSpec;

  // Ground coverage
  maxFootprint: number;           // m²
  footprintPercent: number;

  // Floor area
  maxFloorArea: number;           // m² total buildable
  floorsByFloor: number[];        // m² per floor

  // Units (for GH2)
  maxUnits?: number;
  unitSizeEstimate?: number;      // m² per unit

  // Rooms (for SA1)
  maxRooms?: number;
  roomSizeEstimate?: number;      // m² per room

  // Financial
  landValue: number;              // MAD
  constructionCost: number;       // MAD
  totalInvestment: number;        // MAD
  projectedBuiltValue: number;    // MAD
  builtValueAlpha: number;        // MAD (profit potential)
  alphaPercent: number;           // %

  // Summary
  summaryText: string;
}

export function calculateBuildPotential(input: BuildPotentialInput): BuildPotentialOutput {
  const spec = ZONING_SPECS[input.zoningCode];

  // Calculate ground coverage
  const maxFootprint = input.plotSize * (spec.cesPercent / 100);
  const footprintPercent = spec.cesPercent;

  // Calculate total floor area
  const maxFloorArea = input.plotSize * spec.cos;

  // Calculate floor by floor
  const floorsByFloor: number[] = [];
  let remainingArea = maxFloorArea;
  for (let i = 0; i < spec.maxFloors && remainingArea > 0; i++) {
    const floorArea = Math.min(maxFootprint, remainingArea);
    floorsByFloor.push(Math.round(floorArea));
    remainingArea -= floorArea;
  }

  // Calculate units for GH2 (collective housing)
  let maxUnits: number | undefined;
  let unitSizeEstimate: number | undefined;
  if (input.zoningCode === 'GH2') {
    unitSizeEstimate = 80; // Average apartment size
    maxUnits = Math.floor(maxFloorArea / unitSizeEstimate);
  }

  // Calculate rooms for SA1 (tourist)
  let maxRooms: number | undefined;
  let roomSizeEstimate: number | undefined;
  if (input.zoningCode === 'SA1') {
    roomSizeEstimate = 35; // Average hotel room including common areas
    maxRooms = Math.floor(maxFloorArea / roomSizeEstimate);
  }

  // Financial calculations
  const landValue = input.plotSize * input.pricePerSqmLand;
  const constructionCost = maxFloorArea * input.constructionCostPerSqm;
  const totalInvestment = landValue + constructionCost;
  const projectedBuiltValue = maxFloorArea * input.pricePerSqmBuilt;
  const builtValueAlpha = projectedBuiltValue - totalInvestment;
  const alphaPercent = totalInvestment > 0 ? (builtValueAlpha / totalInvestment) * 100 : 0;

  // Generate summary
  let summaryText = `${spec.name} (${spec.code}): `;
  if (input.zoningCode === 'GH2' && maxUnits) {
    summaryText += `Potential for ${maxUnits} apartments (${Math.round(maxFloorArea)}m² buildable)`;
  } else if (input.zoningCode === 'SA1' && maxRooms) {
    summaryText += `Potential for ${maxRooms}-room boutique hotel (${Math.round(maxFloorArea)}m² buildable)`;
  } else if (input.zoningCode === 'SD1') {
    summaryText += `Luxury villa site with ${Math.round(maxFootprint)}m² footprint (${Math.round(maxFloorArea)}m² buildable)`;
  } else {
    summaryText += `${Math.round(maxFloorArea)}m² buildable over ${spec.maxFloors} floors`;
  }

  return {
    zoningSpec: spec,
    maxFootprint: Math.round(maxFootprint),
    footprintPercent,
    maxFloorArea: Math.round(maxFloorArea),
    floorsByFloor,
    maxUnits,
    unitSizeEstimate,
    maxRooms,
    roomSizeEstimate,
    landValue: Math.round(landValue),
    constructionCost: Math.round(constructionCost),
    totalInvestment: Math.round(totalInvestment),
    projectedBuiltValue: Math.round(projectedBuiltValue),
    builtValueAlpha: Math.round(builtValueAlpha),
    alphaPercent: Math.round(alphaPercent * 10) / 10,
    summaryText,
  };
}

// ============================================
// TNB TAX CALCULATOR
// Annual carrying cost for unbuilt land
// ============================================

export interface TNBCalculation {
  plotSize: number;
  infrastructureLevel: InfrastructureLevel;
  appliedRate: number;        // MAD/m²
  annualTax: number;          // MAD
  monthlyCarrying: number;    // MAD
  fiveYearCost: number;       // MAD (total holding cost)
}

export function calculateTNB(
  plotSize: number,
  infrastructureLevel: InfrastructureLevel,
  ratePosition: 'min' | 'mid' | 'max' = 'mid'
): TNBCalculation {
  const rates = TNB_RATES_2026[infrastructureLevel];

  let appliedRate: number;
  switch (ratePosition) {
    case 'min':
      appliedRate = rates.minRate;
      break;
    case 'max':
      appliedRate = rates.maxRate;
      break;
    default:
      appliedRate = (rates.minRate + rates.maxRate) / 2;
  }

  const annualTax = plotSize * appliedRate;
  const monthlyCarrying = annualTax / 12;
  const fiveYearCost = annualTax * 5;

  return {
    plotSize,
    infrastructureLevel,
    appliedRate,
    annualTax: Math.round(annualTax),
    monthlyCarrying: Math.round(monthlyCarrying),
    fiveYearCost: Math.round(fiveYearCost),
  };
}

// ============================================
// COMPLETE LAND ASSESSMENT
// ============================================

export interface LandAssessment {
  // Basic info
  plotSize: number;
  location: string;
  zoningCode: ZoningCode;

  // Title
  titleType: 'titre_foncier' | 'melkia' | 'requisition';
  heirCount: number;

  // VNA
  vnaDetails: VNADetails;

  // Utilities
  utilities: UtilityVerification;
  infrastructureLevel: InfrastructureLevel;

  // Bill 34.21
  bill3421: Bill3421Compliance;

  // TNB
  tnbCalculation: TNBCalculation;

  // Build Potential
  buildPotential: BuildPotentialOutput;

  // Well (for rural land)
  hasWell: boolean;
  wellRegistered: boolean;
  wellAuthorizationNumber?: string;

  // Risk Score
  landRiskScore: number;
  riskFactors: string[];
}

export function calculateLandRiskScore(assessment: Partial<LandAssessment>): { score: number; factors: string[] } {
  let score = 100;
  const factors: string[] = [];

  // Title risk
  if (assessment.titleType === 'melkia') {
    score -= 20;
    factors.push('Melkia title: 6-18 months to convert');
  } else if (assessment.titleType === 'requisition') {
    score -= 10;
    factors.push('Requisition in progress');
  }

  // Heir risk
  if (assessment.heirCount && assessment.heirCount > 3) {
    score -= 15;
    factors.push(`Multiple heirs (${assessment.heirCount}): Coordination risk`);
  }

  // VNA risk
  if (assessment.vnaDetails?.status === 'pending') {
    score -= 15;
    factors.push('VNA pending: Cannot build until approved');
  } else if (assessment.vnaDetails?.status === 'non_eligible') {
    score -= 40;
    factors.push('VNA non-eligible: Major development restriction');
  }

  // Infrastructure risk
  if (assessment.infrastructureLevel === 'low_equipped') {
    score -= 10;
    factors.push('Low infrastructure: Additional development costs');
  }

  // Bill 34.21 risk
  if (assessment.bill3421?.complianceStatus === 'violation') {
    score -= 30;
    factors.push('Bill 34.21 VIOLATION: Infrastructure deadline passed');
  } else if (assessment.bill3421?.complianceStatus === 'warning') {
    score -= 15;
    factors.push(`Bill 34.21 WARNING: ${assessment.bill3421.daysRemaining} days to deadline`);
  }

  // Well risk (rural land)
  if (assessment.hasWell === false) {
    score -= 20;
    factors.push('No well: -40% value for agricultural/rural land');
  } else if (assessment.hasWell && !assessment.wellRegistered) {
    score -= 10;
    factors.push('Unregistered well: Authorization required');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
  };
}
