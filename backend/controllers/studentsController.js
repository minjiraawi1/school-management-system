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
             u.username, u.email, u.first_name, u.middle_name, u.last_name, u.role, u.created_at as user_created_at,
             c.name as class_name, c.grade_level, c.academic_year, s.class_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.grade_level, c.name, u.last_name, u.first_name
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
    console.error('Get students error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get students by class ID
const getStudentsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email, s.class_id,
             u.username, u.first_name, u.middle_name, u.last_name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = $1
      ORDER BY u.last_name, u.first_name
    `, [classId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email, s.enrollment_date,
             u.username, u.email, u.first_name, u.middle_name, u.last_name, u.role, u.created_at as user_created_at,
             c.name as class_name, c.grade_level, c.academic_year, c.id as class_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create new student (with user account)
const createStudent = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { password, first_name, middle_name, last_name, class_id, date_of_birth, parent_name, parent_phone, parent_email } = req.body;

    await client.query('BEGIN');

    // Auto-generate student_id starting from ST1000
    let nextNumber = 1000;
    
    // Get the highest existing student_id that starts with ST
    try {
      const maxIdResult = await client.query(`
        SELECT student_id FROM students 
        WHERE student_id LIKE 'ST%'
        ORDER BY CAST(SUBSTRING(student_id FROM 3) AS INTEGER) DESC 
        LIMIT 1
      `);
      
      if (maxIdResult.rows.length > 0) {
        const lastId = maxIdResult.rows[0].student_id;
        const numberPart = lastId.substring(2);
        const parsedNum = parseInt(numberPart);
        if (!isNaN(parsedNum)) {
          nextNumber = parsedNum + 1;
        }
      }
    } catch (queryError) {
      console.log('Note: Could not query existing student IDs, starting from ST1000');
    }
    
    const student_id = `ST${nextNumber}`;
    const username = student_id; // Username same as student_id

    // Create user account
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (username, password, role, email, first_name, middle_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [username, hashedPassword, 'student', username + '@school.local', first_name, middle_name || null, last_name]
    );

    const userId = userResult.rows[0].id;

    // Create student record
    const studentResult = await client.query(
      'INSERT INTO students (user_id, student_id, class_id, date_of_birth, parent_name, parent_phone, parent_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, student_id, class_id, date_of_birth || null, parent_name, parent_phone || null, parent_email || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create student error:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint && error.constraint.includes('student_id')) {
        res.status(400).json({ success: false, error: 'Student ID already exists' });
      } else {
        res.status(400).json({ success: false, error: 'Username or email already exists' });
      }
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ success: false, error: 'Invalid class ID' });
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } finally {
    client.release();
  }
};

// Update student
const updateStudent = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { first_name, middle_name, last_name, class_id, date_of_birth, parent_name, parent_phone, parent_email, password } = req.body;

    await client.query('BEGIN');

    // Get user_id for this student
    const studentResult = await client.query('SELECT user_id FROM students WHERE id = $1', [id]);
    
    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const userId = studentResult.rows[0].user_id;

    // Update user information (first_name, middle_name, last_name, and optionally password)
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await client.query(
        'UPDATE users SET first_name = $1, middle_name = $2, last_name = $3, password = $4 WHERE id = $5',
        [first_name, middle_name || null, last_name, hashedPassword, userId]
      );
    } else {
      await client.query(
        'UPDATE users SET first_name = $1, middle_name = $2, last_name = $3 WHERE id = $4',
        [first_name, middle_name || null, last_name, userId]
      );
    }

    // Update student record (excluding student_id and username as they are read-only)
    const result = await client.query(
      'UPDATE students SET class_id = $1, date_of_birth = $2, parent_name = $3, parent_phone = $4, parent_email = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [class_id, date_of_birth, parent_name, parent_phone, parent_email, id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update student error:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ success: false, error: 'Invalid class ID' });
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } finally {
    client.release();
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
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const userId = studentResult.rows[0].user_id;

    // Delete student record first (foreign key constraint)
    await client.query('DELETE FROM students WHERE id = $1', [id]);

    // Then delete user account
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    client.release();
  }
};

// Get current authenticated student's own profile
const getMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const result = await pool.query(`
      SELECT s.id, s.student_id, s.date_of_birth, s.parent_name, s.parent_phone, s.parent_email, s.enrollment_date,
             u.username, u.email, u.first_name, u.middle_name, u.last_name, u.role,
             c.name as class_name, c.grade_level, c.academic_year, c.id as class_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE u.id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllStudents,
  getStudentsByClassId,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile
};
