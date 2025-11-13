const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { registerUser } = require('./authController');

// Get all students with user info and class info (pagination-ready)
const getAllStudents = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10) || 20, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM students');
    const total = totalResult.rows[0].total;

    const dataResult = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email, s.enrollment_date,
             u.username, u.email, u.first_name, u.last_name, u.role, u.created_at as user_created_at,
             c.name as class_name, c.grade_level, c.academic_year
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.grade_level, c.name, u.last_name, u.first_name
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get students by class ID
const getStudentsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email,
             u.first_name, u.last_name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = $1
      ORDER BY u.last_name, u.first_name
    `, [classId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email, s.enrollment_date,
             u.username, u.email, u.first_name, u.last_name, u.role, u.created_at as user_created_at,
             c.name as class_name, c.grade_level, c.academic_year, c.id as class_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new student (with user account)
const createStudent = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, first_name, middle_name, last_name, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email } = req.body;

    await client.query('BEGIN');

    // First create user account
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (username, password, role, email, first_name, middle_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [username, hashedPassword, 'student', username + '@school.local', first_name, middle_name || null, last_name]
    );

    const userId = userResult.rows[0].id;

    // Then create student record
    const studentResult = await client.query(
      'INSERT INTO students (user_id, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Student created successfully',
      student: studentResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create student error:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('student_id')) {
        res.status(400).json({ error: 'Student ID already exists' });
      } else {
        res.status(400).json({ error: 'Username or email already exists' });
      }
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid class ID' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  } finally {
    client.release();
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email } = req.body;

    const result = await pool.query(
      'UPDATE students SET student_id = $1, class_id = $2, date_of_birth = $3, parent_name = $4, parent_phone = $5, parent_email = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Update student error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Student ID already exists' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid class ID' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get user_id first
    const studentResult = await client.query('SELECT user_id FROM students WHERE id = $1', [id]);
    
    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student not found' });
    }

    const userId = studentResult.rows[0].user_id;

    // Delete student record first (foreign key constraint)
    await client.query('DELETE FROM students WHERE id = $1', [id]);

    // Then delete user account
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllStudents,
  getStudentsByClassId,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
