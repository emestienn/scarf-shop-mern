import HeroCarousel from '../components/home/HeroCarousel.jsx';
import WholesaleRetailBanner from '../components/home/WholesaleRetailBanner.jsx';
import BestSellers from '../components/home/BestSellers.jsx';
import InstagramFeed from '../components/home/InstagramFeed.jsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Truck, Building2, ShieldCheck, Layers, Wind, Feather, Tag } from 'lucide-react';
import useLanguageStore from '../store/languageStore.js';

const CATEGORY_ICONS = {
  hijab:  <Layers  size={32} strokeWidth={1.5} />,
  platok: <Wind    size={32} strokeWidth={1.5} />,
  shawl:  <Feather size={32} strokeWidth={1.5} />,
  scarf:  <Tag     size={32} strokeWidth={1.5} />,
};

const CATEGORY_SLUGS = ['hijab', 'platok', 'shawl', 'scarf'];

const CATEGORY_BG = {
  hijab:  'from-pink-100 to-pink-50',
  platok: 'from-gold-100 to-gold-50',
  shawl:  'from-charcoal-100 to-charcoal-50',
  scarf:  'from-pink-50 to-gold-50',
};

const CATEGORY_ICON_COLOR = {
  hijab:  'text-pink-400',
  platok: 'text-gold-500',
  shawl:  'text-charcoal-500',
  scarf:  'text-pink-300',
};

const FEATURE_ICONS = [
  <Sparkles   size={26} strokeWidth={1.5} />,
  <Truck      size={26} strokeWidth={1.5} />,
  <Building2  size={26} strokeWidth={1.5} />,
  <ShieldCheck size={26} strokeWidth={1.5} />,
];

const FEATURE_ICON_COLOR = ['text-pink-400', 'text-gold-500', 'text-charcoal-500', 'text-pink-400'];

export default function Home() {
  const { t, lang } = useLanguageStore();

  const features = t('features') || [];
  const categories = t('categories') || {};

  return (
    <main>
      {/* Hero */}
      <HeroCarousel />

      {/* Category cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal-800">
              {lang === 'uz' ? 'Kategoriyalar' : 'Категории'}
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORY_SLUGS.map((slug, i) => {
              const cat = categories[slug] || {};
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    to={`/products?category=${slug}`}
                    className={`block rounded-2xl bg-gradient-to-br ${CATEGORY_BG[slug]} p-6 text-center hover-lift group transition-all duration-300 hover:shadow-luxury`}
                  >
                    <div className={`flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 ${CATEGORY_ICON_COLOR[slug]}`}>
                      {CATEGORY_ICONS[slug]}
                    </div>
                    <h3 className="font-serif text-lg text-charcoal-800 mb-0.5">{cat.label}</h3>
                    <p className="text-xs text-charcoal-400">{cat.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <BestSellers variant="bestSeller" />

      {/* Features strip */}
      <section className="py-14 bg-luxury-gradient border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURE_ICONS.map((icon, i) => {
              const f = Array.isArray(features) ? features[i] : null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className={`flex items-center justify-center mb-3 ${FEATURE_ICON_COLOR[i]}`}>
                    {icon}
                  </div>
                  <h4 className="font-semibold text-charcoal-800 text-sm">{f?.title}</h4>
                  <p className="text-charcoal-400 text-xs mt-0.5">{f?.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <div className="bg-pink-50/50">
        <BestSellers variant="newArrival" />
      </div>

      {/* Wholesale Banner */}
      <WholesaleRetailBanner />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA section */}
      <section className="py-20 bg-charcoal-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#C9A96E"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)"/>
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <span className="badge-luxury bg-gold-400/20 text-gold-300 border border-gold-400/30 mb-4 inline-flex items-center gap-2">
            <Sparkles size={13} /> LUXURY PLATOK
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white mt-4 mb-4">
            {t('home.cta_title')}
          </h2>
          <p className="text-charcoal-400 mb-8">
            {t('home.cta_sub')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="btn-primary">
              {t('home.cta_btn')}
            </Link>
            <Link to="/stores" className="btn-outline border-charcoal-600 text-charcoal-300 hover:text-white hover:border-charcoal-400">
              {t('home.stores_btn')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
