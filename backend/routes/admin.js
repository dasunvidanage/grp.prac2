const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/students', isAdmin, adminController.getStudents);
router.get('/audit-logs', isAdmin, adminController.getAuditLogs);
router.post('/toggle-voting', isAdmin, adminController.toggleVoting);
router.post('/reset-votes', isAdmin, adminController.resetVotes);
router.get('/settings', adminController.getSettings); // Publicly accessible to show timer
router.post('/update-deadline', isAdmin, adminController.updateDeadline);

module.exports = router;
