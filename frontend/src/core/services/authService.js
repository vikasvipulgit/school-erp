import { auth, db } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import teachersData from '@/data/teachers.json'

export const authService = {
  signup: async (name, email, password, role) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    // Auto-link teacher accounts: match by email first, then by name
    let teacherId = null;
    if (role === 'teacher') {
      const record = teachersData.find(
        (t) => t.email.toLowerCase() === email.toLowerCase() ||
               t.name.toLowerCase() === name.trim().toLowerCase()
      );
      teacherId = record?.id || null;
    }

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      role,
      ...(teacherId ? { teacherId } : {}),
      createdAt: serverTimestamp(),
    });

    return user;
  },

  login: async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  },

  logout: async () => {
    await signOut(auth);
  },

  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};
