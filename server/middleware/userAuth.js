import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mac_miller_jwt_secret_2026';

export function userAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
