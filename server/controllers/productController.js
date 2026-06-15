import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    material,
    pattern,
    color,
    minPrice,
    maxPrice,
    search,
    sort = '-createdAt',
    featured,
    bestSeller,
    newArrival,
  } = req.query;

  const filter = { isAvailable: true };

  if (category) filter.category = category;
  if (material) filter.material = material;
  if (pattern) filter.pattern = pattern;
  if (color) filter['colors.name'] = { $regex: color, $options: 'i' };
  if (featured === 'true') filter.isFeatured = true;
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (newArrival === 'true') filter.isNewArrival = true;

  if (minPrice || maxPrice) {
    filter.retailPrice = {};
    if (minPrice) filter.retailPrice.$gte = Number(minPrice);
    if (maxPrice) filter.retailPrice.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-reviews'),
    Product.countDocuments(filter),
  ]);

  const isWholesale = req.user?.role === 'wholesale' || req.user?.role === 'admin';

  const result = products.map((p) => {
    const obj = p.toObject();
    if (!isWholesale) delete obj.wholesaleTiers;
    return obj;
  });

  res.json({
    success: true,
    products: result,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isAvailable: true }).populate(
    'reviews.user',
    'name'
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const obj = product.toObject({ virtuals: true });
  const isWholesale = req.user?.role === 'wholesale' || req.user?.role === 'admin';
  if (!isWholesale) delete obj.wholesaleTiers;

  res.json({ success: true, product: obj });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isAvailable: true })
    .limit(8)
    .select('-reviews -wholesaleTiers');
  res.json({ success: true, products });
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.isAvailable = false;
  await product.save();
  res.json({ success: true, message: 'Product removed' });
});
