const gamificationModel = require("../models/gamificationModel");

/*
Retrieve all spells (Shop).
- No input required
- If successful:
  - return list of spells (200)
- If database error:
  - return 500
*/
module.exports.getAllSpells = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Failed getAllSpells:", error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    };

    gamificationModel.selectAllSpells(callback);
};

/*
Retrieve user inventory (UserSpells).
- Reads user_id from URL
- Checks:
  1) invalid user_id -> 400
  2) user not found -> 404
- If ok:
  - return user info + spells (200)
*/
module.exports.getUserSpells = (req, res, next) => {

    const userId = Number(req.params.user_id);

    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "user_id must be a positive number"
        });
    }

    // Prepare data object for model
    const data = {
        user_id: userId
    };

    // Step 1: check user exists
    gamificationModel.selectUserById(data, (err1, users) => {
        if (err1) {
            console.error("Failed getUserSpells (user):", err1);
            return res.status(500).json(err1);
        }

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Step 2: get inventory
        gamificationModel.selectUserSpells(data, (err2, spells) => {
            if (err2) {
                console.error("Failed getUserSpells (spells):", err2);
                return res.status(500).json(err2);
            }

            return res.status(200).json({
                user_id: users[0].user_id,
                username: users[0].username,
                points: users[0].points,
                spells: spells
            });
        });
    });
};

/*
Buy a spell.
- Reads user_id from URL
- Reads spell_id from request body
- Checks:
  1) invalid user_id -> 400
  2) invalid spell_id -> 400
  3) user not found -> 404
  4) spell not found -> 404
  5) already owned -> 409
  6) not enough points -> 400
- If ok:
  - deduct points
  - insert UserSpells row
  - return 200
*/
module.exports.buySpell = (req, res, next) => {

    const userId = Number(req.params.user_id);
    const spellId = Number(req.body.spell_id);

    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "user_id must be a positive number"
        });
    }

    if (req.body.spell_id === undefined || isNaN(spellId) || spellId <= 0) {
        return res.status(400).json({
            message: "spell_id must be a positive number"
        });
    }

    // Prepare data object (I keep everything inside one object so model calls stay consistent)
    const data = {
        user_id: userId,
        spell_id: spellId
    };

    // Step 1: check user exists
    gamificationModel.selectUserById(data, (err1, users) => {
        if (err1) {
            console.error("Failed buySpell (user):", err1);
            return res.status(500).json(err1);
        }

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 2: check spell exists + get cost
        gamificationModel.selectSpellById(data, (err2, spells) => {
            if (err2) {
                console.error("Failed buySpell (spell):", err2);
                return res.status(500).json(err2);
            }

            if (spells.length === 0) {
                return res.status(404).json({ message: "Spell not found" });
            }

            // store cost inside the same data object so next model can use it
            data.cost_points = Number(spells[0].cost_points);

            // Step 3: check if user already owns spell
            gamificationModel.selectUserSpellOwned(data, (err3, owned) => {
                if (err3) {
                    console.error("Failed buySpell (owned check):", err3);
                    return res.status(500).json(err3);
                }

                if (owned.length > 0) {
                    return res.status(409).json({ message: "User already owns this spell" });
                }

                // Step 4: deduct points safely (won't go negative)
                gamificationModel.deductPointsIfEnough(data, (err4, result) => {
                    if (err4) {
                        console.error("Failed buySpell (deduct points):", err4);
                        return res.status(500).json(err4);
                    }

                    if (result.affectedRows === 0) {
                        return res.status(400).json({ message: "Not enough points" });
                    }

                    // Step 5: insert spell into inventory
                    gamificationModel.insertUserSpell(data, (err5, insertResult) => {
                        if (err5) {
                            console.error("Failed buySpell (insert inventory):", err5);
                            return res.status(500).json(err5);
                        }

                        return res.status(200).json({
                            message: "Spell purchased successfully",
                            user_id: data.user_id,
                            spell_id: data.spell_id
                        });
                    });
                });
            });
        });
    });
};

