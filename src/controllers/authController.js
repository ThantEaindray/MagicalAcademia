const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

function signToken(payload) {
  const secret = process.env.JWT_SECRET_KEY; // matches .env
  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
  const algorithm = process.env.JWT_ALGORITHM || "HS256";

  return jwt.sign(payload, secret, { expiresIn, algorithm });
}

/*
POST /api/register
Register a new user and return JWT token (auto-login).
frontend expects status 200 + token
*/
module.exports.register = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // 1) basic validation
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "username, email and password are required",
    });
  }

  const data = { username, email };

  // 2) check username conflict
  authModel.selectByUsername(data, (err1, results1) => {
    if (err1) {
      console.error("Failed register (username check):", err1);
      return res.status(500).json(err1);
    }
    if (results1.length > 0) {
      return res.status(409).json({ message: "username already exists" });
    }

    // 3) check email conflict
    authModel.selectByEmail(data, (err2, results2) => {
      if (err2) {
        console.error("Failed register (email check):", err2);
        return res.status(500).json(err2);
      }
      if (results2.length > 0) {
        return res.status(409).json({ message: "email already exists" });
      }

      // 4) hash password
      const password_hash = bcrypt.hashSync(password, 10);

      const insertData = {
        username,
        email,
        password_hash,
      };

      // 5) insert user
      authModel.insertUser(insertData, (err3, insertResults) => {
        if (err3) {
          console.error("Failed register (insert user):", err3);
          return res.status(500).json(err3);
        }

        const userId = insertResults.insertId;

        // 6) create token
        const token = signToken({ userId: userId, role: "USER" });

        return res.status(200).json({
          message: "Register successful",
          token: token,
          userId: userId,
        });
      });
    });
  });
};

/*
POST /api/login
Login using username + password, return JWT token.
*/
module.exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  // 1) basic validation
  if (!username || !password) {
    return res.status(400).json({
      message: "username and password are required",
    });
  }

  const data = { username };

  // 2) find user by username
  authModel.selectUserByUsername(data, (err1, results1) => {
    if (err1) {
      console.error("Failed login (selectUserByUsername):", err1);
      return res.status(500).json(err1);
    }

    if (results1.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results1[0];

    // 3) bcrypt compare
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 4) create token
    const token = signToken({ userId: user.user_id, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token: token,
      userId: user.user_id,
    });
  });
};


/*
GET /api/me
Returns the logged in user info (token required).
- req.user is set by jwt middleware
*/
module.exports.me = (req, res, next) => {
  return res.status(200).json(req.user);
};
