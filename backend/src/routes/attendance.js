import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeMinLevel } from '../middleware/roles.js';
import { db } from '../lib/firebase.js';

const router = Router();

// Teachers and above can view attendance
router.get('/', authenticate, authorizeMinLevel('teacher'), async (req, res, next) => {
  try {
    const snapshot = await db.collection('attendance').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Only teachers and admin can mark attendance
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    const record = { ...req.body, markedBy: req.user.uid, markedAt: new Date().toISOString() };
    const ref = await db.collection('attendance').add(record);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    await db.collection('attendance').doc(req.params.id).set(req.body, { merge: true });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
