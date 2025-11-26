const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { registerUser } = require('./authController');

// Get all teachers with user info (pagination-ready)
const getAllTeachers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10) || 20, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM teachers');
    const total = totalResult.rows[0].total;

    const dataResult = await pool.query(`
      SELECT t.id, t.employee_id, t.specialization, t.qualification, t.experience_years, t.hire_date,
             u.username, u.email, u.first_name, u.last_name, u.role, u.created_at as user_created_at
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.last_name, u.first_name
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT t.id, t.employee_id, t.specialization, t.qualification, t.experience_years, t.hire_date,
             u.username, u.email, u.first_name, u.last_name, u.role, u.created_at as user_created_at
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get teacher by ID error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create new teacher (with user account)
const createTeacher = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password, email, first_name, last_name, employee_id, specialization, qualification, experience_years, hire_date } = req.body;

    await client.query('BEGIN');

    // First create user account
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (username, password, role, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [username, hashedPassword, 'teacher', email, first_name, last_name]
    );

    const userId = userResult.rows[0].id;

    // Then create teacher record
    const teacherResult = await client.query(
      'INSERT INTO teachers (user_id, employee_id, specialization, qualification, experience_years, hire_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, employee_id, specialization, qualification, experience_years, hire_date]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacherResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create teacher error:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('employee_id')) {
        res.status(400).json({ success: false, error: 'Employee ID already exists' });
      } else {
        res.status(400).json({ success: false, error: 'Username or email already exists' });
      }
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } finally {
    client.release();
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { employee_id, specialization, qualification, experience_years, hire_date } = req.body;

    const result = await pool.query(
      'UPDATE teachers SET employee_id = $1, specialization = $2, qualification = $3, experience_years = $4, hire_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [employee_id, specialization, qualification, experience_years, hire_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ success: false, error: 'Employee ID already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get user_id first
    const teacherResult = await client.query('SELECT user_id FROM teachers WHERE id = $1', [id]);
    
    if (teacherResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    const userId = teacherResult.rows[0].user_id;

    // Delete teacher record first (foreign key constraint)
    await client.query('DELETE FROM teachers WHERE id = $1', [id]);

    // Then delete user account
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
