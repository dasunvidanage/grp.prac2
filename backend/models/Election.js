const db = require('../database');

const Election = {
  create: (data, callback) => {
    const { title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions, allowed_years, cs_vote_limit, is_vote_limit } = data;
    db.run(
      `INSERT INTO elections (title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions, allowed_years, cs_vote_limit, is_vote_limit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions, allowed_years, cs_vote_limit || 1, is_vote_limit || 1],
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  },

  getAll: (callback) => {
    db.all('SELECT * FROM elections ORDER BY created_at DESC', [], callback);
  },

  findById: (id, callback) => {
    db.get('SELECT * FROM elections WHERE id = ?', [id], callback);
  },

  updateStatus: (id, status, callback) => {
    db.run('UPDATE elections SET status = ? WHERE id = ?', [status, id], callback);
  },

  updateNominationRange: (id, start, end, callback) => {
    db.run('UPDATE elections SET nomination_start = ?, nomination_end = ? WHERE id = ?', [start, end, id], callback);
  },

  updateVotingRange: (id, start, end, callback) => {
    db.run('UPDATE elections SET start_time = ?, end_time = ? WHERE id = ?', [start, end, id], callback);
  },

  updateAllowedYears: (id, allowed_years, callback) => {
    db.run('UPDATE elections SET allowed_years = ? WHERE id = ?', [allowed_years, id], callback);
  },

  resetNominations: (id, callback) => {
    db.run('DELETE FROM nominations WHERE election_id = ?', [id], callback);
  },

  resetVotes: (id, callback) => {
    db.serialize(() => {
      db.run('DELETE FROM votes WHERE election_id = ?', [id]);
      db.run('DELETE FROM voter_participation WHERE election_id = ?', [id], callback);
    });
  },

  getActive: (callback) => {
    db.all("SELECT * FROM elections WHERE status = 'active' OR status = 'upcoming'", [], callback);
  },

  delete: (id, callback) => {
    db.serialize(() => {
      db.run('DELETE FROM votes WHERE election_id = ?', [id]);
      db.run('DELETE FROM voter_participation WHERE election_id = ?', [id]);
      db.run('DELETE FROM candidates WHERE election_id = ?', [id]);
      db.run('DELETE FROM nominations WHERE election_id = ?', [id]);
      db.run('DELETE FROM elections WHERE id = ?', [id], callback);
    });
  }
};

module.exports = Election;
