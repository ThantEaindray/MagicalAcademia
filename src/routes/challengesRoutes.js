const express = require('express');
const router = express.Router();

const challengesController = require('../controllers/challengesController');

router.get('/', challengesController.getAllChallenges);
router.get('/:challenge_id', challengesController.getChallengeAttemptsById);
router.post('/', challengesController.createNewChallenge);
router.post('/:challenge_id', challengesController.createChallengeCompletion);
router.put('/:challenge_id', challengesController.updateChallengeById);
router.delete('/:challenge_id', challengesController.deleteChallengeById);

module.exports = router;