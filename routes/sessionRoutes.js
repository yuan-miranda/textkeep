// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post("/email/resend", sessionController.resendEmailVerification);
router.get("/email/verify", sessionController.verifyEmail);
router.get("/email/delete", sessionController.deleteEmail);

module.exports = router;