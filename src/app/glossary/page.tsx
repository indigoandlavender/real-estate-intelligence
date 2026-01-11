'use client';

import { useState } from 'react';
import Link from 'next/link';

const GLOSSARY = {
  legal: {
    title: 'Legal',
    terms: [
      {
        term: 'Titre Foncier',
        arabic: 'الرسم العقاري',
        definition: 'The "Gold Standard" of Moroccan property titles. Registered with the Conservation Fonciere. Can be mortgaged.',
        tip: 'Always request the Certificat de Propriete with QR code (2026 digital version).',
      },
      {
        term: 'Melkia',
        arabic: 'الملكية',
        definition: 'Traditional ownership based on Islamic law. Established through witness testimony (Lafif). NOT registered.',
        tip: 'Trades at 20-30% discount. Requires 6-18 months to regularize.',
      },
      {
        term: 'Requisition',
        arabic: 'مطلب التحفيظ',
        definition: 'Formal application to convert Melkia to Titre Foncier. Property is "in process."',
        tip: 'Verify status on the ANCFCC Mohafadati portal.',
      },
      {
        term: 'Lafif',
        arabic: 'اللفيف',
        definition: 'Document signed by 12 witnesses attesting to ownership facts. Required for Melkia.',
        tip: 'Verify all 12 witnesses are still alive and reachable.',
      },
      {
        term: 'Adoul',
        arabic: 'العدول',
        definition: 'Traditional Islamic notaries who authenticate Melkia documents.',
        tip: 'Adouls work in pairs. Both signatures required.',
      },
      {
        term: 'VNA',
        arabic: 'الصبغة غير الفلاحية',
        definition: 'Vocation Non-Agricole. Required for foreigners outside urban perimeters.',
        tip: 'VNA Provisoire = temporary (3 years). Always get Definitive.',
      },
      {
        term: 'Quitus Fiscal',
        arabic: 'براءة الذمة الضريبية',
        definition: 'Tax clearance certificate. Required before closing.',
        tip: '2026: Outstanding tax debts transfer with property.',
      },
    ],
  },
  structural: {
    title: 'Structural',
    terms: [
      {
        term: 'Tabia',
        arabic: 'الطابية',
        definition: 'Traditional rammed earth (mud-brick) construction. Made of clay, straw, and lime.',
        tip: 'Walls are 40-60cm thick. Never use cement plaster.',
      },
      {
        term: 'Chainage',
        arabic: 'التسليح الزلزالي',
        definition: 'Seismic chaining. Reinforced concrete tie-beams connecting walls at floor/roof levels.',
        tip: 'Post-2023 earthquake: Properties without it face insurance issues.',
      },
      {
        term: 'Remontee Capillaire',
        arabic: 'الرطوبة الصاعدة',
        definition: 'Rising damp. Moisture from ground rising through walls via capillary action.',
        tip: 'Height >1m = serious. Treatment: 2,500 MAD/m² for lime injection.',
      },
      {
        term: 'Tassement',
        arabic: 'الهبوط',
        definition: 'Foundation settlement. Building sinks unevenly, causing cracks.',
        tip: 'Differential settlement (one side sinking) is worse than uniform.',
      },
      {
        term: 'Porteur',
        arabic: 'الجدار الحامل',
        definition: 'Load-bearing wall supporting floors and roof above.',
        tip: 'NEVER remove without structural engineer approval.',
      },
      {
        term: 'Etancheite',
        arabic: 'العزل المائي',
        definition: 'Waterproofing, particularly for terraces and roofs.',
        tip: 'Most "renovated" riads fail within 2 years. Budget 800 MAD/m².',
      },
    ],
  },
  financial: {
    title: 'Financial',
    terms: [
      {
        term: 'Frais de Notaire',
        arabic: 'أتعاب الموثق',
        definition: 'Notary fees. Approximately 1% of transaction value.',
        tip: 'Total closing: 7% (Registration 4% + Conservation 1.5% + Notary 1%).',
      },
      {
        term: 'TSC',
        arabic: 'الضريبة على الخدمات الجماعية',
        definition: 'Taxe de Services Communaux. Annual municipal tax ~10.5% of rental value.',
        tip: 'Unpaid TSC must be cleared before sale. Check 4 years.',
      },
      {
        term: 'Cap Rate',
        arabic: 'معدل الرسملة',
        definition: 'Net Operating Income / Property Value. For income-producing properties.',
        tip: 'Institutional investors target 4.5-6% for Titre properties.',
      },
      {
        term: 'NOI',
        arabic: 'صافي الدخل التشغيلي',
        definition: 'Net Operating Income. Gross Revenue minus Operating Expenses.',
        tip: 'For Riads: OpEx 35-40% (staffing, utilities, OTA fees, maintenance).',
      },
      {
        term: 'FF&E',
        arabic: 'الأثاث والتجهيزات',
        definition: 'Furniture, Fixtures & Equipment. Movable items.',
        tip: 'Budget 12-15% of renovation. Artisan delivery is "Inshallah."',
      },
    ],
  },
  location: {
    title: 'Location',
    terms: [
      {
        term: 'Derb',
        arabic: 'الدرب',
        definition: 'Narrow alley in the Medina. Can be public or semi-private.',
        tip: 'Width <1.5m = 20% labor cost increase. Materials carried by hand.',
      },
      {
        term: 'Riad',
        arabic: 'الرياض',
        definition: 'Traditional house with interior courtyard and garden. 2-3 floors around central patio.',
        tip: 'True riads have gardens. Houses with just courtyard are "Dar."',
      },
      {
        term: 'Dar',
        arabic: 'الدار',
        definition: 'Traditional house with courtyard but no garden. Simpler than Riad.',
        tip: 'Smaller and less expensive. Excellent boutique conversions.',
      },
      {
        term: 'Fondouk',
        arabic: 'الفندق',
        definition: 'Historic caravanserai. Large central courtyard with rooms on multiple floors.',
        tip: 'Highest suite density but often complex multi-family ownership.',
      },
      {
        term: 'Quartier',
        arabic: 'الحي',
        definition: 'Neighborhood or district within the Medina.',
        tip: 'Premium: Laksour, Mouassine. Budget: Mellah. Emerging: Sidi Ben Slimane.',
      },
    ],
  },
};

type Category = keyof typeof GLOSSARY;

export default function GlossaryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('legal');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(GLOSSARY) as Category[];
  const currentCategory = GLOSSARY[activeCategory];

  const filteredTerms = currentCategory.terms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.arabic.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-10 bg-[#faf9f7] border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assess" className="text-xs uppercase tracking-widest text-gray-400 hover:text-black">
                Back
              </Link>
              <h1 className="font-display text-xl tracking-widest mt-1">Glossary</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search terms..."
          className="w-full px-4 py-4 border border-gray-200 text-sm focus:outline-none focus:border-black placeholder-gray-300"
        />

        <div className="flex gap-4 mt-8 border-b border-gray-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 text-xs uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
                activeCategory === cat
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {GLOSSARY[cat].title}
            </button>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {filteredTerms.map((item) => (
            <div key={item.term}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg">{item.term}</h3>
                <span className="text-sm text-gray-400" dir="rtl">{item.arabic}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.definition}</p>
              <div className="flex gap-3 mt-3">
                <div className="w-1 bg-gray-200 flex-shrink-0" />
                <p className="text-xs text-gray-500">{item.tip}</p>
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              No terms found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
