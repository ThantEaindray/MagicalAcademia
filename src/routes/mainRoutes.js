const express = require('express');
const router = express.Router();

const usersRoutes = require('./usersRoutes');
const challengesRoutes = require('./challengesRoutes');
const gamificationRoutes = require('./gamificationRoutes');

router.use('/users', usersRoutes);
router.use('/challenges', challengesRoutes);
router.use("/game", gamificationRoutes);

module.exports = router;
