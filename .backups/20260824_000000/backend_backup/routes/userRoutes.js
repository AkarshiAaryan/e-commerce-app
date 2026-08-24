const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin', userController.adminLogin);

// Example protected route
router.get('/me', auth, async (req, res) => {
  res.json({ userId: req.userId });
});

module.exports = router;
