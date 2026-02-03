const pool = require("../services/db");

/* 
Find user by username (for login).
*/
module.exports.selectUserByUsername = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, username, email, password_hash, points, role
    FROM Users
    WHERE username = ?;
  `;
  const VALUES = [data.username];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


/*
Check if email already exists (for register).
*/
module.exports.selectByEmail = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id
    FROM Users
    WHERE email = ?;
  `;
  const VALUES = [data.email];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Check if username already exists (for register).
This matches our CA1 rule: username must be unique
*/
module.exports.selectByUsername = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id
    FROM Users
    WHERE username = ?;
  `;
  const VALUES = [data.username];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

/*
Insert new user (register).
*/
module.exports.insertUser = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO Users (username, email, password_hash, points, role)
    VALUES (?, ?, ?, 0, 'USER');
  `;
  const VALUES = [data.username, data.email, data.password_hash];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