/*
Retrieve all competitions.
*/
module.exports.getAllCompetitions = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Failed getAllCompetitions:", error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    };

    gamificationModel.selectAllCompetitions(callback);
};

/*
Join a competition + reward points.
- Reads competition_id from URL
- Reads user_id from body
- Checks:
  1) invalid competition_id -> 400
  2) invalid user_id -> 400
  3) competition not found -> 404
  4) user not found -> 404
  5) already joined -> 409
- If ok:
  - insert entry
  - add reward_points to user
  - return 201 + points awarded
*/
module.exports.joinCompetition = (req, res, next) => {

    const competitionId = Number(req.params.competition_id);
    const userId = Number(req.body.user_id);

    if (isNaN(competitionId) || competitionId <= 0) {
        return res.status(400).json({ message: "competition_id must be a positive number" });
    }

    if (req.body.user_id === undefined || isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "user_id must be a positive number" });
    }

    const data = {
        competition_id: competitionId,
        user_id: userId
    };

    // Step 1: check competition exists
    gamificationModel.selectCompetitionById(data, (err1, comps) => {
        if (err1) {
            console.error("Failed joinCompetition (competition):", err1);
            return res.status(500).json(err1);
        }

        if (comps.length === 0) {
            return res.status(404).json({ message: "Competition not found" });
        }

        // Step 2: check user exists
        gamificationModel.selectUserById(data, (err2, users) => {
            if (err2) {
                console.error("Failed joinCompetition (user):", err2);
                return res.status(500).json(err2);
            }

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            // Step 3: check already joined (prevents double reward)
            gamificationModel.selectCompetitionEntry(data, (err3, rows) => {
                if (err3) {
                    console.error("Failed joinCompetition (check joined):", err3);
                    return res.status(500).json(err3);
                }

                if (rows.length > 0) {
                    return res.status(409).json({ message: "User already joined this competition" });
                }

                // Step 4: insert entry
                gamificationModel.insertCompetitionEntry(data, (err4, result) => {
                    if (err4) {
                        console.error("Failed joinCompetition (insert):", err4);
                        return res.status(500).json(err4);
                    }

                    // Step 5: get reward_points
                    gamificationModel.selectCompetitionRewardPoints(data, (err5, rewardRows) => {
                        if (err5) {
                            console.error("Failed joinCompetition (get reward_points):", err5);
                            return res.status(500).json(err5);
                        }

                        const rewardPoints = Number(rewardRows[0].reward_points || 0);

                        // Step 6: add reward points to user
                        const pointsData = {
                            user_id: data.user_id,
                            points: rewardPoints
                        };

                        gamificationModel.addPointsToUser(pointsData, (err6, updateResult) => {
                            if (err6) {
                                console.error("Failed joinCompetition (add points):", err6);
                                return res.status(500).json(err6);
                            }

                            return res.status(201).json({
                                message: "Joined competition successfully",
                                competition_id: data.competition_id,
                                user_id: data.user_id,
                                reward_points_awarded: rewardPoints
                                // I return reward_points_awarded so frontend can show a nice popup like “+100 points!”
                            });
                        });
                    });
                });
            });
        });
    });
};


/*
Retrieve leaderboard for a competition.
- Reads competition_id from URL
- If competition not found -> 404
- If ok -> return leaderboard list (200)
*/
module.exports.getLeaderboard = (req, res, next) => {

    const competitionId = Number(req.params.competition_id);

    if (isNaN(competitionId) || competitionId <= 0) {
        return res.status(400).json({ message: "competition_id must be a positive number" });
    }

    const data = {
        competition_id: competitionId
    };

    // Step 1: check competition exists
    gamificationModel.selectCompetitionById(data, (err1, comps) => {
        if (err1) {
            console.error("Failed getLeaderboard (competition check):", err1);
            return res.status(500).json(err1);
        }

        if (comps.length === 0) {
            return res.status(404).json({ message: "Competition not found" });
        }

        // Step 2: get leaderboard
        gamificationModel.selectLeaderboard(data, (err2, results) => {
            if (err2) {
                console.error("Failed getLeaderboard:", err2);
                return res.status(500).json(err2);
            }

            return res.status(200).json(results);
        });
    });
};

