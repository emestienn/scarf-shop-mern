import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  color: { type: String },
  colorHex: { type: String },
  size: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true, default: 'Tashkent' },
  district: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String },
  notes: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String },
    guestPhone: { type: String },
    orderType: {
      type: String,
      enum: ['retail', 'wholesale'],
      default: 'retail',
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    deliveryMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
      default: 'delivery',
    },
    pickupLocation: {
      type: String,
      enum: ['chorsu', 'yunusabad', 'abu_sahiy'],
    },
    paymentMethod: {
      type: String,
      enum: ['click', 'payme', 'cash_on_delivery', 'card_on_delivery'],
      required: true,
    },
    paymentResult: {
      transactionId: String,
      status: String,
      paidAt: Date,
      provider: String,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'UZS' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    adminNote: { type: String },
    telegramNotified: { type: Boolean, default: false },
    language: { type: String, enum: ['ru', 'uz'], default: 'ru' },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    this.orderNumber = `LP-${yy}${mm}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
