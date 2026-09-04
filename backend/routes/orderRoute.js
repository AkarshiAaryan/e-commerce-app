const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middlewares/validate');

// Place order (COD)
router.post('/place', auth, [body('items').isArray({ min: 1 }), body('address').notEmpty()], validate, orderController.placeOrderCOD);

// User's orders
router.post('/userorders', auth, orderController.userOrders);

// Admin list orders
router.post('/list', auth, adminAuth, orderController.adminListOrders);

// Admin update status
router.post('/status', auth, adminAuth, orderController.adminUpdateStatus);

// Stripe
router.post('/stripe', auth, [body('items').isArray({ min: 1 }), body('address').notEmpty()], validate, orderController.createStripeSession);
router.post('/verifyStripe', [body('sessionId').notEmpty(), body('orderId').isMongoId()], validate, orderController.verifyStripe);

// Razorpay
router.post('/razorpay', auth, [body('items').isArray({ min: 1 }), body('address').notEmpty()], validate, orderController.createRazorpayOrder);
router.post('/verifyRazorpay', [body('razorpay_order_id').notEmpty(), body('razorpay_payment_id').notEmpty(), body('razorpay_signature').notEmpty(), body('orderId').isMongoId()], validate, orderController.verifyRazorpay);

module.exports = router;