/*
Retrieve user completed challenges (UserCompletions).
- Reads user_id from URL
- Checks:
  1) invalid user_id -> 400
  2) user not found -> 404
- If ok:
  - return completions list (200)
*/
module.exports.getUserCompletions = (req, res) => {
  const userId = Number(req.params.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ message: "user_id must be a positive number" });
  }

  const data = { user_id: userId };

  // check user exists first (same pattern as getUserSpells)
  gamificationModel.selectUserById(data, (err1, users) => {
    if (err1) return res.status(500).json(err1);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    gamificationModel.selectUserCompletions(data, (err2, rows) => {
      if (err2) return res.status(500).json(err2);

      return res.status(200).json({
        user_id: users[0].user_id,
        username: users[0].username,
        points: users[0].points,
        completions: rows
      });
    });
  });
};

/*
Claim final reward (Top 3 only).
- body: { user_id }
- checks:
  1) user joined competition
  2) reward not claimed yet
  3) user is in Top 3
- reward = baseReward * competitionMultiplier
*/
module.exports.claimCompetitionReward = (req, res) => {
  const userId = Number(req.body.user_id);
  const competitionId = Number(req.params.competition_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ message: "user_id must be a positive number" });
  }
  if (isNaN(competitionId) || competitionId <= 0) {
    return res.status(400).json({ message: "competition_id must be a positive number" });
  }

  const data = { user_id: userId, competition_id: competitionId };

  // helper: same mapping you used frontend
  const getCompetitionMultiplierByName = (compName) => {
    const n = String(compName || "").toLowerCase();
    if (n.includes("triwizard") || n.includes("n.e.w.t")) return 10000; // Hard
    if (n.includes("dueling")) return 1000; // Medium
    if (n.includes("house") || n.includes("o.w.l")) return 100; // Easy
    return 1;
  };

  // 1) check user joined + not claimed
  gamificationModel.selectUserEntryForCompetition(data, (err1, entryRows) => {
    if (err1) return res.status(500).json(err1);
    if (entryRows.length === 0) {
      return res.status(404).json({ message: "You have not joined this competition." });
    }
    if (Number(entryRows[0].reward_claimed) === 1) {
      return res.status(400).json({ message: "Reward already claimed." });
    }

    // 2) check Top 3
    gamificationModel.selectLeaderboard(data, (err2, leaderboard) => {
      if (err2) return res.status(500).json(err2);

      const top3 = leaderboard.slice(0, 3);
      const isTop3 = top3.some((r) => Number(r.user_id) === userId);

      if (!isTop3) {
        return res.status(403).json({ message: "Only Top 3 can claim the final reward." });
      }

      // 3) compute final reward
      gamificationModel.selectCompetitionRewardInfo(data, (err3, compRows) => {
        if (err3) return res.status(500).json(err3);
        if (compRows.length === 0) return res.status(404).json({ message: "Competition not found" });

        const baseReward = Number(compRows[0].reward_points || 0);
        const mult = getCompetitionMultiplierByName(compRows[0].name);
        const finalReward = baseReward * mult;

        // 4) add points + mark claimed
        gamificationModel.addPointsToUser(
          { user_id: userId, points: finalReward },
          (err4) => {
            if (err4) return res.status(500).json(err4);

            gamificationModel.markCompetitionRewardClaimed(data, (err5) => {
              if (err5) return res.status(500).json(err5);

              return res.status(200).json({
                message: "Final reward claimed!",
                base_reward: baseReward,
                multiplier: mult,
                final_reward: finalReward
              });
            });
          }
        );
      });
    });
  });
};
