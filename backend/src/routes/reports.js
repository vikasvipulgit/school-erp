import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { db } from '../lib/firebase.js';

const router = Router();

// Only admin and teachers can access reports
router.get('/', authenticate, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const snapshot = await db.collection('reports').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const ref = await db.collection('reports').add(req.body);
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

export default router;
