import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, preferredLanguage } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, phone, preferredLanguage });

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isWholesaleVerified: user.isWholesaleVerified,
      preferredLanguage: user.preferredLanguage,
    },
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account deactivated. Please contact support.');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isWholesaleVerified: user.isWholesaleVerified,
      preferredLanguage: user.preferredLanguage,
    },
    token: generateToken(user._id),
  });
});

export const telegramLogin = asyncHandler(async (req, res) => {
  const { id, first_name, last_name, username, hash } = req.body;

  if (!id || !hash) {
    res.status(400);
    throw new Error('Invalid Telegram auth data');
  }

  let user = await User.findOne({ telegramId: String(id) });

  if (!user) {
    const name = [first_name, last_name].filter(Boolean).join(' ');
    const fakeEmail = `tg_${id}@luxuryplatok.local`;

    user = await User.create({
      name,
      email: fakeEmail,
      telegramId: String(id),
      telegramUsername: username,
      isActive: true,
    });
  } else {
    user.lastLogin = new Date();
    if (username) user.telegramUsername = username;
    await user.save();
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
      isWholesaleVerified: user.isWholesaleVerified,
      telegramUsername: user.telegramUsername,
      preferredLanguage: user.preferredLanguage,
    },
    token: generateToken(user._id),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images retailPrice slug');
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, phone, preferredLanguage, currentPassword, newPassword, addresses } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (addresses) user.addresses = addresses;

  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
  }

  const updated = await user.save();
  res.json({
    success: true,
    user: { _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role },
  });
});

export const applyForWholesale = asyncHandler(async (req, res) => {
  const { businessName, registrationNumber } = req.body;
  const user = await User.findById(req.user._id);

  user.wholesaleInfo = { businessName, registrationNumber };
  await user.save();

  res.json({ success: true, message: 'Wholesale application submitted. Admin will review within 24 hours.' });
});
