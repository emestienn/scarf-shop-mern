import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, ChevronDown, Clock, CheckCircle, XCircle,
  Settings2, Truck, BadgeCheck, RotateCcw, Store, MapPin, CreditCard,
} from 'lucide-react';
import useLanguageStore from '../store/languageStore.js';
import { ordersApi } from '../api/index.js';

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
  day: '2-digit', month: 'long', year: 'numeric',
});

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-charcoal-100 text-charcoal-600',
};

const STATUS_ICONS = {
  pending:    <Clock size={12} />,
  confirmed:  <CheckCircle size={12} />,
  processing: <Settings2 size={12} />,
  shipped:    <Truck size={12} />,
  delivered:  <BadgeCheck size={12} />,
  cancelled:  <XCircle size={12} />,
  refunded:   <RotateCcw size={12} />,
};

const StatusBadge = ({ status, t }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
    {STATUS_ICONS[status]}
    {t(`orders.status.${status}`)}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-luxury p-5 space-y-3">
    <div className="flex justify-between">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="skeleton h-5 w-20 rounded-full" />
    </div>
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => <div key={i} className="skeleton w-16 h-16 rounded-xl" />)}
    </div>
    <div className="skeleton h-4 w-24 rounded" />
  </div>
);

export default function Orders() {
  const { t } = useLanguageStore();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-charcoal-50/50">
      <div className="bg-luxury-gradient border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800">{t('orders.title')}</h1>
          <p className="text-charcoal-400 text-sm mt-2">{t('orders.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={36} className="text-pink-300" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal-700 mb-2">{t('orders.empty')}</h3>
            <p className="text-charcoal-400 mb-6">{t('orders.empty_sub')}</p>
            <Link to="/products" className="btn-primary inline-block">{t('orders.browse')}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const isOpen = expanded === order._id;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                  className="bg-white rounded-2xl shadow-luxury overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="w-full text-left p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-charcoal-800">{t('orders.order')} {order.orderNumber}</p>
                        <p className="text-xs text-charcoal-400 mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>
                      <StatusBadge status={order.status} t={t} />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                      {order.items?.map((item, i) => (
                        <img
                          key={i}
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-pink-100"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-charcoal-500">
                        {order.items?.length} {t('orders.items_count').toLowerCase()}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-pink-500">{formatPrice(order.totalAmount)} UZS</p>
                        <ChevronDown size={16} className={`text-charcoal-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-charcoal-100"
                      >
                        <div className="p-5 space-y-4">
                          {/* Items detail */}
                          <ul className="space-y-3">
                            {order.items?.map((item, i) => (
                              <li key={i} className="flex gap-3">
                                <img
                                  src={item.image || '/placeholder.jpg'}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-pink-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-charcoal-800 line-clamp-1">{item.name}</p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400 flex-wrap">
                                    {item.color && (
                                      <span className="flex items-center gap-1">
                                        {item.colorHex && <span className="w-2.5 h-2.5 rounded-full border border-charcoal-200 inline-block" style={{ backgroundColor: item.colorHex }} />}
                                        {t('orders.color')}: {item.color}
                                      </span>
                                    )}
                                    {item.size && <span>{t('orders.size')}: {item.size}</span>}
                                    <span>{t('orders.quantity')}: {item.quantity}</span>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-charcoal-700 flex-shrink-0">{formatPrice(item.totalPrice)} UZS</p>
                              </li>
                            ))}
                          </ul>

                          <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-charcoal-100 text-sm">
                            <div>
                              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                <MapPin size={12} /> {t('orders.shipping_address')}
                              </p>
                              {order.deliveryMethod === 'pickup' ? (
                                <p className="text-charcoal-700 flex items-center gap-1.5">
                                  <Store size={13} className="text-gold-500" /> {t('orders.pickup')}: {order.pickupLocation}
                                </p>
                              ) : (
                                <p className="text-charcoal-700">
                                  {order.shippingAddress?.district}, {order.shippingAddress?.street}
                                  {order.shippingAddress?.apartment ? `, кв.${order.shippingAddress.apartment}` : ''}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                <CreditCard size={12} /> {t('orders.payment_method')}
                              </p>
                              <p className="text-charcoal-700 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                              <p className={`text-xs mt-1 flex items-center gap-1 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.isPaid
                                  ? <><CheckCircle size={11} /> {t('orders.paid')}</>
                                  : <><Clock size={11} /> {t('orders.not_paid')}</>}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
