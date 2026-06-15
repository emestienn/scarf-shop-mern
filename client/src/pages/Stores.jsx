import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import useLanguageStore from '../store/languageStore.js';

const stores = [
  {
    key: 'chorsu',
    emoji: '🏪',
    nameRu: 'Чорсу / Фунча',
    nameUz: 'Cho\'rsu / Funcha',
    addressRu: 'Рынок Чорсу, Фунча павильон, Ташкент',
    addressUz: 'Cho\'rsu bozori, Funcha pavilon, Toshkent',
    phone: '+998 90 XXX XX XX',
    hoursRu: 'Пн–Сб: 09:00–19:00',
    hoursUz: 'Du–Sha: 09:00–19:00',
    mapsUrl: 'https://maps.google.com/?q=Chorsu+Bazaar+Tashkent',
    yandexUrl: 'https://yandex.uz/maps/?text=Chorsu+Bazaar+Tashkent',
    color: 'from-pink-100 to-pink-50',
    accent: '#E8A2B5',
  },
  {
    key: 'yunusabad',
    emoji: '🏬',
    nameRu: 'Юнусабад',
    nameUz: 'Yunusobod',
    addressRu: 'Юнусабадский район, ТЦ, Ташкент',
    addressUz: 'Yunusobod tumani, savdo markazi, Toshkent',
    phone: '+998 90 XXX XX XX',
    hoursRu: 'Пн–Сб: 09:00–19:00',
    hoursUz: 'Du–Sha: 09:00–19:00',
    mapsUrl: 'https://maps.google.com/?q=Yunusabad+Tashkent',
    yandexUrl: 'https://yandex.uz/maps/?text=Yunusabad+Tashkent',
    color: 'from-gold-100 to-gold-50',
    accent: '#C9A96E',
  },
  {
    key: 'abu_sahiy',
    emoji: '🛍',
    nameRu: 'Абу Сахий',
    nameUz: 'Abu Sahiy',
    addressRu: 'Рынок Абу Сахий, Ташкент',
    addressUz: 'Abu Sahiy bozori, Toshkent',
    phone: '+998 90 XXX XX XX',
    hoursRu: 'Пн–Сб: 09:00–18:00',
    hoursUz: 'Du–Sha: 09:00–18:00',
    mapsUrl: 'https://maps.google.com/?q=Abu+Sahiy+Bazaar+Tashkent',
    yandexUrl: 'https://yandex.uz/maps/?text=Abu+Sahiy+Tashkent',
    color: 'from-charcoal-100 to-charcoal-50',
    accent: '#7A7A7A',
  },
];

export default function Stores() {
  const { t, lang } = useLanguageStore();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-luxury-gradient border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="badge-luxury bg-pink-50 text-pink-500 border border-pink-200 mb-4">
            <MapPin size={14} /> Ташкент
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal-800 mt-4">
            {t('stores.title')}
          </h1>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('stores.subtitle')}</p>
        </div>
      </div>

      {/* Store cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 md:gap-8">
          {stores.map((store, i) => (
            <motion.div
              key={store.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl shadow-luxury overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Colorful left panel */}
                <div className={`bg-gradient-to-br ${store.color} p-8 md:w-52 flex-shrink-0 flex flex-col items-center justify-center text-center`}>
                  <span className="text-5xl mb-3">{store.emoji}</span>
                  <h2 className="font-serif text-xl text-charcoal-800">
                    {lang === 'uz' ? store.nameUz : store.nameRu}
                  </h2>
                </div>

                {/* Info */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-400 font-medium mb-1 uppercase tracking-wide">Адрес</p>
                        <p className="text-charcoal-700 text-sm leading-relaxed">
                          {lang === 'uz' ? store.addressUz : store.addressRu}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <Phone size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-400 font-medium mb-1 uppercase tracking-wide">Телефон</p>
                        <a href={`tel:${store.phone}`} className="text-charcoal-700 text-sm hover:text-pink-500 transition-colors">
                          {store.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-400 font-medium mb-1 uppercase tracking-wide">{t('stores.hours')}</p>
                        <p className="text-charcoal-700 text-sm">
                          {lang === 'uz' ? store.hoursUz : store.hoursRu}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map buttons */}
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={store.yandexUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#FC3F1D]/10 text-[#FC3F1D] hover:bg-[#FC3F1D]/20 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Navigation size={15} />
                      Яндекс Карты
                    </a>
                    <a
                      href={store.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-charcoal-50 text-charcoal-700 hover:bg-charcoal-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Navigation size={15} />
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center bg-luxury-gradient rounded-3xl p-10 border border-pink-100"
        >
          <h3 className="font-serif text-2xl text-charcoal-800 mb-2">Хотите заказать доставку?</h3>
          <p className="text-charcoal-400 mb-6">Доставляем по всему Ташкенту. Бесплатно при заказе от 500 000 UZS.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://t.me/luxury_platok" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Написать в Telegram
            </a>
            <a href="/products" className="btn-outline">
              Смотреть каталог
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
