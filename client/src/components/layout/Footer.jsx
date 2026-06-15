import { Link } from 'react-router-dom';
import { Instagram, Send, MapPin, Phone } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

export default function Footer() {
  const { t } = useLanguageStore();

  return (
    <footer className="bg-charcoal-900 text-charcoal-200">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-pink-gradient flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">LP</span>
              </div>
              <span className="font-serif text-xl text-white">Luxury Platok</span>
            </div>
            <p className="text-sm text-charcoal-400 leading-relaxed mb-6">
              Премиальные платки, хиджабы и шали из лучших материалов. Оптом и в розницу. Ташкент.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/luxury_platok__"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center hover:bg-pink-400 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://t.me/luxury_platok"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center hover:bg-blue-500 transition-colors"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-white text-lg mb-4">Навигация</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/products', label: t('nav.catalog') },
                { to: '/products?category=hijab', label: 'Хиджабы' },
                { to: '/products?category=platok', label: 'Платки' },
                { to: '/products?category=shawl', label: 'Шали' },
                { to: '/stores', label: t('nav.stores') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-charcoal-400 hover:text-pink-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wholesale */}
          <div>
            <h4 className="font-serif text-white text-lg mb-4">Оптовым клиентам</h4>
            <ul className="space-y-3">
              {[
                { to: '/products?wholesale=true', label: 'Оптовые цены' },
                { to: '/register', label: 'Стать оптовым клиентом' },
                { to: '/login', label: 'Кабинет оптовика' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-charcoal-400 hover:text-gold-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-charcoal-800 rounded-2xl">
              <p className="text-xs text-charcoal-400 mb-1">Минимальный заказ</p>
              <p className="font-serif text-white text-lg">от 10 шт.</p>
              <p className="text-xs text-gold-400 mt-1">Скидки до 40%</p>
            </div>
          </div>

          {/* Stores */}
          <div>
            <h4 className="font-serif text-white text-lg mb-4">{t('stores.title')}</h4>
            <ul className="space-y-4">
              {[
                { name: 'Чорсу / Фунча', phone: '+998 XX XXX XX XX' },
                { name: 'Юнусабад', phone: '+998 XX XXX XX XX' },
                { name: 'Абу Сахий', phone: '+998 XX XXX XX XX' },
              ].map((store) => (
                <li key={store.name}>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-pink-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white">{store.name}</p>
                      <a
                        href={`tel:${store.phone}`}
                        className="text-xs text-charcoal-400 hover:text-pink-300 flex items-center gap-1 mt-0.5 transition-colors"
                      >
                        <Phone size={11} />
                        {store.phone}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-charcoal-500">
            © {new Date().getFullYear()} Luxury Platok. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayMe.svg/1200px-PayMe.svg.png" alt="Payme" className="h-5 opacity-40 hover:opacity-70 transition-opacity" />
            <span className="text-xs text-charcoal-600">Click • Payme • Наличные</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
