const Candidate = require('../models/Candidate');

exports.getCandidates = (req, res) => {
  Candidate.getAll((err, candidates) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    res.json(candidates);
  });
};
