const usersModel = require("../models/usersModel");

/*
Retrieve all users.
- No input required from URL or request body
- If successful:
  - return a list of users -> 200
- If database error:
  - return 500 Internal Server Error
*/
module.exports.getAllUsers = (req, res, next) => {

    // Callback to handle database query result
    const callback = (error, results, fields) => {
        if (error) {
            console.error('Failed getAllUsers:', error);
            return res.status(500).json(error);
        }

        // Success → return a list of users
        return res.status(200).json(results);
    };

    // Query database for all users
    usersModel.selectAll(callback);
};

/* 
Get ONE user by user_id.
- Reads user_id from URL params ( /users/:user_id )
- Checks:
  1) user_id must be a positive number -> 400
  2) user not found in DB -> 404
- If found:
  - return the user object -> 200
*/
module.exports.getUserById = (req, res, next) => {

    // 1) validate user_id from URL params
    if (isNaN(req.params.user_id) || req.params.user_id <= 0) {
        return res.status(400).json({
            error: 'Error: ID must be a positive integer'
        });
    }

    // Prepare data object for model
    const data = {
        user_id: req.params.user_id
    };

    // Callback to handle database query result
    const callback = (error, results, fields) => {
        if (error) {
            console.error('Failed getUserById:', error);
            return res.status(500).json(error);
        }

        // 2) user not found
        if (results.length === 0) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        // 3) return response
        // Return the user row
        return res.status(200).json(results[0]);
    };

    // Query database for user by ID
    usersModel.getSingle(data, callback);
};

/* 
Create a new user.
- Reads username from request body
- Checks:
  1) missing username -> 400
  2) username already exists -> 409
- If successful:
  - insert user into database
  - return new user_id, username and points -> 201
*/
module.exports.createNewUser = (req, res, next) => {

    // Extract username from request body
    // This value is reused for validation, checking conflicts and insertion
    const username = req.body.username;

    // 1) basic validation (missing username)
    if (!username) {
        return res.status(400).json({
            message: "username is required"
        });
    }

    // 2) check if username already exists
    usersModel.selectByUsername(username, (error, results) => {

        // Database error when checking username
        if (error) {
            console.error("Error checking username:", error);
            return res.status(500).json(error);
        }

        // If username already exists, return conflict
        if (results.length > 0) {
            return res.status(409).json({
                message: "username already exists"
            });
        }

        // 3) insert new user
        const data = {
            username: username
        };

        // insertResults contains information returned by MySQL after inserting a row
        usersModel.insertSingle(data, (err, insertResults) => {
            if (err) {
                console.error("Error creating user:", err);
                return res.status(500).json(err);
            }

            // Success → return created user (201 Created)
            return res.status(201).json({
                user_id: insertResults.insertId,
                username: username,
                points: 0
            });
        });
    });
};

/* 
Update a user by user_id.
- Reads user_id from URL params ( /users/:user_id )
- Reads username and points from request body
- Checks:
  1) missing username or points -> 400
  2) username already used by another user -> 409
  3) user_id not found -> 404
  4) points negative / not a number -> 400
- If successful:
  - update username and points
  - return updated user info -> 200
*/
module.exports.updateUserById = (req, res, next) => {

    // 1) basic validation (missing fields)
    if (req.body.username === undefined || req.body.points === undefined) {
        return res.status(400).json({
            message: "Error: username or points is undefined"
        });
    }

    // user_id must be a valid number
    const userId = Number(req.params.user_id);

    if (Number.isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Error: user_id must be a valid positive number"
        });
    }

    const points = req.body.points; 
    // already validated & converted by middleware

    // Prepare data object for model
    const data = {
        user_id: userId,
        username: req.body.username,
        points: points
    };

    // 2) check if username already exists (conflict check)
    // We do this manually because there is no FOREIGN KEY or UNIQUE constraint enforced in logic
    usersModel.selectByUsername( data.username , (err1, results1) => {

        // Database error when checking username
        if (err1) {
            console.error("Error checking username:", err1);
            return res.status(500).json(err1);
        }

        /*
        results1 contains users with the same username.
        - If results1.length > 0, the username already exists
        - results1[0].user_id is the owner of that username
        - data.user_id is the user we are updating
        If they are different users -> conflict (409)
        */
        if (results1.length > 0 && results1[0].user_id !== data.user_id) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        // 3) update user in database
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updateUserByID:", error);
                return res.status(500).json(error);
            }

            // user_id does not exist
            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Success → return updated user (200 OK)
            return res.status(200).json({
                user_id: data.user_id,
                username: data.username,
                points: data.points
            });
        };

        usersModel.updateById(data, callback);
    });
};


