import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import useCartStore from '../../store/cartStore.js';
import useLanguageStore from '../../store/languageStore.js';

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(n);

export default function QuickViewModal({ product, onClose }) {
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { t, lang } = useLanguageStore();

  if (!product) return null;

  const name = product.name?.[lang] || product.name?.ru || product.name;
  const description = product.description?.[lang] || product.description?.ru || '';

  const handleAddToCart = () => {
    addItem(product, {
      color: selectedColor?.name,
      colorHex: selectedColor?.hex,
      quantity,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-luxury-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-1/2 aspect-square sm:aspect-auto relative">
              <img
                src={selectedColor?.images?.[0] || product.images?.[0] || '/placeholder.jpg'}
                alt={name}
                className="w-full h-full object-cover rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:bg-pink-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Details */}
            <div className="sm:w-1/2 p-6 flex flex-col">
              <div className="flex-1">
                <p className="text-xs text-charcoal-400 uppercase tracking-widest mb-1">{product.material}</p>
                <h2 className="font-serif text-2xl text-charcoal-800 mb-3">{name}</h2>

                {product.numReviews > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.round(product.rating) ? 'text-gold-400' : 'text-charcoal-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-charcoal-400">({product.numReviews})</span>
                  </div>
                )}

                <p className="text-charcoal-500 text-sm leading-relaxed mb-4 line-clamp-3">{description}</p>

                {/* Price */}
                <div className="mb-4">
                  {product.compareAtPrice > product.retailPrice && (
                    <p className="text-sm text-charcoal-400 line-through">{formatPrice(product.compareAtPrice)} UZS</p>
                  )}
                  <p className="text-pink-500 font-bold text-2xl">
                    {formatPrice(product.retailPrice)} <span className="text-sm font-normal text-charcoal-400">UZS</span>
                  </p>
                </div>

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-charcoal-600 mb-2">{t('product.select_color')}: <span className="text-pink-500">{selectedColor?.name}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          title={color.name}
                          onClick={() => setSelectedColor(color)}
                          className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: color.hex,
                            borderColor: selectedColor?.name === color.name ? '#E8A2B5' : '#E8E8E8',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-charcoal-600 mb-2">{t('product.quantity')}</p>
                  <div className="flex items-center gap-3 bg-charcoal-50 rounded-xl p-1 w-fit">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-charcoal-700 hover:bg-pink-50 hover:text-pink-500 transition-all font-bold">−</button>
                    <span className="w-8 text-center font-semibold text-charcoal-800">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-charcoal-700 hover:bg-pink-50 hover:text-pink-500 transition-all font-bold">+</button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  {t('product.add_to_cart')}
                </button>
                <Link
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 text-sm text-charcoal-500 hover:text-pink-500 transition-colors"
                >
                  <ExternalLink size={14} />
                  Подробнее о товаре
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
