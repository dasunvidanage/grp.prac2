const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

exports.register = (req, res) => {
  const { student_id, name, email, password, id_photo } = req.body;
  console.log('Registration attempt for student_id:', student_id);

  if (!student_id || !name || !email || !password || !id_photo) {
    console.log('Missing required fields for registration:', { student_id, name, email, hasPassword: !!password, hasPhoto: !!id_photo });
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  Student.create({ student_id, name, email, password_hash, id_photo }, (err) => {
    if (err) {
      console.error('Error creating student:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Student ID already registered.' });
      }
      return res.status(500).json({ error: 'Failed to register student.' });
    }
    console.log('Student registered successfully, pending approval:', student_id);
    res.json({ message: 'Registration successful. Waiting for admin approval.' });
  });
};

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

    if (student.status !== 'approved') {
      return res.status(403).json({ error: `Account status is ${student.status}. Please contact an administrator.` });
    }

    try {
      const isMatch = bcrypt.compareSync(password, student.password_hash);
      if (!isMatch) {
        console.log('Password mismatch for:', student_id);
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if (req.session) {
        req.session.studentId = student.student_id;
        req.session.role = student.role;
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
