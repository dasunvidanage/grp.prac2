exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'admin') {
    next();
  } else {
    console.log('[DEBUG] isAdmin check failed. Role:', req.session ? req.session.role : 'No Session');
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.studentId) {
    next();
  } else {
    console.log('[DEBUG] isLoggedIn check failed. studentId:', req.session ? req.session.studentId : 'No Session');
    res.status(401).json({ error: 'Please log in to continue.' });
  }
};
