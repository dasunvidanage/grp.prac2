const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

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

    // Store in session (if using) or just return user info
    req.session.studentId = student.student_id;
    req.session.role = student.role;

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
  });
};
