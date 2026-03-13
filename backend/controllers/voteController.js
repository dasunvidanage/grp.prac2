const Vote = require('../models/Vote');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const db = require('../database');

exports.submitVote = (req, res) => {
  const { student_id, candidate_id } = req.body;

  if (!student_id || !candidate_id) {
    return res.status(400).json({ error: 'Please provide student_id and candidate_id.' });
  }

  // Check if voting is open
  Admin.getSettings((err, settings) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    
    if (settingsObj.voting_open !== '1') {
      return res.status(400).json({ error: 'Voting is currently closed.' });
    }

    const deadline = new Date(settingsObj.voting_deadline);
    if (new Date() > deadline) {
      return res.status(400).json({ error: 'Voting deadline has passed.' });
    }

    // Check if student exists and has already voted
    Student.findByStudentId(student_id, (err, student) => {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      if (!student) return res.status(404).json({ error: 'Student not found.' });

      if (student.has_voted) {
        return res.status(400).json({ error: 'You have already voted.' });
      }

      // Process vote
      Vote.create(student_id, candidate_id, function(err) {
        if (err) return res.status(500).json({ error: 'Failed to record vote.' });

        const voteId = this.lastID; // SQLite lastID

        // Update student's has_voted status and voted_at
        const now = new Date().toISOString();
        db.run('UPDATE students SET has_voted = 1, voted_at = ? WHERE student_id = ?', [now, student_id], (err) => {
          if (err) return res.status(500).json({ error: 'Failed to update student status.' });
          
          // Log action
          Admin.logAction(student_id, `Cast a vote (Vote ID: #${voteId})`);
          
          res.json({ message: 'Vote submitted successfully.', vote_id: `#${voteId}` });
        });
      });
    });
  });
};
