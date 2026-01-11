// Street Intelligence Module Types
// For on-the-ground Medina reconnaissance

// ============================================
// STEALTH DATA FIELDS
// Observations without asking the broker
// ============================================

export interface StealthObservation {
  id: string;
  timestamp: Date;
  category: StealthCategory;
  observation: string;
  severity: 'info' | 'warning' | 'critical';
  photosAttached: number;
  gpsCoordinates?: { lat: number; lng: number };
}

export type StealthCategory =
  | 'neighbor_walls'        // Wall condition of adjacent properties
  | 'sabats_cracks'         // Visible cracks in bridges/passages
  | 'street_access'         // Construction vehicle accessibility
  | 'drainage'              // Water drainage patterns
  | 'electrical'            // Visible electrical infrastructure
  | 'roof_condition'        // Neighboring rooftops visible condition
  | 'commercial_activity'   // Nearby commercial operations
  | 'noise_sources'         // Mosques, schools, workshops
  | 'social_dynamics'       // Who watches the street, territorial markers
  | 'other';

export const STEALTH_CATEGORIES: Record<StealthCategory, { label: string; icon: string; prompt: string }> = {
  neighbor_walls: {
    label: 'Neighbor Walls',
    icon: '🧱',
    prompt: 'Condition of shared/adjacent walls? Cracks, leaning, recent repairs?',
  },
  sabats_cracks: {
    label: 'Sabats Condition',
    icon: '🌉',
    prompt: 'Any visible cracks in overhead passages? Structural concerns?',
  },
  street_access: {
    label: 'Street Access',
    icon: '🚚',
    prompt: 'Can construction vehicles reach? Narrowest point in meters?',
  },
  drainage: {
    label: 'Drainage',
    icon: '💧',
    prompt: 'Where does water flow during rain? Any pooling visible?',
  },
  electrical: {
    label: 'Electrical',
    icon: '⚡',
    prompt: 'Visible wiring condition? Proximity to transformer?',
  },
  roof_condition: {
    label: 'Neighboring Roofs',
    icon: '🏠',
    prompt: 'Condition of visible neighboring rooftops? Water tanks, satellite dishes?',
  },
  commercial_activity: {
    label: 'Commerce',
    icon: '🏪',
    prompt: 'Nearby shops, workshops, restaurants? Potential noise/odor sources?',
  },
  noise_sources: {
    label: 'Noise Sources',
    icon: '🔊',
    prompt: 'Distance to mosque, school, workshop? Peak activity times?',
  },
  social_dynamics: {
    label: 'Social Dynamics',
    icon: '👁️',
    prompt: 'Who "owns" this derb? Territorial markers? Moqaddem influence?',
  },
  other: {
    label: 'Other',
    icon: '📝',
    prompt: 'Any other relevant observation',
  },
};

// ============================================
// ADOUL DOCUMENT SCANNER
// OCR for handwritten Arabic Moulkia
// ============================================

export interface MoulkiaDocument {
  id: string;
  scanDate: Date;
  imageUrl: string;
  documentType: 'moulkia' | 'acte_adoulaire' | 'certificat_propriete' | 'other';

  // OCR extracted data
  extractedNames: ExtractedName[];
  propertyDescription?: string;
  dateOnDocument?: string;
  adoulNames?: string[];
  witnessNames?: string[];

  // Verification
  verificationStatus: 'pending' | 'verified' | 'flagged' | 'rejected';
  flaggedIssues: DocumentFlag[];

  // Raw OCR confidence
  ocrConfidence: number; // 0-100
}

export interface ExtractedName {
  arabicName: string;
  latinTransliteration?: string;
  role: 'owner' | 'heir' | 'witness' | 'adoul' | 'unknown';
  presentDuringNegotiation: boolean;
  flagged: boolean;
  flagReason?: string;
}

export interface DocumentFlag {
  type: 'missing_person' | 'name_mismatch' | 'date_inconsistency' | 'suspicious_amendment' | 'illegible_section';
  description: string;
  severity: 'low' | 'medium' | 'high';
  coordinates?: { x: number; y: number; width: number; height: number }; // Region in document
}

// ============================================
// SOCIAL RISK / SAMSAR INTELLIGENCE
// Track broker reliability and territory
// ============================================

export interface SamsarProfile {
  id: string;
  name: string;
  phone?: string;
  territory: string[]; // Neighborhoods they operate in
  reliabilityScore: number; // 0-100

  // Track record
  dealsCompleted: number;
  dealsGoneBad: number;
  knownTactics: SamsarTactic[];

  // Network
  connectedTo: string[]; // Other samsars they work with
  protectedBy?: string; // If they have "protection"

  // Notes
  notes: SamsarNote[];
  lastInteraction?: Date;
}

export type SamsarTactic =
  | 'price_inflation'      // Adds markup without disclosure
  | 'fake_competition'     // Claims other buyers exist
  | 'document_hiding'      // Delays showing real documents
  | 'heir_concealment'     // Doesn't reveal all heirs
  | 'territorial'          // Gets aggressive if you go around them
  | 'reliable'             // Actually trustworthy
  | 'connected'            // Has real government/legal connections
  | 'specialist';          // Expert in specific property types

export const SAMSAR_TACTICS: Record<SamsarTactic, { label: string; color: string; risk: 'positive' | 'neutral' | 'negative' }> = {
  price_inflation: { label: 'Price Inflator', color: 'red', risk: 'negative' },
  fake_competition: { label: 'Fake Competition', color: 'red', risk: 'negative' },
  document_hiding: { label: 'Document Hider', color: 'red', risk: 'negative' },
  heir_concealment: { label: 'Heir Concealer', color: 'red', risk: 'negative' },
  territorial: { label: 'Territorial', color: 'yellow', risk: 'neutral' },
  reliable: { label: 'Reliable', color: 'green', risk: 'positive' },
  connected: { label: 'Connected', color: 'green', risk: 'positive' },
  specialist: { label: 'Specialist', color: 'blue', risk: 'positive' },
};

export interface SamsarNote {
  date: Date;
  note: string;
  interactionType: 'call' | 'meeting' | 'deal' | 'conflict' | 'referral';
}

// ============================================
// STREET INTELLIGENCE REPORT
// Complete field assessment
// ============================================

export interface StreetIntelligenceReport {
  id: string;
  propertyId: string;
  propertyAddress: string;

  // Audit metadata
  auditDate: Date;
  auditorName: string;
  auditNumber: string; // Official-looking reference
  qrCode: string; // For institutional appearance

  // Components
  stealthObservations: StealthObservation[];
  documentScans: MoulkiaDocument[];
  samsarInvolved: SamsarProfile[];

  // Risk assessment
  overallRiskScore: number; // 0-100
  riskFactors: string[];
  recommendations: string[];

  // Institutional stamp
  verificationStatus: 'draft' | 'pending_review' | 'verified' | 'official';
  officialStamp?: string; // Base64 stamp image
}

// Generate official-looking audit number
export function generateAuditNumber(): string {
  const prefix = 'TFT';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

// Calculate overall risk from components
export function calculateStreetRisk(report: StreetIntelligenceReport): number {
  let risk = 0;

  // Stealth observations
  const criticalObs = report.stealthObservations.filter(o => o.severity === 'critical').length;
  const warningObs = report.stealthObservations.filter(o => o.severity === 'warning').length;
  risk += criticalObs * 15 + warningObs * 5;

  // Document flags
  report.documentScans.forEach(doc => {
    const highFlags = doc.flaggedIssues.filter(f => f.severity === 'high').length;
    const medFlags = doc.flaggedIssues.filter(f => f.severity === 'medium').length;
    risk += highFlags * 20 + medFlags * 10;

    // Missing persons during negotiation
    const missingPersons = doc.extractedNames.filter(n => !n.presentDuringNegotiation && n.role === 'owner').length;
    risk += missingPersons * 25;
  });

  // Samsar risk
  report.samsarInvolved.forEach(samsar => {
    const negTactics = samsar.knownTactics.filter(t => SAMSAR_TACTICS[t].risk === 'negative').length;
    risk += negTactics * 10;
    risk += Math.max(0, 50 - samsar.reliabilityScore) / 2;
  });

  return Math.min(100, Math.max(0, risk));
}
