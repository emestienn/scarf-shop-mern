import { Link } from 'react-router-dom';
import { Instagram, Send, MapPin, Phone, CreditCard, Gem } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

export default function Footer() {
  const { t } = useLanguageStore();

  const navLinks = [
    { to: '/',                            label: t('nav.home') },
    { to: '/products',                    label: t('nav.catalog') },
    { to: '/products?category=hijab',     label: t('footer.categories_hijab') },
    { to: '/products?category=platok',    label: t('footer.categories_platok') },
    { to: '/products?category=shawl',     label: t('footer.categories_shawl') },
    { to: '/stores',                      label: t('nav.stores') },
  ];

  const wholesaleLinks = [
    { to: '/products?wholesale=true',     label: t('footer.wholesale_prices') },
    { to: '/register',                    label: t('footer.become_wholesale') },
    { to: '/login',                       label: t('footer.wholesale_cabinet') },
  ];

  const stores = [
    { name: t('stores.locations.chorsu.name'),     phone: t('stores.locations.chorsu.phone') },
    { name: t('stores.locations.yunusabad.name'),  phone: t('stores.locations.yunusabad.phone') },
    { name: t('stores.locations.abu_sahiy.name'),  phone: t('stores.locations.abu_sahiy.phone') },
  ];

  return (
    <footer className="bg-charcoal-900 text-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Luxury Platok"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-9 h-9 rounded-full bg-pink-gradient items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">LP</span>
              </div>
              <span className="font-serif text-xl text-white">Luxury Platok</span>
            </div>

            <p className="text-sm text-charcoal-400 leading-relaxed mb-6">
              {t('footer.brand_desc')}
            </p>

            <div className="flex gap-3">
              <a
                href="https://instagram.com/luxury_platok__"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center hover:bg-pink-400 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://t.me/luxury_platok"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center hover:bg-blue-500 transition-colors"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-white text-lg mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-3">
              {navLinks.map(({ to, label }) => (
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
            <h4 className="font-serif text-white text-lg mb-4 flex items-center gap-2">
              <Gem size={16} className="text-gold-400" />
              {t('footer.wholesale_section')}
            </h4>
            <ul className="space-y-3">
              {wholesaleLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-charcoal-400 hover:text-gold-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-charcoal-800 rounded-2xl">
              <p className="text-xs text-charcoal-400 mb-1">{t('footer.min_order')}</p>
              <p className="font-serif text-white text-lg">{t('footer.min_order_value')}</p>
              <p className="text-xs text-gold-400 mt-1">{t('footer.discount')}</p>
            </div>
          </div>

          {/* Stores */}
          <div>
            <h4 className="font-serif text-white text-lg mb-4">{t('stores.title')}</h4>
            <ul className="space-y-4">
              {stores.map((store) => (
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
            © {new Date().getFullYear()} Luxury Platok. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-3 text-charcoal-500">
            <CreditCard size={15} />
            <span className="text-xs">{t('footer.payment_methods')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
