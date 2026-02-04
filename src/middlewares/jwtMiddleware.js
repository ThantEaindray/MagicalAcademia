//////////////////////////////////////////////////////
// REQUIRE DOTENV MODULE
//////////////////////////////////////////////////////
require("dotenv").config();
// to get access to these in dotenv file
// JWT_SECRET_KEY=your-secret-key
// JWT_EXPIRES_IN=15m
// JWT_ALGORITHM=HS256

//////////////////////////////////////////////////////
// REQUIRE JWT MODULE
//////////////////////////////////////////////////////
const jwt = require("jsonwebtoken");

//////////////////////////////////////////////////////
// SET JWT CONFIGURATION
//////////////////////////////////////////////////////
const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR GENERATING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.generateToken = (req, res, next) => {
  const payload = {
    userId: res.locals.userId, // response stores the userId in the local variable
    role: res.locals.role,
    timestamp: new Date()
  };

  const options = {
    algorithm: tokenAlgorithm,
    expiresIn: tokenDuration,
  };

  const callback = (err, token) => {
    if (err) {
      console.error("Error jwt:", err);
      res.status(500).json(err);
    } else {
      res.locals.token = token;
      next();
    }
  };

  const token = jwt.sign(payload, secretKey, options, callback);  // generate the token
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR SENDING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.sendToken = (req, res, next) => {
  res.status(200).json({
    message: res.locals.message,
    token: res.locals.token,
  });
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR VERIFYING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // authentication header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // authorization type should be bearer token or
    // choose header then type key = authorization and value = Bearer token

    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  // (after Bearer) after the 7th character, token characters

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const callback = (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.locals.userId = decoded.userId; // cuz userId: res.locals.userId
    res.locals.role = decoded.role;
    res.locals.tokenTimestamp = decoded.timestamp;

    next();
  };

  jwt.verify(token, secretKey, callback);
};
