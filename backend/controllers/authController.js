const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

exports.login = (req, res) => {
  const { student_id, password } = req.body;
  console.log('Login attempt for:', student_id);

  if (!student_id || !password) {
    return res.status(400).json({ error: 'Please provide student_id and password.' });
  }

  Student.findByStudentId(student_id, (err, student) => {
    if (err) {
      console.error('Database error in findByStudentId:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    
    if (!student) {
      console.log('User not found:', student_id);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    try {
      const isMatch = bcrypt.compareSync(password, student.password_hash);
      if (!isMatch) {
        console.log('Password mismatch for:', student_id);
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      // Store in session (if using) or just return user info
      if (req.session) {
        req.session.studentId = student.student_id;
        req.session.role = student.role;
      } else {
        console.warn('Session middleware not available');
      }

      console.log('Login successful for:', student_id);
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: student.id, 
          student_id: student.student_id, 
          name: student.name, 
          role: student.role,
          has_voted: student.has_voted 
        } 
      });
    } catch (bcryptErr) {
      console.error('Bcrypt error:', bcryptErr);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  });
};

exports.getStatus = (req, res) => {
  const { student_id } = req.params;
  Student.findByStudentId(student_id, (err, student) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    res.json({
      has_voted: student.has_voted,
      voted_at: student.voted_at
    });
  });
};
