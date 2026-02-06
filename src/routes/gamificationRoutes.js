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

// GET /game/users/:user_id/competitions
router.get("/users/:user_id/competitions", gamificationController.getUserCompetitions);

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

module.exports = router;
