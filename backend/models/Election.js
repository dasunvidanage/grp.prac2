const db = require('../database');

const Election = {
  create: (data, callback) => {
    const { title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions } = data;
    db.run(
      `INSERT INTO elections (title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions],
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

  resetNominations: (id, callback) => {
    db.run('DELETE FROM nominations WHERE election_id = ?', [id], callback);
  },

  getActive: (callback) => {
    db.all("SELECT * FROM elections WHERE status = 'active' OR status = 'upcoming'", [], callback);
  }
};

module.exports = Election;
