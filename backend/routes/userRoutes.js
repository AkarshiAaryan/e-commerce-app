const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middlewares/validate');

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, userController.register);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, userController.login);
router.post('/admin', [body('email').isEmail(), body('password').notEmpty()], validate, userController.adminLogin);

router.get('/me', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/cart', auth, userController.getCart);
router.put('/cart', auth, userController.updateCart);

module.exports = router;
