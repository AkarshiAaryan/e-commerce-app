const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: [String], default: [] },
  images: { type: [String], default: [] },
  bestSeller: { type: Boolean, default: false },
  date: { type: Number, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);
