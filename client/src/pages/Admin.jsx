import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Users, LogOut,
  TrendingUp, Clock, CheckCircle, XCircle, ChevronDown,
  RefreshCw, Plus, Edit2, Trash2, Search, Eye,
  Truck, Store, MessageSquare, RotateCcw, Settings2,
  BadgeCheck, Star, Award, Sparkles, Link2, UserX,
  CreditCard, AlertCircle,
} from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import { adminApi } from '../api/index.js';

// ── Bilingual strings ─────────────────────────────────────────────────────────
const AT = {
  ru: {
    nav: { dashboard: 'Dashboard', orders: 'Заказы', products: 'Товары', users: 'Клиенты' },
    sidebar: { view_site: 'Просмотр сайта', logout: 'Выйти', role: 'Администратор' },
    dashboard: {
      total_orders: 'Всего заказов', pending: 'Ожидают', needs_processing: 'Нужна обработка',
      revenue: 'Выручка', customers: 'Клиентов', recent_orders: 'Последние заказы',
      cols: ['Заказ', 'Клиент', 'Сумма', 'Статус', 'Дата'],
    },
    orders: {
      title: 'Управление заказами', all: 'Все',
      loading: 'Загрузка заказов...', empty: 'Заказов нет',
      cols: ['', 'Заказ', 'Клиент', 'Товары', 'Сумма', 'Доставка', 'Статус'],
      delivery: 'Доставка', pickup: 'Самовывоз',
      expand: { address: 'Адрес', payment: 'Оплата', composition: 'Состав', notes: 'Комментарий' },
      paid: 'Оплачен', not_paid: 'Не оплачен',
      units: 'шт.',
    },
    status: {
      pending: 'Ожидает', confirmed: 'Подтверждён', processing: 'Обрабатывается',
      shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён', refunded: 'Возврат',
    },
    products: {
      title: 'Товары', search: 'Поиск...', add: 'Добавить',
      cols: ['Товар', 'Категория', 'Материал', 'Цена', 'Склад', 'Флаги', ''],
      loading: 'Загрузка...', units: 'шт.',
      modal_edit: 'Редактировать товар', modal_new: 'Новый товар',
      name_ru: 'Название (RU) *', name_uz: 'Название (UZ)',
      slug: 'Slug — авто если пусто', desc_ru: 'Описание (RU)', desc_uz: 'Описание (UZ)',
      category: 'Категория', material: 'Материал', pattern: 'Узор',
      price: 'Цена (UZS) *', stock: 'Остаток (шт.) *', photos: 'Фото (URLs через запятую)',
      cancel: 'Отмена', save: 'Сохранить', saving: 'Сохранение...',
      delete_confirm: 'Удалить товар?', error_save: 'Ошибка сохранения',
      flags: { featured: 'Рекомендуемый', bestseller: 'Хит продаж', new: 'Новинка' },
    },
    users: {
      title: 'Клиенты', cols: ['Клиент', 'Email', 'Телефон', 'Роль', 'Telegram', 'Зарег.', ''],
      loading: 'Загрузка...', all: 'Все',
      approve: 'Одобрить опт', deactivate_confirm: 'Деактивировать пользователя?',
      linked: 'Привязан', guest: 'Гость',
    },
  },
  uz: {
    nav: { dashboard: 'Dashboard', orders: 'Buyurtmalar', products: 'Mahsulotlar', users: 'Mijozlar' },
    sidebar: { view_site: 'Saytni ko\'rish', logout: 'Chiqish', role: 'Administrator' },
    dashboard: {
      total_orders: 'Jami buyurtmalar', pending: 'Kutilmoqda', needs_processing: 'Qayta ishlash kerak',
      revenue: 'Daromad', customers: 'Mijozlar', recent_orders: 'So\'nggi buyurtmalar',
      cols: ['Buyurtma', 'Mijoz', 'Summa', 'Holat', 'Sana'],
    },
    orders: {
      title: 'Buyurtmalarni boshqarish', all: 'Hammasi',
      loading: 'Buyurtmalar yuklanmoqda...', empty: 'Buyurtmalar yo\'q',
      cols: ['', 'Buyurtma', 'Mijoz', 'Mahsulotlar', 'Summa', 'Yetkazib berish', 'Holat'],
      delivery: 'Yetkazib berish', pickup: 'O\'zi olib ketish',
      expand: { address: 'Manzil', payment: 'To\'lov', composition: 'Tarkib', notes: 'Izoh' },
      paid: 'To\'langan', not_paid: 'To\'lanmagan',
      units: 'ta',
    },
    status: {
      pending: 'Kutilmoqda', confirmed: 'Tasdiqlandi', processing: 'Jarayonda',
      shipped: 'Yuborildi', delivered: 'Yetkazildi', cancelled: 'Bekor', refunded: 'Qaytarildi',
    },
    products: {
      title: 'Mahsulotlar', search: 'Qidirish...', add: 'Qo\'shish',
      cols: ['Mahsulot', 'Kategoriya', 'Material', 'Narx', 'Ombor', 'Belgilar', ''],
      loading: 'Yuklanmoqda...', units: 'ta',
      modal_edit: 'Mahsulotni tahrirlash', modal_new: 'Yangi mahsulot',
      name_ru: 'Nomi (RU) *', name_uz: 'Nomi (UZ)',
      slug: 'Slug — bo\'sh bo\'lsa avtomatik', desc_ru: 'Tavsif (RU)', desc_uz: 'Tavsif (UZ)',
      category: 'Kategoriya', material: 'Material', pattern: 'Naqsh',
      price: 'Narx (UZS) *', stock: 'Qoldiq (ta) *', photos: 'Rasmlar (vergul bilan URLlar)',
      cancel: 'Bekor qilish', save: 'Saqlash', saving: 'Saqlanmoqda...',
      delete_confirm: 'Mahsulotni o\'chirish?', error_save: 'Saqlashda xatolik',
      flags: { featured: 'Tavsiya etilgan', bestseller: 'Eng ko\'p sotilgan', new: 'Yangi' },
    },
    users: {
      title: 'Mijozlar', cols: ['Mijoz', 'Email', 'Telefon', 'Rol', 'Telegram', 'Ro\'yxat', ''],
      loading: 'Yuklanmoqda...', all: 'Hammasi',
      approve: 'Ulgurjini tasdiqlash', deactivate_confirm: 'Foydalanuvchini faolsizlantirish?',
      linked: 'Bog\'langan', guest: 'Mehmon',
    },
  },
};

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS  = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-charcoal-100 text-charcoal-600',
};
const STATUS_ICONS = {
  pending:    <Clock     size={12} />,
  confirmed:  <CheckCircle size={12} />,
  processing: <Settings2 size={12} />,
  shipped:    <Package   size={12} />,
  delivered:  <BadgeCheck size={12} />,
  cancelled:  <XCircle   size={12} />,
  refunded:   <RotateCcw size={12} />,
};

