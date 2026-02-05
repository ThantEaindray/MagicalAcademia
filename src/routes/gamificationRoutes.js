const express = require("express");
const router = express.Router();

const gamificationController = require("../controllers/gamificationController");

// ------------------
// Shop (Spells)
// ------------------
// GET /game/spells
router.get("/spells", gamificationController.getAllSpells);

// ------------------
// Inventory (UserSpells)
// ------------------
// GET /game/users/:user_id/spells
router.get("/users/:user_id/spells", gamificationController.getUserSpells);

// GET /game/users/:user_id/completions
router.get("/users/:user_id/completions", gamificationController.getUserCompletions);

// POST /game/users/:user_id/buy-spell
router.post("/users/:user_id/buy-spell", gamificationController.buySpell);

// ------------------
// Competitions
// ------------------
// GET /game/competitions
router.get("/competitions", gamificationController.getAllCompetitions);

// POST /game/competitions/:competition_id/join
router.post("/competitions/:competition_id/join", gamificationController.joinCompetition);

// GET /game/competitions/:competition_id/leaderboard
router.get("/competitions/:competition_id/leaderboard", gamificationController.getLeaderboard);

// POST /game/competitions/:competition_id/claim
// Allows Top 3 players to claim final competition reward
// Backend checks:
// 1. User joined competition
// 2. User has not claimed reward yet
// 3. User is within Top 3 leaderboard ranking
// Final reward = base reward × competition multiplier
router.post(
  "/competitions/:competition_id/claim",
  gamificationController.claimCompetitionReward
);

module.exports = router;
