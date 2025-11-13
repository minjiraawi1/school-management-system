const express = require('express');
const { body } = require('express-validator');
const {
  createOrUpdateResult,
  getResultsByStudent,
  getResultsByClassAndSubject,
  getMyResultsNormalized
} = require('../controllers/resultsController');
const checkTeacher = require('../middleware/checkTeacher');
const checkStudent = require('../middleware/checkStudent');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware
const validateResult = [
  body('student_id').isInt({ min: 1 }).withMessage('Valid student ID is required'),
  body('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required'),
  body('first_monthly_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('second_monthly_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('midterm_exam_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('third_monthly_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('fourth_monthly_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('final_exam_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('academic_year').notEmpty().withMessage('Academic year is required')
];

// Routes
router.post('/', checkTeacher, validateResult, createOrUpdateResult);
router.put('/', checkTeacher, validateResult, createOrUpdateResult); // Same as POST for upsert
router.get('/student/me/:academicYear', checkStudent, getMyResultsNormalized); // Must come before /:studentId route
router.get('/student/:studentId/:academicYear', checkAdmin, getResultsByStudent);
router.get('/class/:classId/subject/:subjectId/:academicYear', checkTeacher, getResultsByClassAndSubject);

module.exports = router;
