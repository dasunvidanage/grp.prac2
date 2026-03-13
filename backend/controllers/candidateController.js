const Candidate = require('../models/Candidate');
const Admin = require('../models/Admin');

exports.getAllCandidates = (req, res) => {
  Candidate.getAll((err, candidates) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch candidates.' });
    res.json(candidates);
  });
};

exports.addCandidate = (req, res) => {
  const { name, manifesto, manifesto_full, campaign_points, photo } = req.body;
  if (!name || !manifesto) return res.status(400).json({ error: 'Name and manifesto are required.' });

  const db = require('../database');
  db.run('INSERT INTO candidates (name, manifesto, manifesto_full, campaign_points, photo) VALUES (?, ?, ?, ?, ?)', 
    [name, manifesto, manifesto_full, campaign_points, photo || '../assets/images/default.jpg'], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add candidate.' });
      Admin.logAction(req.session.studentId || 'admin', `Added candidate: ${name}`);
      res.json({ message: 'Candidate added successfully.', id: this.lastID });
    }
  );
};

exports.deleteCandidate = (req, res) => {
  const { id } = req.params;
  const db = require('../database');
  db.run('DELETE FROM candidates WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete candidate.' });
    Admin.logAction(req.session.studentId || 'admin', `Deleted candidate ID: ${id}`);
    res.json({ message: 'Candidate deleted successfully.' });
  });
};
