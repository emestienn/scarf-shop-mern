import express from 'express';
import {
  register,
  login,
  telegramLogin,
  getProfile,
  updateProfile,
  applyForWholesale,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/telegram', telegramLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wholesale-apply', protect, applyForWholesale);

export default router;
