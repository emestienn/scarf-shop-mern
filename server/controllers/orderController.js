import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderNotification, sendStatusUpdate, sendUserStatusUpdate } from '../utils/telegramBot.js';

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    deliveryMethod,
    pickupLocation,
    paymentMethod,
    guestEmail,
    guestPhone,
    language,
    location,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const populatedItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name.ru}"`);
      }

      const isWholesale = req.user?.role === 'wholesale' || req.user?.role === 'admin';
      const unitPrice = isWholesale
        ? product.getWholesalePrice(item.quantity)
        : product.retailPrice;

      return {
        product: product._id,
        name: product.name.ru,
        image: product.images[0],
        color: item.color,
        colorHex: item.colorHex,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    })
  );

  const subtotal = populatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const shippingCost = deliveryMethod === 'pickup' ? 0 : subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + shippingCost;

  const orderType = req.user?.role === 'wholesale' ? 'wholesale' : 'retail';

  const order = await Order.create({
    user: req.user?._id,
    guestEmail,
    guestPhone,
    orderType,
    items: populatedItems,
    shippingAddress,
    deliveryMethod,
    pickupLocation,
    paymentMethod,
    subtotal,
    shippingCost,
    totalAmount,
    language: language || 'ru',
    location: location || undefined,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  for (const item of populatedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  const notified = await sendOrderNotification(order);
  if (notified) {
    order.telegramNotified = true;
    await order.save();
  }

  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .select('-statusHistory -adminNote');
  res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.user?._id.toString() === req.user?._id.toString();
  const isAdmin = req.user?.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  order.statusHistory.push({ status, note });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  await sendStatusUpdate(order, status);

  // Notify the customer on their Telegram — works for linked accounts (user.telegramId)
  // AND for guest orders where the customer connected via the checkout deep-link
  // (order.customerTelegramChatId). If neither is present, silently skipped.
  const fullOrder = await Order.findById(order._id).populate('user', 'telegramId preferredLanguage name');
  if (fullOrder.user?.telegramId || fullOrder.customerTelegramChatId) {
    await sendUserStatusUpdate(fullOrder, status, fullOrder.user);
  }

  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email phone'),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});
