'use client';

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

const EXPERT_TIPS = {
  legal: {
    title: 'Legal Intelligence',
    tips: [
      {
        id: 'certificat',
        title: 'Certificat de Non-Opposition',
        content: 'Request from neighbors before construction permits.',
        priority: 'high',
      },
      {
        id: 'lafif',
        title: 'Lafif Verification',
        content: 'Verify all 12 witnesses are reachable. Dead witnesses cause delays.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => data.titleType === 'melkia',
      },
      {
        id: 'heirs',
        title: 'Heir Coordination',
        content: 'Each heir must sign. One holdout blocks the sale.',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => (data.heirCount || 0) > 3,
      },
      {
        id: 'power-attorney',
        title: '2026 Electronic Register',
        content: 'Verify Powers of Attorney via the National Digital Portal.',
        priority: 'high',
      },
      {
        id: 'vna-timeline',
        title: 'VNA Timeline',
        content: 'Approval takes 3-6 months. No VNA = no foreign transfer.',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => !data.vnaStatus,
      },
    ],
  },
  structural: {
    title: 'Structural Intelligence',
    tips: [
      {
        id: 'pillar-subsidence',
        title: 'Foundation Subsidence',
        content: 'Pillar tilt >2° indicates active movement. Consult engineer.',
        priority: 'critical',
        condition: (data: ExpertTipsProps['data']) => (data.pillarTilt || 0) > 2,
      },
      {
        id: 'tabia-humidity',
        title: 'Tabia Wall Treatment',
        content: 'Dampness >6/10 requires lime treatment. Never use cement.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => (data.humidity || 0) > 6,
      },
      {
        id: 'seismic-post-2023',
        title: 'Post-2023 Seismic',
        content: 'Properties without chaining face insurance issues.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => !data.seismicChaining,
      },
      {
        id: 'roof-check',
        title: 'Terrace Waterproofing',
        content: 'Most "renovated" riads fail within 2 years.',
        priority: 'medium',
      },
    ],
  },
  market: {
    title: 'Market Intelligence',
    tips: [
      {
        id: 'darb-width',
        title: 'Derb Width = Labor Cost',
        content: 'Alley <1.5m increases labor costs 20% minimum.',
        priority: 'high',
        condition: (data: ExpertTipsProps['data']) => (data.alleyWidthM || 2) < 1.5,
      },
      {
        id: 'parking-distance',
        title: 'Parking Reality',
        content: '>200m walk with luggage = bad guest reviews.',
        priority: 'medium',
      },
      {
        id: 'price-benchmark',
        title: 'Laksour Benchmark',
        content: '2026: 18,000 MAD/m². Below = potential. Above 25,000 = premium.',
        priority: 'medium',
      },
      {
        id: 'wc2030',
        title: 'World Cup 2030',
        content: 'Properties <500m from new infrastructure appreciate 5%+.',
        priority: 'medium',
      },
    ],
  },
  financial: {
    title: 'Financial Intelligence',
    tips: [
      {
        id: 'closing-costs',
        title: '2026 Closing Costs',
        content: 'Total 7%: Registration 4% + Conservation 1.5% + Notary 1%.',
        priority: 'high',
      },
      {
        id: 'renovation-buffer',
        title: 'Renovation Buffer',
        content: 'Always add 20%. You will find surprises behind the walls.',
        priority: 'high',
      },
      {
        id: 'occupancy-reality',
        title: 'Occupancy Reality',
        content: 'Market average 65%. First year expect 40-50%.',
        priority: 'high',
      },
      {
        id: 'quitus-fiscal',
        title: 'Quitus Fiscal',
        content: '2026: Tax debts transfer with property.',
        priority: 'critical',
      },
      {
        id: 'titre-arbitrage',
        title: 'Melkia Arbitrage',
        content: 'Buy Melkia, regularize to Titre, value at 4.5% cap rate.',
        priority: 'medium',
        condition: (data: ExpertTipsProps['data']) => data.titleType === 'melkia',
      },
    ],
  },
};

export default function ExpertTips({ section, data }: ExpertTipsProps) {
  const sectionTips = EXPERT_TIPS[section];

  const activeTips = sectionTips.tips.filter((tip) => {
    if (!tip.condition) return true;
    return tip.condition(data);
  });

  if (activeTips.length === 0) return null;

  return (
    <div className="border-t pt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">
        {sectionTips.title}
      </div>
      <div className="space-y-4">
        {activeTips.map((tip) => (
          <div key={tip.id} className="flex gap-4">
            <div className={`w-1 flex-shrink-0 ${
              tip.priority === 'critical' ? 'bg-red-600' :
              tip.priority === 'high' ? 'bg-gray-400' : 'bg-gray-200'
            }`} />
            <div>
              <div className="text-sm font-medium">{tip.title}</div>
              <div className="text-sm text-gray-500 mt-1">{tip.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
