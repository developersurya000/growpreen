// middleware/authAdminCookie.js
import jwt from 'jsonwebtoken';

export default function authAdminCookie(req, res, next) {
  // use gp_admin_token (matches what browser sends)
  const token = req.cookies.gp_admin_token;
  if (!token) return res.status(401).json({ message: 'Admin not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // or ADMIN_JWT_SECRET if you used that
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not an admin' });
    }
    req.admin = { mobile: decoded.mobile };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid admin token' });
  }
}
