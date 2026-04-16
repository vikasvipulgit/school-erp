import { adminAuth } from '../lib/firebase.js';

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * Attaches `req.user` with { uid, email, role } on success.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.split('Bearer ')[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role ?? 'student', // custom claim set via setCustomUserClaims
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
