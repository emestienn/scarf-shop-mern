import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../product/ProductCard.jsx';
import QuickViewModal from '../product/QuickViewModal.jsx';
import useLanguageStore from '../../store/languageStore.js';
import { productsApi } from '../../api/index.js';

const SkeletonCard = () => (
  <div className="card-luxury overflow-hidden">
    <div className="skeleton aspect-[3/4]" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-5 w-24 rounded mt-3" />
    </div>
  </div>
);

export default function BestSellers({ variant = 'bestSeller' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [quickView, setQuickView] = useState(null);
  const { t } = useLanguageStore();

  const isBest = variant === 'bestSeller';

  useEffect(() => {
    const fetch = async () => {
      try {
        const param = isBest ? { bestSeller: 'true' } : { newArrival: 'true' };
        const { data } = await productsApi.getAll({ ...param, limit: 4 });
        setProducts(data.products);
      } catch {
        // Silently fail; product grid will be empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [variant]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">
            {isBest ? t('sections.best_sellers') : t('sections.new_arrivals')}
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            {isBest ? t('sections.best_sellers_sub') : t('sections.new_arrivals_sub')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal-400">Скоро здесь появятся товары ✨</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to={isBest ? '/products?bestSeller=true' : '/products?newArrival=true'}
            className="btn-outline"
          >
            {t('common.see_all')}
          </Link>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}
