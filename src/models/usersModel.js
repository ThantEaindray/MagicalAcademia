const pool = require('../services/db');

/* 
Query to get all users from the User table.
*/
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * 
    FROM Users; 
    `;
    
    pool.query(SQLSTATEMENT, callback);
};

/* 
Query to get a single user from the User table by their ID.
The ID is inside the data object passed to the function.
*/
module.exports.getSingle = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Users
    WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/*  
Query to check whether a username already exists in the Users table.
This is used to prevent duplicate usernames when creating a new user.
For checking, I only need one value so I pass username directly.
*/
module.exports.selectByUsername = (username, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id
        FROM Users
        WHERE username = ?;
    `;
    pool.query(SQLSTATEMENT, [username], callback);
    // [username] is the array of values used to replace the ? in the SQL query
};

/*
selectById is used purely for existence checking, 
while getSingle is used when full user details are required. 
This avoids unnecessary data retrieval.
*/

/* 
Query to insert a single user into the User table.
The data object contains the username of the user to be inserted.
For insertion, I pass a data object 
because the insert function is designed to accept multiple fields.
*/
module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Users (username)
        VALUES (?);
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to get a single user id from the Users table by their ID.
The ID is inside the data object passed to the function.
*/
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id
        FROM Users
        WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/* 
Query to update a user's details in the Users table by their ID.
The data object contains user_id, username and points.
*/
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Users
        SET username = ?, points = ?
        WHERE user_id = ?;
    `;

    const VALUES = [
        data.username,
        data.points,
        data.user_id
    ];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

