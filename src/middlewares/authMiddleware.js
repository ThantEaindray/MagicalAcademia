// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

/*
Verify JWT token from Authorization header.
I use this to protect routes and prove the user is logged in
*/
module.exports.verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // I attach decoded info so controllers can use it
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/*
Check if the logged-in user is an admin.
This middleware assumes verifyToken has already run
and req.user is available.
*/
module.exports.requireAdmin = (req, res, next) => {
  // If user info is missing or role is not admin, block access
  const role = String(req.user?.role || "").toUpperCase();
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  // User is admin, allow request to continue
  next();
};
