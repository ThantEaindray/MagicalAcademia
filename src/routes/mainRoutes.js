const express = require('express');
const router = express.Router();

const usersRoutes = require('./usersRoutes');
const challengesRoutes = require('./challengesRoutes');

router.use('/users', usersRoutes);
router.use('/challenges', challengesRoutes);

module.exports = router;
