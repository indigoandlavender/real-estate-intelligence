'use client';

interface TrustGaugeProps {
  score: number;
  label?: string;
}

export default function TrustGauge({ score, label = 'TRUST SCORE' }: TrustGaugeProps) {
  // Clamp score between 0-100
  const clampedScore = Math.max(0, Math.min(100, score));
  const isHighRisk = clampedScore < 40;

  // Calculate color based on score
  const getColor = () => {
    if (clampedScore >= 70) return { ring: '#22c55e', text: 'text-green-500', bg: 'from-green-500/20' };
    if (clampedScore >= 50) return { ring: '#eab308', text: 'text-yellow-500', bg: 'from-yellow-500/20' };
    if (clampedScore >= 40) return { ring: '#f97316', text: 'text-orange-500', bg: 'from-orange-500/20' };
    return { ring: '#ef4444', text: 'text-red-500', bg: 'from-red-500/20' };
  };

  const color = getColor();

  // SVG circle calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Get verdict text
  const getVerdict = () => {
    if (clampedScore >= 85) return 'INVESTMENT GRADE';
    if (clampedScore >= 70) return 'STRONG BUY';
    if (clampedScore >= 55) return 'MODERATE';
    if (clampedScore >= 40) return 'CAUTION';
    return 'HIGH RISK';
  };

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b ${color.bg} to-transparent`}>
      {/* HIGH RISK Warning Banner */}
      {isHighRisk && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
          ⚠️ HIGH RISK ASSET
        </div>
      )}

      {/* SVG Gauge */}
      <div className={`relative w-48 h-48 ${isHighRisk ? 'mt-4' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color.ring}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-bold ${color.text} transition-colors duration-300`}>
            {clampedScore}
          </span>
          <span className="text-gray-500 text-sm font-medium tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500 tracking-[0.3em] font-medium">
          {label}
        </div>
        <div className={`text-lg font-bold ${color.text} mt-1`}>
          {getVerdict()}
        </div>
      </div>

      {/* High Risk Warning Message */}
      {isHighRisk && (
        <div className="mt-4 px-4 py-3 bg-red-900/50 border border-red-700 rounded-xl text-center">
          <div className="text-red-400 text-sm font-medium">
            PROCEED WITH CAUTION
          </div>
          <div className="text-red-300/70 text-xs mt-1">
            Multiple risk factors detected. Don't finish the tea.
          </div>
        </div>
      )}
    </div>
  );
}
