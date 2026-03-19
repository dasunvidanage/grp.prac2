const db = require('../database');

const Admin = {
  getAllStudents: (limit, offset, orderBy, callback) => {
    let sql = 'SELECT student_id, name, email, academic_year, status, id_photo FROM students WHERE role = "student"';
    if (orderBy === 'status') {
      // Prioritize pending first, then approved, then rejected
      sql += " ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END ASC, name ASC";
    } else {
      // Default stable sort
      sql += " ORDER BY name ASC";
    }
    sql += ' LIMIT ? OFFSET ?';
    db.all(sql, [limit, offset], callback);
  },
  updateStudentStatus: (studentId, status, callback) => {
    db.run('UPDATE students SET status = ? WHERE student_id = ?', [status, studentId], callback);
  },
  deleteStudent: (studentId, callback) => {
    db.run('DELETE FROM students WHERE student_id = ?', [studentId], callback);
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


  getStats: async (electionId, callback) => {
  try {
    const query = (sql, params = [], method = 'get') => {
      return new Promise((resolve, reject) => {
        db[method](sql, params, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    // 1. Fetch raw data
    const election = await query('SELECT allowed_years FROM elections WHERE id = ?', [electionId]);

    let allowedYears = [];
    if (election && election.allowed_years) {
      try {
        const parsed = JSON.parse(election.allowed_years);
        allowedYears = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        allowedYears = election.allowed_years.split(',').map(y => y.trim());
      }
    }

    // 2. The Integer Conversion Log
    const yearParams = allowedYears.map(y => parseInt(y, 10)).filter(y => !isNaN(y));

    let studentSql = 'SELECT COUNT(*) as count FROM students WHERE role = "student" AND status = "approved"';
    if (yearParams.length > 0) {
      const placeholders = yearParams.map(() => '?').join(',');
      studentSql += ` AND academic_year IN (${placeholders})`;
    }
    

    // 3. Parallel Execution
    const [totalRow, votedRow, candidateRow, recentVotes] = await Promise.all([
      query(studentSql, yearParams),
      query('SELECT COUNT(*) as count FROM voter_participation WHERE election_id = ?', [electionId]),
      query('SELECT COUNT(*) as count FROM candidates WHERE election_id = ?', [electionId]),
      query('SELECT student_id, voted_at FROM voter_participation WHERE election_id = ? ORDER BY voted_at DESC LIMIT 10', [electionId], 'all')
    ]);

    const total = totalRow?.count || 0;
    const voted = votedRow?.count || 0;


    callback(null, {
      total,
      voted,
      notVoted: Math.max(0, total - voted),
      candidates: candidateRow?.count || 0,
      recentVotes: recentVotes || []
    });

  } catch (err) {
    console.error('[getStats] FATAL ERROR:', err);
    callback(err);
  }
},

  resetVotes: (callback) => {
    db.serialize(() => {
      db.run('DELETE FROM votes');
      db.run('DELETE FROM voter_participation', callback);
    });
  }
};

module.exports = Admin;

