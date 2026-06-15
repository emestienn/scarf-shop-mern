import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    telegramUsername: {
      type: String,
    },
    role: {
      type: String,
      enum: ['customer', 'wholesale', 'admin'],
      default: 'customer',
    },
    isWholesaleVerified: {
      type: Boolean,
      default: false,
    },
    wholesaleInfo: {
      businessName: String,
      registrationNumber: String,
      approvedAt: Date,
    },
    preferredLanguage: {
      type: String,
      enum: ['ru', 'uz'],
      default: 'ru',
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        city: String,
        district: String,
        street: String,
        apartment: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
