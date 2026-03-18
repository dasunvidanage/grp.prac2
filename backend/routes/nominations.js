const express = require('express');
const router = express.Router();
const nominationController = require('../controllers/nominationController');
const { isLoggedIn, isAdmin, isStudent } = require('../middleware/authMiddleware');

router.post('/', isStudent, nominationController.createNomination);
router.get('/pending', isStudent, nominationController.getPendingNominations);
router.post('/consent', isStudent, nominationController.giveConsent);

router.get('/admin/list', isAdmin, nominationController.getAdminNominations);
router.post('/admin/review', isAdmin, nominationController.reviewNomination);

module.exports = router;
