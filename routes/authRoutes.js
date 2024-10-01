// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/account', authController.account);
router.get('/settings', authController.settings);
router.post('/settings', authController.settings);
router.get('/auto-login', authController.account);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get("/admin", authController.admin);

module.exports = router;