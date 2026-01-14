const jwt = require("jsonwebtoken");

module.exports.verifyToken = (req, res, next) => {
  if (req.body.source) return next();

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET,
     (err, decoded) => {
    if (err) return res.status(401).json({ message: "no matching token" });
    req.user = decoded;
    next();
  });
};
