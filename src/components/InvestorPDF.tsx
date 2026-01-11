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

  const projectedValue2030 = data.totalAcquisitionCost * 1.35;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print">
        <div className="bg-[#faf9f7] max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-[#faf9f7] border-b border-gray-200 p-5 flex justify-between items-center">
            <h2 className="font-display text-lg tracking-widest">Investor Report</h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800"
              >
                Export
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="print-area p-8 bg-[#faf9f7] text-black">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-black pb-6 mb-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Property Assessment</div>
                <h1 className="font-display text-2xl tracking-wide mt-1">{data.propertyName || 'Untitled'}</h1>
                <div className="text-sm text-gray-500 mt-1">{data.neighborhood}, Marrakech</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Melkia 2.0</div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="text-center py-8 border border-gray-200">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Trust Score</div>
                <div className="font-display text-5xl mt-2">{data.trustScore}</div>
              </div>
              <div className="text-center py-8 border border-gray-200">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Net Yield</div>
                <div className="font-display text-5xl mt-2">{data.netYield.toFixed(1)}%</div>
              </div>
            </div>

            {/* Structural Audit */}
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Structural Audit</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Seismic Chaining</span>
                  <span>{data.seismicChaining ? 'Present' : 'Absent'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Pillar Tilt</span>
                  <span>{data.pillarTilt}°</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Humidity</span>
                  <span>{data.humidity}/10</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Surface</span>
                  <span>{data.surfaceSqm} m²</span>
                </div>
              </div>
            </div>

            {/* Legal Status */}
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Legal Status</div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Title</span>
                  <span>
                    {data.titleType === 'titre_foncier' ? 'Titre Foncier' :
                     data.titleType === 'melkia' ? 'Melkia' :
                     data.titleType === 'requisition' ? 'Requisition' : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Heirs</span>
                  <span>{data.heirCount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">VNA</span>
                  <span>{data.vnaStatus ? 'Approved' : 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Financial Analysis</div>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <div className="text-xs text-gray-400 uppercase mb-3">Acquisition</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purchase</span>
                      <span>{data.askingPrice.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Closing (7%)</span>
                      <span>{Math.round(data.askingPrice * 0.07).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Renovation</span>
                      <span>{data.renovationEstimate.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                      <span>Total</span>
                      <span>{Math.round(data.totalAcquisitionCost).toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase mb-3">Annual Returns</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gross</span>
                      <span>{Math.round(data.grossAnnualRevenue).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OpEx (35%)</span>
                      <span>-{Math.round(data.grossAnnualRevenue * 0.35).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax (15%)</span>
                      <span>-{Math.round(data.grossAnnualRevenue * 0.65 * 0.15).toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                      <span>Net</span>
                      <span>{Math.round(data.netAfterTax).toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exit */}
            <div className="mb-8 p-6 border border-gray-200">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Exit Strategy 2030</div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Projected Value</span>
                  <span className="font-medium">{Math.round(projectedValue2030).toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Appreciation</span>
                  <span className="font-medium">+{Math.round(projectedValue2030 - data.totalAcquisitionCost).toLocaleString()} MAD</span>
                </div>
                {data.titleType === 'melkia' && data.foundValue > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Title Arbitrage</span>
                    <span className="font-medium">+{Math.round(data.foundValue).toLocaleString()} MAD</span>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-10 pt-6 border-t border-gray-200 text-[9px] text-gray-400 leading-relaxed">
              <strong>PLF 2026:</strong> Ce rapport est a titre indicatif. Les projections financieres sont basees sur les taux du Projet de Loi de Finances 2026. La verification juridique doit etre confirmee par un Adoul ou Notaire avant transaction.
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
              <span>Melkia 2.0</span>
              <span>melkia.vercel.app</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
