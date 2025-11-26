const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllStudents,
  getStudentsByClassId,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile
} = require('../controllers/studentsController');
const checkAdmin = require('../middleware/checkAdmin');
const checkStudent = require('../middleware/checkStudent');

const router = express.Router();

// Validation middleware
const validateStudent = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('middle_name').optional(),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('class_id').isInt({ min: 1 }).withMessage('Valid class ID is required'),
  body('date_of_birth').optional().isISO8601().withMessage('Please provide a valid date of birth'),
  body('parent_name').notEmpty().withMessage('Parent name is required'),
  body('parent_phone').optional(),
  body('parent_email').optional().isEmail().withMessage('Please provide a valid parent email')
];

const validateStudentUpdate = [
  body('class_id').isInt({ min: 1 }).withMessage('Valid class ID is required'),
  body('date_of_birth').optional().isISO8601().withMessage('Please provide a valid date of birth'),
  body('parent_name').notEmpty().withMessage('Parent name is required'),
  body('parent_phone').optional(),
  body('parent_email').optional().isEmail().withMessage('Please provide a valid parent email')
];

// Routes - all protected with admin middleware
router.get('/me', checkStudent, getMyProfile); // Must come before /:id to avoid routing issues
router.get('/', checkAdmin, getAllStudents);
router.get('/class/:classId', checkAdmin, [param('classId').isInt({ min: 1 }).withMessage('Invalid class ID')], getStudentsByClassId);
router.get('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')], getStudentById);
router.post('/', checkAdmin, validateStudent, createStudent);
router.put('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid student ID'), ...validateStudentUpdate], updateStudent);
router.delete('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')], deleteStudent);

module.exports = router;
