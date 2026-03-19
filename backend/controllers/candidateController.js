const Candidate = require('../models/Candidate');
const Admin = require('../models/Admin');

exports.getAllCandidates = (req, res) => {
  const { category, limit, offset, election_id } = req.query;
  const db = require('../database');
  
  let query = 'SELECT * FROM candidates';
  let params = [];
  let whereClauses = [];

  if (election_id) {
    whereClauses.push('election_id = ?');
    params.push(election_id);
  }
  
  if (category && category.trim() !== '') {
    whereClauses.push('category = ?');
    params.push(category);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY id DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }
  }

  db.all(query, params, (err, candidates) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch candidates.' });
    res.json(candidates);
  });
};

exports.addCandidate = (req, res) => {
  const { election_id, name, manifesto, language_proficiency, category, position, photo } = req.body;
  if (!election_id || !name || !manifesto || !category || !language_proficiency || !position) {
    return res.status(400).json({ error: 'Election ID, Name, manifesto, category, position and language proficiency are required.' });
  }

  const db = require('../database');
  db.run('INSERT INTO candidates (election_id, name, manifesto, language_proficiency, category, position, photo) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [election_id, name, manifesto, language_proficiency, category, position, photo || '../assets/images/candidate_pfp.png'], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add candidate.' });
      res.json({ message: 'Candidate added successfully.', id: this.lastID });
    }
  );
};

exports.deleteCandidate = (req, res) => {
  const { id } = req.params;
  const db = require('../database');
  db.run('DELETE FROM candidates WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete candidate.' });
    res.json({ message: 'Candidate deleted successfully.' });
  });
};
