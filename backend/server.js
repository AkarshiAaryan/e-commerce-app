const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cors());

// Stripe webhook endpoint requires the raw body to verify signature.
// Define the route with express.raw before the JSON body parser is applied.
const orderController = require('./controllers/orderController');
app.post('/api/order/stripe-webhook', express.raw({ type: 'application/json' }), orderController.stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
