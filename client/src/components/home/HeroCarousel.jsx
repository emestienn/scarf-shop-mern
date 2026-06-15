import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useLanguageStore from '../../store/languageStore.js';

const slides = [
  {
    id: 1,
    badge: 'Летняя коллекция 2025',
    titleRu: 'Лёгкость в каждом движении',
    titleUz: 'Har bir harakatda yengillik',
    subtitleRu: 'Воздушные ткани, пастельные оттенки — идеально для жаркого лета Ташкента',
    subtitleUz: 'Yengil matolar, pastel ranglar — Toshkentning issiq yozi uchun ideal tanlov',
    cta: 'shop',
    bg: 'from-pink-50 via-white to-sky-50',
    accent: '#E8A2B5',
    pattern: 'flowers',
  },
  {
    id: 2,
    badge: 'Летняя коллекция',
    titleRu: 'Шифон. Лёгкость. Элегантность.',
    titleUz: 'Shifon. Yengillik. Nafosatlik.',
    subtitleRu: 'Воздушные шифоновые платки для жаркого лета Ташкента',
    subtitleUz: 'Toshkentning issiq yozi uchun nafis shifon ro\'mollar',
    cta: 'shop',
    bg: 'from-sky-50 via-white to-pink-50',
    accent: '#C9A96E',
    pattern: 'waves',
  },
  {
    id: 3,
    badge: 'ОПТОМ И В РОЗНИЦУ',
    titleRu: 'Специальные условия для оптовых клиентов',
    titleUz: 'Ulgurji mijozlar uchun maxsus shartlar',
    subtitleRu: 'Скидки до 40% при заказе от 10 шт. Быстрая доставка по Ташкенту.',
    subtitleUz: '10 ta dan buyurtmada 40% gacha chegirma. Toshkent bo\'ylab tez yetkazib berish.',
    cta: 'wholesale',
    bg: 'from-gold-100 via-white to-pink-50',
    accent: '#C9A96E',
    pattern: 'dots',
  },
];

const patterns = {
  flowers: (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="flowers" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="8" fill="none" stroke="#C9A96E" strokeWidth="1"/>
          <circle cx="30" cy="30" r="3" fill="#C9A96E"/>
          {[0,60,120,180,240,300].map((angle, i) => (
            <circle key={i} cx={30 + 12 * Math.cos(angle * Math.PI / 180)} cy={30 + 12 * Math.sin(angle * Math.PI / 180)} r="4" fill="#E8A2B5"/>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#flowers)"/>
    </svg>
  ),
  waves: (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="waves" x="0" y="0" width="80" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q20 0 40 10 Q60 20 80 10" fill="none" stroke="#C9A96E" strokeWidth="1.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#waves)"/>
    </svg>
  ),
  dots: (
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="2" fill="#C9A96E"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)"/>
    </svg>
  ),
};

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { t, lang } = useLanguageStore();

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

  const slide = slides[current];

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden rounded-none" style={{ height: 'clamp(420px, 60vh, 680px)' }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg} flex items-center`}
        >
          {patterns[slide.pattern]}

          {/* Decorative blob */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: slide.accent }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl"
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-gold-200 text-gold-600 text-xs font-medium mb-5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                {slide.badge}
              </span>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal-800 leading-tight mb-4">
                {lang === 'uz' ? slide.titleUz : slide.titleRu}
              </h1>

              {/* Subtitle */}
              <p className="text-charcoal-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                {lang === 'uz' ? slide.subtitleUz : slide.subtitleRu}
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
                      Зарегистрироваться
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-luxury flex items-center justify-center hover:bg-white transition-all"
      >
        <ChevronLeft size={20} className="text-charcoal-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-luxury flex items-center justify-center hover:bg-white transition-all"
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
              i === current ? 'w-6 h-2 bg-pink-400' : 'w-2 h-2 bg-charcoal-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
