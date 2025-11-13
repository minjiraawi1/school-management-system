const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectsController');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware
const validateSubject = [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('code').notEmpty().withMessage('Subject code is required'),
  body('description').optional()
];

// Routes - all protected with admin middleware
router.get('/', checkAdmin, getAllSubjects);
router.get('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid subject ID')], getSubjectById);
router.post('/', checkAdmin, validateSubject, createSubject);
router.put('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid subject ID'), ...validateSubject], updateSubject);
router.delete('/:id', checkAdmin, [param('id').isInt({ min: 1 }).withMessage('Invalid subject ID')], deleteSubject);

module.exports = router;
