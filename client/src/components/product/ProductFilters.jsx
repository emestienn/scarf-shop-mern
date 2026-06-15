import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-charcoal-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="font-medium text-charcoal-700 text-sm">{title}</span>
        <ChevronDown size={16} className={`text-charcoal-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductFilters({ filters, onChange, onClear }) {
  const { t } = useLanguageStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = ['hijab', 'platok', 'shawl', 'scarf'];
  const materials  = ['silk', 'chiffon', 'cotton', 'georgette', 'viscose', 'modal', 'jersey'];
  const patterns   = ['solid', 'floral', 'monogram', 'patterned', 'geometric'];
  const sortOptions = [
    { value: '-createdAt', label: t('filters.sort_options.newest') },
    { value: 'retailPrice', label: t('filters.sort_options.price_asc') },
    { value: '-retailPrice', label: t('filters.sort_options.price_desc') },
    { value: '-numReviews', label: t('filters.sort_options.popular') },
  ];

  const CheckOption = ({ group, value, label }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <input
        type="radio"
        name={group}
        value={value}
        checked={filters[group] === value}
        onChange={() => onChange({ ...filters, [group]: filters[group] === value ? '' : value })}
        className="sr-only"
      />
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        filters[group] === value
          ? 'border-pink-400 bg-pink-400'
          : 'border-charcoal-300 group-hover:border-pink-300'
      }`}>
        {filters[group] === value && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
      </span>
      <span className="text-sm text-charcoal-600 group-hover:text-charcoal-800">{label}</span>
    </label>
  );

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '-createdAt');

  const FilterContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg text-charcoal-800">{t('filters.title')}</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs text-pink-400 hover:text-pink-600 flex items-center gap-1">
            <X size={12} /> {t('filters.clear')}
          </button>
        )}
      </div>

      <FilterSection title={t('filters.sort')}>
        <div className="space-y-0.5">
          {sortOptions.map((opt) => (
            <CheckOption key={opt.value} group="sort" value={opt.value} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t('filters.category')}>
        <div className="space-y-0.5">
          {categories.map((c) => (
            <CheckOption key={c} group="category" value={c} label={t(`filters.categories.${c}`)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t('filters.material')}>
        <div className="space-y-0.5">
          {materials.map((m) => (
            <CheckOption key={m} group="material" value={m} label={t(`filters.materials.${m}`)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t('filters.pattern')}>
        <div className="space-y-0.5">
          {patterns.map((p) => (
            <CheckOption key={p} group="pattern" value={p} label={t(`filters.patterns.${p}`)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t('filters.price')}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={filters.minPrice || ''}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="input-field text-sm py-2"
            />
            <input
              type="number"
              placeholder="До"
              value={filters.maxPrice || ''}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="input-field text-sm py-2"
            />
          </div>
          <p className="text-xs text-charcoal-400">В сумах (UZS)</p>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-2xl shadow-luxury p-6 h-fit sticky top-24">
        <FilterContent />
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 btn-outline text-sm px-4 py-2.5"
        >
          <SlidersHorizontal size={16} />
          {t('filters.title')}
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-pink-400 text-white text-xs rounded-full flex items-center justify-center">
              {Object.values(filters).filter((v) => v && v !== '-createdAt').length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-charcoal-900/40 z-40"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-80 bg-white z-50 p-6 overflow-y-auto shadow-luxury-lg"
              >
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-pink-50 rounded-full">
                  <X size={20} />
                </button>
                <FilterContent />
                <button onClick={() => setMobileOpen(false)} className="btn-primary w-full mt-4">
                  Применить
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
