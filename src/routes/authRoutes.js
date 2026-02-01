const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/register
router.post("/register", authController.register);

// POST /api/login
router.post("/login", authController.login);

// GET /api/me (protected)
router.get("/me", authMiddleware.verifyToken, authController.me);

module.exports = router;
