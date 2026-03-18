const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { isStudent } = require('../middleware/authMiddleware');

router.post('/', isStudent, voteController.submitVote);

module.exports = router;
