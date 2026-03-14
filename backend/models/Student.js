const db = require('../database');

const Student = {
  findByStudentId: (studentId, callback) => {
    db.get('SELECT * FROM students WHERE UPPER(student_id) = ?', [studentId.toUpperCase()], callback);
  },
  updateVoteStatus: (studentId, status, callback) => {
    db.run('UPDATE students SET has_voted = ? WHERE student_id = ?', [status, studentId], callback);
  }
};

module.exports = Student;
