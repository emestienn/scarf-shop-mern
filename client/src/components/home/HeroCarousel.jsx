import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useLanguageStore from '../../store/languageStore.js';

const slides = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    fallbackGrad: 'from-pink-100 via-pink-50 to-white',
    accent: '#E8A2B5',
    cta: 'shop',
  },
  {
    id: 2,
    image: '/images/hero-2.jpg',
    fallbackGrad: 'from-gold-100 via-white to-pink-50',
    accent: '#C9A96E',
    cta: 'shop',
  },
  {
    id: 3,
    image: '/images/hero-3.jpg',
    fallbackGrad: 'from-charcoal-100 via-white to-gold-50',
    accent: '#C9A96E',
    cta: 'wholesale',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState(1);
  const [imgError, setImgError]     = useState({});
  const { t, lang }                 = useLanguageStore();

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  const slide   = slides[current];
  const slideT  = t('hero.slides')?.[current] || {};
  const hasImg  = !imgError[slide.id];

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden" style={{ height: 'clamp(480px, 65vh, 700px)' }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex"
        >
          {/* ── Left: Text content ─────────────────────────────────────────── */}
          <div className={`relative flex items-center w-full md:w-[55%] bg-gradient-to-br ${slide.fallbackGrad} z-10`}>
            {/* Subtle decorative SVG pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`pat-${slide.id}`} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="1.5" fill="#C9A96E"/>
                  <circle cx="0"  cy="0"  r="1"   fill="#E8A2B5"/>
                  <circle cx="50" cy="50" r="1"   fill="#E8A2B5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#pat-${slide.id})`}/>
            </svg>

            {/* Decorative blob */}
            <div
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: slide.accent }}
            />

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative z-10 px-8 sm:px-12 lg:px-16 py-12 w-full"
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gold-200 text-gold-600 text-xs font-semibold mb-6 shadow-sm tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse flex-shrink-0" />
                {slideT.badge}
              </span>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] text-charcoal-800 leading-tight mb-4 max-w-lg">
                {slideT.title}
              </h1>

              {/* Gold divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-gold-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                <div className="h-px w-10 bg-gold-400" />
              </div>

              {/* Subtitle */}
              <p className="text-charcoal-500 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                {slideT.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {slide.cta === 'shop' ? (
                  <>
                    <Link to="/products" className="btn-primary">
                      {t('hero.cta_shop')}
                    </Link>
                    <Link to="/products?wholesale=true" className="btn-outline">
                      {t('hero.cta_wholesale')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products?wholesale=true" className="btn-gold">
                      {t('hero.cta_wholesale')}
                    </Link>
                    <Link to="/register" className="btn-outline">
                      {t('hero.register')}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Lifestyle image ─────────────────────────────────────── */}
          <div className="hidden md:block absolute right-0 top-0 w-[48%] h-full overflow-hidden">
            {hasImg ? (
              <>
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover object-center"
                  onError={() => setImgError((p) => ({ ...p, [slide.id]: true }))}
                />
                {/* Left-fade overlay for seamless blend */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent" />
              </>
            ) : (
              /* Fallback decorative panel when no image file exists */
              <div className={`w-full h-full bg-gradient-to-br ${slide.fallbackGrad} flex items-center justify-center`}>
                <div className="text-center opacity-30">
                  <div className="w-32 h-32 mx-auto border-2 border-gold-300 rounded-full flex items-center justify-center mb-4">
                    <span className="font-serif text-4xl text-gold-400">LP</span>
                  </div>
                  <p className="text-charcoal-400 text-sm font-medium tracking-widest">LUXURY PLATOK</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm shadow-luxury flex items-center justify-center hover:bg-white hover:shadow-luxury-lg transition-all"
      >
        <ChevronLeft size={20} className="text-charcoal-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm shadow-luxury flex items-center justify-center hover:bg-white hover:shadow-luxury-lg transition-all"
      >
        <ChevronRight size={20} className="text-charcoal-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-7 h-2.5 bg-pink-400' : 'w-2.5 h-2.5 bg-charcoal-300 hover:bg-pink-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
