import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeMinLevel, authorize } from '../middleware/roles.js';
import { db } from '../lib/firebase.js';

const router = Router();

// All authenticated users can see tasks assigned to them
router.get('/', authenticate, authorizeMinLevel('student'), async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('tasks')
      .where('assignedTo', 'array-contains', req.user.uid)
      .get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Teachers and admin can create tasks
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    const task = { ...req.body, createdBy: req.user.uid, createdAt: new Date().toISOString() };
    const ref = await db.collection('tasks').add(task);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res, next) => {
  try {
    await db.collection('tasks').doc(req.params.id).set(req.body, { merge: true });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await db.collection('tasks').doc(req.params.id).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
