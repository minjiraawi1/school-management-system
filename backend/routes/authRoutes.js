const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Role must be admin, teacher, or student'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
];

const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

module.exports = router;