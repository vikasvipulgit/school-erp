import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { db } from '../lib/firebase.js';

const router = Router();

// Admin and teachers can view fees; students/parents can view their own
router.get('/', authenticate, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const snapshot = await db.collection('fees').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Students/parents can fetch their own fee record
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('fees')
      .where('studentUid', '==', req.user.uid)
      .get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Only admin can create or update fee records
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const ref = await db.collection('fees').add(req.body);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await db.collection('fees').doc(req.params.id).set(req.body, { merge: true });
    res.json({ id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
