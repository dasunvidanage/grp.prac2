const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/', candidateController.getAllCandidates);
router.post('/', isAdmin, candidateController.addCandidate);
router.delete('/:id', isAdmin, candidateController.deleteCandidate);

module.exports = router;
