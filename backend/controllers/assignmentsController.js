const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all teacher assignments (pagination-ready)
const getAllAssignments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10) || 20, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM teacher_assignments');
    const total = totalResult.rows[0].total;

    const dataResult = await pool.query(`
      SELECT ta.id, ta.assigned_date, ta.academic_year,
             t.id as teacher_id, t.employee_id, t.specialization,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             s.id as subject_id, s.name as subject_name, s.code as subject_code,
             c.id as class_id, c.name as class_name, c.grade_level
      FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN subjects s ON ta.subject_id = s.id
      JOIN classes c ON ta.class_id = c.id
      ORDER BY ta.academic_year DESC, u.last_name, u.first_name, c.grade_level, c.name, s.name
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
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get assignments by teacher ID
const getAssignmentsByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const result = await pool.query(`
      SELECT ta.id, ta.assigned_date, ta.academic_year,
             s.id as subject_id, s.name as subject_name, s.code as subject_code,
             c.id as class_id, c.name as class_name, c.grade_level
      FROM teacher_assignments ta
      JOIN subjects s ON ta.subject_id = s.id
      JOIN classes c ON ta.class_id = c.id
      WHERE ta.teacher_id = $1
      ORDER BY ta.academic_year DESC, c.grade_level, c.name, s.name
    `, [teacherId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assignments by teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current teacher's assignments (for logged-in teacher)
const getMyAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id; // This will be the teacher ID from the teachers table
    
    // First get the teacher record from the user ID
    const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }

    const actualTeacherId = teacherResult.rows[0].id;
    
    const result = await pool.query(`
      SELECT ta.id, ta.assigned_date, ta.academic_year,
             s.id as subject_id, s.name as subject_name, s.code as subject_code,
             c.id as class_id, c.name as class_name, c.grade_level
      FROM teacher_assignments ta
      JOIN subjects s ON ta.subject_id = s.id
      JOIN classes c ON ta.class_id = c.id
      WHERE ta.teacher_id = $1
      ORDER BY ta.academic_year DESC, c.grade_level, c.name, s.name
    `, [actualTeacherId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacher_id, subject_id, class_id, academic_year } = req.body;

    const result = await pool.query(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id, academic_year) VALUES ($1, $2, $3, $4) RETURNING *',
      [teacher_id, subject_id, class_id, academic_year]
    );

    res.status(201).json({
      message: 'Teacher assignment created successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'This assignment already exists' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid teacher, subject, or class ID' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM teacher_assignments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Teacher assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllAssignments,
  getAssignmentsByTeacherId,
  getMyAssignments,
  createAssignment,
  deleteAssignment
};
