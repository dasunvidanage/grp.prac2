const Admin = require('../models/Admin');

exports.getStudents = (req, res) => {
  Admin.getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users.' });
    res.json(users);
  });
};

exports.getAuditLogs = (req, res) => {
  Admin.getAuditLogs((err, logs) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch audit logs.' });
    res.json(logs);
  });
};

exports.toggleVoting = (req, res) => {
  const { status } = req.body;
  Admin.toggleVoting(status, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to toggle voting.' });
    Admin.logAction(req.session.studentId || 'admin', `Voting period ${status === '1' ? 'opened' : 'closed'}`);
    res.json({ message: `Voting ${status === '1' ? 'opened' : 'closed'} successfully.` });
  });
};

exports.resetVotes = (req, res) => {
  Admin.resetVotes((err) => {
    if (err) return res.status(500).json({ error: 'Failed to reset votes.' });
    res.json({ message: 'All votes have been reset.' });
  });
};

exports.getSettings = (req, res) => {
  Admin.getSettings((err, settings) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch settings.' });
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    res.json(settingsObj);
  });
};

exports.updateDeadline = (req, res) => {
  const { deadline } = req.body;
  Admin.updateDeadline(deadline, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update deadline.' });
    Admin.logAction(req.session.studentId || 'admin', `Updated voting deadline to ${deadline}`);
    res.json({ message: 'Voting deadline updated successfully.' });
  });
};
