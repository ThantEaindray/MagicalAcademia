const pool = require('../services/db');

/* 
Query to get all challenges from the WellnessChallenges table.
*/
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * 
    FROM WellnessChallenges; 
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

/* 
Query to retrieve users who attempted a specific challenge.
Returns user_id and details from the UserCompletions table
based on the provided challenge_id.
*/
module.exports.selectAttemptsByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, details
        FROM UserCompletions
        WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to insert a new wellness challenge into the WellnessChallenges table.
The data object contains creator_id, description and points.
*/
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO WellnessChallenges (creator_id, description, points)
        VALUES (?, ?, ?);
    `;

    const VALUES = [
        data.creator_id,
        data.description,
        data.points
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to check if a challenge exists and get its reward points.
The challenge_id is inside the data object.
*/
module.exports.selectChallengeById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT points, multiplier
        FROM WellnessChallenges
        WHERE challenge_id = ?;
    `;

    const VALUES = [data.challenge_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to check if a user exists by user_id.
The user_id is inside the data object.
*/
module.exports.selectUserById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, points
        FROM Users
        WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to insert a new completion record.
Stores which user completed which challenge and their details.
*/
module.exports.insertCompletion = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserCompletions (challenge_id, user_id, details)
        VALUES (?, ?, ?);
    `;

    const VALUES = [
        data.challenge_id,
        data.user_id,
        data.details
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to reward points to a user after completing a challenge.
Adds the challenge points to the user's total points.
*/
module.exports.addPointsToUser = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Users
        SET points = points + ?
        WHERE user_id = ?;
    `;

    const VALUES = [
        data.points,
        data.user_id
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Query to get the creator_id of a challenge.
Used to check if the challenge exists and who owns it.
*/
module.exports.getChallengeCreator = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT creator_id
    FROM WellnessChallenges
    WHERE challenge_id = ?;
  `;
  const VALUES = [data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Query to update a challenge by challenge_id.
The data object contains description, points and challenge_id.
*/
module.exports.updateChallenge = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE WellnessChallenges
    SET description = ?, points = ?
    WHERE challenge_id = ?;
  `;
  const VALUES = [data.description, data.points, data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Query to delete all completion records for a challenge.
The data object contains challenge_id.
*/
module.exports.deleteCompletionsByChallengeId = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM UserCompletions
    WHERE challenge_id = ?;
  `;

  const VALUES = [data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Query to delete a challenge from the WellnessChallenges table.
The data object contains challenge_id.
*/
module.exports.deleteChallengeById = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM WellnessChallenges
    WHERE challenge_id = ?;
  `;

  const VALUES = [data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};



