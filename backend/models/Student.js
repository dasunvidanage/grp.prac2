const db = require('../database');

const Student = {
  findByStudentId: (studentId, callback) => {
    db.get('SELECT * FROM students WHERE UPPER(student_id) = ?', [studentId.toUpperCase()], callback);
  },
  create: (studentData, callback) => {
    const { student_id, name, email, academic_year, password_hash, id_photo } = studentData;
    db.run(
      'INSERT INTO students (student_id, name, email, academic_year, password_hash, id_photo, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, name, email, academic_year, password_hash, id_photo, 'pending'],
      callback
    );
  },
  updateVoteStatus: (studentId, status, callback) => {
    db.run('UPDATE students SET has_voted = ? WHERE student_id = ?', [status, studentId], callback);
  }
};

module.exports = Student;
