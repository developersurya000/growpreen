// routes/adminAuth.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/admin-auth/login
router.post('/login', (req, res) => {
  const { mobile, password } = req.body;

  if (
    mobile !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', mobile },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '24h' }                  // 24 hours
  );

  res.cookie('gp_admin_token', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,          // 24 hours
    path: '/',
  });

  res.json({ success: true });
});

// GET /api/admin-auth/me
router.get('/me', (req, res) => {
  const token = req.cookies.gp_admin_token;
  if (!token) return res.status(401).json({ message: 'No admin cookie' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not admin' });
    }
    res.json({ mobile: decoded.mobile });
  } catch {
    res.status(401).json({ message: 'Invalid admin token' });
  }
});

// POST /api/admin-auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('gp_admin_token', { path: '/' });
  res.json({ success: true });
});

export default router;
