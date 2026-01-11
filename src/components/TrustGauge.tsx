'use client';

interface TrustGaugeProps {
  score: number;
}

export default function TrustGauge({ score }: TrustGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const isHighRisk = clampedScore < 40;

  return (
    <div className="text-center">
      <div className="font-display text-8xl tracking-tight">
        {clampedScore}
      </div>
      <div className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-2">
        Trust Score
      </div>
      {isHighRisk && (
        <div className="mt-4 inline-block px-4 py-2 border-2 border-red-600 text-red-600 text-xs uppercase tracking-widest">
          High Risk
        </div>
      )}
    </div>
  );
}
