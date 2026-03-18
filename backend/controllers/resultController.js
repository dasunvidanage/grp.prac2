const Vote = require('../models/Vote');

exports.getResults = (req, res) => {
  const { election_id } = req.query;
  if (!election_id) {
    return res.status(400).json({ error: 'Election ID is required.' });
  }

  Vote.getResults(election_id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    res.json(results);
  });
};
