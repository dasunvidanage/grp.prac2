const Vote = require('../models/Vote');

exports.getResults = (req, res) => {
  Vote.getResults((err, results) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    res.json(results);
  });
};
