import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, Gem } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import useAuthStore from '../../store/authStore.js';
import useLanguageStore from '../../store/languageStore.js';

const LanguageToggle = () => {
  const { lang, setLang } = useLanguageStore();
  return (
    <button
      onClick={() => setLang(lang === 'ru' ? 'uz' : 'ru')}
      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-charcoal-200 hover:border-pink-400 hover:text-pink-500 transition-all duration-200 tracking-wide"
    >
      {lang === 'ru' ? 'UZ' : 'RU'}
    </button>
  );
};

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate                = useNavigate();
  const { items, openCart }     = useCartStore();
  const { user, logout }        = useAuthStore();
  const { t }                   = useLanguageStore();

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/',         label: t('nav.home') },
    { to: '/products', label: t('nav.catalog') },
    { to: '/stores',   label: t('nav.stores') },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-luxury' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {/* Top strip */}
        <div className="bg-pink-400 text-white text-center text-xs py-1.5 font-medium tracking-widest">
          {t('nav.top_strip')}
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="Luxury Platok"
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if logo.png not yet added */}
              <div className="hidden w-9 h-9 rounded-full bg-pink-gradient items-center justify-center shadow-pink">
                <span className="text-white font-serif font-bold text-sm">LP</span>
                {/* <img src="/images/logo.jpg" alt="" className='rounded-full' /> */}
              </div>
              <span className="hidden sm:block font-script text-2xl text-[#c9777f] group-hover:text-pink-500 transition-colors leading-none">
                Luxury Platok
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-pink-50 text-pink-500'
                        : 'text-charcoal-600 hover:text-pink-500 hover:bg-pink-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link
                to="/products?wholesale=true"
                className="px-4 py-2 rounded-full text-sm font-medium text-gold-500 hover:bg-gold-100 transition-all duration-200 flex items-center gap-1.5"
              >
                <Gem size={13} />
                {t('nav.wholesale')}
              </Link>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <LanguageToggle />

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-pink-50 text-charcoal-600 hover:text-pink-500 transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {user ? (
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-pink-50 text-charcoal-600 hover:text-pink-500 transition-all flex items-center gap-1">
                    <User size={20} />
                    <ChevronDown size={14} className="hidden sm:block" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-luxury-lg border border-charcoal-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-3 text-sm text-charcoal-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                      {t('nav.profile')}
                    </Link>
                    <Link to="/orders" className="block px-4 py-3 text-sm text-charcoal-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                      {t('nav.my_orders')}
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-3 text-sm text-gold-500 hover:bg-gold-100 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-charcoal-400 hover:bg-charcoal-50 transition-colors border-t border-charcoal-100"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-charcoal-700 hover:text-pink-500 hover:bg-pink-50 transition-all"
                >
                  <User size={16} />
                  {t('nav.login')}
                </Link>
              )}

              <button
                onClick={openCart}
                className="relative p-2 rounded-full hover:bg-pink-50 text-charcoal-700 hover:text-pink-500 transition-all"
                aria-label="Cart"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] bg-pink-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-pink-50 text-charcoal-700 transition-all"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-charcoal-100 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 py-3 flex gap-3">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                  <Search size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-charcoal-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-pink-50 text-pink-500' : 'text-charcoal-700'}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                <Link
                  to="/products?wholesale=true"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gold-500 flex items-center gap-1.5"
                >
                  <Gem size={13} /> {t('nav.wholesale')}
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-center mt-2"
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header + top strip */}
      <div className="h-[calc(28px+64px)]" />
    </>
  );
}
