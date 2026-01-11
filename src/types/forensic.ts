// ============================================
// TIFORT: Forensic Data Types
// The Intelligence Schema
// ============================================

// ============================================
// ENUMS
// ============================================

export type OwnershipType = 'titre_foncier' | 'melkia' | 'requisition' | 'unknown';
export type WallComposition = 'tabia' | 'brick' | 'reinforced_concrete' | 'mixed' | 'unknown';
export type PropertyType = 'riad' | 'dar' | 'apartment' | 'villa' | 'terrain' | 'commerce' | 'other';
export type TransactionType = 'sale' | 'rent';
export type PropertyCondition = 'new' | 'renovated' | 'habitable' | 'to_renovate' | 'ruin';
export type DataSource = 'mubawab' | 'avito' | 'field_audit' | 'manual' | 'agent' | 'owner_direct';
export type DealStatus = 'prospect' | 'contacted' | 'visiting' | 'negotiating' | 'due_diligence' | 'offer_made' | 'under_contract' | 'closed' | 'rejected' | 'lost';
export type NeighborhoodTier = 'premium' | 'mid' | 'budget' | 'emerging';

// ============================================
// CATEGORY A: LEGAL "RED-TAPE" (Trust Layer)
// ============================================

export interface LegalProfile {
  id: string;
  propertyId: string;

  // Ownership
  ownershipType: OwnershipType;
  titreFoncierNumber?: string;
  melkiaReference?: string;

  // Heir Risk
  heirCount: number;
  heirCoordinationRisk: boolean; // AUTO: true if heirCount > 5
  heirNotes?: string;

  // VNA (Vocation Non-Agricole)
  vnaStatus: boolean;
  vnaApplicationDate?: Date;
  vnaNotes?: string;

  // Chain of Truth
  legalChainComplete: boolean;
  chainGapYears?: string; // e.g., "1987-1992 missing"
  moulkiaScrollNotes?: string;

  // Disputes
  hasActiveDispute: boolean;
  disputeDetails?: string;

  // Encumbrances
  hasMortgage: boolean;
  mortgageAmount?: number;
  hasLiens: boolean;

  // Calculated
  ownershipScore: number; // 0-100

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CATEGORY B: STRUCTURAL "SORE POINTS"
// ============================================

export interface StructuralAssessment {
  id: string;
  propertyId: string;
  auditDate: Date;
  auditorName?: string;

  // Wall Composition
  wallComposition: WallComposition;
  wallThicknessCm?: number;
  wallNotes?: string;

  // Seismic (2026 Norms)
  hasSeismicChaining: boolean;
  chainageScore: number; // 0-10
  porteurScore: number;  // 0-10
  fissureScore: number;  // 0-10
  seismicNotes?: string;

  // Dampness
  dampnessLevel: number; // 0-10
  capillaryRiseHeightCm?: number;
  dampnessRenovationBuffer: number; // AUTO: 0.20 if dampnessLevel > 7
  dampnessNotes?: string;

  // Verticality
  verticalityDegrees?: number;
  verticalityCritical: boolean; // AUTO: true if > 2.0 degrees

  // Foundations
  foundationDepthCm?: number;
  foundationType?: string;
  tassementScore: number; // 0-10

  // Roof/Terrace
  terraceWaterproof: boolean;
  terrasseScore: number; // 0-10

  // Utilities
  electricalConformity: boolean;
  electricalScore: number; // 0-10
  waterPressureScore: number; // 0-10
  plumbingAgeYears?: number;

  // SHS (Structural Health Score) - 0-100
  shsScore: number;

  // Photos
  photoUrls: string[];

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CATEGORY C: FINANCIAL "COLD TRUTH"
// ============================================

export interface FinancialAnalysis {
  id: string;
  propertyId: string;
  analysisDate: Date;

  // Asking Price
  askingPrice: number;
  askingPricePerSqm: number;
  currency: string;

  // Target Metrics
  targetAdr: number; // Average Daily Rate
  targetOccupancyRate: number; // Default 65%
  suiteCount: number;

  // Renovation
  renovationEstimatePerSqm: number;
  totalRenovationEstimate: number;
  renovationTimelineMonths: number;

  // Acquisition Costs (Morocco 2026)
  notaryFeesRate: number; // 6%
  registrationTaxRate: number; // 4%
  totalAcquisitionCost: number;

  // Yield Calculations
  grossAnnualIncome: number;
  netOperatingIncome: number;
  grossYield: number;
  netYield: number;
  cashOnCashReturn: number;
  paybackYears: number;

  // Exit Strategy
  exitMultiplier: number; // Default 1.20
  projectedExitValue: number;
  titreConversionCost?: number;

