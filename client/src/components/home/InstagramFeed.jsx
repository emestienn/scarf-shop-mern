import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

const REEL_SHORTCODES = [
  'DZhuNjwzjiw',
  'DZK2hP4sOl1',
  'DZK2UKcMvzw',
  'DZKWyomsqSS',
  'DZJ9taEskBz',
  'DZCBxGTMTZ9',
];

const PASTEL_GRADIENTS = [
  'from-pink-100 to-gold-100',
  'from-gold-100 to-pink-100',
  'from-pink-200 to-pink-100',
  'from-charcoal-100 to-pink-100',
  'from-gold-200 to-gold-100',
  'from-pink-100 to-charcoal-100',
];

const ReelTile = ({ shortcode, index }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-charcoal-50 shadow-luxury flex-shrink-0"
      style={{ aspectRatio: '9 / 16', width: 'var(--reel-width)' }}
    >
      {/* Loading shimmer */}
      {!loaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${PASTEL_GRADIENTS[index]} flex items-center justify-center z-10`}>
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center animate-pulse">
            <Play size={22} className="text-pink-400 fill-pink-400 ml-0.5" />
          </div>
        </div>
      )}

      <iframe
        src={`https://www.instagram.com/p/${shortcode}/embed/`}
        className="absolute inset-0 w-full h-full border-0"
        allowTransparency={true}
        scrolling="no"
        frameBorder="0"
        allow="encrypted-media; clipboard-write"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        title={`Instagram reel ${index + 1}`}
      />
    </div>
  );
};

export default function InstagramFeed() {
  const { t } = useLanguageStore();
  const trackRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // scroll one tile width at a time
    const tileW = el.firstChild?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (tileW + 16), behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="badge-luxury bg-pink-50 text-pink-500 border border-pink-200 mb-3 inline-flex items-center gap-1.5">
            <Instagram size={13} /> Instagram Reels
          </span>
          <h2 className="section-title mt-3">{t('sections.instagram')}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('sections.instagram_sub')}</p>
        </div>

        {/* Carousel wrapper */}
        <div className="relative group/carousel">

          {/* Left arrow */}
          <motion.button
            initial={false}
            animate={{ opacity: canLeft ? 1 : 0, pointerEvents: canLeft ? 'auto' : 'none' }}
            transition={{ duration: 0.2 }}
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-luxury-lg border border-pink-100 flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-all"
          >
            <ChevronLeft size={20} className="text-charcoal-700" />
          </motion.button>

          {/* Right arrow */}
          <motion.button
            initial={false}
            animate={{ opacity: canRight ? 1 : 0, pointerEvents: canRight ? 'auto' : 'none' }}
            transition={{ duration: 0.2 }}
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-luxury-lg border border-pink-100 flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-all"
          >
            <ChevronRight size={20} className="text-charcoal-700" />
          </motion.button>

          {/* Scrollable track
              --reel-width drives the tile width AND aspect-ratio height.
              Shows ~3.3 tiles on mobile, ~4 on desktop so the next tile
              peeks to hint at scrollability. */}
          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 hide-scrollbar"
            style={{ '--reel-width': 'clamp(200px, 22vw, 280px)' }}
          >

            {REEL_SHORTCODES.map((shortcode, i) => (
              <motion.div
                key={shortcode}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <ReelTile shortcode={shortcode} index={i} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {REEL_SHORTCODES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = trackRef.current;
                if (!el) return;
                const tileW = el.firstChild?.firstChild?.offsetWidth ?? 260;
                el.scrollTo({ left: i * (tileW + 16), behavior: 'smooth' });
              }}
              className="w-2 h-2 rounded-full bg-pink-200 hover:bg-pink-400 transition-colors"
            />
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/luxury_platok_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-outline"
          >
            <Instagram size={18} />
            {t('instagram.follow')}
          </a>
        </div>
      </div>
    </section>
  );
}
