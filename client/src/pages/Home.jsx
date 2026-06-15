import HeroCarousel from '../components/home/HeroCarousel.jsx';
import WholesaleRetailBanner from '../components/home/WholesaleRetailBanner.jsx';
import BestSellers from '../components/home/BestSellers.jsx';
import InstagramFeed from '../components/home/InstagramFeed.jsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useLanguageStore from '../store/languageStore.js';

const categories = [
  { slug: 'hijab',  emoji: '🕌', labelRu: 'Хиджабы',  labelUz: 'Hijoblar',  bg: 'from-pink-100 to-pink-50' },
  { slug: 'platok', emoji: '🌸', labelRu: 'Платки',    labelUz: 'Ro\'mollar', bg: 'from-gold-100 to-gold-50' },
  { slug: 'shawl',  emoji: '✨', labelRu: 'Шали',      labelUz: 'Shallar',   bg: 'from-charcoal-100 to-charcoal-50' },
  { slug: 'scarf',  emoji: '🎀', labelRu: 'Шарфы',    labelUz: 'Sharflar',  bg: 'from-pink-50 to-gold-50' },
];

const features = [
  { icon: '✦', titleRu: 'Премиум качество',   subtitleRu: 'Лучшие ткани со всего мира' },
  { icon: '🚚', titleRu: 'Доставка по Ташкенту', subtitleRu: 'Быстро и надёжно' },
  { icon: '🏢', titleRu: 'Оптовые условия',    subtitleRu: 'Скидки до 40% для бизнеса' },
  { icon: '💎', titleRu: 'Гарантия качества',  subtitleRu: '100% возврат при дефекте' },
];

export default function Home() {
  const { lang } = useLanguageStore();

  return (
    <main>
      {/* Hero */}
      <HeroCarousel />

      {/* Category cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className={`block rounded-2xl bg-gradient-to-br ${cat.bg} p-6 text-center hover-lift group transition-all duration-300 hover:shadow-luxury`}
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </span>
                  <h3 className="font-serif text-lg text-charcoal-800">
                    {lang === 'uz' ? cat.labelUz : cat.labelRu}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <BestSellers variant="bestSeller" />

      {/* Features strip */}
      <section className="py-12 bg-luxury-gradient border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-medium text-charcoal-800 text-sm">{f.titleRu}</h4>
                <p className="text-charcoal-400 text-xs mt-0.5">{f.subtitleRu}</p>
              </motion.div>
            ))}
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
          <span className="badge-luxury bg-gold-400/20 text-gold-300 border border-gold-400/30 mb-4">
            ✦ LUXURY PLATOK
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white mt-4 mb-4">
            Начните свою коллекцию
          </h2>
          <p className="text-charcoal-400 mb-8">
            Более 200 наименований платков, хиджабов и шалей. Доставка по всему Ташкенту.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="btn-primary">
              Смотреть каталог
            </Link>
            <Link to="/stores" className="btn-outline border-charcoal-600 text-charcoal-300 hover:text-white hover:border-charcoal-400">
              Наши магазины
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
