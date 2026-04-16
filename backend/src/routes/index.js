import { Router } from 'express';
import timetableRoutes from './timetable.js';
import attendanceRoutes from './attendance.js';
import feesRoutes from './fees.js';
import tasksRoutes from './tasks.js';
import reportsRoutes from './reports.js';
import usersRoutes from './users.js';

const router = Router();

router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feesRoutes);
router.use('/tasks', tasksRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', usersRoutes);

export default router;
