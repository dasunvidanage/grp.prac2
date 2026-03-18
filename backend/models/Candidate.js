const db = require('../database');

const Candidate = {
  getAll: (electionId, callback) => {
    let query = 'SELECT * FROM candidates';
    let params = [];
    if (electionId) {
      query += ' WHERE election_id = ?';
      params.push(electionId);
    }
    db.all(query, params, callback);
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM candidates WHERE id = ?', [id], callback);
  },
  create: (data, callback) => {
    const { election_id, student_id, name, manifesto, language_proficiency, category, position, photo } = data;
    db.run(
      'INSERT INTO candidates (election_id, student_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [election_id, student_id, name, manifesto, language_proficiency, category, position, photo],
      callback
    );
  }
};

module.exports = Candidate;
