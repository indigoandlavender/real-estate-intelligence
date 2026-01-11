'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// World Cup 2030 Target Date
const WC2030_DATE = new Date('2030-06-14T00:00:00');

// Sample Boutique Collection
const BOUTIQUE_COLLECTION = [
  {
    id: 'laksour-280',
    name: 'Riad Laksour',
    neighborhood: 'Laksour',
    price: 4500000,
    sqm: 280,
    rooms: 8,
    verified: true,
    verificationLevel: 'gold',
    image: '/properties/laksour.jpg',
    headline: 'Premier investment opportunity in the heart of historic Laksour',
    features: ['8 Suites', '280m²', 'Rooftop Terrace', '300m to Jemaa el-Fna'],
  },
  {
    id: 'mouassine-120',
    name: 'Dar Mouassine',
    neighborhood: 'Mouassine',
    price: 3200000,
    sqm: 120,
    rooms: 5,
    verified: true,
    verificationLevel: 'silver',
    image: '/properties/mouassine.jpg',
    headline: 'Turnkey boutique hotel in prestigious Mouassine quarter',
    features: ['5 Suites', '120m²', 'Operating License', 'Fountain Courtyard'],
  },
  {
    id: 'kasbah-180',
    name: 'Riad Kasbah',
    neighborhood: 'Kasbah',
    price: 4800000,
    sqm: 180,
    rooms: 6,
    verified: true,
    verificationLevel: 'gold',
    image: '/properties/kasbah.jpg',
    headline: 'Meticulously restored palace with Atlas views',
    features: ['6 Suites', '180m²', 'Private Pool', 'Historic Certification'],
  },
];

