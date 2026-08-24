const Product = require('../models/ProductModel');
const { cloudinary, configured } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadToCloudinary = async (filePath) => {
  if (!configured) throw new Error('Cloudinary not configured');
  return await cloudinary.uploader.upload(filePath, { folder: 'ecommerce/products' });
};

exports.addProduct = async (req, res, next) => {
  try {
    // multer will attach files in req.files
    const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;
    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    // parse sizes: allow JSON array or comma-separated string
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
      // upload via cloudinary if configured; otherwise keep local path
      if (configured) {
        const result = await uploadToCloudinary(f.path);
        imageUrls.push(result.secure_url);
        // remove local file
        try { fs.unlinkSync(f.path); } catch (e) {}
      } else {
        // keep relative path for fallback
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
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Product id required' });
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    await prod.remove();
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.singleProduct = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Product id required' });
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product: prod });
  } catch (err) {
    next(err);
  }
};
