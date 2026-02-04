const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/validatePoints');

const usersController = require('../controllers/usersController');
const authMiddleware = require("../middlewares/authMiddleware");

// ADMIN ONLY can get all users
// Step 1: verifyToken checks JWT and attaches decoded user info to req.user
// Step 2: requireAdmin checks req.user.role === "admin"
// If both pass, then getAllUsers runs
router.get("/", authMiddleware.verifyToken, authMiddleware.requireAdmin, usersController.getAllUsers);
router.get('/:user_id', usersController.getUserById);
router.post('/', usersController.createNewUser);
router.put('/:user_id', middlewares.validateNonNegativePoints, usersController.updateUserById);
// A custom middleware is used to validate that the points field is 
// present, numeric, and non-negative before update logic is executed.

module.exports = router;