const db = require('../database');

const checkFallback = (id, res, next, roleRequired = false) => {
  console.log(`Auth Check - ID: ${id}, Role Required: ${roleRequired}`);
  
  if (!id) {
    console.warn('Auth Check - No ID provided');
    return res.status(roleRequired ? 403 : 401).json({ error: 'Authorization required.' });
  }
  
  db.get('SELECT role FROM students WHERE UPPER(student_id) = ?', [id.toUpperCase()], (err, user) => {
    if (err) {
      console.error('Database error in checkFallback:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    
    if (!user) {
      console.warn(`Auth Check - User NOT FOUND for ID: ${id}`);
      return res.status(403).json({ error: 'Access denied.' });
    }

    const hasRole = user.role.toLowerCase() === 'admin';
    console.log(`Auth Check - User found: ${id}, Role: ${user.role}, Admin Match: ${hasRole}`);

    // If admin is strictly required
    if (roleRequired === true && !hasRole) {
      console.warn(`Auth Check - Role mismatch for ${id}. Expected admin, got ${user.role}`);
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    // For student-only routes
    if (roleRequired === 'student' && hasRole) {
      console.warn(`Auth Check - Role mismatch for ${id}. Expected student, got admin`);
      return res.status(403).json({ error: 'Access denied. Only students can perform this action.' });
    }
    
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.session?.role?.toLowerCase() === 'admin') {
    console.log('Auth Check - Access granted via SESSION for admin');
    return next();
  }
  checkFallback(req.headers['x-admin-id'], res, next, true);
};

exports.isStudent = (req, res, next) => {
  if (req.session?.role?.toLowerCase() === 'student' || req.session?.role?.toLowerCase() === 'user') {
    console.log('Auth Check - Access granted via SESSION for student');
    return next();
  }
  // Check if it's NOT an admin
  const id = req.headers['x-student-id'] || req.headers['x-admin-id'];
  checkFallback(id, res, next, 'student');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session?.studentId) {
    console.log('Auth Check - Access granted via SESSION for student');
    return next();
  }
  checkFallback(req.headers['x-student-id'] || req.headers['x-admin-id'], res, next);
};
