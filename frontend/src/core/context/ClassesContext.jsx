import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { useAuth } from '@/core/context/AuthContext';
import defaultClassesData from '@/data/classes.json';

const STORAGE_KEY = 'erp_classes';

function loadClasses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaultClassesData;
    }
  } catch {}
  return defaultClassesData;
}

function persist(classes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

const ClassesContext = createContext(null);

export function ClassesProvider({ children }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState(loadClasses);

  useEffect(() => {
    if (!user) return;
    apiRequest(API_ENDPOINTS.classes.list)
      .then((list) => {
        if (!list?.length) return;
        const fromApi = list.map((c) => ({ class: c.name, sections: c.sections || [] }));
        setClasses(fromApi);
        persist(fromApi);
      })
      .catch(() => {});
  }, [user]);

  const addClass = useCallback((className, sections) => {
    setClasses((prev) => {
      if (prev.find((c) => c.class === className)) return prev;
      const next = [...prev, { class: className, sections }];
      persist(next);
      return next;
    });
  }, []);

  const removeClass = useCallback((className) => {
    setClasses((prev) => {
      const next = prev.filter((c) => c.class !== className);
      persist(next);
      // Remove timetable grids for all sections of this class
      try {
        const timetable = JSON.parse(localStorage.getItem('erp_timetable') || '{}');
        const cls = prev.find((c) => c.class === className);
        if (cls) {
          cls.sections.forEach((s) => {
            delete timetable[`${className}-${s}`];
          });
          localStorage.setItem('erp_timetable', JSON.stringify(timetable));
        }
      } catch {}
      return next;
    });
  }, []);

  const addSection = useCallback((className, section) => {
    setClasses((prev) => {
      const next = prev.map((c) => {
        if (c.class !== className) return c;
        if (c.sections.includes(section)) return c;
        return { ...c, sections: [...c.sections, section] };
      });
      persist(next);
      return next;
    });
  }, []);

  const removeSection = useCallback((className, section) => {
    setClasses((prev) => {
      const next = prev.map((c) => {
        if (c.class !== className) return c;
        return { ...c, sections: c.sections.filter((s) => s !== section) };
      });
      persist(next);
      // Remove timetable grid for this section
      try {
        const timetable = JSON.parse(localStorage.getItem('erp_timetable') || '{}');
        delete timetable[`${className}-${section}`];
        localStorage.setItem('erp_timetable', JSON.stringify(timetable));
      } catch {}
      return next;
    });
  }, []);

  // Flat list of { value: "Class 1-A", label: "Class 1 - A" }
  const classOptions = Array.isArray(classes) 
    ? classes.flatMap((c) =>
        (c?.sections || []).map((s) => ({ value: `${c.class}-${s}`, label: `${c.class} - ${s}` }))
      )
    : [];

  return (
    <ClassesContext.Provider value={{ classes, classOptions, addClass, removeClass, addSection, removeSection }}>
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used inside ClassesProvider');
  return ctx;
}
