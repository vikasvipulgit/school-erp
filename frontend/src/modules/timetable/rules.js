const RULES_KEY = 'erp_timetable_rules';

export const DEFAULT_RULES = {
  minPeriodsPerSubject: 0,
  maxPeriodsPerSubject: 7,
  maxPeriodsPerSubjectPerDay: 2,
  maxTeacherPeriodsPerDay: 6,
};

export const getTimetableRules = () => {
  try {
    const stored = localStorage.getItem(RULES_KEY);
    return stored ? { ...DEFAULT_RULES, ...JSON.parse(stored) } : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
};

export const saveTimetableRules = (rules) => {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
};

const HOLIDAY_DAYS = new Set(['Sat']);

export const isHolidayDay = (day) => HOLIDAY_DAYS.has(day);

export const getSubjectAvailability = (subjectsData, subjectName, fallback = 20) => {
  const subject = subjectsData.find((s) => s.name === subjectName);
  return subject?.availability || fallback;
};

export const getUsedPeriodsForSubject = (gridsByClass, subjectName) => {
  let count = 0;
  Object.values(gridsByClass).forEach((grid) => {
    if (!grid) return;
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell && (cell.type === 'filled' || cell.type === 'proxy') && cell.subject === subjectName) {
          count++;
        }
      });
    });
  });
  return count;
};

export const getUsedPeriodsForSubjectInClass = (gridsByClass, classKey, subjectName) => {
  const gridForClass = gridsByClass[classKey];
  if (!gridForClass) return 0;
  let count = 0;
  gridForClass.forEach((row) => {
    row.forEach((cell) => {
      if (cell && (cell.type === 'filled' || cell.type === 'proxy') && cell.subject === subjectName) {
        count++;
      }
    });
  });
  return count;
};

export const getUsedPeriodsForSubjectInClassDay = (gridsByClass, classKey, subjectName, dayIndex) => {
  const gridForClass = gridsByClass[classKey];
  if (!gridForClass) return 0;
  let count = 0;
  gridForClass.forEach((row) => {
    const cell = row[dayIndex];
    if (cell && (cell.type === 'filled' || cell.type === 'proxy') && cell.subject === subjectName) {
      count++;
    }
  });
  return count;
};

export const getTeacherPeriodsForDay = (gridsByClass, teacherName, dayIndex) => {
  let count = 0;
  Object.values(gridsByClass).forEach((grid) => {
    if (!grid) return;
    grid.forEach((row) => {
      const cell = row[dayIndex];
      if (cell && (cell.type === 'filled' || cell.type === 'proxy') && cell.teacher === teacherName) {
        count++;
      }
    });
  });
  return count;
};

export const canAssignSubjectForClass = ({ subjectsData, gridsByClass, classKey, subjectName }) => {
  const { maxPeriodsPerSubject } = getTimetableRules();
  const available = getSubjectAvailability(subjectsData, subjectName);
  const usedGlobal = getUsedPeriodsForSubject(gridsByClass, subjectName);
  const usedClass = getUsedPeriodsForSubjectInClass(gridsByClass, classKey, subjectName);
  return usedGlobal < available && usedClass < maxPeriodsPerSubject;
};

export const canAssignSubjectForClassDay = ({ gridsByClass, classKey, subjectName, dayIndex }) => {
  const { maxPeriodsPerSubjectPerDay } = getTimetableRules();
  const usedDay = getUsedPeriodsForSubjectInClassDay(gridsByClass, classKey, subjectName, dayIndex);
  return usedDay < maxPeriodsPerSubjectPerDay;
};

export const canAssignTeacherForDay = (gridsByClass, teacherName, dayIndex, currentTeacher = null) => {
  const { maxTeacherPeriodsPerDay } = getTimetableRules();
  const periods = getTeacherPeriodsForDay(gridsByClass, teacherName, dayIndex);
  // If editing an existing slot already assigned to this teacher, don't double-count it
  const adjustment = currentTeacher === teacherName ? 1 : 0;
  return periods - adjustment < maxTeacherPeriodsPerDay;
};

export const getAvailabilityStatus = ({ subjectsData, gridsByClass, selectedClass, subjectName }) => {
  const { maxPeriodsPerSubject } = getTimetableRules();
  const available = getSubjectAvailability(subjectsData, subjectName);
  const used = getUsedPeriodsForSubject(gridsByClass, subjectName);
  const usedClass = selectedClass
    ? getUsedPeriodsForSubjectInClass(gridsByClass, selectedClass, subjectName)
    : 0;
  return {
    available,
    used,
    remaining: available - used,
    usedClass,
    classRemaining: maxPeriodsPerSubject - usedClass,
  };
};

export const getSubjectRuleViolationsForClass = ({
  classKey,
  gridsByClass,
  subjectsData,
  days,
  getSubjectsForClass,
  isHolidayDay: isHolidayDayFn,
}) => {
  const { minPeriodsPerSubject, maxPeriodsPerSubject, maxPeriodsPerSubjectPerDay } = getTimetableRules();
  const className = classKey.split('-')[0];
  const subjects = getSubjectsForClass(subjectsData, className);
  return subjects.reduce((acc, subject) => {
    const used = getUsedPeriodsForSubjectInClass(gridsByClass, classKey, subject);
    if (used < minPeriodsPerSubject || used > maxPeriodsPerSubject) {
      acc.push({ classKey, subject, used });
    }
    days.forEach((day, dayIndex) => {
      if (isHolidayDayFn(day)) return;
      const usedDay = getUsedPeriodsForSubjectInClassDay(gridsByClass, classKey, subject, dayIndex);
      if (usedDay > maxPeriodsPerSubjectPerDay) {
        acc.push({ classKey, subject, used: usedDay, day });
      }
    });
    return acc;
  }, []);
};

// Keep legacy constant exports so any existing import still compiles
export const SUBJECT_MIN_PERIODS = DEFAULT_RULES.minPeriodsPerSubject;
export const SUBJECT_MAX_PERIODS = DEFAULT_RULES.maxPeriodsPerSubject;
export const SUBJECT_MAX_PER_DAY = DEFAULT_RULES.maxPeriodsPerSubjectPerDay;
