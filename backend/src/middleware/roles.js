/**
 * Role hierarchy for the school ERP.
 * Higher index = more permissions.
 */
const ROLE_LEVELS = {
  student: 0,
  parent: 1,
  teacher: 2,
  admin: 3,
};

/**
 * Returns middleware that allows only users whose role is in `allowedRoles`.
 *
 * Usage:
 *   router.get('/fees', authenticate, authorize('admin', 'teacher'), handler)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}

/**
 * Returns middleware that allows users at or above a minimum role level.
 *
 * Usage:
 *   router.get('/reports', authenticate, authorizeMinLevel('teacher'), handler)
 */
export function authorizeMinLevel(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const userLevel = ROLE_LEVELS[req.user.role] ?? -1;
    const requiredLevel = ROLE_LEVELS[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `Access denied. Minimum required role: ${minRole}`,
      });
    }

    next();
  };
}
