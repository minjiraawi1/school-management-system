const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classesController');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware
const validateClass = [
  body('name').notEmpty().withMessage('Class name is required'),
  body('grade_level').isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
  body('academic_year').notEmpty().withMessage('Academic year is required')
];

// Routes - all protected with admin middleware
router.get('/', checkAdmin, getAllClasses);
router.get('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid class ID')], getClassById);
router.post('/', checkAdmin, validateClass, createClass);
router.put('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid class ID'), ...validateClass], updateClass);
router.delete('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid class ID')], deleteClass);

module.exports = router;
