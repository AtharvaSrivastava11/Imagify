// middleware/auth.js
import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  try {
    // ✅ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
    }

    // ✅ Extract token
    const token = authHeader.split(' ')[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Invalid Token' });
    }

    // ✅ Make sure req.body exists and attach userId
    req.body = req.body || {};
    req.body.userId = decoded.id;

    // ✅ Proceed to next middleware or controller
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: error.message || 'Unauthorized' });
  }
};

export default userAuth;
