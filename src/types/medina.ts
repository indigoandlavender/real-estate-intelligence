// Medina-specific types for PAV 2026 Zoning and Compliance

export type VocationCode = 'MH' | 'H' | 'P' | 'C';

export interface VocationZone {
  code: VocationCode;
  name: string;
  meaning: string;
  implications: string;
  riskLevel: 'low' | 'medium' | 'high';
  licenseEase: 'easy' | 'moderate' | 'difficult' | 'restricted';
}

export const VOCATION_ZONES: Record<VocationCode, VocationZone> = {
  MH: {
    code: 'MH',
    name: 'Zone Maison d\'Hôte',
    meaning: 'Commercial/Tourism',
    implications: 'Pre-approved for Guest House licenses. High liquidity. Optimal for hospitality investment.',
    riskLevel: 'low',
    licenseEase: 'easy',
  },
  H: {
    code: 'H',
    name: 'Zone Habitat',
    meaning: 'Residential Only',
    implications: 'Commercial license for hotel is extremely difficult. Red tape heavy. Lower immediate value for hospitality.',
    riskLevel: 'high',
    licenseEase: 'difficult',
  },
  P: {
    code: 'P',
    name: 'Zone à Protéger',
    meaning: 'Historic Monument',
    implications: 'UNESCO-style oversight. Cannot modify without approval. High "Cost of Truth" for renovations.',
    riskLevel: 'high',
    licenseEase: 'restricted',
  },
  C: {
    code: 'C',
    name: 'Zone de Commerce',
    meaning: 'Souks/Bazaars',
    implications: 'Ground floor must remain commercial. Excellent for "Riad + Shop" arbitrage strategy.',
    riskLevel: 'medium',
    licenseEase: 'moderate',
  },
};

// Coefficient Trap - Medina Volume Rules
export interface MedinaVolumeCompliance {
  patioOpen: boolean; // 70/30 Rule - patio must be open
  coveredPatioArea: number; // If any covered, what percentage
  buildingHeight: number; // In meters
  nearestMinaretHeight: number; // Height ceiling reference (typically 7.5-8m)
  neighborWindowHigher: boolean; // Privacy compromise check
  heightCompliant: boolean;
  patioCompliant: boolean;
}

// Medina Land/Ruins Audit
export interface MedinaLandAudit {
  propertyType: 'empty_land' | 'ruins' | 'douiria' | 'reconstruction';
  droitDeReconstruction: boolean; // Certificate proving previous structure
  reconstructionCertificateDate?: string;
  archaeologicalRisk: 'none' | 'low' | 'medium' | 'high';
  archaeologicalBuffer: number; // Percentage added to timeline (0-30)
  hasSabats: boolean; // Bridge over street
  sabatsOnTitle: boolean; // Verified on the title
  greenSpaceOnly: boolean; // If no reconstruction rights
}

// Complete Medina Zoning Assessment
export interface MedinaZoningAssessment {
  vocationCode: VocationCode;
  vocationZone: VocationZone;
  volumeCompliance: MedinaVolumeCompliance;
  landAudit?: MedinaLandAudit;
  currentUse: 'residential' | 'commercial' | 'hospitality' | 'mixed' | 'vacant';
  intendedUse: 'residential' | 'commercial' | 'hospitality' | 'mixed';
  complianceIssues: string[];
  valueUpliftPotential: boolean; // Can convert H to MH?
  wc2030AuditRisk: 'low' | 'medium' | 'high';
}

// Zoning Score Calculation
export function calculateMedinaZoningScore(assessment: MedinaZoningAssessment): number {
  let score = 100;

  // Vocation Code impact
  switch (assessment.vocationCode) {
    case 'MH':
      score -= 0; // Best case
      break;
    case 'H':
      score -= 25; // Significant penalty for residential-only
      break;
    case 'P':
      score -= 35; // High restriction penalty
      break;
    case 'C':
      score -= 10; // Minor penalty for commercial requirement
      break;
  }

  // Volume compliance
  if (!assessment.volumeCompliance.patioCompliant) {
    score -= 20; // Non-compliant patio is serious
  }
  if (!assessment.volumeCompliance.heightCompliant) {
    score -= 15;
  }
  if (assessment.volumeCompliance.neighborWindowHigher) {
    score -= 10; // Privacy issue
  }

  // Use mismatch (WC2030 audit risk)
  if (assessment.currentUse === 'hospitality' && assessment.vocationCode === 'H') {
    score -= 30; // Operating illegally - high risk
  }

  // Land audit penalties
  if (assessment.landAudit) {
    if (!assessment.landAudit.droitDeReconstruction) {
      score -= 40; // No reconstruction rights is critical
    }
    if (assessment.landAudit.archaeologicalRisk === 'high') {
      score -= 15;
    } else if (assessment.landAudit.archaeologicalRisk === 'medium') {
      score -= 8;
    }
    if (assessment.landAudit.hasSabats && !assessment.landAudit.sabatsOnTitle) {
      score -= 20; // Sabats not on title - samsar trick
    }
  }

  return Math.max(0, Math.min(100, score));
}

// Generate compliance warnings
export function getMedinaComplianceWarnings(assessment: MedinaZoningAssessment): string[] {
  const warnings: string[] = [];

  // Vocation warnings
  if (assessment.vocationCode === 'H' && assessment.intendedUse === 'hospitality') {
    warnings.push('Zone Habitat (H): Commercial guest house license will require lengthy administrative conversion. Budget 18-24 months.');
  }
  if (assessment.vocationCode === 'P') {
    warnings.push('Zone à Protéger: All renovations require UNESCO-style oversight. Expect 40-60% higher renovation costs and extended timelines.');
  }

  // Current vs intended use
  if (assessment.currentUse === 'hospitality' && assessment.vocationCode === 'H') {
    warnings.push('CRITICAL: Property operating as Guest House in Residential zone. WC2030 audit risk is HIGH. License may be revoked.');
  }

  // Volume compliance
  if (!assessment.volumeCompliance.patioCompliant) {
    warnings.push('70/30 Rule Violation: Patio is covered beyond legal limit. Non-compliant for insurance and titling.');
  }
  if (!assessment.volumeCompliance.heightCompliant) {
    warnings.push(`Height Ceiling Exceeded: Building height (${assessment.volumeCompliance.buildingHeight}m) exceeds minaret reference (${assessment.volumeCompliance.nearestMinaretHeight}m).`);
  }
  if (assessment.volumeCompliance.neighborWindowHigher) {
    warnings.push('Terrace Privacy Compromised: Neighboring window is higher than terrace level. Value impact: -10-15%.');
  }

  // Land/Ruins warnings
  if (assessment.landAudit) {
    if (!assessment.landAudit.droitDeReconstruction) {
      warnings.push('NO RECONSTRUCTION RIGHTS: Seller cannot prove prior structure. Property may only be used as green space.');
    }
    if (assessment.landAudit.archaeologicalRisk !== 'none') {
      warnings.push(`Archaeological Risk: ${assessment.landAudit.archaeologicalRisk.toUpperCase()}. Add ${assessment.landAudit.archaeologicalBuffer}% to project timeline for potential excavation delays.`);
    }
    if (assessment.landAudit.hasSabats && !assessment.landAudit.sabatsOnTitle) {
      warnings.push('SABATS TRAP: Property claims to own bridge/passage over street but it is NOT on the title. Common samsar trick.');
    }
  }

  return warnings;
}