// Infrastructure projects for 2030
const INFRASTRUCTURE_PROJECTS = [
  { name: 'Marrakech-Agadir LGV', distance: '2.1km', impact: 'high', status: 'Under Construction' },
  { name: 'New Stadium Complex', distance: '4.5km', impact: 'high', status: 'Planned' },
  { name: 'Medina Pedestrian Zone', distance: '0.3km', impact: 'medium', status: 'Approved' },
  { name: 'Airport Terminal 3', distance: '8km', impact: 'medium', status: 'Under Construction' },
];

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function Home() {
  const countdown = useCountdown(WC2030_DATE);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-[0.2em]">
            Melkia 2.0
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="#collection" className="text-sm tracking-widest text-gray-400 hover:text-white transition-colors">
              Collection
            </Link>
            <Link href="#infrastructure" className="text-sm tracking-widest text-gray-400 hover:text-white transition-colors">
              2030 Impact
            </Link>
            <Link href="/assess" className="text-sm tracking-widest text-gray-400 hover:text-white transition-colors">
              Verify
            </Link>
            <Link
              href="/assess"
              className="px-5 py-2 border border-white/20 text-sm tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Private Access
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[url('/medina-pattern.svg')] opacity-[0.02]" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-6">
              LAKSOUR · MARRAKECH · MOROCCO
            </p>
            <h1 className="font-display text-5xl md:text-7xl tracking-wide leading-tight mb-8">
              The Future of Historic
              <br />
              Investment in Marrakech
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Verified heritage properties in Morocco&apos;s most prestigious Medina quarters.
              Forensically audited. Investment grade. World Cup 2030 ready.
            </p>
          </motion.div>

          {/* WC2030 Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <p className="text-xs tracking-[0.3em] text-gray-600 mb-4">WORLD CUP 2030 KICKOFF</p>
            <div className="flex items-center justify-center gap-6">
              <CountdownUnit value={countdown.days} label="Days" />
              <span className="text-2xl text-gray-700">:</span>
              <CountdownUnit value={countdown.hours} label="Hours" />
              <span className="text-2xl text-gray-700">:</span>
              <CountdownUnit value={countdown.minutes} label="Min" />
              <span className="text-2xl text-gray-700">:</span>
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-6"
          >
            <Link
              href="#collection"
              className="px-8 py-4 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100 transition-colors"
            >
              View Collection
            </Link>
            <Link
              href="/assess"
              className="px-8 py-4 border border-white/20 text-sm tracking-widest hover:bg-white/5 transition-colors"
            >
              Request Audit
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent"
          />
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 gap-16 text-center"
          >
            <div>
              <p className="font-display text-5xl mb-4">47</p>
              <p className="text-sm tracking-widest text-gray-500">Verified Properties</p>
            </div>
            <div>
              <p className="font-display text-5xl mb-4">8.2%</p>
              <p className="text-sm tracking-widest text-gray-500">Avg Net Yield</p>
            </div>
            <div>
              <p className="font-display text-5xl mb-4">+35%</p>
              <p className="text-sm tracking-widest text-gray-500">Projected 2030 Appreciation</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Boutique Collection */}
      <section id="collection" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">BOUTIQUE COLLECTION</p>
            <h2 className="font-display text-4xl tracking-wide">Investment-Grade Heritage</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BOUTIQUE_COLLECTION.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-16"
          >
            <Link
              href="/listings"
              className="inline-block px-8 py-4 border border-white/20 text-sm tracking-widest hover:bg-white/5 transition-colors"
            >
              View Full Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Infrastructure Impact */}
      <section id="infrastructure" className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">2030 INFRASTRUCTURE</p>
            <h2 className="font-display text-4xl tracking-wide">Proximity Impact Analysis</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Properties within 500m of new infrastructure projects are projected to appreciate 5%+ by 2030.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INFRASTRUCTURE_PROJECTS.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      project.impact === 'high' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {project.impact === 'high' ? 'High Impact' : 'Medium Impact'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{project.distance} from Medina</p>
                  </div>
                </div>
                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: project.impact === 'high' ? '85%' : '60%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full ${
                      project.impact === 'high' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 border border-white/10 text-center"
          >
            <p className="text-xs tracking-[0.3em] text-gray-600 mb-2">LAKSOUR NEIGHBORHOOD</p>
            <p className="font-display text-2xl">300m to Jemaa el-Fna · 2.1km to LGV Station</p>
            <p className="text-gray-500 mt-3">
              Prime positioning for both tourist traffic and infrastructure appreciation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-6">VERIFIED INVESTMENT</p>
            <h2 className="font-display text-4xl tracking-wide mb-6">
              Request a Full Forensic Audit
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Our verification process includes structural engineering assessment,
              legal title analysis, and 2026 tax compliance review.
              Only Gold-Verified properties qualify for institutional investment.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/assess"
                className="px-10 py-5 bg-white text-black text-sm tracking-widest font-medium hover:bg-gray-100 transition-colors"
              >
                Start Verification
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg tracking-[0.2em]">Melkia 2.0</p>
              <p className="text-xs text-gray-600 mt-1 tracking-widest">
                LAKSOUR REAL ESTATE · MEDINA INVESTMENT
              </p>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link>
              <Link href="/assess" className="hover:text-white transition-colors">Verify</Link>
              <Link href="/listings" className="hover:text-white transition-colors">Collection</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            <p>Forensic Real Estate Intelligence · Marrakech, Morocco</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-5xl tabular-nums">
        {value.toString().padStart(2, '0')}
      </p>
      <p className="text-[10px] tracking-[0.2em] text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function PropertyCard({ property, index }: { property: typeof BOUTIQUE_COLLECTION[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link href={`/property/${property.id}`} className="group block">
        <div className="relative aspect-[4/5] bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden mb-6">
          {/* Placeholder for property image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display text-3xl text-gray-700">{property.rooms}</p>
              <p className="text-xs tracking-widest text-gray-600">SUITES</p>
            </div>
          </div>

          {/* Verification Badge */}
          {property.verified && (
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1.5 text-[10px] tracking-widest font-medium ${
                property.verificationLevel === 'gold'
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-300 text-black'
              }`}>
                {property.verificationLevel === 'gold' ? 'GOLD VERIFIED' : 'VERIFIED'}
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-sm tracking-widest">View Property</p>
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-2">{property.neighborhood.toUpperCase()}</p>
          <h3 className="font-display text-xl tracking-wide mb-2">{property.name}</h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{property.headline}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs text-gray-500">
              {property.features.slice(0, 2).map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <p className="font-display text-lg">
              {(property.price / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
