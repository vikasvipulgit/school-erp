import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { adminAuth } from '../lib/firebase.js';

const router = Router();

/**
 * POST /api/users/:uid/role
 * Admin-only: assign a custom claim role to a user.
 * Body: { role: 'admin' | 'teacher' | 'student' | 'parent' }
 */
router.post('/:uid/role', authenticate, authorize('admin'), async (req, res, next) => {
  const VALID_ROLES = ['admin', 'teacher', 'student', 'parent'];
  const { role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }

  try {
    await adminAuth.setCustomUserClaims(req.params.uid, { role });
    res.json({ uid: req.params.uid, role });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/me
 * Returns the current user's profile and role.
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email, role: req.user.role });
});

export default router;
