const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const mongoose = require('mongoose');
const stripeLib = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const ALLOWED_STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];

const getServerTotalAndSnapshots = async (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Cart items required');
  let total = 0;
  const snapshots = [];
  for (const it of items) {
    if (!it.productId || !mongoose.Types.ObjectId.isValid(it.productId)) throw new Error('Invalid productId');
    const prod = await Product.findById(it.productId);
    if (!prod) throw new Error(`Product not found: ${it.productId}`);
    const qty = Number(it.quantity) || 1;
    if (qty <= 0) throw new Error('Invalid quantity');
    total += prod.price * qty;
    snapshots.push({ productId: prod._id, name: prod.name, image: (prod.images && prod.images[0]) || '', price: prod.price, size: it.size || '', quantity: qty });
  }
  return { total, snapshots };
};

exports.placeOrderCOD = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { items, address, amount, paymentMethod } = req.body;
    if (!items || !address || !paymentMethod) return res.status(400).json({ message: 'Missing order data' });

    const { total, snapshots } = await getServerTotalAndSnapshots(items);
    // server must compute total; compare to provided amount as a guard
    if (Number(amount) !== Number(total)) {
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    const order = await Order.create({ userId, items: snapshots, amount: total, address, paymentMethod: 'COD', payment: false, status: 'Order Placed' });
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.userOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.adminListOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 }).populate('userId', 'name email');
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ message: 'orderId and status required' });
    if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// Stripe: create checkout session and create a pending order
exports.createStripeSession = async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) return res.status(500).json({ message: 'Stripe or FRONTEND_URL not configured' });
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    const userId = req.userId;
    const { items, address } = req.body;
    if (!items || !address) return res.status(400).json({ message: 'Missing items or address' });

    const { total, snapshots } = await getServerTotalAndSnapshots(items);

    // create pending order
    const order = await Order.create({ userId, items: snapshots, amount: total, address, paymentMethod: 'Stripe', payment: false, status: 'Order Placed' });

    // create Stripe Checkout Session
    const line_items = snapshots.map(it => ({ price_data: { currency: 'usd', product_data: { name: it.name }, unit_amount: Math.round(it.price * 100) }, quantity: it.quantity }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?orderId=${order._id}`,
      metadata: { orderId: String(order._id) }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

exports.verifyStripe = async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ message: 'Stripe not configured' });
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    const { sessionId, orderId } = req.body;
    if (!sessionId || !orderId) return res.status(400).json({ message: 'sessionId and orderId required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      order.payment = true;
      await order.save();
      return res.json({ success: true, order });
    }
    res.status(400).json({ message: 'Payment not completed' });
  } catch (err) {
    next(err);
  }
};

// Razorpay: create order and verify signature
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.FRONTEND_URL) return res.status(500).json({ message: 'Razorpay not configured' });
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const userId = req.userId;
    const { items, address } = req.body;
    if (!items || !address) return res.status(400).json({ message: 'Missing items or address' });

    const { total, snapshots } = await getServerTotalAndSnapshots(items);

    // create pending order
    const order = await Order.create({ userId, items: snapshots, amount: total, address, paymentMethod: 'Razorpay', payment: false, status: 'Order Placed' });

    const options = {
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: String(order._id),
    };
    const razorOrder = await instance.orders.create(options);
    res.json({ success: true, razorOrder, key: process.env.RAZORPAY_KEY_ID, orderId: order._id });
  } catch (err) {
    next(err);
  }
};

exports.verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) return res.status(400).json({ message: 'Missing verification parameters' });
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (generated_signature !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.payment = true;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};


exports.stripeWebhook = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send('Stripe not configured');
    const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const raw = req.body; // raw body as Buffer
    let event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata && session.metadata.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment = true;
          await order.save();
          console.log('Order marked paid via webhook', orderId);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('stripeWebhook error', err);
    res.status(500).send('Webhook handler error');
  }
}
