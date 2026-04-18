import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const TASKS_COL = 'tasks';
const ASSIGNMENTS_COL = 'taskAssignments';

export async function createTask(taskData, assignees) {
  const taskRef = await addDoc(collection(db, TASKS_COL), {
    ...taskData,
    createdAt: serverTimestamp(),
    status: 'active',
  });

  const assignments = await Promise.all(
    assignees.map((teacherId) =>
      addDoc(collection(db, ASSIGNMENTS_COL), {
        taskId: taskRef.id,
        teacherId,
        status: 'not_started',
        escalated: false,
        escalationCount: 0,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      })
    )
  );

  return { taskId: taskRef.id, assignmentIds: assignments.map((a) => a.id) };
}

export async function getTasks() {
  const snap = await getDocs(query(collection(db, TASKS_COL), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTask(taskId) {
  const snap = await getDoc(doc(db, TASKS_COL, taskId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAssignmentsForTask(taskId) {
  const snap = await getDocs(
    query(collection(db, ASSIGNMENTS_COL), where('taskId', '==', taskId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAssignmentsForTeacher(teacherId) {
  const snap = await getDocs(
    query(
      collection(db, ASSIGNMENTS_COL),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAssignmentStatus(assignmentId, status) {
  const updates = {
    status,
    lastUpdated: serverTimestamp(),
  };
  if (status === 'in_progress') updates.startedAt = serverTimestamp();
  if (status === 'completed') updates.completedAt = serverTimestamp();

  await updateDoc(doc(db, ASSIGNMENTS_COL, assignmentId), updates);
}

export async function cancelTask(taskId) {
  await updateDoc(doc(db, TASKS_COL, taskId), { status: 'cancelled' });
  const assignments = await getAssignmentsForTask(taskId);
  await Promise.all(
    assignments.map((a) =>
      updateDoc(doc(db, ASSIGNMENTS_COL, a.id), {
        status: 'cancelled',
        lastUpdated: serverTimestamp(),
      })
    )
  );
}

export async function checkAndMarkOverdueTasks() {
  const now = new Date();
  const snap = await getDocs(
    query(collection(db, ASSIGNMENTS_COL), where('status', 'in', ['not_started', 'in_progress']))
  );

  const updates = [];
  for (const d of snap.docs) {
    const data = d.data();
    const task = await getTask(data.taskId);
    if (!task) continue;
    const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    if (dueDate < now) {
      updates.push(
        updateDoc(doc(db, ASSIGNMENTS_COL, d.id), {
          status: 'overdue',
          lastUpdated: serverTimestamp(),
        })
      );
    }
  }
  await Promise.all(updates);
}

export async function getAllAssignmentsWithTasks() {
  const [tasksSnap, assignmentsSnap] = await Promise.all([
    getDocs(query(collection(db, TASKS_COL), orderBy('createdAt', 'desc'))),
    getDocs(collection(db, ASSIGNMENTS_COL)),
  ]);

  const taskMap = Object.fromEntries(tasksSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
  return assignmentsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    task: taskMap[d.data().taskId] || null,
  }));
}
