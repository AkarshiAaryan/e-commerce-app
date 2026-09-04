const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const signToken = (userId, isAdmin = false) => {
  return jwt.sign({ id: userId, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  cartData: user.cartData || [],
  createdAt: user.createdAt,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('cartData');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, cartData: user.cartData || [] });
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { cartData } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cartData = Array.isArray(cartData) ? cartData : [];
    await user.save();
    res.json({ success: true, cartData: user.cartData });
  } catch (err) {
    next(err);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ message: 'Admin credentials not configured on server' });
    }
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    // Create an admin token
    const token = signToken('admin', true);
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
