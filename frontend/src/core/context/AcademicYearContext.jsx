import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getActiveAcademicYear } from '../../modules/settings/services/academicYearsService';
import { useAuth } from '@/core/context/AuthContext';

const AcademicYearContext = createContext();

export function AcademicYearProvider({ children }) {
  const { user } = useAuth();
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshActiveYear = useCallback(async () => {
    // Guard: do not call authenticated API if there is no access token.
    // This prevents the infinite hard-reload loop on /login.
    const token = localStorage.getItem('access_token');
    if (!token) {
      setActiveYear(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const year = await getActiveAcademicYear();
      setActiveYear(year);
    } catch (err) {
      console.error('Failed to fetch active academic year', err);
      setActiveYear(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-run whenever the auth user changes (login → fetch, logout → clear)
  useEffect(() => {
    refreshActiveYear();
  }, [user, refreshActiveYear]);

  // Memoize so consumers don't re-render unless data actually changes
  const value = useMemo(
    () => ({ activeYear, loading, refreshActiveYear }),
    [activeYear, loading, refreshActiveYear]
  );

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}

