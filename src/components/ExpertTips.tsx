'use client';

// ============================================
// THE INTELLIGENCE LAYER
// "The Woman Who Knows" Expert Tips
// ============================================

interface ExpertTipsProps {
  section: 'legal' | 'structural' | 'market' | 'financial';
  data: {
    titleType?: string;
    heirCount?: number;
    vnaStatus?: boolean;
    pillarTilt?: number;
    humidity?: number;
    seismicChaining?: boolean;
    alleyWidthM?: number;
    askingPrice?: number;
    surfaceSqm?: number;
  };
}

// Expert knowledge database - "The Adoul Logic"
const EXPERT_TIPS = {
  legal: {
    title: 'Legal Intelligence',
    icon: '⚖️',
    tips: [
      {
        id: 'certificat',
        title: 'Certificat de Non-Opposition',
        content: 'MANDATORY: Request the "Certificat de Non-Opposition" from neighbors. Without it, construction permits can be blocked later.',
        priority: 'high',
      },
      {
        id: 'lafif',
        title: 'Lafif Verification (Melkia)',
        content: 'For Melkia properties: Verify the "Lafif" document. Are all 12 witnesses still alive or reachable? Dead witnesses = administrative nightmare.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => data.titleType === 'melkia',
      },
      {
        id: 'heirs',
        title: 'Heir Coordination',
        content: 'Count the heirs carefully. If >5, expect a 6-month delay minimum. Each heir must sign—one holdout can block the entire sale.',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => (data.heirCount || 0) > 3,
      },
      {
        id: 'power-attorney',
        title: '2026 Alert: Electronic Register',
        content: 'If seller is not physically present, check the National Electronic Register for Powers of Attorney (2026 requirement). Fake procurations are common.',
        priority: 'high',
      },
      {
        id: 'vna-timeline',
        title: 'VNA Timeline',
        content: 'VNA (Vocation Non-Agricole) approval takes 3-6 months. Budget this into your acquisition timeline. No VNA = no foreign ownership transfer.',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => !data.vnaStatus,
      },
    ],
  },
  structural: {
    title: 'Builder\'s Intelligence',
    icon: '🏛️',
    tips: [
      {
        id: 'pillar-subsidence',
        title: 'Foundation Subsidence Risk',
        content: 'HIGH RISK: Pillar tilt >2° indicates active foundation movement. Consult a structural engineer before proceeding. Do NOT trust verbal assurances.',
        priority: 'critical',
        condition: (data: ExpertTipsProps['data']) => (data.pillarTilt || 0) > 2,
      },
      {
        id: 'tabia-humidity',
        title: 'Tabia Wall Treatment',
        content: 'Dampness >6/10 = Tabia degradation. Budget 2,500 DH/m² extra for specialized lime treatment (chaux aérienne). Cement plaster will make it WORSE.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => (data.humidity || 0) > 6,
      },
      {
        id: 'seismic-post-2023',
        title: 'Post-2023 Seismic Requirements',
        content: 'After the Al Haouz earthquake, seismic chaining is now scrutinized. Properties without it face insurance issues and resale difficulties.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => !data.seismicChaining,
      },
      {
        id: 'roof-check',
        title: 'Terrace Waterproofing',
        content: 'Check the terrace during/after rain. Most "renovated" riads have waterproofing failures within 2 years. Budget 800 DH/m² for proper étanchéité.',
        priority: 'medium',
      },
      {
        id: 'shared-walls',
        title: 'Neighbor Wall Assessment',
        content: 'Shared walls in the Medina are common. If neighbor\'s house is leaning, YOUR wall will crack. Always inspect from BOTH sides.',
        priority: 'medium',
      },
    ],
  },
  market: {
    title: 'Location Intelligence',
    icon: '📍',
    tips: [
      {
        id: 'darb-width',
        title: 'Darb Width = Labor Cost',
        content: 'Can a mule or construction cart pass? If alley <1.5m, labor costs increase 20% minimum. All materials carried by hand = slow + expensive.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => (data.alleyWidthM || 2) < 1.5,
      },
      {
        id: 'parking-distance',
        title: 'Parking Reality Check',
        content: 'Distance to parking affects both renovation logistics AND guest experience. >200m walk with luggage = bad reviews on Booking.com.',
        priority: 'medium',
      },
      {
        id: 'price-benchmark',
        title: 'Laksour Benchmark',
        content: 'Laksour 2026 benchmark: 18,000 DH/m². Below this = potential arbitrage. Above 25,000 = you\'re paying for "finished" premium.',
        priority: 'medium',
      },
      {
        id: 'wc2030',
        title: 'World Cup 2030 Factor',
        content: 'Properties <500m from new infrastructure (train station, stadium access) will appreciate 5%+ by 2030. Check the urban planning maps.',
        priority: 'medium',
      },
      {
        id: 'tourist-flow',
        title: 'Tourist Flow Analysis',
        content: 'Walk the derb at 10am and 6pm. Count tourists. High foot traffic = high visibility for your future Maison d\'Hôte.',
        priority: 'low',
      },
    ],
  },
  financial: {
    title: 'Financial Intelligence',
    icon: '💰',
    tips: [
      {
        id: 'closing-costs',
        title: '2026 Closing Costs',
        content: 'Total: 7% of purchase price. Registration (4%) + Conservation (1.5%) + Notary (1%) + stamps. Non-negotiable. Budget it from day one.',
        priority: 'high',
      },
      {
        id: 'renovation-buffer',
        title: 'Renovation Buffer Rule',
        content: 'Always add 20% buffer to renovation estimates. In the Medina, you WILL find surprises behind the walls. No exceptions.',
        priority: 'high',
      },
      {
        id: 'ffe-budget',
        title: 'FF&E Reality',
        content: 'Furniture, Fixtures & Equipment: 12-15% of renovation cost. Moroccan artisan furniture is beautiful but delivery times are "Inshallah."',
        priority: 'medium',
      },
      {
        id: 'occupancy-reality',
        title: 'Occupancy Reality Check',
        content: '65% is the market average. First year: expect 40-50% while building reviews. Don\'t model your ROI on 80% occupancy fantasies.',
        priority: 'high',
      },
      {
        id: 'quitus-fiscal',
        title: 'Quitus Fiscal (2026)',
        content: 'Before closing, demand the Quitus Fiscal. This proves seller has no outstanding tax debts. New 2026 rule: debts transfer with property.',
        priority: 'critical',
      },
      {
        id: 'titre-arbitrage',
        title: 'Melkia Arbitrage Strategy',
        content: 'Buy Melkia at discount → Regularize to Titre (12-18 months) → Property becomes bankable at institutional 4.5% cap rate. This is the "Found Value."',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => data.titleType === 'melkia',
      },
    ],
  },
};

