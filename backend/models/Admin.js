const db = require('../database');

const Admin = {
  getAllStudents: (callback) => {
    db.all('SELECT student_id, name, has_voted, voted_at FROM students WHERE role = "student"', [], callback);
  },
  getAuditLogs: (callback) => {
    db.all('SELECT * FROM audit_log ORDER BY timestamp DESC', [], callback);
  },
  logAction: (studentId, action, callback) => {
    db.run('INSERT INTO audit_log (student_id, action) VALUES (?, ?)', [studentId, action], callback);
  },
  toggleVoting: (status, callback) => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_open", ?)', [status], callback);
  },
  updateDeadline: (deadline, callback) => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_deadline", ?)', [deadline], callback);
  },
  getSettings: (callback) => {
    db.all('SELECT * FROM settings', [], callback);
  },
  resetVotes: (callback) => {
    const newDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    db.serialize(() => {
      db.run('DELETE FROM votes');
      db.run('UPDATE students SET has_voted = 0, voted_at = NULL');
      db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_deadline", ?)', [newDeadline], (err) => {
        if (err) {
          callback(err);
          return;
        }
        db.run('INSERT INTO audit_log (student_id, action) VALUES ("admin", "Reset all votes and deadline")', [], callback);
      });
    });
  }
};

module.exports = Admin;