  // World Cup 2030 Factor
  distanceToInfrastructureM?: number;
  wc2030AppreciationFactor: number; // AUTO calculated

  // Taxes
  vatRate: number; // 20%
  igtRate: number; // 15%

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MASTER PROPERTY
// ============================================

export interface Property {
  id: string;

  // Source
  source: DataSource;
  sourceId?: string;
  sourceUrl?: string;

  // Basic Info
  title: string;
  description?: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  condition: PropertyCondition;

  // Location
  city: string;
  neighborhood: string;
  address?: string;
  derb?: string;
  latitude?: number;
  longitude?: number;

  // Access
  alleyWidthM?: number;
  alleyLaborBuffer: number; // AUTO: 0.15 if alleyWidthM < 1.5
  distanceToParkingM?: number;

  // Size
  surfaceTotalSqm?: number;
  surfaceHabitableSqm?: number;
  surfaceTerrainSqm?: number;
  floors: number;

  // Features
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  hasPool: boolean;
  hasTerrace: boolean;
  hasPatio: boolean;
  hasParking: boolean;

  // Pricing
  price: number;
  pricePerSqm?: number; // AUTO calculated
  currency: string;
  isNegotiable: boolean;

  // Deal Pipeline
  dealStatus: DealStatus;
  dealNotes?: string;
  rejectionReason?: string;

  // Media
  images: string[];

  // Timestamps
  listedAt?: Date;
  scrapedAt: Date;
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;

  isActive: boolean;

  // Related Data (joins)
  legal?: LegalProfile;
  structural?: StructuralAssessment;
  financial?: FinancialAnalysis;
}

// ============================================
// INTELLIGENCE VIEW
// ============================================

export interface PropertyIntelligence {
  id: string;
  title: string;
  neighborhood: string;
  price: number;
  pricePerSqm: number;
  surfaceTotalSqm: number;
  dealStatus: DealStatus;

  // Scores
  legalScore: number;
  ownershipType: OwnershipType;
  heirCoordinationRisk: boolean;
  vnaStatus: boolean;

  structuralScore: number;
  dampnessRenovationBuffer: number;
  verticalityCritical: boolean;

  netYield: number;
  paybackYears: number;
  wc2030AppreciationFactor: number;

  // TRUST SCORE (0-100)
  trustScore: number;

  // INTELLIGENCE FLAGS
  flagUnderpricedArbitrage: boolean;
  flagAccessCostBuffer: boolean;
  flagWc2030Proximity: boolean;
  flagHeirRisk: boolean;
  flagDampnessCritical: boolean;
  flagTitreConversionOpportunity: boolean;
}

// ============================================
// NEIGHBORHOOD
// ============================================

export interface Neighborhood {
  id: string;
  name: string;
  nameAr?: string;
  city: string;

  centerLat: number;
  centerLng: number;

  tier: NeighborhoodTier;
  medina: boolean;

  avgPricePerSqm: number;
  medianPricePerSqm: number;
  listingCount: number;

  touristDensity: 'high' | 'medium' | 'low';
  renovationDifficulty: 'easy' | 'moderate' | 'difficult';
  accessRating: number; // 1-5

  distanceToStadiumM?: number;
  distanceToTrainM?: number;

  updatedAt: Date;
}

// ============================================
// INTELLIGENCE FLAGS CONFIG
// ============================================

export const INTELLIGENCE_RULES = {
  // The Laksour Filter
  LAKSOUR_UNDERPRICED_THRESHOLD: 18000, // MAD/m²

  // Access Alert
  NARROW_ALLEY_THRESHOLD: 1.5, // meters
  NARROW_ALLEY_LABOR_BUFFER: 0.15, // 15%

  // Dampness Alert
  DAMPNESS_CRITICAL_THRESHOLD: 7,
  DAMPNESS_RENOVATION_BUFFER: 0.20, // 20%

  // Heir Risk
  HEIR_HIGH_RISK_THRESHOLD: 5,

  // World Cup 2030
  WC2030_PROXIMITY_TIERS: {
    TIER_1: { distance: 500, appreciation: 0.05 },
    TIER_2: { distance: 1000, appreciation: 0.03 },
    TIER_3: { distance: 2000, appreciation: 0.015 },
  },

  // Titre Conversion Opportunity
  TITRE_CONVERSION_PRICE_THRESHOLD: 15000, // MAD/m²

  // Trust Score Weights
  TRUST_SCORE_WEIGHTS: {
    legal: 0.40,
    structural: 0.35,
    financial: 0.25,
  },

  // Morocco 2026 Tax Rates
  TAXES: {
    VAT: 0.20,
    IGT: 0.15,
    NOTARY: 0.06,
    REGISTRATION: 0.04,
  },
} as const;
