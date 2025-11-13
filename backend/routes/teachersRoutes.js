const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teachersController');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware
const validateTeacher = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('specialization').optional(),
  body('qualification').optional(),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
  body('hire_date').optional().isISO8601().withMessage('Please provide a valid hire date')
];

const validateTeacherUpdate = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('specialization').optional(),
  body('qualification').optional(),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
  body('hire_date').optional().isISO8601().withMessage('Please provide a valid hire date')
];

// Routes - all protected with admin middleware
router.get('/', checkAdmin, getAllTeachers);
router.get('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid teacher ID')], getTeacherById);
router.post('/', checkAdmin, validateTeacher, createTeacher);
router.put('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid teacher ID'), ...validateTeacherUpdate], updateTeacher);
router.delete('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid teacher ID')], deleteTeacher);

module.exports = router;
