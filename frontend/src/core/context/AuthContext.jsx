import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authService } from '@/core/services/authService';
import { apiRequest } from '@/core/api/client';
import { requestNotificationPermission } from '@/utils/firebaseNotifications';

const AuthContext = createContext(null);

const ROLE_LEVEL = {
  student: 0, parent: 1, teacher: 2,
  coordinator: 3, principal: 4, admin: 5,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) {
      setUser(stored);
      setUserProfile(stored);
      // Students have a separate DB table — /auth/me only covers the users table.
      // Skip the background refresh for students; the stored login profile is sufficient.
      if (stored.role !== 'student') {
        apiRequest('/auth/me')
          .then((profile) => {
            setUserProfile(profile);
            localStorage.setItem('user_profile', JSON.stringify(profile));
          })
          .catch(() => {});
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      // Small delay to ensure browser is ready
      setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
    }
  }, [user]);

  const login = useCallback((userData) => {
    setUser(userData);
    setUserProfile(userData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
  }, []);

  const role = userProfile?.role || user?.role || null;
  const teacherId = userProfile?.teacherId || user?.teacherId || null;
  const level = ROLE_LEVEL[role] ?? 0;

  const isAdmin       = role === 'admin';
  const isPrincipal   = role === 'principal';
  const isCoordinator = role === 'coordinator';
  const isTeacher     = role === 'teacher';

  const canManageTasks          = level >= ROLE_LEVEL.teacher;
  const canManageTimetable      = level >= ROLE_LEVEL.coordinator;
  const canApproveLeave         = level >= ROLE_LEVEL.coordinator;
  const canApproveProxy         = level >= ROLE_LEVEL.principal;
  const canAssignProxy          = level >= ROLE_LEVEL.coordinator;
  const canViewReports          = level >= ROLE_LEVEL.coordinator;
  const canConfigureMasterData  = level >= ROLE_LEVEL.admin;
  const canManageTimetableSetup = level >= ROLE_LEVEL.admin;
  const canCreateTasks          = level >= ROLE_LEVEL.coordinator;
  const canDeleteTasks          = role === 'admin';

  // Memoize the context value so every consumer (NotificationBell, ClassesContext,
  // AppLayout, etc.) only re-renders when auth state genuinely changes,
  // not on every AuthProvider render.
  const value = useMemo(() => ({
    user,
    userProfile,
    role,
    teacherId,
    loading,
    login,
    logout,
    isAdmin,
    isPrincipal,
    isCoordinator,
    isTeacher,
    canManageTasks,
    canManageTimetable,
    canApproveLeave,
    canApproveProxy,
    canAssignProxy,
    canViewReports,
    canConfigureMasterData,
    canManageTimetableSetup,
    canCreateTasks,
    canDeleteTasks,
  }), [
    user, userProfile, role, teacherId, loading, login, logout,
    isAdmin, isPrincipal, isCoordinator, isTeacher,
    canManageTasks, canManageTimetable, canApproveLeave, canApproveProxy,
    canAssignProxy, canViewReports, canConfigureMasterData,
    canManageTimetableSetup, canCreateTasks, canDeleteTasks,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

