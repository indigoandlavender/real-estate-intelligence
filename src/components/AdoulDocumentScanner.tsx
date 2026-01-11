'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoulkiaDocument,
  ExtractedName,
  DocumentFlag,
} from '@/types/street-intelligence';

interface AdoulDocumentScannerProps {
  documents: MoulkiaDocument[];
  onScan: (document: Omit<MoulkiaDocument, 'id' | 'scanDate'>) => void;
  onUpdateName: (docId: string, nameIndex: number, present: boolean) => void;
}

// Simulated OCR extraction (in production, use Tesseract.js or cloud OCR API)
const simulateOCR = async (imageFile: File): Promise<{
  names: ExtractedName[];
  confidence: number;
  documentType: MoulkiaDocument['documentType'];
}> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return mock extracted data
  return {
    names: [
      { arabicName: 'محمد بن علي', latinTransliteration: 'Mohamed Ben Ali', role: 'owner', presentDuringNegotiation: false, flagged: false },
      { arabicName: 'فاطمة الزهراء', latinTransliteration: 'Fatima Zahra', role: 'heir', presentDuringNegotiation: false, flagged: false },
      { arabicName: 'أحمد العدول', latinTransliteration: 'Ahmed Al-Adoul', role: 'adoul', presentDuringNegotiation: false, flagged: false },
      { arabicName: 'عبد الكريم', latinTransliteration: 'Abdelkarim', role: 'witness', presentDuringNegotiation: false, flagged: false },
    ],
    confidence: 78,
    documentType: 'moulkia',
  };
};

export default function AdoulDocumentScanner({ documents, onScan, onUpdateName }: AdoulDocumentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Start scanning
    setIsScanning(true);
    setScanProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await simulateOCR(file);

      clearInterval(progressInterval);
      setScanProgress(100);

      // Check for flags
      const flags: DocumentFlag[] = [];
      const extractedNames = result.names.map(name => {
        // Flag owners not present
        if (name.role === 'owner' && !name.presentDuringNegotiation) {
          flags.push({
            type: 'missing_person',
            description: `Owner "${name.latinTransliteration || name.arabicName}" not present during negotiation`,
            severity: 'high',
          });
          return { ...name, flagged: true, flagReason: 'Not present during negotiation' };
        }
        return name;
      });

      onScan({
        imageUrl: previewImage || '',
        documentType: result.documentType,
        extractedNames,
        ocrConfidence: result.confidence,
        verificationStatus: flags.length > 0 ? 'flagged' : 'pending',
        flaggedIssues: flags,
      });

      // Reset after short delay
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
        setPreviewImage(null);
      }, 1000);
    } catch {
      clearInterval(progressInterval);
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getRoleColor = (role: ExtractedName['role']) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800 border-red-300';
      case 'heir': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'adoul': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'witness': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="border-2 border-gray-900 bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-gray-400">DOCUMENT FORENSICS</div>
            <h3 className="font-mono text-lg tracking-wide">ADOUL SCANNER</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-2xl">{documents.length}</div>
              <div className="text-[10px] tracking-widest text-gray-400">SCANNED</div>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-right">
              <div className="font-mono text-2xl text-red-400">
                {documents.reduce((acc, d) => acc + d.flaggedIssues.length, 0)}
              </div>
              <div className="text-[10px] tracking-widest text-gray-400">FLAGS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Interface */}
      <div className="p-6 border-b border-gray-200">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!isScanning && !previewImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-gray-300 hover:border-black transition-all group"
          >
            <div className="text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📸</div>
              <div className="font-mono text-sm uppercase tracking-widest">Scan Moulkia Document</div>
              <div className="text-xs text-gray-500 mt-2">
                Supports Arabic handwritten deeds, Acte Adoulaire, and property certificates
              </div>
            </div>
          </button>
        ) : (
          <div className="relative">
            {previewImage && (
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={previewImage}
                  alt="Document preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <div className="text-white font-mono text-sm mb-4">
                  PROCESSING ARABIC OCR...
                </div>
                <div className="w-64 h-2 bg-gray-700 overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="text-green-400 font-mono text-xs mt-2">{scanProgress}%</div>

                {/* Scanning animation */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-green-400/50"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanned Documents */}
      <div className="max-h-[500px] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">📜</div>
            <div className="text-sm">No documents scanned</div>
            <div className="text-xs mt-1">Scan Moulkia documents to extract owner names</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4">
                {/* Document Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      doc.verificationStatus === 'flagged' ? 'bg-red-500' :
                      doc.verificationStatus === 'verified' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-mono text-sm">
                        {doc.documentType.toUpperCase().replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(doc.scanDate).toLocaleDateString('fr-MA')} · Confidence: {doc.ocrConfidence}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {doc.flaggedIssues.length > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-mono">
                        {doc.flaggedIssues.length} FLAGS
                      </span>
                    )}
                    <span className="text-gray-400">{expandedDoc === doc.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedDoc === doc.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Extracted Names */}
                        <div className="text-[10px] tracking-widest text-gray-500 mb-3">
                          EXTRACTED NAMES ({doc.extractedNames.length})
                        </div>

                        <div className="space-y-2">
                          {doc.extractedNames.map((name, idx) => (
                            <div
                              key={idx}
                              className={`p-3 border ${name.flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 text-[9px] uppercase tracking-wider border ${getRoleColor(name.role)}`}>
                                    {name.role}
                                  </span>
                                  <div>
                                    <div className="font-mono text-lg" dir="rtl">{name.arabicName}</div>
                                    {name.latinTransliteration && (
                                      <div className="text-xs text-gray-500">{name.latinTransliteration}</div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => onUpdateName(doc.id, idx, !name.presentDuringNegotiation)}
                                  className={`px-3 py-2 text-[10px] uppercase tracking-widest font-mono transition-all ${
                                    name.presentDuringNegotiation
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {name.presentDuringNegotiation ? '✓ PRESENT' : 'NOT PRESENT'}
                                </button>
                              </div>

                              {name.flagged && (
                                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                  <span>⚠</span> {name.flagReason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Flags */}
                        {doc.flaggedIssues.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-[10px] tracking-widest text-red-600 mb-3">
                              DOCUMENT FLAGS
                            </div>
                            <div className="space-y-2">
                              {doc.flaggedIssues.map((flag, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 text-sm ${
                                    flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                                    flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <div className="font-mono text-[10px] uppercase mb-1">
                                    {flag.type.replace('_', ' ')} · {flag.severity}
                                  </div>
                                  {flag.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Banner */}
      {documents.some(d => d.flaggedIssues.some(f => f.severity === 'high')) && (
        <div className="p-4 bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠</span>
            <div>
              <div className="font-mono text-sm uppercase tracking-wider">HIGH RISK DETECTED</div>
              <div className="text-xs opacity-80">
                One or more property owners are not present during negotiation. Do not proceed without verification.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
