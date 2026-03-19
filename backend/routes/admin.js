const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

// Election Management Routes
router.post('/elections', isAdmin, adminController.createElection);
router.get('/elections', isAdmin, adminController.getElections);
router.get('/elections/:id', isAdmin, adminController.getElectionById);
router.put('/elections/:id/status', isAdmin, adminController.updateElectionStatus);
router.put('/elections/:id/nomination-range', isAdmin, adminController.updateNominationRange);
router.put('/elections/:id/voting-range', isAdmin, adminController.updateVotingRange);
router.put('/elections/:id/allowed-years', isAdmin, adminController.updateAllowedYears);
router.post('/elections/:id/reset-nominations', isAdmin, adminController.resetNominations);
router.post('/elections/:id/reset-votes', isAdmin, adminController.resetElectionVotes);

// Student & System Routes
router.get('/students', isAdmin, adminController.getStudents);
router.post('/update-student-status', isAdmin, adminController.updateStudentStatus);
router.post('/delete-student', isAdmin, adminController.deleteStudent);
router.get('/overview', isAdmin, adminController.getOverview);
router.get('/stats', isAdmin, adminController.getStats);

// Legacy / Deprecated (Mapped to new or stubbed)
router.post('/toggle-voting', isAdmin, adminController.toggleVoting); 
router.post('/toggle-nomination', isAdmin, adminController.toggleNominations);
router.post('/reset-votes', isAdmin, adminController.resetVotes);
router.get('/settings', adminController.getSettings); 
router.post('/update-deadline', isAdmin, adminController.updateDeadline);
router.post('/update-voting-range', isAdmin, adminController.updateVotingRange);

module.exports = router;
