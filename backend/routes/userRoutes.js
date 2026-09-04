const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin', userController.adminLogin);

router.get('/me', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/cart', auth, userController.getCart);
router.put('/cart', auth, userController.updateCart);

module.exports = router;
