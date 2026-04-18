import React, { createContext, useContext, useState, useCallback } from 'react';
import defaultClassesData from '@/data/classes.json';

const STORAGE_KEY = 'erp_classes';

function loadClasses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultClassesData;
}

function persist(classes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

const ClassesContext = createContext(null);

export function ClassesProvider({ children }) {
  const [classes, setClasses] = useState(loadClasses);

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
  const classOptions = classes.flatMap((c) =>
    c.sections.map((s) => ({ value: `${c.class}-${s}`, label: `${c.class} - ${s}` }))
  );

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
