const Product = require('../models/ProductModel');
const { cloudinary, configured } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadToCloudinary = async (filePath) => {
  if (!configured) throw new Error('Cloudinary not configured');
  return await cloudinary.uploader.upload(filePath, { folder: 'ecommerce/products' });
};

const getProductId = (req) => {
  return req.body?.id || req.params?.id || req.query?.id;
};

exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;
    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    let sizesArr = [];
    if (sizes) {
      try {
        sizesArr = typeof sizes === 'string' && sizes.trim().startsWith('[') ? JSON.parse(sizes) : sizes.split(',').map(s => s.trim()).filter(Boolean);
      } catch (e) {
        sizesArr = sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const priceNum = Number(price);
    const best = bestSeller === 'true' || bestSeller === true || bestSeller === '1';

    const imageFiles = req.files || [];
    if (imageFiles.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const imageUrls = [];
    for (const f of imageFiles) {
      if (configured) {
        const result = await uploadToCloudinary(f.path);
        imageUrls.push(result.secure_url);
        try { fs.unlinkSync(f.path); } catch (e) {}
      } else {
        imageUrls.push(path.relative(process.cwd(), f.path));
      }
    }

    const product = await Product.create({
      name,
      description,
      price: priceNum,
      category,
      subCategory,
      sizes: sizesArr,
      images: imageUrls,
      bestSeller: best,
      date: Date.now(),
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.removeProduct = async (req, res, next) => {
  try {
    const id = getProductId(req);
    if (!id) return res.status(400).json({ message: 'Product id required' });
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    await prod.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const { category, subCategory, bestSeller } = req.body || {};
    const filters = {};

    if (category) filters.category = category;
    if (subCategory) filters.subCategory = subCategory;
    if (bestSeller !== undefined) filters.bestSeller = bestSeller === true || bestSeller === 'true' || bestSeller === '1';

    const products = await Product.find(filters).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, categories: categories.filter(Boolean) });
  } catch (err) {
    next(err);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.body || {};
    if (!q || !q.trim()) {
      return res.json({ success: true, products: [] });
    }
    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({ $or: [{ name: regex }, { description: regex }, { category: regex }, { subCategory: regex }] }).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.singleProduct = async (req, res, next) => {
  try {
    const id = getProductId(req);
    if (!id) return res.status(400).json({ message: 'Product id required' });
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product: prod });
  } catch (err) {
    next(err);
  }
};
