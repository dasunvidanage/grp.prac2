const db = require('../database');

const Nomination = {
  create: (data, callback) => {
    const { election_id, candidate_id, proposer_id, seconder_id, manifesto, language_proficiency, category, position, photo } = data;
    console.log('Nomination.create called with:', data);
    db.run(
      `INSERT INTO nominations (
        election_id, candidate_id, proposer_id, seconder_id, manifesto, language_proficiency, category, position, photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [election_id, candidate_id, proposer_id, seconder_id, manifesto, language_proficiency, category, position, photo],
      function(err) {
        if (err) console.error('DB Error in Nomination.create:', err);
        callback(err, this ? this.lastID : null);
      }
    );
  },

  findById: (id, callback) => {
    db.get('SELECT * FROM nominations WHERE id = ?', [id], callback);
  },

  updateConsent: (id, role, status, callback) => {
    const column = `${role}_consent`;
    console.log(`Nomination.updateConsent called for ID: ${id}, role: ${role}, status: ${status}`);
    db.run(`UPDATE nominations SET ${column} = ? WHERE id = ?`, [status, id], (err) => {
      if (err) console.error('DB Error in Nomination.updateConsent:', err);
      callback(err);
    });
  },

  updateAdminStatus: (id, status, callback) => {
    db.run('UPDATE nominations SET admin_status = ? WHERE id = ?', [status, id], callback);
  },

  getPendingForUser: (studentId, callback) => {
    console.log('Nomination.getPendingForUser called for studentId:', studentId);
    db.all(
      `SELECT n.*, 
              e.title as election_title,
              s1.name as candidate_name, 
              s2.name as proposer_name, 
              s3.name as seconder_name
       FROM nominations n
       JOIN elections e ON n.election_id = e.id
       JOIN students s1 ON n.candidate_id = s1.student_id
       JOIN students s2 ON n.proposer_id = s2.student_id
       JOIN students s3 ON n.seconder_id = s3.student_id
       WHERE (UPPER(n.candidate_id) = ? 
          OR UPPER(n.proposer_id) = ? 
          OR UPPER(n.seconder_id) = ?)
       ORDER BY n.created_at DESC`,
      [studentId.toUpperCase(), studentId.toUpperCase(), studentId.toUpperCase()],
      (err, rows) => {
        if (err) console.error('DB Error in Nomination.getPendingForUser:', err);
        callback(err, rows);
      }
    );
  },

  getAllForAdmin: (limit, offset, electionId, callback) => {
    let query = `SELECT n.*, 
              e.title as election_title,
              s1.name as candidate_name, 
              s2.name as proposer_name, 
              s3.name as seconder_name
       FROM nominations n
       JOIN elections e ON n.election_id = e.id
       JOIN students s1 ON n.candidate_id = s1.student_id
       JOIN students s2 ON n.proposer_id = s2.student_id
       JOIN students s3 ON n.seconder_id = s3.student_id
       WHERE candidate_consent = 'approved' 
         AND proposer_consent = 'approved' 
         AND seconder_consent = 'approved'
         AND admin_status = 'pending'`;
    
    let params = [];
    
    if (electionId) {
        query += ` AND n.election_id = ?`;
        params.push(electionId);
    }

    query += ` ORDER BY n.created_at DESC`;

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);
      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    db.all(query, params, callback);
  }
};

module.exports = Nomination;
