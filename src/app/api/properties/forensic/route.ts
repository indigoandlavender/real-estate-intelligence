import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Forensic data - requires authentication
interface ForensicData {
  propertyId: string;
  trustScore: number;
  structural: {
    seismicChaining: boolean;
    pillarTilt: number;
    humidity: number;
    sharedWalls: string;
    structuralScore: number;
  };
  legal: {
    titleType: string;
    heirCount: number;
    vnaStatus: string;
    taxClearance: string;
    insuranceStatus: string;
    legalScore: number;
  };
  medinaZoning?: {
    vocationCode: string;
    volumeCompliance: {
      patioCompliant: boolean;
      heightCompliant: boolean;
      neighborWindowHigher: boolean;
    };
    wc2030AuditRisk: 'low' | 'medium' | 'high';
    complianceWarnings: string[];
    landAudit?: {
      droitDeReconstruction: boolean;
      archaeologicalRisk: string;
      hasSabats: boolean;
      sabatsOnTitle: boolean;
    };
  };
  financial: {
    totalAcquisitionCost: number;
    grossAnnualRevenue: number;
    netAfterTax: number;
    netYield: number;
    foundValue: number;
  };
}

// Sample forensic data
const FORENSIC_DATA: Record<string, ForensicData> = {
  'laksour-280': {
    propertyId: 'laksour-280',
    trustScore: 82,
    structural: {
      seismicChaining: true,
      pillarTilt: 0.8,
      humidity: 4,
      sharedWalls: 'Stable',
      structuralScore: 85,
    },
    legal: {
      titleType: 'Titre Foncier',
      heirCount: 1,
      vnaStatus: 'Approved',
      taxClearance: 'Quitus obtained',
      insuranceStatus: 'Valid until 2026',
      legalScore: 92,
    },
    medinaZoning: {
      vocationCode: 'MH',
      volumeCompliance: {
        patioCompliant: true,
        heightCompliant: true,
        neighborWindowHigher: false,
      },
      wc2030AuditRisk: 'low',
      complianceWarnings: [],
    },
    financial: {
      totalAcquisitionCost: 6500000,
      grossAnnualRevenue: 720000,
      netAfterTax: 520000,
      netYield: 8.0,
      foundValue: 2800000,
    },
  },
  'mouassine-120': {
    propertyId: 'mouassine-120',
    trustScore: 75,
    structural: {
      seismicChaining: true,
      pillarTilt: 1.2,
      humidity: 5,
      sharedWalls: 'Stable',
      structuralScore: 78,
    },
    legal: {
      titleType: 'Melkia',
      heirCount: 3,
      vnaStatus: 'Pending',
      taxClearance: 'Pending verification',
      insuranceStatus: 'Valid until 2025',
      legalScore: 68,
    },
    medinaZoning: {
      vocationCode: 'H',
      volumeCompliance: {
        patioCompliant: true,
        heightCompliant: true,
        neighborWindowHigher: true,
      },
      wc2030AuditRisk: 'high',
      complianceWarnings: [
        'CRITICAL: Property operating as Guest House in Residential zone. WC2030 audit risk is HIGH.',
        'Terrace Privacy Compromised: Neighboring window is higher than terrace level. Value impact: -10-15%.',
      ],
    },
    financial: {
      totalAcquisitionCost: 4200000,
      grossAnnualRevenue: 480000,
      netAfterTax: 340000,
      netYield: 8.1,
      foundValue: 1200000,
    },
  },
  'kasbah-180': {
    propertyId: 'kasbah-180',
    trustScore: 91,
    structural: {
      seismicChaining: true,
      pillarTilt: 0.5,
      humidity: 3,
      sharedWalls: 'Independent',
      structuralScore: 94,
    },
    legal: {
      titleType: 'Titre Foncier',
      heirCount: 1,
      vnaStatus: 'Approved',
      taxClearance: 'Quitus obtained',
      insuranceStatus: 'Valid until 2027',
      legalScore: 98,
    },
    medinaZoning: {
      vocationCode: 'MH',
      volumeCompliance: {
        patioCompliant: true,
        heightCompliant: true,
        neighborWindowHigher: false,
      },
      wc2030AuditRisk: 'low',
      complianceWarnings: [],
    },
    financial: {
      totalAcquisitionCost: 6800000,
      grossAnnualRevenue: 840000,
      netAfterTax: 620000,
      netYield: 9.1,
      foundValue: 3400000,
    },
  },
};

// Valid access tokens (in production, use a proper auth system)
const VALID_TOKENS = ['MELKIA2026', 'FORENSIC_VIEWER_2026'];

function validateToken(token: string | null): boolean {
  if (!token) return false;
  return VALID_TOKENS.includes(token);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('id');

  // Check authentication via cookie or header
  const cookieStore = cookies();
  const forensicCookie = cookieStore.get('forensic-access');
  const authHeader = request.headers.get('x-forensic-token');

  const isAuthenticated =
    validateToken(forensicCookie?.value || null) ||
    validateToken(authHeader);

  if (!isAuthenticated) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid forensic access token required. Set cookie "forensic-access" or header "x-forensic-token".',
      },
      { status: 401 }
    );
  }

  if (!propertyId) {
    return NextResponse.json(
      { error: 'Property ID required', message: 'Provide ?id=property-id' },
      { status: 400 }
    );
  }

  const forensicData = FORENSIC_DATA[propertyId];

  if (!forensicData) {
    return NextResponse.json(
      { error: 'Not found', message: 'Forensic data not available for this property' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    data: forensicData,
  });
}
