const pool = require('../services/db');

/* Get all spells */
module.exports.selectAllSpells = (callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Spells
        ORDER BY cost_points ASC;
    `;
    pool.query(SQLSTATEMENT, callback);
};

/* Get spell by ID */
module.exports.selectSpellById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT *
        FROM Spells
        WHERE spell_id = ?;
    `;

    const VALUES = [data.spell_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Get user by ID */
module.exports.selectUserById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, points, role
        FROM Users
        WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Check if user already owns the spell */
module.exports.selectUserSpellOwned = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_spell_id
        FROM UserSpells
        WHERE user_id = ? AND spell_id = ?;
    `;

    const VALUES = [data.user_id, data.spell_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Deduct points only if enough */
module.exports.deductPointsIfEnough = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Users
        SET points = points - ?
        WHERE user_id = ? AND points >= ?;
    `;

    // I use data.cost_points twice: once to subtract and once to check minimum
    const VALUES = [data.cost_points, data.user_id, data.cost_points];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Insert spell into inventory */
module.exports.insertUserSpell = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserSpells (user_id, spell_id)
        VALUES (?, ?);
    `;

    const VALUES = [data.user_id, data.spell_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Get user's spells (inventory list) */
module.exports.selectUserSpells = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT us.user_spell_id, us.unlocked_on,
               s.spell_id, s.name, s.effect, s.cost_points
        FROM UserSpells us
        INNER JOIN Spells s ON us.spell_id = s.spell_id
        WHERE us.user_id = ?
        ORDER BY us.unlocked_on DESC;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Get all competitions */
module.exports.selectAllCompetitions = (callback) => {
    const SQLSTATEMENT = `
        SELECT competition_id, name, description, reward_points, starts_at
        FROM Competitions
        ORDER BY starts_at DESC;
    `;
    pool.query(SQLSTATEMENT, callback);
};

/* Check competition exists */
module.exports.selectCompetitionById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT competition_id, name
        FROM Competitions
        WHERE competition_id = ?;
    `;

    const VALUES = [data.competition_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Check if user already joined competition */
module.exports.selectCompetitionEntry = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT entry_id
        FROM UserCompetitionEntries
        WHERE competition_id = ? AND user_id = ?;
    `;

    const VALUES = [data.competition_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Join competition */
module.exports.insertCompetitionEntry = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserCompetitionEntries (competition_id, user_id, score)
        VALUES (?, ?, 0);
    `;

    const VALUES = [data.competition_id, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* Leaderboard */
module.exports.selectLeaderboard = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT u.user_id, u.username, e.score, e.joined_on
        FROM UserCompetitionEntries e
        INNER JOIN Users u ON e.user_id = u.user_id
        WHERE e.competition_id = ?
        ORDER BY e.score DESC, e.joined_on ASC;
    `;

    const VALUES = [data.competition_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
