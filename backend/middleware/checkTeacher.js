const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verify teacher role and authorization for specific subject/class
const checkTeacher = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    const user = userResult.rows[0];

    // Check if user is teacher
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }

    // Get teacher record
    const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [user.id]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(403).json({ error: 'Teacher profile not found' });
    }

    const teacherId = teacherResult.rows[0].id;

    // For POST/PUT requests, check if teacher is assigned to the subject/class
    if (req.method === 'POST' || req.method === 'PUT') {
      const { subject_id, student_id } = req.body;

      if (!subject_id || !student_id) {
        return res.status(400).json({ error: 'Subject ID and Student ID are required' });
      }

      // Get student's class
      const studentResult = await pool.query('SELECT class_id FROM students WHERE id = $1', [student_id]);
      
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const classId = studentResult.rows[0].class_id;

      // Check if teacher is assigned to this subject and class
      const assignmentResult = await pool.query(
        'SELECT id FROM teacher_assignments WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3',
        [teacherId, subject_id, classId]
      );

      if (assignmentResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'You are not authorized to enter results for this subject and class' 
        });
      }
    }

    // For GET requests for specific result, check if teacher owns that result
    if (req.method === 'GET' && req.params.resultId) {
      const resultResult = await pool.query('SELECT teacher_id FROM results WHERE id = $1', [req.params.resultId]);
      
      if (resultResult.rows.length === 0) {
        return res.status(404).json({ error: 'Result not found' });
      }

      if (resultResult.rows[0].teacher_id !== teacherId) {
        return res.status(403).json({ 
          error: 'You are not authorized to view this result' 
        });
      }
    }

    req.user = user;
    req.teacherId = teacherId;
    next();
  } catch (error) {
    console.error('Teacher auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = checkTeacher;