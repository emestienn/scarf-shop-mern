import mongoose from 'mongoose';

// Accept secure absolute URLs (pasted external links) or our own relative
// upload path (/uploads/...). Rejects http:// (mixed content on HTTPS
// deployments) and unsafe schemes like data:/javascript:.
const isAllowedImageUrl = (url) => /^https:\/\/|^\/uploads\//.test(url);
const imageUrlValidator = {
  validator: isAllowedImageUrl,
  message: (props) => `"${props.value}" is not a valid image URL — it must start with https:// or be an uploaded file path`,
};

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const wholesaleTierSchema = new mongoose.Schema({
  minQuantity: { type: Number, required: true },
  maxQuantity: { type: Number },
  pricePerUnit: { type: Number, required: true },
  label: { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      ru: { type: String, required: true, trim: true },
      uz: { type: String, trim: true },
    },
    description: {
      ru: { type: String, required: true },
      uz: { type: String },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['hijab', 'platok', 'shawl', 'scarf', 'accessory'],
    },
    material: {
      type: String,
      required: true,
      enum: ['silk', 'chiffon', 'cotton', 'georgette', 'viscose', 'modal', 'jersey', 'other'],
    },
    pattern: {
      type: String,
      enum: ['solid', 'floral', 'monogram', 'patterned', 'striped', 'geometric', 'abstract'],
      default: 'solid',
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        images: [{ type: String, validate: imageUrlValidator }],
        stock: { type: Number, default: 0 },
      },
    ],
    sizes: [
      {
        label: { type: String },
        dimensions: { type: String },
      },
    ],
    images: [{ type: String, required: true, validate: imageUrlValidator }],
    retailPrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    wholesaleTiers: [wholesaleTierSchema],
    currency: { type: String, default: 'UZS' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true }],
    badges: [
      {
        type: String,
        enum: ['premium', 'breathable', 'limited', 'new', 'sale', 'exclusive'],
      },
    ],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    weight: { type: Number },
    minWholesaleQuantity: { type: Number, default: 10 },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ category: 1, material: 1, pattern: 1 });
productSchema.index({ isFeatured: 1, isBestSeller: 1, isNewArrival: 1 });
productSchema.index({ 'name.ru': 'text', 'description.ru': 'text', tags: 'text' });

productSchema.virtual('isOnSale').get(function () {
  return this.compareAtPrice && this.compareAtPrice > this.retailPrice;
});

productSchema.virtual('discountPercent').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.retailPrice) return 0;
  return Math.round(((this.compareAtPrice - this.retailPrice) / this.compareAtPrice) * 100);
});

productSchema.methods.getWholesalePrice = function (quantity) {
  if (!this.wholesaleTiers || this.wholesaleTiers.length === 0) return this.retailPrice;
  const tiers = [...this.wholesaleTiers].sort((a, b) => b.minQuantity - a.minQuantity);
  for (const tier of tiers) {
    if (quantity >= tier.minQuantity) return tier.pricePerUnit;
  }
  return this.retailPrice;
};

productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
