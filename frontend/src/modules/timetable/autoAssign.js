import {
  SUBJECT_MAX_PERIODS,
  SUBJECT_MAX_PER_DAY,
  getSubjectAvailability,
  getUsedPeriodsForSubject,
} from "./rules";
import {
  getSubjectsForClass,
  getTeachersForSubject,
  getInitialGrid,
  getBookedTeachersForSlot,
} from "./selectors";

export const autoAssignForClass = ({
  selectedClass,
  gridsByClass,
  periods,
  days,
  subjectsData,
  teachersData,
  isHolidayDay,
}) => {
  if (!selectedClass) return gridsByClass;

  const className = selectedClass.split("-")[0];
  const subjects = getSubjectsForClass(subjectsData, className);
  const current =
    gridsByClass[selectedClass] ||
    getInitialGrid({ periods, days, isHolidayDay });
  const next = current.map((row) => row.map((cell) => ({ ...cell })));

  const getUsedInNext = (subjectName) => {
    let count = 0;
    next.forEach((row) => {
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

  const getUsedInNextDay = (subjectName, dayIndex) => {
    let count = 0;
    next.forEach((row) => {
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

  const canAssignInNext = (subjectName) => {
    const available = getSubjectAvailability(subjectsData, subjectName);
    const usedGlobal = getUsedPeriodsForSubject(gridsByClass, subjectName);
    const usedClass = getUsedInNext(subjectName);
    return usedGlobal < available && usedClass < SUBJECT_MAX_PERIODS;
  };

  const canAssignInNextDay = (subjectName, dayIndex) => {
    const usedDay = getUsedInNextDay(subjectName, dayIndex);
    return usedDay < SUBJECT_MAX_PER_DAY;
  };

  for (let pi = 0; pi < periods.length; pi++) {
    for (let di = 0; di < days.length; di++) {
      const cell = next[pi][di];
      if (cell.type === "break" || cell.type === "holiday") continue;
      if (
        cell.type === "filled" ||
        cell.type === "proxy" ||
        cell.type === "conflict"
      ) {
        continue;
      }

      const booked = getBookedTeachersForSlot(
        { ...gridsByClass, [selectedClass]: next },
        pi,
        di
      );

      const candidates = subjects
        .filter((name) => canAssignInNext(name) && canAssignInNextDay(name, di))
        .sort((a, b) => {
          const aRemaining =
            getSubjectAvailability(subjectsData, a) -
            getUsedPeriodsForSubject(gridsByClass, a);
          const bRemaining =
            getSubjectAvailability(subjectsData, b) -
            getUsedPeriodsForSubject(gridsByClass, b);
          if (aRemaining !== bRemaining) return bRemaining - aRemaining;
          return a.localeCompare(b);
        });

      let assigned = false;
      for (const subject of candidates) {
        const teacherOptions = getTeachersForSubject(
          teachersData,
          subject,
          className
        ).filter((t) => !booked.has(t.name));
        if (teacherOptions.length > 0) {
          next[pi][di] = {
            type: "filled",
            subject,
            teacher: teacherOptions[0].name,
            room: "101",
          };
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        next[pi][di] = { type: "empty" };
      }
    }
  }

  return { ...gridsByClass, [selectedClass]: next };
};
