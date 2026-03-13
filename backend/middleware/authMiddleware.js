exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.studentId) {
    next();
  } else {
    res.status(401).json({ error: 'Please log in to continue.' });
  }
};
