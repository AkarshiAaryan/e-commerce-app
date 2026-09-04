const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Configure CORS from environment (comma-separated list). If none provided, allow all origins (useful for dev).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function(origin, callback) {
    // Allow non-browser tools like curl or server-to-server requests (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Stripe webhook endpoint requires the raw body to verify signature.
// Define the route with express.raw before the JSON body parser is applied.
const orderController = require('./controllers/orderController');
app.post('/api/order/stripe-webhook', express.raw({ type: 'application/json' }), orderController.stripeWebhook);

// JSON / URL-encoded body size limits (configurable via REQUEST_SIZE_LIMIT env, default 500kb)
const requestSizeLimit = process.env.REQUEST_SIZE_LIMIT || '500kb';
app.use(express.json({ limit: requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);
const productRoutes = require('./routes/productRoute');
app.use('/api/product', productRoutes);
const orderRoutes = require('./routes/orderRoute');
app.use('/api/order', orderRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
