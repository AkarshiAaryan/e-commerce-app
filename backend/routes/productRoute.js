const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Admin-only: add product (multipart/form-data)
router.post('/add', auth, adminAuth, upload.array('images', 8), productController.addProduct);

// Admin-only: remove product
router.post('/remove', auth, adminAuth, productController.removeProduct);

// Public: list products
router.post('/list', productController.listProducts);

// Public: single product
router.post('/single', productController.singleProduct);

module.exports = router;
