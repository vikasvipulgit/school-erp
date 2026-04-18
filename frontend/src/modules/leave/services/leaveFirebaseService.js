import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const LEAVE_COL = 'leaveApplications';
const PROXY_COL = 'proxyAssignments';

export async function submitLeaveApplication(data) {
  const ref = await addDoc(collection(db, LEAVE_COL), {
    ...data,
    status: 'pending',
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getLeaveApplications() {
  const snap = await getDocs(collection(db, LEAVE_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
}

export async function getLeaveApplicationsForTeacher(teacherId) {
  const snap = await getDocs(
    query(collection(db, LEAVE_COL), where('teacherId', '==', teacherId))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
}

export async function approveLeave(leaveId, approvedBy) {
  await updateDoc(doc(db, LEAVE_COL, leaveId), {
    status: 'approved',
    approvedBy,
    approvedAt: serverTimestamp(),
  });
}

export async function rejectLeave(leaveId, approvedBy, remarks) {
  await updateDoc(doc(db, LEAVE_COL, leaveId), {
    status: 'rejected',
    approvedBy,
    remarks,
    approvedAt: serverTimestamp(),
  });
}

export async function createProxyAssignment(data) {
  const ref = await addDoc(collection(db, PROXY_COL), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getProxyAssignments() {
  const snap = await getDocs(
    query(collection(db, PROXY_COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function approveProxy(proxyId, approvedBy) {
  await updateDoc(doc(db, PROXY_COL, proxyId), {
    status: 'approved',
    approvedBy,
    approvedAt: serverTimestamp(),
  });
}

export async function rejectProxy(proxyId, approvedBy) {
  await updateDoc(doc(db, PROXY_COL, proxyId), {
    status: 'rejected',
    approvedBy,
    approvedAt: serverTimestamp(),
  });
}
