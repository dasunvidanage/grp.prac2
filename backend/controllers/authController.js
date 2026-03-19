const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Election = require('../models/Election');

exports.register = (req, res) => {
  const { student_id, name, email, password, id_photo } = req.body;
  console.log('Registration attempt for student_id:', student_id);

  if (!student_id || !name || !email || !password || !id_photo) {
    console.log('Missing required fields for registration:', { student_id, name, email, hasPassword: !!password, hasPhoto: !!id_photo });
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  // Calculate academic year from email (e.g., 2025cs010@stu.ucsc.cmb.ac.lk)
  // Assuming current year is 2026 as per user requirement
  let academic_year = null;
  const yearMatch = email.match(/^(\d{4})/);
  if (yearMatch) {
    const enrollmentYear = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear(); // Will be 2026 in this context
    academic_year = currentYear - enrollmentYear;
  }

  const password_hash = bcrypt.hashSync(password, 10);

  Student.create({ student_id, name, email, academic_year, password_hash, id_photo }, (err) => {
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
          academic_year: student.academic_year,
          has_voted: student.has_voted,
          status: student.status
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
      voted_at: student.voted_at,
      status: student.status
    });
  });
};

exports.getPublicElections = (req, res) => {
  const studentId = req.headers['x-student-id'] || (req.session ? req.session.studentId : null);

  Election.getAll((err, elections) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch elections.' });

    if (!studentId) {
      return res.json(elections);
    }

    Student.findByStudentId(studentId, (err, student) => {
      if (err || !student) {
        // If student not found or error, return all elections but maybe log it
        return res.json(elections);
      }

      const studentYear = String(student.academic_year);
      const filteredElections = elections.filter(election => {
        if (!election.allowed_years) return true; // If not specified, all can see
        try {
          const allowed = JSON.parse(election.allowed_years);
          return Array.isArray(allowed) && (allowed.length === 0 || allowed.includes(studentYear));
        } catch (e) {
          return true; // Fallback to showing if parse fails
        }
      });

      res.json(filteredElections);
    });
  });
};

exports.getElectionById = (req, res) => {
  const { id } = req.params;
  Election.findById(id, (err, election) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch election.' });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    res.json(election);
  });
};
