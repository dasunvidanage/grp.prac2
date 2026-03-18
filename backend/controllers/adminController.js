const Admin = require('../models/Admin');
const Election = require('../models/Election');

// --- Election Management ---

exports.createElection = (req, res) => {
  const { title, start_time, end_time, has_nominations, nomination_type, nomination_start, nomination_end, positions, cs_vote_limit, is_vote_limit } = req.body;
  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: 'Title, start time, and end time are required.' });
  }

  const electionData = {
    title,
    start_time,
    end_time,
    has_nominations: 1, // Every election has nominations now
    nomination_type: nomination_type || '3-person',
    nomination_start,
    nomination_end,
    positions: positions ? JSON.stringify(positions.split(',').map(p => p.trim())) : '[]',
    cs_vote_limit: parseInt(cs_vote_limit) || 1,
    is_vote_limit: parseInt(is_vote_limit) || 1
  };

  Election.create(electionData, (err, id) => {
    if (err) return res.status(500).json({ error: 'Failed to create election.' });
    res.json({ message: 'Election created successfully.', id });
  });
};

exports.getElections = (req, res) => {
  Election.getAll((err, elections) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch elections.' });
    res.json(elections);
  });
};

exports.getElectionById = (req, res) => {
  const { id } = req.params;
  Election.findById(id, (err, election) => {
    if (err || !election) return res.status(404).json({ error: 'Election not found.' });
    res.json(election);
  });
};

exports.updateElectionStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'upcoming', 'active', 'completed'
  
  Election.updateStatus(id, status, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update status.' });
    res.json({ message: 'Election status updated.' });
  });
};

exports.updateNominationRange = (req, res) => {
  const { id } = req.params;
  const { nomination_start, nomination_end } = req.body;
  Election.updateNominationRange(id, nomination_start, nomination_end, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update nomination range.' });
    res.json({ message: 'Nomination range updated successfully.' });
  });
};

exports.resetNominations = (req, res) => {
  const { id } = req.params;
  Election.resetNominations(id, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to reset nominations.' });
    res.json({ message: 'All nominations for this election have been reset.' });
  });
};

// --- Student & System Management ---

exports.getStudents = (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  Admin.getAllStudents(limit, offset, (err, students) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch students.' });
    res.json(students);
  });
};

exports.updateStudentStatus = (req, res) => {
  const { studentId, status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  Admin.updateStudentStatus(studentId, status, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update student status.' });
    res.json({ message: `Student ${studentId} ${status} successfully.` });
  });
};


exports.getOverview = (req, res) => {
  Admin.getOverview((err, stats) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch overview stats.' });
    res.json(stats);
  });
};

exports.getStats = (req, res) => {
  const { election_id } = req.query;
  if (!election_id) {
    return res.status(400).json({ error: 'Election ID is required.' });
  }

  Admin.getStats(election_id, (err, stats) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stats.' });
    res.json(stats);
  });
};

exports.updateVotingRange = (req, res) => {
  const { id } = req.params;
  const { start_time, end_time } = req.body;
  
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'Start time and end time are required.' });
  }

  Election.updateVotingRange(id, start_time, end_time, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update voting range.' });
    res.json({ message: 'Voting range updated successfully.' });
  });
};

exports.resetElectionVotes = (req, res) => {
  const { id } = req.params;
  Election.resetVotes(id, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to reset votes for this election.' });
    res.json({ message: 'All votes for this election have been reset.' });
  });
};

// --- Legacy / Deprecated (Keep for backward compat or refactor later) ---
exports.toggleVoting = (req, res) => { res.json({ message: 'Use Election Management instead.' }); };
exports.toggleNominations = (req, res) => { res.json({ message: 'Use Election Management instead.' }); };
exports.resetVotes = (req, res) => { 
    Admin.resetVotes((err) => {
        if (err) return res.status(500).json({ error: 'Failed to reset votes.' });
        res.json({ message: 'System reset complete.' });
    });
};
exports.getSettings = (req, res) => {
    Admin.getSettings((err, settings) => {
        if (err) return res.status(500).json({ error: 'Failed.' });
        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.json(settingsObj);
    });
};
exports.updateDeadline = (req, res) => { res.json({ message: 'Deprecated.' }); };
