const db = require('../database');

const Candidate = {
  getAll: (callback) => {
    db.all('SELECT * FROM candidates', [], callback);
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM candidates WHERE id = ?', [id], callback);
  }
};

module.exports = Candidate;
