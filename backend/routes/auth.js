const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/check-session', isLoggedIn, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: { 
      student_id: req.session.studentId, 
      role: req.session.role 
    } 
  });
});

module.exports = router;
