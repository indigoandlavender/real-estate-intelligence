'use client';

import { useState } from 'react';
import Link from 'next/link';

// ============================================
// THE ALIVE GLOSSARY
// Moroccan Real Estate Intelligence Terms
// ============================================

const GLOSSARY = {
  legal: {
    title: 'Legal Terms',
    icon: '⚖️',
    terms: [
      {
        term: 'Titre Foncier',
        arabic: 'الرسم العقاري',
        definition: 'The "Gold Standard" of Moroccan property titles. A registered title with the Conservation Foncière that provides absolute proof of ownership. Can be mortgaged with banks.',
        tip: 'Always request the "Certificat de Propriété" with QR code (2026 digital version).',
      },
      {
        term: 'Melkia',
        arabic: 'الملكية',
        definition: 'Traditional ownership document based on Islamic law. Established through witness testimony (Lafif) and notarized by an Adoul. NOT registered with the land registry.',
        tip: 'Melkia properties trade at 20-30% discount but require 6-18 months to regularize to Titre.',
      },
      {
        term: 'Réquisition',
        arabic: 'مطلب التحفيظ',
        definition: 'A formal application to convert Melkia to Titre Foncier. The property is "in process" of being titled.',
        tip: 'Request the Réquisition number and verify status on the ANCFCC Mohafadati portal.',
      },
      {
        term: 'Lafif',
        arabic: 'اللفيف',
        definition: 'A document signed by 12 witnesses (traditionally 12 adult Muslim men) attesting to ownership facts. Required for Melkia transactions.',
        tip: 'Verify that all 12 witnesses are still alive and reachable. Dead witnesses = administrative delays.',
      },
      {
        term: 'Adoul',
        arabic: 'العدول',
        definition: 'Traditional Islamic notaries who authenticate Melkia documents, inheritance divisions, and marriage contracts.',
        tip: 'Adouls work in pairs. Both signatures are required for legal validity.',
      },
      {
        term: 'VNA (Vocation Non-Agricole)',
        arabic: 'الصبغة غير الفلاحية',
        definition: 'Certificate confirming land is designated for non-agricultural use. Required for foreigners to purchase property outside urban perimeters.',
        tip: 'VNA Provisoire = temporary (3 years). VNA Définitive = permanent. Always get Définitive.',
      },
      {
        term: 'Conservation Foncière',
        arabic: 'المحافظة العقارية',
        definition: 'The Land Registry office (ANCFCC) where Titre Foncier properties are registered and updated.',
        tip: 'Registration costs approximately 1.5% of property value.',
      },
      {
        term: 'Certificat de Non-Opposition',
        arabic: 'شهادة عدم التعرض',
        definition: 'Certificate from neighbors confirming no objection to construction or renovation plans.',
        tip: 'MANDATORY before any building permit. Get it early—neighbor disputes can block projects for years.',
      },
      {
        term: 'Quitus Fiscal',
        arabic: 'براءة الذمة الضريبية',
        definition: 'Tax clearance certificate proving the seller has no outstanding tax debts. Required by notaries before closing.',
        tip: '2026 Rule: Outstanding tax debts now transfer with the property. Always verify 4 years of records.',
      },
      {
        term: 'Droit de Vue',
        arabic: 'حق الإطلالة',
        definition: 'Legal right to windows/openings that overlook neighboring properties. Protected under Moroccan law.',
        tip: 'In the Medina, existing Droit de Vue can block your renovation plans. Inspect all windows carefully.',
      },
      {
        term: 'Procuration (POA)',
        arabic: 'الوكالة',
        definition: 'Power of Attorney allowing someone to act on behalf of the property owner.',
        tip: '2026 Alert: Verify all POAs via the National Electronic Register. Paper POAs without digital timestamp are suspect.',
      },
    ],
  },
  structural: {
    title: 'Structural Terms',
    icon: '🏛️',
    terms: [
      {
        term: 'Tabia',
        arabic: 'الطابية',
        definition: 'Traditional rammed earth (mud-brick) construction common in Moroccan Medinas. Made of clay, straw, and lime.',
        tip: 'Tabia walls are 40-60cm thick. They breathe and regulate humidity naturally—but require lime plaster, NEVER cement.',
      },
      {
        term: 'Chainage (Seismic Chaining)',
        arabic: 'التسليح الزلزالي',
        definition: 'Reinforced concrete tie-beams that connect walls at floor and roof levels to resist earthquake forces.',
        tip: 'Post-2023 earthquake, properties without chainage face insurance and resale difficulties.',
      },
      {
        term: 'Remontée Capillaire',
        arabic: 'الرطوبة الصاعدة',
        definition: 'Rising damp—moisture absorbed from the ground that rises through walls via capillary action.',
        tip: 'Measure height of damp marks. >1m = serious problem. Treatment: 2,500 DH/m² for specialized lime injection.',
      },
      {
        term: 'Tassement',
        arabic: 'الهبوط',
        definition: 'Foundation settlement—when the building sinks unevenly into the ground, causing cracks and tilting.',
        tip: 'Differential settlement (one side sinking more) is worse than uniform settlement. Check crack patterns.',
      },
      {
        term: 'Porteur',
        arabic: 'الجدار الحامل',
        definition: 'Load-bearing wall that supports the weight of floors and roof above.',
        tip: 'NEVER remove a porteur wall without structural engineer approval. Common renovation mistake.',
      },
      {
        term: 'Étanchéité',
        arabic: 'العزل المائي',
        definition: 'Waterproofing, particularly for terraces and roofs.',
        tip: 'Most "renovated" riads have waterproofing failures within 2 years. Budget 800 DH/m² for proper work.',
      },
      {
        term: 'Fissure',
        arabic: 'الشق',
        definition: 'Crack in walls or structure. Can be cosmetic or structural depending on pattern and width.',
        tip: 'Horizontal cracks = settlement. Diagonal cracks = differential movement. Vertical cracks = thermal expansion.',
      },
      {
        term: 'SHS (Structural Health Score)',
        arabic: 'مؤشر الصحة الهيكلية',
        definition: 'TIFORT proprietary score (0-100) measuring overall structural condition based on seismic, dampness, foundations, and utilities.',
        tip: 'SHS < 50 = major renovation required. SHS > 70 = cosmetic updates only.',
      },
    ],
  },
  financial: {
    title: 'Financial Terms',
    icon: '💰',
    terms: [
      {
        term: 'Frais de Notaire',
        arabic: 'أتعاب الموثق',
        definition: 'Notary fees for property transfer. Approximately 1% of transaction value plus fixed fees.',
        tip: 'Total closing costs in Morocco: 7% (Registration 4% + Conservation 1.5% + Notary 1% + stamps).',
      },
      {
        term: 'Droits d\'Enregistrement',
        arabic: 'رسوم التسجيل',
        definition: 'Registration tax paid to the government when transferring property ownership. Currently 4% of declared value.',
        tip: 'Declaring below market value is illegal and increasingly detected via automated price comparisons.',
      },
      {
        term: 'TSC (Taxe de Services Communaux)',
        arabic: 'الضريبة على الخدمات الجماعية',
        definition: 'Annual municipal tax based on rental value of property. Approximately 10.5% of theoretical rental value.',
        tip: 'Unpaid TSC must be cleared before sale. Check 4 years of records.',
      },
      {
        term: 'IGT (Impôt sur la Gestion Touristique)',
        arabic: 'الضريبة على التسيير السياحي',
        definition: 'Tax on tourist accommodation revenue. 15% on net profit for Maison d\'Hôte operations.',
        tip: 'Structure as "Maison d\'Hôte" (not hotel) for favorable tax treatment. Max 7 rooms.',
      },
      {
        term: 'ADR (Average Daily Rate)',
        arabic: 'متوسط السعر اليومي',
        definition: 'Average revenue per room per night. Key metric for hospitality investments.',
        tip: 'Laksour ADR benchmark: 1,000-1,500 DH for boutique riads. Premium locations can reach 2,500 DH.',
      },
      {
        term: 'RevPAR',
        arabic: 'العائد لكل غرفة متاحة',
        definition: 'Revenue Per Available Room = ADR × Occupancy Rate. True measure of hotel performance.',
        tip: 'Focus on RevPAR, not just ADR. A 2,000 DH ADR at 40% occupancy = 800 DH RevPAR.',
      },
      {
        term: 'Cap Rate',
        arabic: 'معدل الرسملة',
        definition: 'Capitalization Rate = Net Operating Income / Property Value. Used to value income-producing properties.',
        tip: 'Institutional investors in Morocco target 4.5-6% cap rates for verified (Titre) properties.',
      },
      {
        term: 'NOI (Net Operating Income)',
        arabic: 'صافي الدخل التشغيلي',
        definition: 'Gross Revenue minus Operating Expenses (before debt service and taxes).',
        tip: 'For Riads, expect OpEx of 35-40% of gross revenue (staffing, utilities, OTA commissions, maintenance).',
      },
      {
        term: 'FF&E',
        arabic: 'الأثاث والتجهيزات',
        definition: 'Furniture, Fixtures & Equipment. Movable items not permanently attached to the building.',
        tip: 'Budget 12-15% of renovation cost for FF&E. Moroccan artisan furniture: beautiful but slow delivery.',
      },
    ],
  },
  location: {
    title: 'Location Terms',
    icon: '📍',
    terms: [
      {
        term: 'Derb',
        arabic: 'الدرب',
        definition: 'Narrow alley or lane in the Medina. Can be public or semi-private.',
        tip: 'Derb width < 1.5m = 20% labor cost increase for renovation. Materials carried by hand only.',
      },
      {
        term: 'Riad',
        arabic: 'الرياض',
        definition: 'Traditional Moroccan house with interior courtyard/garden. Typically 2-3 floors built around a central patio.',
        tip: 'True riads have gardens (trees). Houses with just a courtyard are "Dar" not "Riad" (though often mislabeled).',
      },
      {
        term: 'Dar',
        arabic: 'الدار',
        definition: 'Traditional house with interior courtyard but no garden. Simpler than a Riad.',
        tip: 'Dars are typically smaller and less expensive than Riads but can be excellent boutique hotel conversions.',
      },
      {
        term: 'Fondouk',
        arabic: 'الفندق',
        definition: 'Historic caravanserai or merchant inn. Large central courtyard surrounded by rooms on multiple floors.',
        tip: 'Fondouks offer highest suite density but often have complex ownership (multiple families) and protected heritage status.',
      },
      {
        term: 'Périmètre Urbain',
        arabic: 'المدار الحضري',
        definition: 'Urban perimeter defining city boundaries for planning and zoning purposes.',
        tip: 'Properties outside the Périmètre Urbain require VNA for foreign ownership.',
      },
      {
        term: 'Quartier',
        arabic: 'الحي',
        definition: 'Neighborhood or district within the Medina or city.',
        tip: 'Premium Medina quartiers: Laksour, Mouassine, Riad Zitoun. Budget: Mellah, Kennaria. Emerging: Sidi Ben Slimane.',
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/assess" className="text-amber-500 hover:text-amber-400">
                ← Back to Calculator
              </Link>
              <h1 className="text-xl font-bold text-white mt-1">The Alive Glossary</h1>
              <p className="text-xs text-gray-500">Moroccan Real Estate Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search terms in English or Arabic..."
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{GLOSSARY[cat].icon}</span>
              {GLOSSARY[cat].title}
            </button>
          ))}
        </div>

        {/* Terms List */}
        <div className="space-y-4">
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              className="bg-gray-800 rounded-xl p-5 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{item.term}</h3>
                <span className="text-amber-400 text-lg font-arabic">{item.arabic}</span>
              </div>
              <p className="text-gray-300 mb-3">{item.definition}</p>
              <div className="flex items-start gap-2 p-3 bg-amber-900/20 rounded-lg border border-amber-800">
                <span className="text-amber-400 text-sm">💡</span>
                <p className="text-amber-300 text-sm">{item.tip}</p>
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No terms found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            This glossary is version-controlled. As laws change and knowledge grows, it updates.
          </p>
          <p className="text-amber-500 text-xs mt-2">
            TIFORT-VERIFY • The Woman Who Knows
          </p>
        </div>
      </div>
    </div>
  );
}
