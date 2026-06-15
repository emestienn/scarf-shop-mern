import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import useLanguageStore from '../../store/languageStore.js';

// Placeholder grid — replace with real Instagram Basic Display API or curated images
const PLACEHOLDER_POSTS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  likes: Math.floor(Math.random() * 800) + 100,
  url: 'https://instagram.com/luxury_platok__',
}));

const PASTEL_GRADIENTS = [
  'from-pink-100 to-gold-100',
  'from-gold-100 to-pink-100',
  'from-pink-200 to-pink-100',
  'from-charcoal-100 to-pink-100',
  'from-gold-200 to-gold-100',
  'from-pink-100 to-charcoal-100',
];

export default function InstagramFeed() {
  const { t } = useLanguageStore();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="badge-luxury bg-pink-50 text-pink-500 border border-pink-200 mb-3">
            <Instagram size={14} /> Instagram
          </span>
          <h2 className="section-title mt-3">{t('sections.instagram')}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('sections.instagram_sub')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {PLACEHOLDER_POSTS.map((post, i) => (
            <motion.a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${PASTEL_GRADIENTS[i]} group cursor-pointer`}
            >
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mb-2">
                    <span className="text-2xl">
                      {['🧣', '✨', '🌸', '💎', '🌿', '🎀'][i]}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-xs font-medium">@luxury_platok__</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal-900/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-center">
                  <Instagram size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">♥ {post.likes}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://instagram.com/luxury_platok__"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-outline"
          >
            <Instagram size={18} />
            Подписаться в Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
