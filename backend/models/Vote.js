const db = require('../database');

const Vote = {
  create: (studentId, candidateId, callback) => {
    db.run('INSERT INTO votes (student_id, candidate_id) VALUES (?, ?)', [studentId, candidateId], callback);
  },
  getResults: (callback) => {
    const query = `
      SELECT candidates.name, COUNT(votes.id) AS vote_count
      FROM candidates
      LEFT JOIN votes ON candidates.id = votes.candidate_id
      GROUP BY candidates.id
    `;
    db.all(query, [], callback);
  }
};

module.exports = Vote;
