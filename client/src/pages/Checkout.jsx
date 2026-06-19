import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Send, MapPin, Loader2, Navigation } from 'lucide-react';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import useLanguageStore from '../store/languageStore.js';
import { ordersApi, configApi } from '../api/index.js';
import { PLACEHOLDER_IMAGE, handleImageError } from '../utils/image.js';

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(n);

const STEPS = ['delivery', 'payment', 'confirm'];

const PICKUP_LOCATIONS = [
  { value: 'chorsu',    label: 'Чорсу / Фунча' },
  { value: 'yunusabad', label: 'Юнусабад' },
  { value: 'abu_sahiy', label: 'Абу Сахий' },
];

const PAYMENT_METHODS = [
  { value: 'click',            label: 'Click', icon: '💳', desc: 'Онлайн оплата через Click' },
  { value: 'payme',            label: 'Payme', icon: '💳', desc: 'Онлайн оплата через Payme' },
  { value: 'cash_on_delivery', label: 'Наличные',  icon: '💵', desc: 'Оплата при получении' },
  { value: 'card_on_delivery', label: 'Карта',     icon: '💳', desc: 'Карта при получении' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shippingCost, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { t, lang } = useLanguageStore();

  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError]           = useState('');
  const [botUsername, setBotUsername] = useState('');

  // Location state — GPS coords and/or manual address text
  const [loc, setLoc] = useState({
    address:   '',
    lat:       null,
    lng:       null,
    detecting: false,
    detected:  false,
    geoError:  '',
  });
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    configApi.get()
      .then(({ data }) => setBotUsername(data.telegramBotUsername || ''))
      .catch(() => {});
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLoc((l) => ({ ...l, geoError: t('checkout.location.no_support') }));
      return;
    }
    setLoc((l) => ({ ...l, detecting: true, geoError: '' }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc((l) => ({
          ...l,
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          detecting: false,
          detected:  true,
          geoError:  '',
        }));
        setLocError(false);
      },
      () => {
        setLoc((l) => ({ ...l, detecting: false, geoError: t('checkout.location.denied') }));
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const [form, setForm] = useState({
    fullName:       user?.name || '',
    phone:          user?.phone || '',
    district:       '',
    street:         '',
    apartment:      '',
    notes:          '',
    deliveryMethod: 'delivery',
    pickupLocation: 'chorsu',
    paymentMethod:  'cash_on_delivery',
    guestEmail:     user?.email || '',
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderData = {
        items: items.map((i) => ({
          product:  i.product,
          color:    i.color,
          colorHex: i.colorHex,
          size:     i.size,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName:  form.fullName,
          phone:     form.phone,
          city:      'Tashkent',
          district:  form.district,
          street:    form.street,
          apartment: form.apartment,
          notes:     form.notes,
        },
        deliveryMethod: form.deliveryMethod,
        pickupLocation: form.deliveryMethod === 'pickup' ? form.pickupLocation : undefined,
        paymentMethod:  form.paymentMethod,
        guestEmail:     form.guestEmail,
        guestPhone:     form.phone,
        language:       lang,
        location: form.deliveryMethod === 'delivery' ? {
          address:   loc.address || undefined,
          latitude:  loc.lat     || undefined,
          longitude: loc.lng     || undefined,
          mapLink:   loc.lat ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : undefined,
        } : undefined,
      };

      const { data } = await ordersApi.create(orderData);
      setPlacedOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка оформления заказа');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-luxury-lg p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-500" />
          </div>
          <h2 className="font-serif text-3xl text-charcoal-800 mb-3">{t('checkout.order_success')}</h2>
          <p className="text-charcoal-500 mb-2">
            {t('checkout.order_success_msg').replace('{number}', placedOrder.orderNumber)}
          </p>
          <p className="text-sm text-charcoal-400 mb-8">
            Заказ <strong className="text-charcoal-700">{placedOrder.orderNumber}</strong>
          </p>
          <div className="space-y-3">
            {/* Telegram notification CTA — shown when bot username is available */}
            {botUsername && (
              <a
                href={`https://t.me/${botUsername}?start=${placedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#229ED9] hover:bg-[#1a8fc7] text-white font-medium transition-colors"
              >
                <Send size={18} />
                {t('checkout.telegram_notify')}
              </a>
            )}
            {user && (
              <Link to="/orders" className="btn-primary w-full block text-center">
                Мои заказы
              </Link>
            )}
            <Link to="/products" className="btn-outline w-full block text-center">
              Продолжить покупки
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-5xl">🛍</p>
        <h2 className="font-serif text-2xl text-charcoal-700">{t('cart.empty')}</h2>
        <Link to="/products" className="btn-primary">{t('cart.browse')}</Link>
      </div>
    );
  }

  const Label = ({ children }) => (
    <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{children}</label>
  );

  return (
    <main className="min-h-screen bg-charcoal-50/50">
      <div className="bg-luxury-gradient border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-serif text-3xl text-charcoal-800 mb-6">{t('checkout.title')}</h1>
          {/* Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-pink-500' : 'text-charcoal-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-pink-400 text-white' : i === step ? 'bg-pink-400 text-white ring-4 ring-pink-100' : 'bg-charcoal-200 text-charcoal-500'
                  }`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{t(`checkout.steps.${s}`)}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 transition-all ${i < step ? 'bg-pink-300' : 'bg-charcoal-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-luxury p-6 md:p-8">
              {/* Step 0: Delivery */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="font-serif text-xl text-charcoal-800 mb-6">{t('checkout.steps.delivery')}</h2>

                  {/* Method toggle */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {['delivery', 'pickup'].map((m) => (
                      <button
                        key={m}
                        onClick={() => update('deliveryMethod', m)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          form.deliveryMethod === m
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-charcoal-200 hover:border-pink-200'
                        }`}
                      >
                        <p className="font-medium text-charcoal-800 text-sm">{t(`checkout.${m}`)}</p>
                        <p className="text-xs text-charcoal-400 mt-0.5">
                          {m === 'delivery' ? 'Курьер до двери' : 'Бесплатно'}
                        </p>
                      </button>
                    ))}
                  </div>

                  {form.deliveryMethod === 'pickup' ? (
                    <div className="space-y-4">
                      <Label>{t('checkout.pickup_locations.chorsu')}</Label>
                      <div className="grid gap-3">
                        {PICKUP_LOCATIONS.map((loc) => (
                          <button
                            key={loc.value}
                            onClick={() => update('pickupLocation', loc.value)}
                            className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                              form.pickupLocation === loc.value
                                ? 'border-pink-400 bg-pink-50'
                                : 'border-charcoal-200 hover:border-pink-200'
                            }`}
                          >
                            <span className="text-xl">🏪</span>
                            <span className="font-medium text-charcoal-800 text-sm">{loc.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>{t('checkout.full_name')} *</Label>
                          <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="input-field" placeholder="Имя Фамилия" required />
                        </div>
                        <div>
                          <Label>{t('checkout.phone')} *</Label>
                          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="+998 90 000 00 00" required />
                        </div>
                      </div>
                      <div>
                        <Label>{t('checkout.district')} *</Label>
                        <input value={form.district} onChange={(e) => update('district', e.target.value)} className="input-field" placeholder="Юнусабадский, Мирзо-Улугбекский..." required />
                      </div>
                      <div>
                        <Label>{t('checkout.street')} *</Label>
                        <input value={form.street} onChange={(e) => update('street', e.target.value)} className="input-field" placeholder="Улица, дом" required />
                      </div>
                      <div>
                        <Label>{t('checkout.apartment')}</Label>
                        <input value={form.apartment} onChange={(e) => update('apartment', e.target.value)} className="input-field" placeholder="Кв. / Офис (необязательно)" />
                      </div>
                      <div>
                        <Label>{t('checkout.notes')}</Label>
                        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-field resize-none" rows={3} placeholder="Ориентир, время доставки и др." />
                      </div>
                      {!user && (
                        <div>
                          <Label>Email (для подтверждения)</Label>
                          <input value={form.guestEmail} onChange={(e) => update('guestEmail', e.target.value)} type="email" className="input-field" placeholder="your@email.com" />
                        </div>
                      )}

                      {/* ── Location widget ── */}
                      <div className="border-t border-charcoal-100 pt-4 mt-1 space-y-3">
                        <Label>{t('checkout.location.label')} *</Label>

                        {/* GPS auto-detect button */}
                        <button
                          type="button"
                          onClick={detectLocation}
                          disabled={loc.detecting}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
                            loc.detected
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : 'border-charcoal-200 hover:border-pink-300 text-charcoal-600'
                          }`}
                        >
                          {loc.detecting
                            ? <Loader2 size={16} className="animate-spin" />
                            : loc.detected
                            ? <><Navigation size={16} className="fill-green-500" /> {t('checkout.location.detected')}</>
                            : <><MapPin size={16} /> {t('checkout.location.detect_btn')}</>
                          }
                          {loc.detecting && t('checkout.location.detecting')}
                        </button>

                        {loc.geoError && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <MapPin size={12} /> {loc.geoError}
                          </p>
                        )}

                        {/* Manual address fallback */}
                        <div>
                          <input
                            value={loc.address}
                            onChange={(e) => {
                              setLoc((l) => ({ ...l, address: e.target.value }));
                              if (e.target.value.trim()) setLocError(false);
                            }}
                            className={`input-field ${locError && !loc.detected && !loc.address.trim() ? 'border-red-300 focus:border-red-400' : ''}`}
                            placeholder={t('checkout.location.manual_ph')}
                          />
                          {locError && !loc.detected && !loc.address.trim() && (
                            <p className="text-xs text-red-500 mt-1">{t('checkout.location.required')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (form.deliveryMethod === 'delivery') {
                        const hasLocation = loc.detected || loc.address.trim();
                        if (!hasLocation) { setLocError(true); return; }
                      }
                      setLocError(false);
                      setStep(1);
                    }}
                    disabled={form.deliveryMethod === 'delivery' && (!form.fullName || !form.phone || !form.district || !form.street)}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  >
                    {t('checkout.next_payment')} <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="font-serif text-xl text-charcoal-800 mb-6">{t('checkout.steps.payment')}</h2>
                  <div className="space-y-3 mb-8">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.value}
                        onClick={() => update('paymentMethod', pm.value)}
                        className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                          form.paymentMethod === pm.value
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-charcoal-200 hover:border-pink-200'
                        }`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <div>
                          <p className="font-medium text-charcoal-800">{pm.label}</p>
                          <p className="text-xs text-charcoal-400">{pm.desc}</p>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === pm.value ? 'border-pink-400 bg-pink-400' : 'border-charcoal-300'}`}>
                          {form.paymentMethod === pm.value && <span className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-outline flex-1">Назад</button>
                    <button onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      Подтвердить <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Confirm */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="font-serif text-xl text-charcoal-800 mb-6">{t('checkout.steps.confirm')}</h2>

                  <div className="space-y-3 mb-6">
                    <div className="bg-pink-50/50 rounded-2xl p-4 text-sm">
                      <p className="font-medium text-charcoal-700 mb-1">
                        {form.deliveryMethod === 'pickup' ? `Самовывоз: ${PICKUP_LOCATIONS.find(l=>l.value===form.pickupLocation)?.label}` : 'Доставка курьером'}
                      </p>
                      {form.deliveryMethod === 'delivery' && (
                        <p className="text-charcoal-500">{form.district}, {form.street}{form.apartment ? `, кв. ${form.apartment}` : ''}</p>
                      )}
                      <p className="text-charcoal-500">{form.fullName} · {form.phone}</p>
                      {form.deliveryMethod === 'delivery' && (
                        <p className="text-charcoal-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-pink-400 flex-shrink-0" />
                          {loc.detected
                            ? t('checkout.location.confirmed_gps')
                            : loc.address || t('checkout.location.not_set')}
                        </p>
                      )}
                    </div>
                    <div className="bg-pink-50/50 rounded-2xl p-4 text-sm">
                      <p className="font-medium text-charcoal-700">{PAYMENT_METHODS.find(pm => pm.value === form.paymentMethod)?.label}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-outline flex-1">Назад</button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-primary flex-1"
                    >
                      {submitting ? 'Оформляем...' : t('checkout.place_order')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-luxury p-6 sticky top-28">
              <h3 className="font-serif text-lg text-charcoal-800 mb-5">Ваш заказ</h3>
              <ul className="space-y-3 mb-5">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3">
                    <img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" onError={handleImageError} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-700 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-charcoal-400">{item.quantity} шт.</p>
                      <p className="text-pink-500 font-medium text-sm">{formatPrice(item.unitPrice * item.quantity)} UZS</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-charcoal-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)} UZS</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>{t('cart.shipping')}</span>
                  <span className={shippingCost === 0 ? 'text-green-500' : ''}>
                    {shippingCost === 0 ? t('cart.free_shipping') : `${formatPrice(shippingCost)} UZS`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-charcoal-800 text-base pt-2 border-t border-charcoal-100">
                  <span>{t('cart.total')}</span>
                  <span className="text-pink-500">{formatPrice(total)} UZS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
