import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeMinLevel, authorize } from '../middleware/roles.js';
import { db } from '../lib/firebase.js';

const router = Router();

// All school members can view the timetable
router.get('/', authenticate, authorizeMinLevel('student'), async (req, res, next) => {
  try {
    const snapshot = await db.collection('timetable').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Only admin can modify timetable
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const ref = await db.collection('timetable').add(req.body);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await db.collection('timetable').doc(req.params.id).set(req.body, { merge: true });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await db.collection('timetable').doc(req.params.id).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
