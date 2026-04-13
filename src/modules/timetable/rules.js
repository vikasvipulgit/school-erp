export const SUBJECT_MIN_PERIODS = 0;
export const SUBJECT_MAX_PERIODS = 7;
export const SUBJECT_MAX_PER_DAY = 2;

const HOLIDAY_DAYS = new Set(["Sat"]);

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
        if (
          cell &&
          (cell.type === "filled" || cell.type === "proxy") &&
          cell.subject === subjectName
        ) {
          count++;
        }
      });
    });
  });
  return count;
};

export const getUsedPeriodsForSubjectInClass = (
  gridsByClass,
  classKey,
  subjectName
) => {
  const gridForClass = gridsByClass[classKey];
  if (!gridForClass) return 0;
  let count = 0;
  gridForClass.forEach((row) => {
    row.forEach((cell) => {
      if (
        cell &&
        (cell.type === "filled" || cell.type === "proxy") &&
        cell.subject === subjectName
      ) {
        count++;
      }
    });
  });
  return count;
};

export const getUsedPeriodsForSubjectInClassDay = (
  gridsByClass,
  classKey,
  subjectName,
  dayIndex
) => {
  const gridForClass = gridsByClass[classKey];
  if (!gridForClass) return 0;
  let count = 0;
  gridForClass.forEach((row) => {
    const cell = row[dayIndex];
    if (
      cell &&
      (cell.type === "filled" || cell.type === "proxy") &&
      cell.subject === subjectName
    ) {
      count++;
    }
  });
  return count;
};

export const canAssignSubjectForClass = ({
  subjectsData,
  gridsByClass,
  classKey,
  subjectName,
}) => {
  const available = getSubjectAvailability(subjectsData, subjectName);
  const usedGlobal = getUsedPeriodsForSubject(gridsByClass, subjectName);
  const usedClass = getUsedPeriodsForSubjectInClass(
    gridsByClass,
    classKey,
    subjectName
  );
  return usedGlobal < available && usedClass < SUBJECT_MAX_PERIODS;
};

export const canAssignSubjectForClassDay = ({
  gridsByClass,
  classKey,
  subjectName,
  dayIndex,
}) => {
  const usedDay = getUsedPeriodsForSubjectInClassDay(
    gridsByClass,
    classKey,
    subjectName,
    dayIndex
  );
  return usedDay < SUBJECT_MAX_PER_DAY;
};

export const getAvailabilityStatus = ({
  subjectsData,
  gridsByClass,
  selectedClass,
  subjectName,
}) => {
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
    classRemaining: SUBJECT_MAX_PERIODS - usedClass,
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
  const className = classKey.split("-")[0];
  const subjects = getSubjectsForClass(subjectsData, className);
  return subjects.reduce((acc, subject) => {
    const used = getUsedPeriodsForSubjectInClass(
      gridsByClass,
      classKey,
      subject
    );
    if (used < SUBJECT_MIN_PERIODS || used > SUBJECT_MAX_PERIODS) {
      acc.push({ classKey, subject, used });
    }
    days.forEach((day, dayIndex) => {
      if (isHolidayDayFn(day)) return;
      const usedDay = getUsedPeriodsForSubjectInClassDay(
        gridsByClass,
        classKey,
        subject,
        dayIndex
      );
      if (usedDay > SUBJECT_MAX_PER_DAY) {
        acc.push({ classKey, subject, used: usedDay, day });
      }
    });
    return acc;
  }, []);
};
