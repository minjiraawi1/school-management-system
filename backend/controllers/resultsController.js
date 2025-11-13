const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Create or update result
const createOrUpdateResult = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, subject_id, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year } = req.body;
    const teacherId = req.teacherId;

    await client.query('BEGIN');

    // Check if result already exists for this student, subject, and academic year
    const existingResult = await client.query(
      'SELECT id FROM results WHERE student_id = $1 AND subject_id = $2 AND academic_year = $3',
      [student_id, subject_id, academic_year]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing result
      result = await client.query(
        `UPDATE results 
         SET first_monthly_score = $1, second_monthly_score = $2, midterm_exam_score = $3, 
             third_monthly_score = $4, fourth_monthly_score = $5, final_exam_score = $6, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $7 
         RETURNING *`,
        [first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, existingResult.rows[0].id]
      );
    } else {
      // Create new result
      result = await client.query(
        `INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, 
          midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [student_id, subject_id, teacherId, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: existingResult.rows.length > 0 ? 'Result updated successfully' : 'Result created successfully',
      result: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create/Update result error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Get results by student and academic year
const getResultsByStudent = async (req, res) => {
  try {
    const { studentId, academicYear } = req.params;

    const result = await pool.query(`
      SELECT r.*, s.name as subject_name, s.code as subject_code
      FROM results r
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.student_id = $1 AND r.academic_year = $2
      ORDER BY s.name
    `, [studentId, academicYear]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get results by student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get results by class and subject (for teachers)
const getResultsByClassAndSubject = async (req, res) => {
  try {
    const { classId, subjectId, academicYear } = req.params;
    const teacherId = req.teacherId;

    const result = await pool.query(`
      SELECT
        st.id AS student_id,
        u.first_name,
        u.last_name,
        s.name AS subject_name,
        s.code AS subject_code,
        r.first_monthly_score,
        r.second_monthly_score,
        r.midterm_exam_score,
        r.third_monthly_score,
        r.fourth_monthly_score,
        r.final_exam_score,
        r.term_1_total,
        r.term_2_total
      FROM students st
      JOIN users u ON st.user_id = u.id
      JOIN subjects s ON s.id = $2
      LEFT JOIN results r
        ON r.student_id = st.id
       AND r.subject_id = $2
       AND r.academic_year = $3
       AND r.teacher_id = $4
      WHERE st.class_id = $1
      ORDER BY u.last_name, u.first_name
    `, [classId, subjectId, academicYear, teacherId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get results by class and subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get normalized results for logged-in student
const getMyResultsNormalized = async (req, res) => {
  try {
    const academicYear = req.params.academicYear || req.query.academicYear;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;

    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    // Get the actual student ID from the students table
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    
    if (studentResult.rows.length === 0) {
      console.log(`No student profile found for user ID: ${userId}`);
      // Return empty results if student profile doesn't exist yet
      return res.json({
        student_id: userId,
        academic_year: academicYear,
        term_1_grand_total: 0,
        term_2_grand_total: 0,
        annual_grand_total: 0,
        annual_average: 0,
        subjects: [],
      });
    }

    const studentId = studentResult.rows[0].id;

    const rows = await pool.query(
      `SELECT 
         r.student_id,
         r.subject_id,
         s.name AS subject_name,
         s.code AS subject_code,
         r.first_monthly_score,
         r.second_monthly_score,
         r.midterm_exam_score,
         r.third_monthly_score,
         r.fourth_monthly_score,
         r.final_exam_score,
         r.term_1_total,
         r.term_2_total
       FROM results r
       JOIN subjects s ON r.subject_id = s.id
       WHERE r.student_id = $1 AND r.academic_year = $2
       ORDER BY s.name`,
      [studentId, academicYear]
    );

    const subjects = rows.rows.map((r) => {
      const term1 = Number(r.term_1_total || 0);
      const term2 = Number(r.term_2_total || 0);
      const annualTotal = +(term1 + term2).toFixed(2);
      return {
        subject_id: r.subject_id,
        subject_code: r.subject_code,
        subject_name: r.subject_name,
        scores: {
          first_monthly_score: r.first_monthly_score,
          second_monthly_score: r.second_monthly_score,
          midterm_exam_score: r.midterm_exam_score,
          third_monthly_score: r.third_monthly_score,
          fourth_monthly_score: r.fourth_monthly_score,
          final_exam_score: r.final_exam_score,
        },
        term_1_total: term1,
        term_2_total: term2,
        annual_total: annualTotal,
      };
    });

    const term_1_grand_total = +subjects.reduce((sum, s) => sum + (s.term_1_total || 0), 0).toFixed(2);
    const term_2_grand_total = +subjects.reduce((sum, s) => sum + (s.term_2_total || 0), 0).toFixed(2);
    const annual_grand_total = +subjects.reduce((sum, s) => sum + (s.annual_total || 0), 0).toFixed(2);
    const subjectCount = subjects.length || 1;
    const annual_average = +(
      annual_grand_total / subjectCount
    ).toFixed(2);

    res.json({
      student_id: studentId,
      academic_year: academicYear,
      term_1_grand_total,
      term_2_grand_total,
      annual_grand_total,
      annual_average,
      subjects,
    });
  } catch (error) {
    console.error('Get my results normalized error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createOrUpdateResult,
  getResultsByStudent,
  getResultsByClassAndSubject,
  getMyResultsNormalized
};
