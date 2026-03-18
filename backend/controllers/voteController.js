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

    // 2. Check if student has already voted in THIS election
    Vote.hasVoted(election_id, student_id, (err, hasVoted) => {
      if (err) return res.status(500).json({ error: 'Internal error.' });
      if (hasVoted) return res.status(400).json({ error: 'You have already voted in this election.' });

      // 3. Check student eligibility (CS/IS)
      Student.findByStudentId(student_id, (err, student) => {
        if (!student) return res.status(404).json({ error: 'Student not found.' });

        db.get('SELECT category FROM candidates WHERE id = ? AND election_id = ?', [candidate_id, election_id], (err, candidate) => {
          if (err || !candidate) return res.status(404).json({ error: 'Candidate not found or invalid.' });

          const isCSStudent = student_id.includes('CS');
          const isISStudent = student_id.includes('IS');
          const candidateCategory = candidate.category;

          if (isCSStudent && candidateCategory !== 'CS') return res.status(403).json({ error: 'CS students can only vote for CS candidates.' });
          if (isISStudent && candidateCategory !== 'IS') return res.status(403).json({ error: 'IS students can only vote for IS candidates.' });

          // 4. Record Vote
          Vote.create(election_id, student_id, candidate_id, function(err) {
            if (err) return res.status(500).json({ error: 'Failed to record vote.' });
            res.json({ message: 'Vote submitted successfully.', vote_id: `#${this.lastID}` });
          });
        });
      });
    });
  });
};
