const express = require('express');
const router = express.Router();
const { addStudent, addStudentsBulk, getAllStudents, getStudentById, updateStudent, deleteStudent, loginStudent, resetPassword, verifyStudentDetails, markAttendance, getStudentStats } = require('../controllers/student.controller');
const { protect } = require('../middleware/auth'); // Admin protection likely needed

// All routes here should probably be protected for Admin use
// Assuming 'protect' middleware checks for valid token (Admin or otherwise)
// If we need specific Admin check, we might need an 'admin' middleware or check role in 'protect'

router.route('/')
    .get(protect, getAllStudents)
    .post(protect, addStudent);

// Public registration route
router.post('/register', addStudent);

router.route('/bulk')
    .post(protect, addStudentsBulk);

router.post('/login', loginStudent);
router.post('/verify-details', verifyStudentDetails);
router.post('/reset-password', resetPassword);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, updateStudent)
    .delete(protect, deleteStudent);

router.get('/:id/stats', protect, getStudentStats);

router.post('/:id/attendance', protect, markAttendance);

module.exports = router;
