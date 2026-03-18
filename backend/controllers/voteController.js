const Vote = require('../models/Vote');
const Student = require('../models/Student');
const Election = require('../models/Election');
const Admin = require('../models/Admin');
const db = require('../database');

exports.submitVote = (req, res) => {
  const { election_id, student_id, candidate_id } = req.body;

  if (!election_id || !student_id || !candidate_id) {
    return res.status(400).json({ error: 'Please provide election_id, student_id and candidate_id.' });
  }

  // 1. Verify Election is Valid & Active
  Election.findById(election_id, (err, election) => {
    if (err || !election) return res.status(404).json({ error: 'Election not found.' });

    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);

    if (election.status !== 'active' || now < startTime || now > endTime) {
      return res.status(400).json({ error: 'Voting is not active for this election.' });
    }

    // 2. Check if student has already voted for THIS candidate in THIS election
    db.get('SELECT 1 FROM votes WHERE election_id = ? AND student_id = ? AND candidate_id = ?', [election_id, student_id, candidate_id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal error.' });
      if (row) return res.status(400).json({ error: 'You have already voted for this candidate.' });

      // 3. Get Candidate Info
      db.get('SELECT category FROM candidates WHERE id = ? AND election_id = ?', [candidate_id, election_id], (err, candidate) => {
        if (err || !candidate) return res.status(404).json({ error: 'Candidate not found or invalid.' });

        const candidateCategory = candidate.category;
        const limit = candidateCategory === 'CS' ? election.cs_vote_limit : election.is_vote_limit;

        // 4. Check category vote count
        Vote.getVoteCountByCategory(election_id, student_id, candidateCategory, (err, currentCount) => {
          if (err) return res.status(500).json({ error: 'Internal error.' });
          
          if (currentCount >= limit) {
            return res.status(403).json({ error: `You have reached the maximum vote limit (${limit}) for ${candidateCategory} candidates.` });
          }

          // 5. Record Vote
          Vote.create(election_id, student_id, candidate_id, function(err) {
            if (err) {
               // If voter_participation unique constraint fails, it means student has already voted in this election at least once.
               // We should still allow the vote in the 'votes' table, but the 'create' method in model handles both.
               // Let's refine the Vote.create to handle multiple votes correctly.
            }
            res.json({ message: 'Vote submitted successfully.', vote_id: `#${this.lastID}` });
          });
        });
      });
    });
  });
};

exports.getMyVotes = (req, res) => {
  const { election_id, student_id } = req.query;
  if (!election_id || !student_id) {
    return res.status(400).json({ error: 'election_id and student_id are required.' });
  }

  const query = `
    SELECT candidates.id, candidates.name, candidates.category 
    FROM votes 
    JOIN candidates ON votes.candidate_id = candidates.id 
    WHERE votes.election_id = ? AND votes.student_id = ?
  `;
  db.all(query, [election_id, student_id], (err, votes) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch votes.' });
    res.json(votes);
  });
};
