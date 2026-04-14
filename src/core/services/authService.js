import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

export const authService = {
  login: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  logout: async () => {
    await signOut(auth);
  },

  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};
