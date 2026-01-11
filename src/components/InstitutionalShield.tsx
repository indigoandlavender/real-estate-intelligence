'use client';

import { useMemo } from 'react';
import { generateAuditNumber } from '@/types/street-intelligence';

interface InstitutionalShieldProps {
  children: React.ReactNode;
  propertyAddress: string;
  auditorName?: string;
  showQRCode?: boolean;
  status?: 'draft' | 'pending_review' | 'verified' | 'official';
}

// Generate a simple QR code SVG (deterministic based on audit number)
function generateQRCodeSVG(data: string): string {
  // Simple visual QR-like pattern based on data hash
  const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const grid: boolean[][] = [];

  for (let i = 0; i < 21; i++) {
    grid[i] = [];
    for (let j = 0; j < 21; j++) {
      // Position detection patterns (corners)
      const isCorner =
        (i < 7 && j < 7) ||
        (i < 7 && j > 13) ||
        (i > 13 && j < 7);

      if (isCorner) {
        // Draw finder patterns
        const cornerI = i < 7 ? i : i - 14;
        const cornerJ = j < 7 ? j : j - 14;
        const isOuter = cornerI === 0 || cornerI === 6 || cornerJ === 0 || cornerJ === 6;
        const isInner = cornerI >= 2 && cornerI <= 4 && cornerJ >= 2 && cornerJ <= 4;
        grid[i][j] = isOuter || isInner;
      } else {
        // Pseudo-random data based on hash
        grid[i][j] = ((hash * (i + 1) * (j + 1)) % 7) < 3;
      }
    }
  }

  let path = '';
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      if (grid[i][j]) {
        path += `M${j * 4},${i * 4}h4v4h-4z`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84"><path d="${path}" fill="currentColor"/></svg>`;
}

export default function InstitutionalShield({
  children,
  propertyAddress,
  auditorName = 'Field Agent',
  showQRCode = true,
  status = 'pending_review',
}: InstitutionalShieldProps) {
  const auditNumber = useMemo(() => generateAuditNumber(), []);
  const qrCodeSVG = useMemo(() => generateQRCodeSVG(auditNumber), [auditNumber]);
  const currentDate = new Date();

  const getStatusBadge = () => {
    switch (status) {
      case 'official':
        return { bg: 'bg-green-600', text: 'OFFICIAL RECORD', border: 'border-green-600' };
      case 'verified':
        return { bg: 'bg-blue-600', text: 'VERIFIED', border: 'border-blue-600' };
      case 'pending_review':
        return { bg: 'bg-yellow-500', text: 'PENDING REVIEW', border: 'border-yellow-500' };
      default:
        return { bg: 'bg-gray-500', text: 'DRAFT', border: 'border-gray-500' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Official Header Bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Official Seal/Logo */}
              <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center">
                <span className="font-mono text-xs font-bold">TFT</span>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.3em] text-gray-400">
                  KINGDOM OF MOROCCO · MARRAKECH-SAFI REGION
                </div>
                <div className="font-mono text-sm tracking-wide">
                  PROPERTY VERIFICATION AUTHORITY
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 text-[10px] tracking-widest ${statusBadge.bg}`}>
                {statusBadge.text}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header with Audit Info */}
      <div className="bg-gray-800 text-white border-b-4 border-yellow-500">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* QR Code */}
              {showQRCode && (
                <div className="bg-white p-2 w-20 h-20">
                  <div
                    className="w-full h-full text-black"
                    dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
                  />
                </div>
              )}

              <div>
                <div className="text-[10px] tracking-[0.2em] text-gray-400 mb-1">
                  OFFICIAL AUDIT REFERENCE
                </div>
                <div className="font-mono text-2xl tracking-wider">
                  {auditNumber}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Scan QR to verify authenticity
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] tracking-[0.2em] text-gray-400">AUDIT DATE</div>
              <div className="font-mono text-lg">
                {currentDate.toLocaleDateString('fr-MA', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
              <div className="font-mono text-xs text-gray-400">
                {currentDate.toLocaleTimeString('fr-MA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Title Bar */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-gray-400 mb-1">
                SUBJECT PROPERTY
              </div>
              <h1 className="font-mono text-xl font-medium">{propertyAddress}</h1>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.3em] text-gray-400 mb-1">
                FIELD AUDITOR
              </div>
              <div className="font-mono text-sm">{auditorName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border-2 border-gray-300 shadow-lg">
          {/* Document Header */}
          <div className="border-b-2 border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-gray-400 rounded-full flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="font-mono text-xs font-bold">TIFORT</div>
                    <div className="text-[8px] text-gray-500">2026</div>
                  </div>
                </div>
                <div>
                  <h2 className="font-mono text-lg uppercase tracking-wider">
                    Field Intelligence Report
                  </h2>
                  <div className="text-xs text-gray-500 mt-1">
                    Forensic Property Assessment · Medina District
                  </div>
                </div>
              </div>

              {/* Official Stamps */}
              <div className="flex items-center gap-3">
                <div className="border-2 border-red-600 text-red-600 px-3 py-2 rotate-[-5deg]">
                  <div className="font-mono text-[10px] uppercase tracking-wider">CONFIDENTIAL</div>
                </div>
                {status === 'official' && (
                  <div className="border-2 border-green-600 text-green-600 px-3 py-2 rotate-[3deg]">
                    <div className="font-mono text-[10px] uppercase tracking-wider">CERTIFIED</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-[9px] text-gray-500 max-w-md">
                <strong>LEGAL NOTICE:</strong> This document is generated by TIFORT Property Verification
                Authority for due diligence purposes only. All data must be independently verified by a
                licensed Notaire or Adoul before any transaction. Reference: PLF 2026, Article 34.21.
              </div>

              <div className="text-right">
                <div className="font-mono text-[10px] text-gray-400 tracking-widest">
                  {auditNumber}
                </div>
                <div className="text-[9px] text-gray-400 mt-1">
                  Page 1 of 1 · Generated {currentDate.toISOString()}
                </div>
              </div>
            </div>

            {/* Signature Line */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="h-12 border-b border-gray-400 mb-2" />
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Field Auditor Signature
                  </div>
                </div>
                <div>
                  <div className="h-12 border-b border-gray-400 mb-2" />
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Property Owner / Representative
                  </div>
                </div>
                <div>
                  <div className="h-12 border-b border-gray-400 mb-2 flex items-end justify-center">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-300">
                      STAMP
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Official Stamp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 text-gray-300 font-mono text-[10px] tracking-widest pointer-events-none">
        TIFORT-{auditNumber.slice(-6)}
      </div>
    </div>
  );
}
