const db = require('../database');

const Vote = {
  create: (electionId, studentId, candidateId, callback) => {
    db.serialize(() => {
      db.run('INSERT INTO votes (election_id, student_id, candidate_id) VALUES (?, ?, ?)', 
        [electionId, studentId, candidateId]);
      db.run('INSERT INTO voter_participation (election_id, student_id) VALUES (?, ?)', 
        [electionId, studentId], callback);
    });
  },
  
  hasVoted: (electionId, studentId, callback) => {
    db.get('SELECT 1 FROM voter_participation WHERE election_id = ? AND student_id = ?', 
      [electionId, studentId], (err, row) => {
        callback(err, !!row);
      });
  },

  getResults: (electionId, callback) => {
    const query = `
      SELECT candidates.name, candidates.category, candidates.position, candidates.photo, COUNT(votes.id) AS vote_count
      FROM candidates
      LEFT JOIN votes ON candidates.id = votes.candidate_id AND votes.election_id = ?
      WHERE candidates.election_id = ?
      GROUP BY candidates.id, candidates.name, candidates.category, candidates.position, candidates.photo
    `;
    db.all(query, [electionId, electionId], callback);
  }
};

module.exports = Vote;
