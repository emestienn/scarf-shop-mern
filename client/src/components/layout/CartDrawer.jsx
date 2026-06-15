import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import useLanguageStore from '../../store/languageStore.js';

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(n);

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, shippingCost, total } = useCartStore();
  const { t } = useLanguageStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-luxury-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-pink-400" />
                <h2 className="font-serif text-xl text-charcoal-800">{t('cart.title')}</h2>
                {items.length > 0 && (
                  <span className="bg-pink-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-pink-50 text-charcoal-400 hover:text-pink-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center">
                    <ShoppingBag size={36} className="text-pink-300" />
                  </div>
                  <div>
                    <p className="font-serif text-lg text-charcoal-700">{t('cart.empty')}</p>
                    <p className="text-sm text-charcoal-400 mt-1">{t('cart.empty_sub')}</p>
                  </div>
                  <Link to="/products" onClick={closeCart} className="btn-outline text-sm">
                    {t('cart.browse')}
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 bg-pink-50/50 rounded-2xl p-3"
                      >
                        <Link to={`/products/${item.slug}`} onClick={closeCart}>
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-medium text-sm text-charcoal-800 hover:text-pink-500 line-clamp-2 transition-colors"
                          >
                            {item.name}
                          </Link>
                          {item.color && (
                            <div className="flex items-center gap-1 mt-1">
                              {item.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-charcoal-200 inline-block"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                              )}
                              <span className="text-xs text-charcoal-400">{item.color}</span>
                            </div>
                          )}
                          <p className="text-pink-500 font-semibold text-sm mt-1">
                            {formatPrice(item.unitPrice)} UZS
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-white rounded-full border border-charcoal-200">
                              <button
                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                className="p-1 rounded-full hover:bg-pink-50 text-charcoal-500 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                className="p-1 rounded-full hover:bg-pink-50 text-charcoal-500 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-charcoal-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-charcoal-100 px-6 py-5 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-charcoal-600">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatPrice(subtotal)} UZS</span>
                  </div>
                  <div className="flex justify-between text-sm text-charcoal-600">
                    <span>{t('cart.shipping')}</span>
                    <span className={shippingCost === 0 ? 'text-green-500 font-medium' : ''}>
                      {shippingCost === 0 ? t('cart.free_shipping') : `${formatPrice(shippingCost)} UZS`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-charcoal-400">{t('cart.free_shipping_threshold')}</p>
                  )}
                  <div className="flex justify-between font-semibold text-charcoal-800 text-base pt-2 border-t border-charcoal-100">
                    <span>{t('cart.total')}</span>
                    <span className="text-pink-500">{formatPrice(total)} UZS</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full text-center block"
                >
                  {t('cart.checkout')}
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
