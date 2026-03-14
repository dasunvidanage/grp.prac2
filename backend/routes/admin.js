const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/students', authenticateToken, isAdmin, adminController.getStudents);
router.get('/audit-logs', authenticateToken, isAdmin, adminController.getAuditLogs);
router.post('/toggle-voting', authenticateToken, isAdmin, adminController.toggleVoting);
router.post('/reset-votes', authenticateToken, isAdmin, adminController.resetVotes);
router.get('/settings', adminController.getSettings); // Publicly accessible to show timer
router.post('/update-deadline', authenticateToken, isAdmin, adminController.updateDeadline);

module.exports = router;
