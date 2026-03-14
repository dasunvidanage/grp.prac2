const Candidate = require('../models/Candidate');
const Admin = require('../models/Admin');

exports.getAllCandidates = (req, res) => {
  const { category } = req.query;
  const db = require('../database');
  let query = 'SELECT * FROM candidates';
  let params = [];
  
  if (category && category.trim() !== '') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  db.all(query, params, (err, candidates) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch candidates.' });
    res.json(candidates);
  });
};

exports.addCandidate = (req, res) => {
  const { name, manifesto, language_proficiency, category, photo } = req.body;
  if (!name || !manifesto || !category) return res.status(400).json({ error: 'Name, manifesto and category are required.' });

  const db = require('../database');
  db.run('INSERT INTO candidates (name, manifesto, language_proficiency, category, photo) VALUES (?, ?, ?, ?, ?)', 
    [name, manifesto, language_proficiency, category, photo || '../assets/images/default.jpg'], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add candidate.' });
      Admin.logAction(req.session.studentId || 'admin', `Added candidate: ${name} (${category})`);
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
