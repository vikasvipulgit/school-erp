import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/core/services/authService';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profile = snap.exists() ? snap.data() : {};
          setUserProfile(profile);
          setUser(firebaseUser);
        } catch {
          setUserProfile({});
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const role = userProfile?.role || 'teacher';
  const teacherId = userProfile?.teacherId || null;

  const isAdmin        = role === 'admin' || role === 'administrator';
  const isPrincipal    = role === 'principal';
  const isCoordinator  = role === 'coordinator';
  const isTeacher      = role === 'teacher';
  const canManageTasks = isAdmin || isPrincipal;
  const canManageTimetable = isAdmin || isCoordinator;
  const canApproveLeave    = isAdmin || isPrincipal;

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      role,
      teacherId,
      loading,
      isAdmin,
      isPrincipal,
      isCoordinator,
      isTeacher,
      canManageTasks,
      canManageTimetable,
      canApproveLeave,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
