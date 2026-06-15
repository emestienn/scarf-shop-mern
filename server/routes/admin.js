import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();
router.use(protect, admin);

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, totalRevenue, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.countDocuments({ isAvailable: true }),
    User.countDocuments({ isActive: true }),
  ]);

  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'name email');

  res.json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
    },
    recentOrders,
  });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = role ? { role } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total });
}));

router.put('/users/:id/approve-wholesale', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.role = 'wholesale';
  user.isWholesaleVerified = true;
  user.wholesaleInfo.approvedAt = new Date();
  await user.save();

  res.json({ success: true, message: 'Wholesale account approved', user });
}));

router.put('/users/:id/deactivate', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User deactivated' });
}));

export default router;
