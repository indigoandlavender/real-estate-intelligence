'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SamsarProfile,
  SamsarTactic,
  SamsarNote,
  SAMSAR_TACTICS,
} from '@/types/street-intelligence';

interface SamsarTrackerProps {
  samsars: SamsarProfile[];
  onAdd: (samsar: Omit<SamsarProfile, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<SamsarProfile>) => void;
  onAddNote: (samsarId: string, note: Omit<SamsarNote, 'date'>) => void;
}

export default function SamsarTracker({ samsars, onAdd, onUpdate, onAddNote }: SamsarTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedSamsar, setExpandedSamsar] = useState<string | null>(null);
  const [newSamsar, setNewSamsar] = useState({
    name: '',
    phone: '',
    territory: '',
    reliabilityScore: 50,
    tactics: [] as SamsarTactic[],
  });
  const [newNote, setNewNote] = useState({ samsarId: '', note: '', type: 'meeting' as SamsarNote['interactionType'] });

  const handleAddSamsar = () => {
    if (!newSamsar.name.trim()) return;

    onAdd({
      name: newSamsar.name,
      phone: newSamsar.phone || undefined,
      territory: newSamsar.territory.split(',').map(t => t.trim()).filter(Boolean),
      reliabilityScore: newSamsar.reliabilityScore,
      dealsCompleted: 0,
      dealsGoneBad: 0,
      knownTactics: newSamsar.tactics,
      connectedTo: [],
      notes: [],
    });

    setNewSamsar({ name: '', phone: '', territory: '', reliabilityScore: 50, tactics: [] });
    setShowAddForm(false);
  };

  const handleAddNote = (samsarId: string) => {
    if (!newNote.note.trim()) return;

    onAddNote(samsarId, {
      note: newNote.note,
      interactionType: newNote.type,
    });

    setNewNote({ samsarId: '', note: '', type: 'meeting' });
  };

  const toggleTactic = (tactic: SamsarTactic) => {
    setNewSamsar(prev => ({
      ...prev,
      tactics: prev.tactics.includes(tactic)
        ? prev.tactics.filter(t => t !== tactic)
        : [...prev.tactics, tactic],
    }));
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="border-2 border-gray-900 bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-gray-400">SOCIAL INTELLIGENCE</div>
            <h3 className="font-mono text-lg tracking-wide">SAMSAR REGISTRY</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-2xl">{samsars.length}</div>
              <div className="text-[10px] tracking-widest text-gray-400">TRACKED</div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-mono hover:bg-gray-100"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Add Samsar Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-6 bg-gray-50">
              <div className="text-[10px] tracking-widest text-gray-500 mb-4">NEW SAMSAR PROFILE</div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={newSamsar.name}
                    onChange={(e) => setNewSamsar(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mohammed, Hassan, etc."
                    className="w-full p-3 border border-gray-300 font-mono text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newSamsar.phone}
                    onChange={(e) => setNewSamsar(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+212 6XX XXX XXX"
                    className="w-full p-3 border border-gray-300 font-mono text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] text-gray-500 uppercase mb-1">Territory (comma-separated)</label>
                <input
                  type="text"
                  value={newSamsar.territory}
                  onChange={(e) => setNewSamsar(prev => ({ ...prev, territory: e.target.value }))}
                  placeholder="Laksour, Mouassine, Kennaria"
                  className="w-full p-3 border border-gray-300 font-mono text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[10px] text-gray-500 uppercase mb-2">
                  Initial Reliability Score: <span className={getReliabilityColor(newSamsar.reliabilityScore)}>{newSamsar.reliabilityScore}/100</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSamsar.reliabilityScore}
                  onChange={(e) => setNewSamsar(prev => ({ ...prev, reliabilityScore: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                  <span>Avoid</span>
                  <span>Cautious</span>
                  <span>Reliable</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] text-gray-500 uppercase mb-2">Known Tactics</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SAMSAR_TACTICS) as SamsarTactic[]).map((tactic) => {
                    const info = SAMSAR_TACTICS[tactic];
                    const isSelected = newSamsar.tactics.includes(tactic);
                    return (
                      <button
                        key={tactic}
                        onClick={() => toggleTactic(tactic)}
                        className={`px-3 py-1 text-[10px] uppercase tracking-wider border transition-all ${
                          isSelected
                            ? info.risk === 'negative' ? 'bg-red-500 text-white border-red-500'
                            : info.risk === 'positive' ? 'bg-green-500 text-white border-green-500'
                            : 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-white border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddSamsar}
                  disabled={!newSamsar.name.trim()}
                  className="flex-1 py-3 bg-black text-white text-xs uppercase tracking-widest font-mono hover:bg-gray-800 disabled:opacity-50"
                >
                  Add to Registry
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-xs uppercase tracking-widest font-mono hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Samsar List */}
      <div className="max-h-[500px] overflow-y-auto">
        {samsars.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🕵️</div>
            <div className="text-sm">No samsars tracked</div>
            <div className="text-xs mt-1">Add brokers to track their reliability and territory</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {samsars.map((samsar) => (
              <div key={samsar.id} className="p-4">
                {/* Samsar Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSamsar(expandedSamsar === samsar.id ? null : samsar.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Reliability Indicator */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke={samsar.reliabilityScore >= 70 ? '#22c55e' : samsar.reliabilityScore >= 40 ? '#eab308' : '#ef4444'}
                          strokeWidth="4"
                          strokeDasharray={`${samsar.reliabilityScore * 1.26} 126`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-mono text-sm font-bold ${getReliabilityColor(samsar.reliabilityScore)}`}>
                          {samsar.reliabilityScore}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-sm font-medium">{samsar.name}</div>
                      <div className="text-[10px] text-gray-500">
                        {samsar.territory.join(' · ')}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {samsar.knownTactics.slice(0, 3).map(tactic => (
                          <span
                            key={tactic}
                            className={`px-1 py-0.5 text-[8px] uppercase ${
                              SAMSAR_TACTICS[tactic].risk === 'negative' ? 'bg-red-100 text-red-700'
                              : SAMSAR_TACTICS[tactic].risk === 'positive' ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {SAMSAR_TACTICS[tactic].label}
                          </span>
                        ))}
                        {samsar.knownTactics.length > 3 && (
                          <span className="text-[8px] text-gray-400">+{samsar.knownTactics.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-[10px] text-gray-500">
                      <div>{samsar.dealsCompleted} deals</div>
                      <div className={samsar.dealsGoneBad > 0 ? 'text-red-500' : ''}>
                        {samsar.dealsGoneBad} bad
                      </div>
                    </div>
                    <span className="text-gray-400">{expandedSamsar === samsar.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedSamsar === samsar.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Quick Actions */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => onUpdate(samsar.id, { reliabilityScore: Math.min(100, samsar.reliabilityScore + 5) })}
                            className="px-3 py-1 bg-green-100 text-green-700 text-[10px] uppercase tracking-wider hover:bg-green-200"
                          >
                            +5 Trust
                          </button>
                          <button
                            onClick={() => onUpdate(samsar.id, { reliabilityScore: Math.max(0, samsar.reliabilityScore - 5) })}
                            className="px-3 py-1 bg-red-100 text-red-700 text-[10px] uppercase tracking-wider hover:bg-red-200"
                          >
                            -5 Trust
                          </button>
                          <button
                            onClick={() => onUpdate(samsar.id, { dealsCompleted: samsar.dealsCompleted + 1 })}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wider hover:bg-gray-200"
                          >
                            +1 Deal
                          </button>
                          <button
                            onClick={() => onUpdate(samsar.id, { dealsGoneBad: samsar.dealsGoneBad + 1 })}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wider hover:bg-gray-200"
                          >
                            +1 Bad
                          </button>
                        </div>

                        {/* Contact */}
                        {samsar.phone && (
                          <div className="mb-4 p-3 bg-gray-50 font-mono text-sm">
                            📞 {samsar.phone}
                          </div>
                        )}

                        {/* Notes */}
                        <div className="mb-4">
                          <div className="text-[10px] tracking-widest text-gray-500 mb-2">
                            INTERACTION LOG ({samsar.notes.length})
                          </div>

                          {samsar.notes.length > 0 && (
                            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                              {samsar.notes.map((note, idx) => (
                                <div key={idx} className="p-2 bg-gray-50 text-xs">
                                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <span className="uppercase">{note.interactionType}</span>
                                    <span>·</span>
                                    <span>{new Date(note.date).toLocaleDateString('fr-MA')}</span>
                                  </div>
                                  <div className="text-gray-700">{note.note}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Note */}
                          <div className="flex gap-2">
                            <select
                              value={newNote.samsarId === samsar.id ? newNote.type : 'meeting'}
                              onChange={(e) => setNewNote({ ...newNote, samsarId: samsar.id, type: e.target.value as SamsarNote['interactionType'] })}
                              className="p-2 border border-gray-300 text-[10px] uppercase"
                            >
                              <option value="call">Call</option>
                              <option value="meeting">Meeting</option>
                              <option value="deal">Deal</option>
                              <option value="conflict">Conflict</option>
                              <option value="referral">Referral</option>
                            </select>
                            <input
                              type="text"
                              value={newNote.samsarId === samsar.id ? newNote.note : ''}
                              onChange={(e) => setNewNote({ ...newNote, samsarId: samsar.id, note: e.target.value })}
                              placeholder="Add note..."
                              className="flex-1 p-2 border border-gray-300 text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddNote(samsar.id)}
                            />
                            <button
                              onClick={() => handleAddNote(samsar.id)}
                              className="px-4 py-2 bg-black text-white text-[10px] uppercase tracking-wider"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Summary */}
      {samsars.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>
              AVG RELIABILITY: {Math.round(samsars.reduce((a, s) => a + s.reliabilityScore, 0) / samsars.length)}/100
            </span>
            <span>
              TOTAL DEALS: {samsars.reduce((a, s) => a + s.dealsCompleted, 0)} |
              BAD: {samsars.reduce((a, s) => a + s.dealsGoneBad, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
