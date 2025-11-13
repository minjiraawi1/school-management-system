const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllAssignments,
  getAssignmentsByTeacherId,
  getMyAssignments,
  createAssignment,
  deleteAssignment
} = require('../controllers/assignmentsController');
const checkAdmin = require('../middleware/checkAdmin');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();

// Validation middleware
const validateAssignment = [
  body('teacher_id').isInt({ min: 1 }).withMessage('Valid teacher ID is required'),
  body('subject_id').isInt({ min: 1 }).withMessage('Valid subject ID is required'),
  body('class_id').isInt({ min: 1 }).withMessage('Valid class ID is required'),
  body('academic_year').notEmpty().withMessage('Academic year is required')
];

// Routes
router.get('/', checkAdmin, getAllAssignments); // Admin only
router.get('/teacher/me', checkAuth, getMyAssignments); // Any authenticated teacher (must come before /:teacherId)
router.get('/teacher/:teacherId', checkAdmin, [param('teacherId').isInt({ min: 1 }).withMessage('Invalid teacher ID')], getAssignmentsByTeacherId); // Admin only
router.post('/', checkAdmin, validateAssignment, createAssignment); // Admin only
router.delete('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid assignment ID')], deleteAssignment); // Admin only

module.exports = router;
