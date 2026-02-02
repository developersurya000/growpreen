// middleware/authUserCookie.js
import jwt from 'jsonwebtoken';

export default function authUserCookie(req, res, next) {
  const token = req.cookies.gp_token;
  if (!token) return res.status(401).json({ message: 'No auth cookie' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, mobile: decoded.mobile };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid auth cookie' });
  }
}
