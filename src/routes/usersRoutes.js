const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/validatePoints');

const usersController = require('../controllers/usersController');

router.get('/', usersController.getAllUsers);
router.get('/:user_id', usersController.getUserById);
router.post('/', usersController.createNewUser);
router.put('/:user_id', middlewares.validateNonNegativePoints, usersController.updateUserById);
// A custom middleware is used to validate that the points field is 
// present, numeric, and non-negative before update logic is executed.

module.exports = router;