export function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword || req.query?.adminPassword;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }
  next();
}
