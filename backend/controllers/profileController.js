const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let profileData = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      role: req.user.role
    };

    // Get additional profile data based on role
    if (role === 'teacher') {
      const teacherResult = await pool.query(
        'SELECT employee_id, specialization, qualification, experience_years, hire_date FROM teachers WHERE user_id = $1',
        [userId]
      );
      if (teacherResult.rows.length > 0) {
        profileData.teacher_info = teacherResult.rows[0];
      }
    } else if (role === 'student') {
      const studentResult = await pool.query(
        `SELECT s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.class_id, c.name as class_name
         FROM students s
         LEFT JOIN classes c ON s.class_id = c.id
         WHERE s.user_id = $1`,
        [userId]
      );
      if (studentResult.rows.length > 0) {
        profileData.student_info = studentResult.rows[0];
      }
    }

    res.json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// Update admin profile (full edit)
const updateAdminProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { email, first_name, last_name, current_password, new_password } = req.body;

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password);
      
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);

      await pool.query(
        'UPDATE users SET email = $1, first_name = $2, last_name = $3, password = $4 WHERE id = $5',
        [email, first_name, last_name, hashedPassword, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET email = $1, first_name = $2, last_name = $3 WHERE id = $4',
        [email, first_name, last_name, userId]
      );
    }

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

// Update password only (for teachers and students)
const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    // Validate all fields are provided
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    // Check if new passwords match
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Check minimum password length
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSame = await bcrypt.compare(new_password, userResult.rows[0].password);
    if (isSame) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error while updating password' });
  }
};

module.exports = {
  getProfile,
  updateAdminProfile,
  updatePassword
};
