import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Order from '../models/Order.js';

// ── Click (Uzbekistan) ──────────────────────────────────────────────────────

export const clickPrepare = asyncHandler(async (req, res) => {
  const { click_trans_id, merchant_trans_id, amount, sign_time, sign_string } = req.body;
  const order = await Order.findById(merchant_trans_id);

  if (!order) return res.json({ error: -5, error_note: 'Order not found' });

  const expectedSign = crypto
    .createHash('md5')
    .update(`${click_trans_id}${process.env.CLICK_SERVICE_ID}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${amount}${1}${sign_time}`)
    .digest('hex');

  if (sign_string !== expectedSign) return res.json({ error: -1, error_note: 'Invalid sign' });

  if (Math.abs(order.totalAmount - Number(amount)) > 1) {
    return res.json({ error: -2, error_note: 'Incorrect amount' });
  }

  res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: order._id,
    error: 0,
    error_note: 'Success',
  });
});

export const clickComplete = asyncHandler(async (req, res) => {
  const { click_trans_id, merchant_trans_id, merchant_prepare_id, amount, error, sign_time, sign_string } = req.body;

  const order = await Order.findById(merchant_trans_id);
  if (!order) return res.json({ error: -5, error_note: 'Order not found' });

  const expectedSign = crypto
    .createHash('md5')
    .update(`${click_trans_id}${process.env.CLICK_SERVICE_ID}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${2}${sign_time}`)
    .digest('hex');

  if (sign_string !== expectedSign) return res.json({ error: -1, error_note: 'Invalid sign' });

  if (Number(error) < 0) {
    order.status = 'cancelled';
    await order.save();
    return res.json({ error: 0, error_note: 'Order cancelled' });
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'confirmed';
  order.paymentResult = {
    transactionId: click_trans_id,
    status: 'paid',
    paidAt: new Date(),
    provider: 'click',
  };
  await order.save();

  res.json({ click_trans_id, merchant_trans_id, error: 0, error_note: 'Success' });
});

// ── Payme (Uzbekistan) ──────────────────────────────────────────────────────

export const paymeWebhook = asyncHandler(async (req, res) => {
  const { method, params, id } = req.body;

  const authHeader = req.headers.authorization || '';
  const base64 = authHeader.replace('Basic ', '');
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [, receivedKey] = decoded.split(':');

  if (receivedKey !== process.env.PAYME_SECRET_KEY) {
    return res.json({
      id,
      error: { code: -32504, message: { ru: 'Недостаточно привилегий', en: 'Insufficient privilege' } },
    });
  }

  if (method === 'CheckPerformTransaction') {
    const order = await Order.findById(params.account?.order_id);
    if (!order) {
      return res.json({ id, error: { code: -31050, message: { ru: 'Заказ не найден', en: 'Order not found' } } });
    }
    if (Math.abs(order.totalAmount * 100 - params.amount) > 100) {
      return res.json({ id, error: { code: -31001, message: { ru: 'Неверная сумма', en: 'Wrong amount' } } });
    }
    return res.json({ id, result: { allow: true } });
  }

  if (method === 'PerformTransaction') {
    const order = await Order.findById(params.account?.order_id);
    if (!order) return res.json({ id, error: { code: -31050, message: { ru: 'Заказ не найден' } } });

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'confirmed';
    order.paymentResult = { transactionId: params.id, status: 'paid', paidAt: new Date(), provider: 'payme' };
    await order.save();

    return res.json({ id, result: { transaction: params.id, perform_time: Date.now(), state: 2 } });
  }

  res.json({ id, error: { code: -32601, message: { ru: 'Метод не найден' } } });
});

// ── Create Payment URL helpers ──────────────────────────────────────────────

export const getClickPaymentUrl = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const params = new URLSearchParams({
    service_id: process.env.CLICK_SERVICE_ID,
    merchant_id: process.env.CLICK_MERCHANT_ID,
    amount: order.totalAmount,
    transaction_param: orderId,
    return_url: process.env.CLICK_RETURN_URL,
  });

  res.json({ success: true, url: `https://my.click.uz/pay/create?${params.toString()}` });
});

export const getPaymePaymentUrl = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const payload = JSON.stringify({ m: process.env.PAYME_MERCHANT_ID, ac: { order_id: orderId }, a: order.totalAmount * 100 });
  const encoded = Buffer.from(payload).toString('base64');
  const baseUrl = process.env.NODE_ENV === 'production' ? process.env.PAYME_PROD_URL : process.env.PAYME_TEST_URL;

  res.json({ success: true, url: `${baseUrl}/${encoded}` });
});
