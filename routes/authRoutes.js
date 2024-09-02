// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.get('/account', verifyToken, authController.getAccount);
router.get('/auto-login', authController.autoLogin);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;