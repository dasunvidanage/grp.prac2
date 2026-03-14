const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const JWT_SECRET = 'election-portal-jwt-secret-key';

exports.login = (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ error: 'Please provide student_id and password.' });
  }

  Student.findByStudentId(student_id, (err, student) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    if (!student) return res.status(401).json({ error: 'Invalid credentials.' });

    const isMatch = bcrypt.compareSync(password, student.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    // Generate JWT token
    const token = jwt.sign(
      { 
        student_id: student.student_id, 
        role: student.role,
        name: student.name,
        id: student.id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful', 
      token: token,
      user: { 
        id: student.id, 
        student_id: student.student_id, 
        name: student.name, 
        role: student.role,
        has_voted: student.has_voted 
      } 
    });
  });
};
