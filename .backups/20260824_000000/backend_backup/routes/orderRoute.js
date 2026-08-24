const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Place order (COD)
router.post('/place', auth, orderController.placeOrderCOD);

// User's orders
router.post('/userorders', auth, orderController.userOrders);

// Admin list orders
router.post('/list', auth, adminAuth, orderController.adminListOrders);

// Admin update status
router.post('/status', auth, adminAuth, orderController.adminUpdateStatus);

// Stripe
router.post('/stripe', auth, orderController.createStripeSession);
router.post('/verifyStripe', orderController.verifyStripe);

// Razorpay
router.post('/razorpay', auth, orderController.createRazorpayOrder);
router.post('/verifyRazorpay', orderController.verifyRazorpay);

module.exports = router;
