const db = require('../database');

exports.isAdmin = (req, res, next) => {
  // Try session first
  if (req.session && req.session.role === 'admin') {
    return next();
  }
  
  // Fallback for direct file access where sessions might fail
  // We use lowercase for header keys as per Express/HTTP standard
  const fallbackId = req.headers['x-admin-id'];
  console.log('Auth Check - Session Role:', req.session ? req.session.role : 'No Session', 'Header x-admin-id:', fallbackId);

  if (fallbackId) {
    db.get('SELECT role FROM students WHERE UPPER(student_id) = ?', [fallbackId.toUpperCase()], (err, user) => {
      if (err) {
        console.error('Database error in isAdmin:', err);
        return res.status(500).json({ error: 'Internal server error.' });
      }
      
      if (user && user.role === 'admin') {
        console.log('Auth Check - Access Granted via header for:', fallbackId);
        return next();
      }
      console.warn('Auth Check - Access Denied for ID:', fallbackId, 'User role in DB:', user ? user.role : 'Not found');
      res.status(403).json({ error: 'Access denied. Admin role required.' });
    });
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.studentId) {
    return next();
  }
  
  const fallbackId = req.headers['x-student-id'] || req.headers['x-admin-id'];
  if (fallbackId) {
    return next();
  }

  res.status(401).json({ error: 'Please log in to continue.' });
};
