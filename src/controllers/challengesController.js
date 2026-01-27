const challengesModel = require("../models/challengesModel");

/*
Retrieve all wellness challenges.
- No input required from URL or request body
- If successful:
  - return list of all challenges (200)
- If database error:
  - return 500 Internal Server Error
*/
module.exports.getAllChallenges = (req, res, next) => {

    // Callback to handle database query result
    const callback = (error, results, fields) => {
        if (error) {
            console.error('Failed getAllChallenges:', error);
            res.status(500).json(error);
        } else {
            // Success: return all challenges
            res.status(200).json(results);
        }
    };

    // Query database for all challenges
    challengesModel.selectAll(callback);
};

/*
Retrieve users who attempted a specific challenge.
- Reads challenge_id from URL
- Checks:
  1) invalid challenge_id -> 400
  2) no attempts found -> 404
- If ok:
  - return list of user_id and details (200)
*/
module.exports.getChallengeAttemptsById = (req, res, next) => {

    // Extract challenge_id from URL parameter
    const challengeId = req.params.challenge_id;

    // 1) validate challenge_id
    if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({
            message: "challenge_id must be a positive number"
        });
    }

    // Prepare data object for model
    const data = {
        challenge_id: challengeId
    };

    // Callback to handle database result
    const callback = (error, results) => {
        if (error) {
            console.error("Failed getChallengeAttemptsById:", error);
            return res.status(500).json(error);
        }

        // 2) no users attempted this challenge
        if (results.length === 0) {
            return res.status(404).json({
                message: "No attempts found for this challenge"
            });
        }

        // 3) success: return list of user_id and details
        return res.status(200).json(results);
    };

    // Query database for challenge attempts
    challengesModel.selectAttemptsByChallengeId(data, callback);
};

/* 
Create a new wellness challenge.
It takes user_id, description and points from the request body.
The user_id is stored as creator_id in the database.
*/
module.exports.createNewChallenge = (req, res, next) => {

    // Extract data from request body
    const userId = req.body.user_id;
    const description = req.body.description;
    const points = req.body.points;

    // Step 1: basic validation
    if (!userId || !description || !points) {
        return res.status(400).json({
            message: "user_id, description and points are required"
        });
    }

    // Step 2: prepare data for model
    const data = {
        creator_id: userId,
        description: description,
        points: points
    };

    // Step 3: insert challenge into database
    const callback = (error, results) => {
        if (error) {
            console.error("Error creating challenge:", error);
            return res.status(500).json(error);
        }

        // Success
        res.status(201).json({
            challenge_id: results.insertId,
            description: description,
            creator_id: userId,
            points: points
        });
    };

    challengesModel.insertSingle(data, callback);
};

