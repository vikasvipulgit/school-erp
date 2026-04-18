import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const TIMETABLE_DOC_PATH = ['timetables', 'published'];

export async function saveTimetableToDb(gridsByClass) {
  await setDoc(doc(db, ...TIMETABLE_DOC_PATH), {
    grids: gridsByClass,
    publishedAt: serverTimestamp(),
  });
}

export async function loadTimetableFromDb() {
  try {
    const snap = await getDoc(doc(db, ...TIMETABLE_DOC_PATH));
    if (snap.exists()) return snap.data().grids || {};
    return null;
  } catch {
    return null;
  }
}
