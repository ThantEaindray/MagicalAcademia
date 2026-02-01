const express = require('express');
const router = express.Router();

const usersRoutes = require('./usersRoutes');
const challengesRoutes = require('./challengesRoutes');
const gamificationRoutes = require('./gamificationRoutes');
const authRoutes = require('./authRoutes');

router.use('/users', usersRoutes);
router.use('/challenges', challengesRoutes);
router.use("/game", gamificationRoutes);
router.use('/', authRoutes);

module.exports = router;
