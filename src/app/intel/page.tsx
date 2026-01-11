'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import InstitutionalShield from '@/components/InstitutionalShield';
import StealthDataFields from '@/components/StealthDataFields';
import AdoulDocumentScanner from '@/components/AdoulDocumentScanner';
import SamsarTracker from '@/components/SamsarTracker';
import {
  StealthObservation,
  MoulkiaDocument,
  SamsarProfile,
  SamsarNote,
  calculateStreetRisk,
  StreetIntelligenceReport,
} from '@/types/street-intelligence';

type ActiveTab = 'stealth' | 'documents' | 'samsars' | 'summary';

export default function StreetIntelligencePage() {
  const [propertyAddress, setPropertyAddress] = useState('Derb Laksour 42, Marrakech Medina');
  const [auditorName, setAuditorName] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('stealth');

  // Data state
  const [observations, setObservations] = useState<StealthObservation[]>([]);
  const [documents, setDocuments] = useState<MoulkiaDocument[]>([]);
  const [samsars, setSamsars] = useState<SamsarProfile[]>([]);

  // Handlers
  const handleAddObservation = useCallback((obs: Omit<StealthObservation, 'id' | 'timestamp'>) => {
    setObservations(prev => [...prev, {
      ...obs,
      id: `obs-${Date.now()}`,
      timestamp: new Date(),
    }]);
  }, []);

  const handleRemoveObservation = useCallback((id: string) => {
    setObservations(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleScanDocument = useCallback((doc: Omit<MoulkiaDocument, 'id' | 'scanDate'>) => {
    setDocuments(prev => [...prev, {
      ...doc,
      id: `doc-${Date.now()}`,
      scanDate: new Date(),
    }]);
  }, []);

  const handleUpdateDocumentName = useCallback((docId: string, nameIndex: number, present: boolean) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;

      const newNames = [...doc.extractedNames];
      newNames[nameIndex] = { ...newNames[nameIndex], presentDuringNegotiation: present };

      // Update flags
      const newFlags = doc.flaggedIssues.filter(f =>
        !(f.type === 'missing_person' && f.description.includes(newNames[nameIndex].arabicName))
      );

      if (!present && newNames[nameIndex].role === 'owner') {
        newFlags.push({
          type: 'missing_person',
          description: `Owner "${newNames[nameIndex].latinTransliteration || newNames[nameIndex].arabicName}" not present during negotiation`,
          severity: 'high',
        });
        newNames[nameIndex].flagged = true;
        newNames[nameIndex].flagReason = 'Not present during negotiation';
      } else {
        newNames[nameIndex].flagged = false;
        newNames[nameIndex].flagReason = undefined;
      }

      return {
        ...doc,
        extractedNames: newNames,
        flaggedIssues: newFlags,
        verificationStatus: newFlags.length > 0 ? 'flagged' : 'pending',
      };
    }));
  }, []);

  const handleAddSamsar = useCallback((samsar: Omit<SamsarProfile, 'id'>) => {
    setSamsars(prev => [...prev, { ...samsar, id: `sam-${Date.now()}` }]);
  }, []);

  const handleUpdateSamsar = useCallback((id: string, updates: Partial<SamsarProfile>) => {
    setSamsars(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleAddSamsarNote = useCallback((samsarId: string, note: Omit<SamsarNote, 'date'>) => {
    setSamsars(prev => prev.map(s =>
      s.id === samsarId
        ? { ...s, notes: [...s.notes, { ...note, date: new Date() }] }
        : s
    ));
  }, []);

  // Calculate risk
  const report: StreetIntelligenceReport = {
    id: `report-${Date.now()}`,
    propertyId: 'current',
    propertyAddress,
    auditDate: new Date(),
    auditorName: auditorName || 'Field Agent',
    auditNumber: 'TFT-AUTO',
    qrCode: '',
    stealthObservations: observations,
    documentScans: documents,
    samsarInvolved: samsars,
    overallRiskScore: 0,
    riskFactors: [],
    recommendations: [],
    verificationStatus: 'draft',
  };

  const riskScore = calculateStreetRisk(report);

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'text-red-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 60) return 'HIGH RISK';
    if (score >= 30) return 'MODERATE RISK';
    return 'LOW RISK';
  };

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: 'stealth', label: 'Stealth', count: observations.length },
    { key: 'documents', label: 'Documents', count: documents.length },
    { key: 'samsars', label: 'Samsars', count: samsars.length },
    { key: 'summary', label: 'Summary', count: 0 },
  ];

  return (
    <InstitutionalShield
      propertyAddress={propertyAddress}
      auditorName={auditorName || 'Field Agent'}
      showQRCode={true}
      status="pending_review"
    >
      {/* Property Input */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              Property Address
            </label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 font-mono text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              Field Auditor Name
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 border border-gray-300 font-mono text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Risk Score Banner */}
      <div className={`mb-6 p-6 border-2 ${
        riskScore >= 60 ? 'border-red-600 bg-red-50' :
        riskScore >= 30 ? 'border-yellow-500 bg-yellow-50' :
        'border-green-600 bg-green-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-gray-500">STREET RISK ASSESSMENT</div>
            <div className={`font-mono text-4xl mt-1 ${getRiskColor(riskScore)}`}>
              {riskScore}
              <span className="text-lg">/100</span>
            </div>
          </div>
          <div className={`px-4 py-2 font-mono text-sm uppercase tracking-widest ${
            riskScore >= 60 ? 'bg-red-600 text-white' :
            riskScore >= 30 ? 'bg-yellow-500 text-black' :
            'bg-green-600 text-white'
          }`}>
            {getRiskLabel(riskScore)}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="font-mono text-xl">{observations.filter(o => o.severity === 'critical').length}</div>
            <div className="text-[9px] text-gray-500 uppercase">Critical Obs</div>
          </div>
          <div>
            <div className="font-mono text-xl">{documents.reduce((a, d) => a + d.flaggedIssues.filter(f => f.severity === 'high').length, 0)}</div>
            <div className="text-[9px] text-gray-500 uppercase">Doc Flags</div>
          </div>
          <div>
            <div className="font-mono text-xl">
              {documents.reduce((a, d) => a + d.extractedNames.filter(n => n.role === 'owner' && !n.presentDuringNegotiation).length, 0)}
            </div>
            <div className="text-[9px] text-gray-500 uppercase">Missing Owners</div>
          </div>
          <div>
            <div className="font-mono text-xl">
              {Math.round(samsars.length > 0 ? samsars.reduce((a, s) => a + s.reliabilityScore, 0) / samsars.length : 0)}
            </div>
            <div className="text-[9px] text-gray-500 uppercase">Avg Samsar Trust</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 text-center font-mono text-xs uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.key
                ? 'border-black text-black bg-gray-50'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stealth' && (
        <StealthDataFields
          observations={observations}
          onAdd={handleAddObservation}
          onRemove={handleRemoveObservation}
        />
      )}

      {activeTab === 'documents' && (
        <AdoulDocumentScanner
          documents={documents}
          onScan={handleScanDocument}
          onUpdateName={handleUpdateDocumentName}
        />
      )}

      {activeTab === 'samsars' && (
        <SamsarTracker
          samsars={samsars}
          onAdd={handleAddSamsar}
          onUpdate={handleUpdateSamsar}
          onAddNote={handleAddSamsarNote}
        />
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Summary Report */}
          <div className="border-2 border-gray-900 bg-white">
            <div className="bg-gray-900 text-white px-6 py-4">
              <div className="text-[10px] tracking-[0.3em] text-gray-400">INTELLIGENCE SUMMARY</div>
              <h3 className="font-mono text-lg tracking-wide">FIELD REPORT</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Stealth Summary */}
              <div>
                <div className="text-[10px] tracking-widest text-gray-500 mb-3">STEALTH OBSERVATIONS</div>
                {observations.length === 0 ? (
                  <div className="text-sm text-gray-400">No observations recorded</div>
                ) : (
                  <div className="space-y-2">
                    {observations.filter(o => o.severity !== 'info').map((obs) => (
                      <div
                        key={obs.id}
                        className={`p-3 text-sm ${
                          obs.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                          'bg-yellow-50 border-l-4 border-yellow-500'
                        }`}
                      >
                        <div className="font-mono text-[10px] uppercase text-gray-500 mb-1">
                          {obs.category.replace('_', ' ')} · {obs.severity}
                        </div>
                        {obs.observation}
                      </div>
                    ))}
                    <div className="text-xs text-gray-400 mt-2">
                      + {observations.filter(o => o.severity === 'info').length} info-level observations
                    </div>
                  </div>
                )}
              </div>

              {/* Document Summary */}
              <div>
                <div className="text-[10px] tracking-widest text-gray-500 mb-3">DOCUMENT ANALYSIS</div>
                {documents.length === 0 ? (
                  <div className="text-sm text-gray-400">No documents scanned</div>
                ) : (
                  <div className="space-y-2">
                    {documents.flatMap(doc =>
                      doc.flaggedIssues.filter(f => f.severity === 'high').map((flag, idx) => (
                        <div key={`${doc.id}-${idx}`} className="p-3 bg-red-50 border-l-4 border-red-500 text-sm">
                          <div className="font-mono text-[10px] uppercase text-gray-500 mb-1">
                            {flag.type.replace('_', ' ')}
                          </div>
                          {flag.description}
                        </div>
                      ))
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {documents.length} document(s) scanned · {documents.reduce((a, d) => a + d.extractedNames.length, 0)} names extracted
                    </div>
                  </div>
                )}
              </div>

              {/* Samsar Summary */}
              <div>
                <div className="text-[10px] tracking-widest text-gray-500 mb-3">BROKER INTELLIGENCE</div>
                {samsars.length === 0 ? (
                  <div className="text-sm text-gray-400">No samsars tracked</div>
                ) : (
                  <div className="space-y-2">
                    {samsars.map((samsar) => (
                      <div key={samsar.id} className="p-3 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm">{samsar.name}</div>
                          <div className={`font-mono text-sm ${
                            samsar.reliabilityScore >= 70 ? 'text-green-600' :
                            samsar.reliabilityScore >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {samsar.reliabilityScore}/100
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {samsar.territory.join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-[10px] tracking-widest text-gray-500 mb-3">RECOMMENDATIONS</div>
                <div className="space-y-2 text-sm">
                  {riskScore >= 60 && (
                    <div className="p-3 bg-red-100 text-red-800">
                      <strong>HIGH RISK:</strong> Do not proceed without resolving critical issues.
                      Missing owner presence and document flags must be cleared.
                    </div>
                  )}
                  {documents.some(d => d.extractedNames.some(n => n.role === 'owner' && !n.presentDuringNegotiation)) && (
                    <div className="p-3 bg-yellow-100 text-yellow-800">
                      <strong>OWNER VERIFICATION:</strong> Request face-to-face meeting with all
                      property owners listed on the Moulkia before proceeding.
                    </div>
                  )}
                  {observations.some(o => o.category === 'neighbor_walls' && o.severity !== 'info') && (
                    <div className="p-3 bg-yellow-100 text-yellow-800">
                      <strong>STRUCTURAL:</strong> Commission independent structural survey
                      focusing on shared walls and neighbor conditions.
                    </div>
                  )}
                  {samsars.some(s => s.reliabilityScore < 40) && (
                    <div className="p-3 bg-yellow-100 text-yellow-800">
                      <strong>BROKER RISK:</strong> Low-reliability samsar involved. Consider
                      finding alternative broker or proceeding with extreme caution.
                    </div>
                  )}
                  {riskScore < 30 && (
                    <div className="p-3 bg-green-100 text-green-800">
                      <strong>PROCEED:</strong> No critical issues detected. Standard due diligence
                      recommended with Notaire/Adoul verification.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/assess"
              className="px-6 py-3 border border-gray-300 font-mono text-xs uppercase tracking-widest hover:bg-gray-50"
            >
              Trust Calculator
            </Link>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-black text-white font-mono text-xs uppercase tracking-widest hover:bg-gray-800"
            >
              Print Report
            </button>
          </div>
        </div>
      )}
    </InstitutionalShield>
  );
}