/*
Create a completion record for a challenge.
- Reads challenge_id from URL
- Reads user_id and details from request body
- Checks:
  1) invalid or missing challenge_id -> 400
  2) invalid or missing user_id -> 400
  3) challenge not found -> 404
  4) user not found -> 404
- If ok:
  - insert completion record
  - reward points to the user
  - return the completion details (201)
*/
module.exports.createChallengeCompletion = (req, res, next) => {

    // Extract parameters from request
    const challenge_id = Number(req.params.challenge_id);
    const user_id = Number(req.body.user_id);
    const details = req.body.details; // optional text from user

    // 1) basic validation for challenge_id
    if (!challenge_id || isNaN(challenge_id) || challenge_id <= 0) {
        return res.status(400).json({
            message: "challenge_id must be a positive number"
        });
    }

    // 2) basic validation for user_id
    if (!user_id || isNaN(user_id) || user_id <= 0) {
        return res.status(400).json({
            message: "user_id is required"
        });
    }

    // 3) check if challenge exists and get its reward points
    // { challenge_id: challenge_id } 
    // => I pass the challenge_id inside an object so the model can access it consistently using data.challenge_id
    challengesModel.selectChallengeById({ challenge_id: challenge_id }, (err1, results1) => {
        if (err1) {
            console.error("Error checking challenge:", err1);
            return res.status(500).json(err1);
        }

        // challenge not found
        if (results1.length === 0) {
            return res.status(404).json({
                message: "Challenge not found"
            });
        }

        // points to be rewarded for this challenge
        // => database returns an array, so I take the first row and extract the points value to reward the user
        const rewardPoints = results1[0].points;

        // 4) check if user exists
        // => This checks whether the user exists before creating a completion record, 
        // => and returns 404 if the user is not found.
        // { user_id: user_id } => I wrap the user_id in an object so the model can access it as data.user_id
        challengesModel.selectUserById({ user_id: user_id }, (err2, results2) => {
            if (err2) {
                console.error("Error checking user:", err2);
                return res.status(500).json(err2);
            }

            // user not found
            if (results2.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // 5) insert completion record
            const completionData = {
                challenge_id: challenge_id,
                user_id: user_id,
                details: details || null
            };

            challengesModel.insertCompletion(completionData, (err3, insertResults) => {
                if (err3) {
                    console.error("Error inserting completion:", err3);
                    return res.status(500).json(err3);
                }

                const completion_id = insertResults.insertId;

                // 6) reward points to the user
                const pointsData = {
                    user_id: user_id,
                    points: rewardPoints
                };

                // updateResults is returned by MySQL, but I don’t need it 
                // because I only care whether the update succeeds or fails
                challengesModel.addPointsToUser(pointsData, (err4, updateResults) => {
                    if (err4) {
                        console.error("Error adding points:", err4);
                        return res.status(500).json(err4);
                    }

                    // 7) success response (201 Created)
                    return res.status(201).json({
                        complete_id: completion_id,
                        challenge_id: challenge_id,
                        user_id: user_id,
                        details: details || null
                        // I use details || null so optional input is stored as NULL when not provided.
                    });
                });
            });
        });
    });
};

/*
Update a challenge.
- Reads challenge_id from URL
- Reads user_id, description, points from body
- Checks:
  1) missing fields -> 400
  2) challenge not found -> 404
  3) user_id not the creator -> 403
- If ok -> update and return the updated challenge (200)
*/
module.exports.updateChallengeById = (req, res, next) => {
    const challenge_id = Number(req.params.challenge_id);
    const user_id = Number(req.body.user_id);
    const description = req.body.description;
    const points = req.body.points;

    // 1) basic validation (missing fields)
    if (!user_id || description === undefined || points === undefined) {
        return res.status(400).json({
            message: "Error: user_id, description and points are required"
        });
    }

    // optional: validate number inputs
    if (isNaN(challenge_id) || challenge_id <= 0 || isNaN(user_id) || user_id <= 0) {
        return res.status(400).json({
            message: "Error: challenge_id and user_id must be positive numbers"
        });
    }

    // 2) check challenge exists + get creator_id
    const checkData = { challenge_id: challenge_id };

    challengesModel.getChallengeCreator(checkData, (err1, results1) => {
        if (err1) {
            console.error("Error getChallengeCreator:", err1);
            return res.status(500).json(err1);
        }

        // challenge not found
        if (results1.length === 0) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        const creator_id = results1[0].creator_id;

        // 3) owner check (creator_id must match user_id)
        // We do not use foreign keys here, so MySQL does not auto-check ownership.
        // Instead, we manually check in code:
        // 1) confirm the challenge exists
        // 2) compare creator_id with the user_id from the request
        // 3) if they do not match, return 403 Forbidden

        if (creator_id !== user_id) {
            return res.status(403).json({
                message: "Forbidden: you are not the creator of this challenge"
            });
        }

        // 4) do update
        const updateData = {
            challenge_id: challenge_id,
            description: description,
            points: points
        };

        challengesModel.updateChallenge(updateData, (err2, results2) => {
            if (err2) {
                console.error("Error updateChallenge:", err2);
                return res.status(500).json(err2);
            }

            // if somehow nothing updated
            if (results2.affectedRows === 0) {
                return res.status(404).json({ message: "Challenge not found" });
            }

            // success response (200)
            return res.status(200).json({
                challenge_id: challenge_id,
                description: description,
                creator_id: creator_id,
                points: points
            });
        });
    });
};

/*
Delete a challenge by its challenge_id.
It deletes the challenge and also deletes any related completion records.
- 204 if deleted
- 404 if challenge_id not found
*/
module.exports.deleteChallengeById = (req, res, next) => {
    const challengeId = Number(req.params.challenge_id);

    // Step 1: validate id
    if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({ message: "challenge_id must be a positive number" });
    }

    // Step 2: delete completions first (safe even if 0 rows)
    challengesModel.deleteCompletionsByChallengeId({ challenge_id: challengeId }, (err1, results1) => {
        if (err1) {
            console.error("Error deleting completions:", err1);
            return res.status(500).json(err1);
        }

        // Step 3: delete the challenge itself
        challengesModel.deleteChallengeById({ challenge_id: challengeId }, (err2, results2) => {
            if (err2) {
                console.error("Error deleting challenge:", err2);
                return res.status(500).json(err2);
            }

            // If no rows deleted, challenge_id doesn't exist
            if (results2.affectedRows === 0) {
                return res.status(404).json({ message: "Challenge not found" });
            }

            // Success: no response body
            return res.status(204).send();
        });
    });
};


