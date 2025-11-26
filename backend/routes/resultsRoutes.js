const express = require('express');
const { body } = require('express-validator');
const {
  getAllResults,
  createOrUpdateResult,
  getResultsByStudent,
  getResultsByClassAndSubject,
  getMyResultsNormalized,
  getPendingApprovals,
  approveResult,
  rejectResult,
  getMyAcademicYears
} = require('../controllers/resultsController');
const checkTeacher = require('../middleware/checkTeacher');
const checkStudent = require('../middleware/checkStudent');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware
const validateResult = [
  body('student_id').isInt({ min: 1 }).withMessage('Valid student ID is required'),
  body('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required'),
  body('first_monthly_score').optional().isFloat({ min: 0, max: 20 }).withMessage('Monthly score must be between 0 and 20'),
  body('second_monthly_score').optional().isFloat({ min: 0, max: 20 }).withMessage('Monthly score must be between 0 and 20'),
  body('midterm_exam_score').optional().isFloat({ min: 0, max: 80 }).withMessage('Exam score must be between 0 and 80'),
  body('final_exam_score').optional().isFloat({ min: 0, max: 80 }).withMessage('Exam score must be between 0 and 80'),
  body('academic_year').notEmpty().withMessage('Academic year is required')
];

// Routes
router.get('/', checkAdmin, getAllResults); // Get all results for admin dashboard
router.post('/', checkTeacher, validateResult, createOrUpdateResult);
router.put('/', checkTeacher, validateResult, createOrUpdateResult); // Same as POST for upsert
router.get('/approvals/pending', checkAdmin, getPendingApprovals); // Get pending approvals (must come before /student)
router.get('/student/me/years', checkStudent, getMyAcademicYears); // Get available academic years for student
router.get('/student/me/:academicYear?', checkStudent, getMyResultsNormalized); // Must come before /:studentId route (academicYear is optional)
router.get('/student/:studentId/:academicYear', checkAdmin, getResultsByStudent);
router.get('/class/:classId/subject/:subjectId/:academicYear', checkTeacher, getResultsByClassAndSubject);
router.put('/approve/:resultId', checkAdmin, approveResult); // Approve a result
router.put('/reject/:resultId', checkAdmin, rejectResult); // Reject a result

module.exports = router;