const fmt   = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));
const fmtDt = (d) => new Date(d).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

// ── Lang context shared across all tabs ───────────────────────────────────────
const LangCtx = createContext('ru');
const useLang = () => {
  const lang = useContext(LangCtx);
  return (path) => path.split('.').reduce((o, k) => o?.[k], AT[lang]) ?? path;
};

// ── Language toggle button ────────────────────────────────────────────────────
const LangToggle = ({ lang, setLang }) => (
  <button
    onClick={() => setLang(l => l === 'ru' ? 'uz' : 'ru')}
    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50 transition-all tracking-wide"
  >
    {lang === 'ru' ? 'UZ' : 'RU'}
  </button>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = 'pink' }) => {
  const bg = { pink: 'bg-pink-50', gold: 'bg-gold-100', green: 'bg-emerald-50', purple: 'bg-purple-50' };
  const ic = { pink: 'text-pink-400', gold: 'text-gold-500', green: 'text-emerald-500', purple: 'text-purple-500' };
  return (
    <div className="bg-white rounded-2xl shadow-luxury p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg[color]} flex items-center justify-center flex-shrink-0`}>
        <span className={ic[color]}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-charcoal-800">{value}</p>
        {sub && <p className="text-xs text-charcoal-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, user, logout, lang, setLang }) => {
  const at = useLang();
  const NAV = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders',    icon: <ShoppingBag size={18} /> },
    { id: 'products',  icon: <Package size={18} /> },
    { id: 'users',     icon: <Users size={18} /> },
  ];

  return (
    <aside className="w-56 bg-white border-r border-pink-100 flex flex-col h-screen sticky top-0 flex-shrink-0 shadow-luxury">
      <div className="px-5 py-5 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="LP"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-8 h-8 rounded-full bg-pink-gradient items-center justify-center">
              <span className="font-serif font-bold text-xs text-white">LP</span>
            </div>
            <div>
              <p className="font-serif text-sm text-charcoal-800 leading-none">Luxury Platok</p>
              <p className="text-[10px] text-charcoal-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === n.id
                ? 'bg-pink-50 text-pink-500 border border-pink-200'
                : 'text-charcoal-500 hover:bg-pink-50/60 hover:text-pink-400'
            }`}
          >
            {n.icon}
            {at(`nav.${n.id}`)}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-pink-100">
        <div className="flex items-center gap-2 px-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-charcoal-700 font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-charcoal-400">{at('sidebar.role')}</p>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-charcoal-400 hover:text-pink-500 transition-colors">
          <Eye size={14} /> {at('sidebar.view_site')}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-charcoal-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> {at('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
};

// ── Status badge (icon + label) ───────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const at = useLang();
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_ICONS[status]}
      {at(`status.${status}`)}
    </span>
  );
};

// ── Dashboard tab ─────────────────────────────────────────────────────────────
const DashboardTab = () => {
  const at = useLang();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag size={22}/>} label={at('dashboard.total_orders')} value={data?.stats.totalOrders ?? 0}  color="pink" />
        <StatCard icon={<Clock size={22}/>}        label={at('dashboard.pending')}      value={data?.stats.pendingOrders ?? 0} color="gold" sub={at('dashboard.needs_processing')} />
        <StatCard icon={<TrendingUp size={22}/>}   label={at('dashboard.revenue')}      value={`${fmt(data?.stats.totalRevenue || 0)} UZS`} color="green" />
        <StatCard icon={<Users size={22}/>}        label={at('dashboard.customers')}    value={data?.stats.totalUsers ?? 0}    color="purple" />
      </div>

      <div className="bg-white rounded-2xl shadow-luxury overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <h3 className="font-serif text-lg text-charcoal-800">{at('dashboard.recent_orders')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50">
              <tr>
                {at('dashboard.cols').map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {(data?.recentOrders || []).map((order) => (
                <tr key={order._id} className="hover:bg-pink-50/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-charcoal-800">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-charcoal-600">{order.user?.name || order.guestEmail || at('users.guest')}</td>
                  <td className="py-3 px-4 font-semibold text-pink-500">{fmt(order.totalAmount)} UZS</td>
                  <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-4 text-charcoal-400 text-xs">{fmtDt(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Orders tab ────────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const at = useLang();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllOrders({ status: filter || undefined, limit: 50 });
      setOrders(data.orders);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
    } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-xl text-charcoal-800">{at('orders.title')}</h2>
        <div className="flex gap-2 flex-wrap items-center">
          {['', ...STATUS_OPTIONS.slice(0, 6)].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === s ? 'bg-pink-400 text-white' : 'bg-white text-charcoal-600 shadow-luxury hover:bg-pink-50'
              }`}
            >
              {s ? <>{STATUS_ICONS[s]} {at(`status.${s}`)}</> : at('orders.all')}
            </button>
          ))}
          <button onClick={load} className="p-2 rounded-full bg-white shadow-luxury text-charcoal-500 hover:text-pink-500 transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-luxury overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal-400">{at('orders.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400">{at('orders.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50">
                <tr>
                  {at('orders.cols').map((h, i) => (
                    <th key={i} className="text-left py-3 px-3 text-xs font-medium text-charcoal-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {orders.map((order) => (
                  <>
                    <tr
                      key={order._id}
                      className="hover:bg-pink-50/20 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      <td className="py-3 px-3 text-charcoal-300">
                        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded === order._id ? 'rotate-180' : ''}`} />
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-charcoal-800 whitespace-nowrap">{order.orderNumber}</p>
                        <p className="text-[11px] text-charcoal-400">{fmtDt(order.createdAt)}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-charcoal-700 whitespace-nowrap">{order.shippingAddress?.fullName || order.user?.name || at('users.guest')}</p>
                        <p className="text-[11px] text-charcoal-400">{order.shippingAddress?.phone || '—'}</p>
                      </td>
                      <td className="py-3 px-3 max-w-[160px]">
                        <p className="text-charcoal-600 text-xs line-clamp-1">
                          {order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                        </p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-pink-500 whitespace-nowrap">{fmt(order.totalAmount)} UZS</td>
                      <td className="py-3 px-3 text-xs text-charcoal-500">
                        <span className="inline-flex items-center gap-1">
                          {order.deliveryMethod === 'pickup'
                            ? <><Store size={12} className="text-gold-500" /> {order.pickupLocation}</>
                            : <><Truck size={12} className="text-blue-400" /> {at('orders.delivery')}</>
                          }
                        </span>
                      </td>
                      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            disabled={updating === order._id}
                            className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300 ${STATUS_COLORS[order.status]}`}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {updating === order._id && <RefreshCw size={13} className="animate-spin text-pink-400 flex-shrink-0" />}
                        </div>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {expanded === order._id && (
                        <tr key={`${order._id}-exp`}>
                          <td colSpan={7} className="px-6 pb-4 bg-pink-50/20">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid sm:grid-cols-3 gap-4 pt-3 text-sm"
                            >
                              <div>
                                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">{at('orders.expand.address')}</p>
                                {order.deliveryMethod === 'pickup' ? (
                                  <p className="text-charcoal-700 flex items-center gap-1">
                                    <Store size={13} className="text-gold-500" /> {at('orders.pickup')}: {order.pickupLocation}
                                  </p>
                                ) : (
                                  <p className="text-charcoal-700">{order.shippingAddress?.district}, {order.shippingAddress?.street}{order.shippingAddress?.apartment ? `, кв.${order.shippingAddress.apartment}` : ''}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">{at('orders.expand.payment')}</p>
                                <p className="text-charcoal-700 flex items-center gap-1">
                                  <CreditCard size={13} className="text-charcoal-400" />
                                  <span className="capitalize">{order.paymentMethod?.replace(/_/g,' ')}</span>
                                </p>
                                <p className={`text-xs mt-1 flex items-center gap-1 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {order.isPaid
                                    ? <><CheckCircle size={12} /> {at('orders.paid')}</>
                                    : <><Clock size={12} /> {at('orders.not_paid')}</>
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">{at('orders.expand.composition')}</p>
                                <ul className="space-y-0.5">
                                  {order.items?.map((item, i) => (
                                    <li key={i} className="text-charcoal-700 text-xs">
                                      {item.name}{item.color ? ` (${item.color})` : ''} — {item.quantity} {at('orders.units')} × {fmt(item.unitPrice)} UZS
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {order.shippingAddress?.notes && (
                                <p className="col-span-3 text-xs text-charcoal-500 italic flex items-start gap-1">
                                  <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                                  {order.shippingAddress.notes}
                                </p>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Products tab ──────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  nameRu: '', nameUz: '', descRu: '', descUz: '', slug: '',
  category: 'platok', material: 'silk', pattern: 'solid',
  retailPrice: '', stock: '',
  isFeatured: false, isBestSeller: false, isNewArrival: false,
  images: '',
};

const ProductsTab = () => {
  const at = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY_PRODUCT);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllProducts({ search: search || undefined });
      setProducts(data.products);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_PRODUCT); setModal('create'); };
  const openEdit   = (p) => {
    setForm({
      nameRu: p.name?.ru || '', nameUz: p.name?.uz || '',
      descRu: p.description?.ru || '', descUz: p.description?.uz || '',
      slug: p.slug || '', category: p.category, material: p.material,
      pattern: p.pattern || 'solid', retailPrice: p.retailPrice, stock: p.stock,
      isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
      images: (p.images || []).join(', '), _id: p._id,
    });
    setModal('edit');
  };

  const F = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slugValue = form.slug ||
        form.nameRu.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').replace(/-+/g, '-');
      const payload = {
        name:        { ru: form.nameRu, uz: form.nameUz },
        description: { ru: form.descRu, uz: form.descUz },
        slug: slugValue, category: form.category, material: form.material, pattern: form.pattern,
        retailPrice: Number(form.retailPrice), stock: Number(form.stock),
        isFeatured: form.isFeatured, isBestSeller: form.isBestSeller, isNewArrival: form.isNewArrival,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        isAvailable: true,
      };
      if (modal === 'edit' && form._id) await adminApi.updateProduct(form._id, payload);
      else await adminApi.createProduct(payload);
      await load();
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || at('products.error_save'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(at('products.delete_confirm'))) return;
    await adminApi.deleteProduct(id);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-xl text-charcoal-800">{at('products.title')} ({products.length})</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={at('products.search')}
              className="pl-8 pr-3 py-2 text-sm border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <button onClick={openCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
            <Plus size={15} /> {at('products.add')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-luxury overflow-hidden">
        {loading ? <div className="p-8 text-center text-charcoal-400">{at('products.loading')}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50">
                <tr>
                  {at('products.cols').map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-pink-50/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={18} className="text-pink-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal-800 line-clamp-1">{p.name?.ru}</p>
                          <p className="text-[11px] text-charcoal-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-charcoal-600 capitalize">{p.category}</td>
                    <td className="py-3 px-4 text-charcoal-600 capitalize">{p.material}</td>
                    <td className="py-3 px-4 font-semibold text-pink-500 whitespace-nowrap">{fmt(p.retailPrice)} UZS</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.stock} {at('products.units')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.isFeatured   && <span className="inline-flex items-center gap-0.5 text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full"><Star size={9} /> {at('products.flags.featured')}</span>}
                        {p.isBestSeller && <span className="inline-flex items-center gap-0.5 text-[10px] bg-gold-100 text-gold-600 px-1.5 py-0.5 rounded-full"><Award size={9} /> {at('products.flags.bestseller')}</span>}
                        {p.isNewArrival && <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full"><Sparkles size={9} /> {at('products.flags.new')}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-pink-50 text-charcoal-400 hover:text-pink-500 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-luxury-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-charcoal-100 sticky top-0 bg-white z-10">
                <h3 className="font-serif text-xl text-charcoal-800">
                  {modal === 'edit' ? at('products.modal_edit') : at('products.modal_new')}
                </h3>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.name_ru')}</label>
                    <input value={form.nameRu} onChange={e => F('nameRu', e.target.value)} className="input-field text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.name_uz')}</label>
                    <input value={form.nameUz} onChange={e => F('nameUz', e.target.value)} className="input-field text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.slug')}</label>
                  <input value={form.slug} onChange={e => F('slug', e.target.value)} className="input-field text-sm" placeholder="nazvanie-tovara" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.desc_ru')}</label>
                    <textarea value={form.descRu} onChange={e => F('descRu', e.target.value)} className="input-field text-sm resize-none" rows={3} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.desc_uz')}</label>
                    <textarea value={form.descUz} onChange={e => F('descUz', e.target.value)} className="input-field text-sm resize-none" rows={3} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.category')}</label>
                    <select value={form.category} onChange={e => F('category', e.target.value)} className="input-field text-sm">
                      {['hijab','platok','shawl','scarf','accessory'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.material')}</label>
                    <select value={form.material} onChange={e => F('material', e.target.value)} className="input-field text-sm">
                      {['silk','chiffon','cotton','georgette','viscose','modal','jersey','other'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.pattern')}</label>
                    <select value={form.pattern} onChange={e => F('pattern', e.target.value)} className="input-field text-sm">
                      {['solid','floral','monogram','patterned','geometric','abstract'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.price')}</label>
                    <input type="number" min="0" value={form.retailPrice} onChange={e => F('retailPrice', e.target.value)} className="input-field text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.stock')}</label>
                    <input type="number" min="0" value={form.stock} onChange={e => F('stock', e.target.value)} className="input-field text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1">{at('products.photos')}</label>
                  <textarea value={form.images} onChange={e => F('images', e.target.value)} className="input-field text-sm resize-none" rows={2} placeholder="https://..., https://..." />
                </div>
                <div className="flex gap-6 flex-wrap">
                  {[
                    ['isFeatured', 'flags.featured',   <Star size={14} className="text-pink-400"/>],
                    ['isBestSeller','flags.bestseller', <Award size={14} className="text-gold-500"/>],
                    ['isNewArrival','flags.new',        <Sparkles size={14} className="text-blue-400"/>],
                  ].map(([field, labelKey, icon]) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[field]} onChange={e => F(field, e.target.checked)} className="w-4 h-4 accent-pink-400" />
                      <span className="flex items-center gap-1 text-sm text-charcoal-700">{icon} {at(`products.${labelKey}`)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2 border-t border-charcoal-100">
                  <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">{at('products.cancel')}</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> {saving ? at('products.saving') : at('products.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Users tab ─────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const at = useLang();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRole] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers({ role: roleFilter || undefined, limit: 50 });
      setUsers(data.users);
    } finally { setLoading(false); }
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const approveWholesale = async (id) => {
    await adminApi.approveWholesale(id);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, role: 'wholesale', isWholesaleVerified: true } : u));
  };

  const deactivate = async (id) => {
    if (!confirm(at('users.deactivate_confirm'))) return;
    await adminApi.deactivateUser(id);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
  };

  const roleColors = {
    customer:  'bg-charcoal-100 text-charcoal-600',
    wholesale: 'bg-gold-100 text-gold-600',
    admin:     'bg-pink-100 text-pink-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-xl text-charcoal-800">{at('users.title')} ({users.length})</h2>
        <div className="flex gap-2">
          {['','customer','wholesale','admin'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${roleFilter === r ? 'bg-pink-400 text-white' : 'bg-white text-charcoal-600 shadow-luxury hover:bg-pink-50'}`}>
              {r || at('users.all')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-luxury overflow-hidden">
        {loading ? <div className="p-8 text-center text-charcoal-400">{at('users.loading')}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50">
                <tr>
                  {at('users.cols').map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {users.map((u) => (
                  <tr key={u._id} className={`hover:bg-pink-50/20 ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-charcoal-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-charcoal-500 text-xs">{u.email}</td>
                    <td className="py-3 px-4 text-charcoal-500 text-xs">{u.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-charcoal-100 text-charcoal-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal-500 text-xs">
                      {u.telegramUsername ? (
                        <span className="flex items-center gap-1">@{u.telegramUsername}</span>
                      ) : u.telegramId ? (
                        <span className="inline-flex items-center gap-1 text-green-600"><Link2 size={12} /> {at('users.linked')}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-charcoal-400 text-xs">{fmtDt(u.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.role === 'customer' && u.wholesaleInfo?.businessName && (
                          <button
                            onClick={() => approveWholesale(u._id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors whitespace-nowrap font-medium"
                          >
                            <BadgeCheck size={12} /> {at('users.approve')}
                          </button>
                        )}
                        {u.isActive && u.role !== 'admin' && (
                          <button onClick={() => deactivate(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-300 hover:text-red-400 transition-colors" title={at('users.deactivate_confirm')}>
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab]           = useState('dashboard');
  const [lang, setLang]         = useState('ru');
  const { user, logout, token } = useAuthStore();
  const navigate                = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== 'admin') navigate('/login', { replace: true });
  }, [token, user, navigate]);

  if (!token || user?.role !== 'admin') return null;

  const tabs = {
    dashboard: <DashboardTab />,
    orders:    <OrdersTab />,
    products:  <ProductsTab />,
    users:     <UsersTab />,
  };

  return (
    <LangCtx.Provider value={lang}>
      <div className="flex h-screen bg-pink-50/30 overflow-hidden font-sans">
        <Sidebar
          active={tab}
          setActive={setTab}
          user={user}
          logout={() => { logout(); navigate('/'); }}
          lang={lang}
          setLang={setLang}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tabs[tab]}
            </motion.div>
          </div>
        </main>
      </div>
    </LangCtx.Provider>
  );
}
