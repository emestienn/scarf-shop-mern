import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import useAuthStore from '../../store/authStore.js';
import useLanguageStore from '../../store/languageStore.js';
import { PLACEHOLDER_IMAGE, handleImageError } from '../../utils/image.js';

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(n);

export default function ProductCard({ product, onQuickView }) {
  const [hovered, setHovered]   = useState(false);
  const [imgIdx, setImgIdx]     = useState(0);
  const [adding, setAdding]     = useState(false);

  const { addItem }    = useCartStore();
  const { isWholesale } = useAuthStore();
  const { t, lang }   = useLanguageStore();

  const name = product.name?.[lang] || product.name?.ru || product.name;
  const image = product.images?.[imgIdx] || product.images?.[0] || PLACEHOLDER_IMAGE;
  const hoverImage = product.images?.[1] || image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 1000);
  };

  const badgeColors = {
    premium:   'bg-gold-100 text-gold-600 border-gold-200',
    breathable:'bg-emerald-50 text-emerald-600 border-emerald-200',
    limited:   'bg-red-50 text-red-500 border-red-200',
    new:       'bg-pink-50 text-pink-500 border-pink-200',
    sale:      'bg-orange-50 text-orange-500 border-orange-200',
    exclusive: 'bg-purple-50 text-purple-500 border-purple-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group card-luxury hover-lift"
    >
      {/* Image container */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-[3/4]">
        <motion.img
          src={hovered && product.images?.length > 1 ? hoverImage : image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 max-w-[calc(100%-1.5rem)]">
          <div className="flex gap-1">
            {product.isNewArrival && (
              <span className="badge-luxury bg-pink-400 text-white text-[10px] font-bold px-1.5 py-0.5">NEW</span>
            )}
            {product.isOnSale && (
              <span className="badge-luxury bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5">
                -{product.discountPercent}%
              </span>
            )}
          </div>
          {product.badges?.slice(0, 1).map((badge) => (
            <span key={badge} className={`badge-luxury border text-[10px] self-start ${badgeColors[badge] || 'bg-white text-charcoal-600 border-charcoal-200'}`}>
              ✦ {t(`product.badges.${badge}`)}
            </span>
          ))}
        </div>

        {/* Color swatches */}
        {product.colors?.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {product.colors.slice(0, 5).map((color, i) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color.hex,
                  borderColor: imgIdx === i ? '#E8A2B5' : 'rgba(255,255,255,0.8)',
                }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-white text-[10px] self-center">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Action buttons on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 right-3 flex flex-col gap-2"
        >
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-luxury flex items-center justify-center hover:bg-pink-50 hover:text-pink-500 transition-all"
              title={t('product.quick_view')}
            >
              <Eye size={16} />
            </button>
          )}
        </motion.div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <p className="text-xs text-charcoal-400 uppercase tracking-widest mb-1">
            {product.material}
          </p>
          <h3 className="font-medium text-charcoal-800 hover:text-pink-500 transition-colors line-clamp-2 leading-snug mb-3">
            {name}
          </h3>
        </Link>

        {/* Price block */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {product.compareAtPrice > product.retailPrice && (
              <p className="text-xs text-charcoal-400 line-through">
                {formatPrice(product.compareAtPrice)} UZS
              </p>
            )}
            <p className="text-pink-500 font-semibold text-base">
              {formatPrice(product.retailPrice)}{' '}
              <span className="text-xs font-normal text-charcoal-400">UZS</span>
            </p>
            {isWholesale?.() && product.wholesaleTiers?.length > 0 && (
              <p className="text-xs text-gold-500 font-medium mt-0.5">
                Опт: {formatPrice(product.wholesaleTiers[0].pricePerUnit)} UZS
              </p>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stock === 0}
            whileTap={{ scale: 0.92 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              adding
                ? 'bg-green-400 text-white'
                : product.stock === 0
                ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                : 'bg-pink-400 hover:bg-pink-500 text-white shadow-pink'
            }`}
          >
            <ShoppingBag size={16} />
          </motion.button>
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-charcoal-400 mt-2">{t('product.out_of_stock')}</p>
        )}

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xs ${i < Math.round(product.rating) ? 'text-gold-400' : 'text-charcoal-200'}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-charcoal-400">({product.numReviews})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
