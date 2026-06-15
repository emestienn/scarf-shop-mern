import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  createReview,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', optionalAuth, getProductBySlug);
router.post('/:slug/reviews', protect, createReview);

router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
