// routes/pageRoutes.js
const express = require("express");
const router = express.Router();
const { requireLoggedOutAccess, requireLoggedInAccess } = require("../middlewares/pageMiddleware");
const { sendPage } = require("../controllers/pageController");

router.get("/", sendPage("index.html"));
router.get("/about", sendPage("about.html"));
router.get("/login", requireLoggedOutAccess, sendPage("login.html"));
router.get("/register", requireLoggedOutAccess, sendPage("register.html"));
router.get("/logout", requireLoggedInAccess, sendPage("logout.html"));
router.get("/create", sendPage("create.html"));
router.get("/modify", sendPage("modify.html"));
router.get("/account", sendPage("account.html"));
router.get("/account/email/verify", sendPage("verify.html"));

module.exports = router;