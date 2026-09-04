const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  size: String,
  quantity: Number,
});

const AddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  street: String,
  city: String,
  state: String,
  zipcode: String,
  phone: String,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], default: [] },
  amount: { type: Number, required: true },
  address: { type: AddressSchema, required: true },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, default: false },
  status: { type: String, default: 'Order Placed' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);

// Indexes for efficient queries
OrderSchema.index({ userId: 1, date: -1 });
OrderSchema.index({ status: 1 });
