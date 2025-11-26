const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all subjects (pagination-ready)
const getAllSubjects = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10) || 20, 1);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM subjects');
    const total = totalResult.rows[0].total;

    const dataResult = await pool.query(
      'SELECT * FROM subjects ORDER BY name LIMIT $1 OFFSET $2',
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
    console.error('Get subjects error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create new subject
const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, code, description } = req.body;

    const result = await pool.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING *',
      [name, code, description]
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint && error.constraint.includes('subjects_code')) {
        res.status(400).json({ success: false, error: 'Subject code already exists' });
      } else if (error.constraint && error.constraint.includes('subjects_name')) {
        res.status(400).json({ success: false, error: 'Subject name already exists' });
      } else {
        res.status(400).json({ success: false, error: 'Duplicate subject detected' });
      }
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { name, code, description } = req.body;

    const result = await pool.query(
      'UPDATE subjects SET name = $1, code = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, code, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update subject error:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint && error.constraint.includes('subjects_code')) {
        res.status(400).json({ success: false, error: 'Subject code already exists' });
      } else if (error.constraint && error.constraint.includes('subjects_name')) {
        res.status(400).json({ success: false, error: 'Subject name already exists' });
      } else {
        res.status(400).json({ success: false, error: 'Duplicate subject detected' });
      }
    } else {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
