const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all results (for admin dashboard)
const getAllResults = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM results');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create or update result
const createOrUpdateResult = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
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
      // Update existing result - set is_approved to false when teacher updates
      result = await client.query(
        `UPDATE results 
         SET first_monthly_score = $1, second_monthly_score = $2, midterm_exam_score = $3, 
             third_monthly_score = $4, fourth_monthly_score = $5, final_exam_score = $6, 
             is_approved = FALSE, approved_by = NULL, approved_at = NULL,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $7 
         RETURNING *`,
        [first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, existingResult.rows[0].id]
      );
    } else {
      // Create new result - default is_approved to false
      result = await client.query(
        `INSERT INTO results (student_id, subject_id, teacher_id, first_monthly_score, second_monthly_score, 
          midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE) 
         RETURNING *`,
        [student_id, subject_id, teacherId, first_monthly_score, second_monthly_score, midterm_exam_score, third_monthly_score, fourth_monthly_score, final_exam_score, academic_year]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: existingResult.rows.length > 0 ? 'Result updated successfully' : 'Result created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create/Update result error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get results by student error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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
        r.term_2_total,
        r.is_approved
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

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get results by class and subject error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get normalized results for logged-in student
const getMyResultsNormalized = async (req, res) => {
  try {
    let academicYear = req.params.academicYear || req.query.academicYear;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = req.user.id;

    // Get the actual student ID from the students table
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    
    if (studentResult.rows.length === 0) {
      console.log(`⚠️  No student profile found for user ID: ${userId}`);
      // Return empty results if student profile doesn't exist yet
      return res.json({
        success: true,
        data: {
          student_id: userId,
          academic_year: academicYear || '',
          term_1_grand_total: 0,
          term_2_grand_total: 0,
          annual_grand_total: 0,
          annual_average: 0,
          subjects: [],
        }
      });
    }

    const studentId = studentResult.rows[0].id;

    // If no academic year provided or it doesn't contain '-', try to find any available results
    if (!academicYear || !academicYear.includes('-')) {
      // Get the most recent academic year with approved results for this student
      const availableYears = await pool.query(
        `SELECT DISTINCT academic_year FROM results 
         WHERE student_id = $1 AND is_approved = TRUE 
         ORDER BY academic_year DESC LIMIT 1`,
        [studentId]
      );
      
      if (availableYears.rows.length > 0) {
        academicYear = availableYears.rows[0].academic_year;
        console.log(`📅 Auto-selected academic year: ${academicYear}`);
      } else {
        // No approved results found, return empty
        return res.json({
          success: true,
          data: {
            student_id: studentId,
            academic_year: academicYear || '',
            term_1_grand_total: 0,
            term_2_grand_total: 0,
            annual_grand_total: 0,
            annual_average: 0,
            subjects: [],
          }
        });
      }
    }

    console.log(`📊 Fetching results for student_id=${studentId}, academic_year=${academicYear}`);

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
         r.term_2_total,
         r.is_approved
       FROM results r
       JOIN subjects s ON r.subject_id = s.id
       WHERE r.student_id = $1 AND r.academic_year = $2 AND r.is_approved = TRUE
       ORDER BY s.name`,
      [studentId, academicYear]
    );

    console.log(`✅ Found ${rows.rows.length} subject(s) with approved results`);

    // If no results found, log available academic years
    if (rows.rows.length === 0) {
      console.warn(`⚠️  No approved results found for student ${studentId} in academic year ${academicYear}`);
      const availableYears = await pool.query(
        `SELECT DISTINCT academic_year, is_approved FROM results WHERE student_id = $1 ORDER BY academic_year DESC`,
        [studentId]
      );
      if (availableYears.rows.length > 0) {
        console.log(`📅 Available results:`, availableYears.rows);
      } else {
        console.warn(`⚠️  No results exist for this student in any academic year`);
      }
    }

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
      success: true,
      data: {
        student_id: studentId,
        academic_year: academicYear,
        term_1_grand_total,
        term_2_grand_total,
        annual_grand_total,
        annual_average,
        subjects,
      }
    });
  } catch (error) {
    console.error('❌ Get my results normalized error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get pending approvals (admin only)
const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.is_approved,
        r.created_at,
        r.updated_at,
        st.id AS student_id,
        u_student.first_name AS student_first_name,
        u_student.last_name AS student_last_name,
        u_student.email AS student_email,
        s.name AS subject_name,
        s.code AS subject_code,
        t.id AS teacher_id,
        u_teacher.first_name AS teacher_first_name,
        u_teacher.last_name AS teacher_last_name,
        r.first_monthly_score,
        r.second_monthly_score,
        r.midterm_exam_score,
        r.third_monthly_score,
        r.fourth_monthly_score,
        r.final_exam_score,
        r.term_1_total,
        r.term_2_total,
        r.academic_year
      FROM results r
      JOIN students st ON r.student_id = st.id
      JOIN users u_student ON st.user_id = u_student.id
      JOIN subjects s ON r.subject_id = s.id
      JOIN teachers t ON r.teacher_id = t.id
      JOIN users u_teacher ON t.user_id = u_teacher.id
      WHERE r.is_approved = FALSE
      ORDER BY r.created_at DESC
    `);
    
    res.json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length 
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Approve results (admin only)
const approveResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE results 
       SET is_approved = TRUE, approved_by = $1, approved_at = CURRENT_TIMESTAMP, approval_notes = $2
       WHERE id = $3
       RETURNING *`,
      [adminId, notes || null, resultId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Result not found' });
    }

    res.json({
      success: true,
      message: 'Result approved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Approve result error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Reject results (admin only)
const rejectResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      `UPDATE results 
       SET is_approved = FALSE, approval_notes = $1
       WHERE id = $2
       RETURNING *`,
      [notes || 'Rejected by admin', resultId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Result not found' });
    }

    res.json({
      success: true,
      message: 'Result rejected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Reject result error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get available academic years for logged-in student
const getMyAcademicYears = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = req.user.id;

    // Get the actual student ID from the students table
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    
    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const studentId = studentResult.rows[0].id;

    // Get all academic years with approved results for this student
    const years = await pool.query(
      `SELECT DISTINCT academic_year FROM results 
       WHERE student_id = $1 AND is_approved = TRUE 
       ORDER BY academic_year DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: years.rows.map(r => r.academic_year)
    });
  } catch (error) {
    console.error('Get my academic years error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllResults,
  createOrUpdateResult,
  getResultsByStudent,
  getResultsByClassAndSubject,
  getMyResultsNormalized,
  getPendingApprovals,
  approveResult,
  rejectResult,
  getMyAcademicYears
};
