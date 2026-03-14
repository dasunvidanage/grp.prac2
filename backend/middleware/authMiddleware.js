const jwt = require('jsonwebtoken');

const JWT_SECRET = 'election-portal-jwt-secret-key';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.user && req.user.student_id) {
    next();
  } else {
    res.status(401).json({ error: 'Please log in to continue.' });
  }
};