export default function ExpertTips({ section, data }: ExpertTipsProps) {
  const sectionTips = EXPERT_TIPS[section];

  // Filter tips based on conditions
  const activeTips = sectionTips.tips.filter((tip) => {
    if (!tip.condition) return true;
    return tip.condition(data);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-900/50 border-red-500 text-red-300';
      case 'high':
        return 'bg-amber-900/30 border-amber-600 text-amber-300';
      case 'medium':
        return 'bg-blue-900/30 border-blue-600 text-blue-300';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'IMPORTANT';
      case 'medium':
        return 'NOTE';
      default:
        return 'TIP';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{sectionTips.icon}</span>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          {sectionTips.title}
        </h3>
      </div>

      <div className="space-y-3">
        {activeTips.map((tip) => (
          <div
            key={tip.id}
            className={`p-3 rounded-lg border ${getPriorityColor(tip.priority)}`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-bold">{tip.title}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                tip.priority === 'critical' ? 'bg-red-600 text-white' :
                tip.priority === 'high' ? 'bg-amber-600 text-black' :
                'bg-gray-600 text-white'
              }`}>
                {getPriorityBadge(tip.priority)}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {tip.content}
            </p>
          </div>
        ))}
      </div>

      {activeTips.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          No specific alerts for current data
        </div>
      )}
    </div>
  );
}
