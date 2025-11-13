const checkAuth = require('./checkAuth');

// Verify admin role
const checkAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await new Promise((resolve, reject) => {
      checkAuth(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Then check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkAdmin;