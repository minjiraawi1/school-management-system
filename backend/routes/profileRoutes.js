const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateAdminProfile, updatePassword } = require('../controllers/profileController');
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Validation middleware for admin profile update
const validateAdminUpdate = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('new_password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validation middleware for password update
const validatePasswordUpdate = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirm_password').notEmpty().withMessage('Confirm password is required')
];

// Routes
// Get current user profile (all roles)
router.get('/me', checkAuth, getProfile);

// Update admin profile (admin only - full edit)
router.put('/admin', checkAuth, checkAdmin, validateAdminUpdate, updateAdminProfile);

// Update password (all roles - teachers and students use this)
router.put('/password', checkAuth, validatePasswordUpdate, updatePassword);

module.exports = router;
