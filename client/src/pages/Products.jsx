import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductFilters from '../components/product/ProductFilters.jsx';
import QuickViewModal from '../components/product/QuickViewModal.jsx';
import useLanguageStore from '../store/languageStore.js';
import { productsApi } from '../api/index.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SkeletonCard = () => (
  <div className="card-luxury overflow-hidden">
    <div className="skeleton aspect-[3/4]" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-5 w-24 rounded mt-2" />
    </div>
  </div>
);

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguageStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [quickView, setQuickView] = useState(null);

  const getFiltersFromParams = useCallback(() => ({
    category:   searchParams.get('category')   || '',
    material:   searchParams.get('material')   || '',
    pattern:    searchParams.get('pattern')    || '',
    minPrice:   searchParams.get('minPrice')   || '',
    maxPrice:   searchParams.get('maxPrice')   || '',
    search:     searchParams.get('search')     || '',
    sort:       searchParams.get('sort')       || '-createdAt',
    page:       Number(searchParams.get('page')) || 1,
    bestSeller: searchParams.get('bestSeller') || '',
    newArrival: searchParams.get('newArrival') || '',
  }), [searchParams]);

  const filters = getFiltersFromParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
        );
        const { data } = await productsApi.getAll({ ...params, limit: 20 });
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const setPage = (p) => updateFilters({ ...filters, page: p });

  const titleMap = {
    hijab:  'Хиджабы',
    platok: 'Платки',
    shawl:  'Шали',
    scarf:  'Шарфы',
  };

  const pageTitle = filters.search
    ? `Поиск: "${filters.search}"`
    : filters.category
    ? titleMap[filters.category] || t('nav.catalog')
    : filters.bestSeller === 'true'
    ? t('sections.best_sellers')
    : filters.newArrival === 'true'
    ? t('sections.new_arrivals')
    : t('nav.catalog');

  return (
    <main className="min-h-screen bg-charcoal-50/50">
      {/* Header */}
      <div className="bg-luxury-gradient border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800">{pageTitle}</h1>
          {total > 0 && (
            <p className="text-charcoal-400 text-sm mt-2">{total} товаров</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar only — mobile gets its own toggle button below, in the grid column */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onChange={(f) => updateFilters({ ...f, page: 1 })}
              onClear={clearFilters}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter row */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <ProductFilters
                filters={filters}
                onChange={(f) => updateFilters({ ...f, page: 1 })}
                onClear={clearFilters}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-serif text-2xl text-charcoal-700 mb-2">Товары не найдены</h3>
                <p className="text-charcoal-400 mb-6">Попробуйте изменить фильтры или поисковый запрос</p>
                <button onClick={clearFilters} className="btn-outline">
                  {t('filters.clear')}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={setQuickView} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="w-10 h-10 rounded-full bg-white shadow-luxury flex items-center justify-center hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - filters.page) < 3 || p === 1 || p === pages)
                      .map((p, i, arr) => (
                        <span key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-charcoal-300 px-1">…</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                              p === filters.page
                                ? 'bg-pink-400 text-white shadow-pink'
                                : 'bg-white shadow-luxury text-charcoal-700 hover:bg-pink-50'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}

                    <button
                      onClick={() => setPage(filters.page + 1)}
                      disabled={filters.page === pages}
                      className="w-10 h-10 rounded-full bg-white shadow-luxury flex items-center justify-center hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
