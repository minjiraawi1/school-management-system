const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all classes (pagination-ready)
const getAllClasses = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10) || 20, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM classes');
    const total = totalResult.rows[0].total;

    const dataResult = await pool.query(
      'SELECT * FROM classes ORDER BY grade_level, name LIMIT $1 OFFSET $2',
      [limit, offset]
    );

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
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, grade_level, academic_year } = req.body;

    const result = await pool.query(
      'INSERT INTO classes (name, grade_level, academic_year) VALUES ($1, $2, $3) RETURNING *',
      [name, grade_level, academic_year]
    );

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create class error:', error);
    if (error.code === '23505') {
      res.status(400).json({ success: false, error: 'Class already exists for academic year' });
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { name, grade_level, academic_year } = req.body;

    const result = await pool.query(
      'UPDATE classes SET name = $1, grade_level = $2, academic_year = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, grade_level, academic_year, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update class error:', error);
    if (error.code === '23505') {
      res.status(400).json({ success: false, error: 'Class already exists for academic year' });
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
