import { auth, db } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export const authService = {
  /**
   * Register a new user.
   * 1. Creates the Firebase Auth account.
   * 2. Sets the displayName on the auth profile.
   * 3. Writes a user document to Firestore `users/{uid}`.
   */
  signup: async (name, email, password, role) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update displayName in Firebase Auth
    await updateProfile(user, { displayName: name });

    // Write user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      role,
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
