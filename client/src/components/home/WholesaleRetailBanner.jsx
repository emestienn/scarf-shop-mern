import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag, Building2, Gem } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

export default function WholesaleRetailBanner() {
  const [active, setActive] = useState('retail');
  const { t } = useLanguageStore();

  const retailPerks     = t('wholesale_banner.retail_perks')    || [];
  const wholesalePerks  = t('wholesale_banner.wholesale_perks') || [];

  return (
    <section className="py-16 bg-luxury-gradient">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="badge-luxury bg-gold-100 text-gold-600 border border-gold-200 mb-3 inline-flex items-center gap-1.5">
            <Gem size={12} /> {t('wholesale_banner.badge')}
          </span>
          <h2 className="section-title mt-3">{t('wholesale_banner.title')}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('wholesale_banner.subtitle')}</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-luxury flex gap-1">
            <button
              onClick={() => setActive('retail')}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                active === 'retail'
                  ? 'bg-pink-400 text-white shadow-pink'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              }`}
            >
              {t('wholesale_banner.retail_label')}
            </button>
            <button
              onClick={() => setActive('wholesale')}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                active === 'wholesale'
                  ? 'bg-gold-gradient text-charcoal-800 shadow-luxury'
                  : 'text-charcoal-500 hover:text-charcoal-700'
              }`}
            >
              <Gem size={13} /> {t('wholesale_banner.wholesale_label')}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Retail card */}
          <motion.div
            animate={{ scale: active === 'retail' ? 1 : 0.97, opacity: active === 'retail' ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
            className="card-luxury p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                <ShoppingBag size={20} className="text-pink-400" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-800">{t('wholesale_banner.retail_title')}</h3>
            </div>
            <p className="text-charcoal-400 text-sm mb-6">{t('wholesale_banner.retail_sub')}</p>
            <ul className="space-y-3 mb-8">
              {retailPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-charcoal-700">
                  <Check size={16} className="text-pink-400 mt-0.5 flex-shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link to="/products" className="btn-outline w-full text-center block">
              {t('wholesale_banner.retail_cta')}
            </Link>
          </motion.div>

          {/* Wholesale card */}
          <motion.div
            animate={{ scale: active === 'wholesale' ? 1 : 0.97, opacity: active === 'wholesale' ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
            className="card-luxury p-8 relative overflow-hidden border-2 border-gold-300"
          >
            <div className="absolute top-4 right-4 badge-luxury bg-gold-100 text-gold-600 text-xs font-semibold border border-gold-200 flex items-center gap-1">
              <Gem size={10} /> {t('wholesale_banner.wholesale_badge')}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                <Building2 size={20} className="text-gold-500" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-800">{t('wholesale_banner.wholesale_title')}</h3>
            </div>
            <p className="text-charcoal-400 text-sm mb-6">{t('wholesale_banner.wholesale_sub')}</p>
            <ul className="space-y-3 mb-8">
              {wholesalePerks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-charcoal-700">
                  <Check size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-gold w-full text-center block">
              {t('wholesale_banner.cta')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
