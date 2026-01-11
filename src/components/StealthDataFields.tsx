'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StealthObservation,
  StealthCategory,
  STEALTH_CATEGORIES,
} from '@/types/street-intelligence';

interface StealthDataFieldsProps {
  observations: StealthObservation[];
  onAdd: (observation: Omit<StealthObservation, 'id' | 'timestamp'>) => void;
  onRemove: (id: string) => void;
}

export default function StealthDataFields({ observations, onAdd, onRemove }: StealthDataFieldsProps) {
  const [selectedCategory, setSelectedCategory] = useState<StealthCategory | null>(null);
  const [observation, setObservation] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!selectedCategory || !observation.trim()) return;

    onAdd({
      category: selectedCategory,
      observation: observation.trim(),
      severity,
      photosAttached: 0,
    });

    // Reset form
    setSelectedCategory(null);
    setObservation('');
    setSeverity('info');
    setShowForm(false);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-600 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="border-2 border-gray-900 bg-white">
      {/* Header - Institutional Style */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-gray-400">FIELD RECONNAISSANCE</div>
            <h3 className="font-mono text-lg tracking-wide">STEALTH OBSERVATIONS</h3>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl">{observations.length}</div>
            <div className="text-[10px] tracking-widest text-gray-400">ENTRIES</div>
          </div>
        </div>
      </div>

      {/* Quick Category Buttons */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-[10px] tracking-widest text-gray-500 mb-3">OBSERVATION CATEGORIES</div>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(STEALTH_CATEGORIES) as StealthCategory[]).map((cat) => {
            const catInfo = STEALTH_CATEGORIES[cat];
            const count = observations.filter(o => o.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowForm(true);
                }}
                className={`p-3 text-center border transition-all ${
                  selectedCategory === cat
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="text-xl mb-1">{catInfo.icon}</div>
                <div className="text-[9px] uppercase tracking-wide leading-tight">{catInfo.label}</div>
                {count > 0 && (
                  <div className="mt-1 text-[10px] font-mono bg-gray-100 text-gray-600 rounded px-1">
                    {count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Observation Form */}
      <AnimatePresence>
        {showForm && selectedCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-6 bg-yellow-50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{STEALTH_CATEGORIES[selectedCategory].icon}</div>
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium">{STEALTH_CATEGORIES[selectedCategory].label}</div>
                  <div className="text-xs text-gray-500 mt-1">{STEALTH_CATEGORIES[selectedCategory].prompt}</div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Record your observation... (Do not ask broker)"
                className="w-full p-4 border border-gray-300 bg-white text-sm font-mono resize-none focus:outline-none focus:border-black"
                rows={3}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {(['info', 'warning', 'critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-mono transition-all ${
                        severity === sev
                          ? getSeverityColor(sev)
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!observation.trim()}
                  className="px-6 py-2 bg-black text-white text-xs uppercase tracking-widest font-mono hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Record Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Observations List */}
      <div className="max-h-96 overflow-y-auto">
        {observations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">👁️</div>
            <div className="text-sm">No observations recorded</div>
            <div className="text-xs mt-1">Select a category above to begin reconnaissance</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {observations.map((obs, index) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{STEALTH_CATEGORIES[obs.category].icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium">
                        {STEALTH_CATEGORIES[obs.category].label}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${getSeverityColor(obs.severity)}`}>
                        {obs.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{obs.observation}</p>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      {new Date(obs.timestamp).toLocaleString('fr-MA')}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(obs.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {observations.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>
              CRITICAL: {observations.filter(o => o.severity === 'critical').length} |
              WARNING: {observations.filter(o => o.severity === 'warning').length} |
              INFO: {observations.filter(o => o.severity === 'info').length}
            </span>
            <span>TOTAL: {observations.length} ENTRIES</span>
          </div>
        </div>
      )}
    </div>
  );
}
