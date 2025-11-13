const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const checkStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const userResult = await pool.query(
      'SELECT id, username, role, email, first_name, last_name FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Token is not valid' })
    }

    const user = userResult.rows[0]
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Access denied. Student role required.' })
    }

    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [user.id])
    
    req.user = user
    // Set studentId if student profile exists, otherwise use user id as fallback
    req.studentId = studentResult.rows.length > 0 ? studentResult.rows[0].id : user.id
    next()
  } catch (error) {
    console.error('Student auth middleware error:', error)
    res.status(401).json({ error: 'Token is not valid' })
  }
}

module.exports = checkStudent

