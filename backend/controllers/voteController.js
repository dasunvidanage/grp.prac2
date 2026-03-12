const Vote = require('../models/Vote');
const Student = require('../models/Student');

exports.submitVote = (req, res) => {
  const { student_id, candidate_id } = req.body;

  if (!student_id || !candidate_id) {
    return res.status(400).json({ error: 'Please provide student_id and candidate_id.' });
  }

  // Check if student exists and has already voted
  Student.findByStudentId(student_id, (err, student) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (student.has_voted) {
      return res.status(400).json({ error: 'You have already voted.' });
    }

    // Process vote
    Vote.create(student_id, candidate_id, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to record vote.' });

      // Update student's has_voted status
      Student.updateVoteStatus(student_id, 1, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update student status.' });
        res.json({ message: 'Vote submitted successfully.' });
      });
    });
  });
};
