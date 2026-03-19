const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { isStudent } = require('../middleware/authMiddleware');

router.post('/', isStudent, voteController.submitVote);
router.get('/my-votes', isStudent, voteController.getMyVotes);

module.exports = router;
