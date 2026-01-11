'use client';

interface InvestorPDFProps {
  data: {
    propertyName: string;
    neighborhood: string;
    trustScore: number;
    netYield: number;
    investmentGrade: string;
    titleType: string;
    heirCount: number;
    vnaStatus: boolean;
    pillarTilt: number;
    humidity: number;
    seismicChaining: boolean;
    surfaceSqm: number;
    askingPrice: number;
    renovationEstimate: number;
    totalAcquisitionCost: number;
    grossAnnualRevenue: number;
    netAfterTax: number;
    foundValue: number;
    suiteCount: number;
    roomRate: number;
    occupancyRate: number;
  };
  onClose: () => void;
}

export default function InvestorPDF({ data, onClose }: InvestorPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  const getTrustColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  const getGradeLabel = () => {
    if (data.investmentGrade === 'institutional') return 'INSTITUTIONAL GRADE';
    if (data.investmentGrade === 'moderate') return 'MODERATE RETURN';
    return 'LIFESTYLE ASSET';
  };

  const getVerificationBadge = () => {
    if (data.trustScore >= 70 && data.netYield >= 8) return 'GOLD-VERIFIED';
    if (data.trustScore >= 50 && data.netYield >= 5) return 'SILVER-VERIFIED';
    return 'UNDER REVIEW';
  };

  const projectedValue2030 = data.totalAcquisitionCost * 1.35; // 35% appreciation by WC2030

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          {/* Close Button */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Investor One-Pager</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500"
              >
                Export PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>

          {/* PDF Content */}
          <div className="print-area p-8 bg-white text-gray-900">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Property Assessment Report</div>
                <h1 className="text-2xl font-bold mt-1">{data.propertyName || 'Untitled Property'}</h1>
                <div className="text-gray-600">{data.neighborhood}, Marrakech</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">TIFORT-VERIFY</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                  getVerificationBadge() === 'GOLD-VERIFIED'
                    ? 'bg-amber-100 text-amber-800'
                    : getVerificationBadge() === 'SILVER-VERIFIED'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {getVerificationBadge()}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Executive Summary</div>
              <p className="text-gray-800">
                {data.neighborhood} property with {data.trustScore}/100 Trust Score and {data.netYield.toFixed(1)}% projected net yield.
                {data.surfaceSqm}m² {data.titleType === 'titre_foncier' ? 'titled' : 'Melkia'} asset
                with {data.suiteCount} suite potential at {data.roomRate} MAD/night ADR.
              </p>
            </div>

            {/* Scoreboard */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Trust Score */}
              <div className="text-center p-6 border-2 rounded-xl" style={{ borderColor: getTrustColor(data.trustScore) }}>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Trust Score</div>
                <div className="text-5xl font-bold mt-2" style={{ color: getTrustColor(data.trustScore) }}>
                  {data.trustScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">/ 100</div>
              </div>

              {/* Net Yield */}
              <div className={`text-center p-6 border-2 rounded-xl ${
                data.investmentGrade === 'institutional'
                  ? 'border-green-500'
                  : data.investmentGrade === 'lifestyle'
                  ? 'border-red-500'
                  : 'border-yellow-500'
              }`}>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Net Yield</div>
                <div className={`text-5xl font-bold mt-2 ${
                  data.investmentGrade === 'institutional'
                    ? 'text-green-600'
                    : data.investmentGrade === 'lifestyle'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                  {data.netYield.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">{getGradeLabel()}</div>
              </div>
            </div>

            {/* Technical Audit */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-3">
                Builder's Notes (Structural Audit)
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Seismic Chaining</span>
                  <span className={data.seismicChaining ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {data.seismicChaining ? '✓ Present' : '✗ Absent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pillar Tilt</span>
                  <span className={data.pillarTilt <= 2 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {data.pillarTilt}° {data.pillarTilt <= 2 ? '(Safe)' : '(Critical)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity Level</span>
                  <span className={data.humidity <= 7 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {data.humidity}/10 {data.humidity <= 7 ? '(Acceptable)' : '(High)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Surface</span>
                  <span className="font-medium">{data.surfaceSqm} m²</span>
                </div>
              </div>
            </div>

            {/* Legal Roadmap */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-3">
                Legal Roadmap
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status</span>
                  <span className={`font-medium ${
                    data.titleType === 'titre_foncier' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {data.titleType === 'titre_foncier' ? 'Titre Foncier (Secure)' :
                     data.titleType === 'melkia' ? 'Melkia (Regularization Required)' :
                     data.titleType === 'requisition' ? 'Requisition (In Process)' : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heir Count</span>
                  <span className={`font-medium ${data.heirCount > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {data.heirCount} {data.heirCount > 5 ? '(High Risk)' : '(Manageable)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VNA Status</span>
                  <span className={`font-medium ${data.vnaStatus ? 'text-green-600' : 'text-amber-600'}`}>
                    {data.vnaStatus ? 'Approved' : 'Pending'}
                  </span>
                </div>
                {data.titleType === 'melkia' && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
                    <strong>Regularization Path:</strong> 6-18 months via Adoul → Conservation Foncière → Titre Foncier.
                    Estimated cost: 3-5% of property value.
                  </div>
                )}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-3">
                Financial Analysis (PLF 2026)
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-2">Acquisition</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price</span>
                      <span>{data.askingPrice.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closing (7%)</span>
                      <span>{Math.round(data.askingPrice * 0.07).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Renovation</span>
                      <span>{data.renovationEstimate.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t">
                      <span>Total Investment</span>
                      <span>{Math.round(data.totalAcquisitionCost).toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-2">Annual Returns</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Revenue</span>
                      <span>{Math.round(data.grossAnnualRevenue).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OpEx (35%)</span>
                      <span className="text-red-600">-{Math.round(data.grossAnnualRevenue * 0.35).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (15%)</span>
                      <span className="text-red-600">-{Math.round(data.grossAnnualRevenue * 0.65 * 0.15).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t text-green-600">
                      <span>Net After Tax</span>
                      <span>{Math.round(data.netAfterTax).toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exit Strategy */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">
                Exit Strategy (World Cup 2030)
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="flex justify-between">
                  <span>Projected Value (2030)</span>
                  <span className="font-bold">{Math.round(projectedValue2030).toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Appreciation</span>
                  <span className="font-bold text-green-600">+{Math.round(projectedValue2030 - data.totalAcquisitionCost).toLocaleString()} MAD</span>
                </div>
                {data.titleType === 'melkia' && data.foundValue > 0 && (
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span>Title Regularization "Found Value"</span>
                    <span className="font-bold text-purple-600">+{Math.round(data.foundValue).toLocaleString()} MAD</span>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-4 border-t text-[9px] text-gray-500 leading-relaxed">
              <strong>Note de Confidentialité et Clause de Non-Responsabilité (PLF 2026) :</strong> Ce rapport est généré par la plateforme TIFORT-VERIFY. Les données techniques (Score SHS) sont basées sur une inspection visuelle effectuée par un professionnel du bâtiment à une date précise et ne constituent pas une garantie décennale. Les projections financières sont basées sur les taux d'imposition du Projet de Loi de Finances (PLF) 2026 et les rendements moyens du quartier de Laksour ; elles ne garantissent pas les revenus futurs. La vérification juridique des titres (Melkia/Titre) doit être confirmée par un Adoul ou un Notaire avant toute transaction finale.
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
              <span>TIFORT-VERIFY • Forensic Real Estate Intelligence</span>
              <span>tifort.vercel.app</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
