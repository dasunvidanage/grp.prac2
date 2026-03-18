const db = require('../database');

const Admin = {
  getAllStudents: (limit, offset, callback) => {
    db.all(
      'SELECT student_id, name, email, status, id_photo FROM students WHERE role = "student" LIMIT ? OFFSET ?',
      [limit, offset],
      callback
    );
  },
  updateStudentStatus: (studentId, status, callback) => {
    db.run('UPDATE students SET status = ? WHERE student_id = ?', [status, studentId], callback);
  },
  toggleVoting: (status, callback) => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_open", ?)', [status], callback);
  },
  toggleNominations: (status, callback) => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("nominationsOpen", ?)', [status], callback);
  },
  updateDeadline: (deadline, callback) => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_deadline", ?)', [deadline], callback);
  },
  updateVotingRange: (startTime, endTime, callback) => {
    db.serialize(() => {
      db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_start", ?)', [startTime]);
      db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ("voting_deadline", ?)', [endTime], callback);
    });
  },
  getSettings: (callback) => {
    db.all('SELECT * FROM settings', [], callback);
  },
  getOverview: (callback) => {
    const getCount = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row ? (row.count || 0) : 0);
        });
      });
    };

    Promise.all([
      getCount('SELECT COUNT(*) as count FROM students WHERE role = "student" AND status = "approved"'),
      getCount('SELECT COUNT(*) as count FROM students WHERE role = "student" AND status = "pending"'),
      getCount('SELECT COUNT(*) as count FROM elections'),
      getCount('SELECT COUNT(*) as count FROM elections WHERE status = "active"'),
      getCount('SELECT COUNT(*) as count FROM voter_participation'),
      getCount('SELECT COUNT(*) as count FROM nominations WHERE admin_status = "pending" AND candidate_consent = "approved" AND proposer_consent = "approved" AND seconder_consent = "approved"')
    ]).then(([verifiedStudents, pendingStudents, totalElections, activeElections, totalVotes, pendingNominations]) => {
      callback(null, {
        verifiedStudents,
        pendingStudents,
        totalElections,
        activeElections,
        totalVotes,
        pendingNominations,
        totalPendingActions: pendingStudents + pendingNominations
      });
    }).catch(err => {
      console.error('Error in getOverview model:', err);
      callback(err);
    });
  },
  getStats: (electionId, callback) => {
    const getCount = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row ? (row.count || 0) : 0);
        });
      });
    };

    const getRecentVotes = (electionId) => {
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT student_id, voted_at FROM voter_participation WHERE election_id = ? ORDER BY voted_at DESC LIMIT 10',
          [electionId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    };

    Promise.all([
      getCount('SELECT COUNT(*) as count FROM students WHERE role = "student" AND status = "approved"'),
      getCount('SELECT COUNT(*) as count FROM voter_participation WHERE election_id = ?', [electionId]),
      getCount('SELECT COUNT(*) as count FROM candidates WHERE election_id = ?', [electionId]),
      getRecentVotes(electionId)
    ]).then(([total, voted, candidates, recentVotes]) => {
      callback(null, { 
        total, 
        voted, 
        notVoted: total - voted,
        candidates,
        recentVotes
      });
    }).catch(err => {
      console.error('Error in getStats model:', err);
      callback(err);
    });
  },
  resetVotes: (callback) => {
    db.serialize(() => {
      db.run('DELETE FROM votes');
      db.run('DELETE FROM voter_participation', callback);
    });
  }
};

module.exports = Admin;

