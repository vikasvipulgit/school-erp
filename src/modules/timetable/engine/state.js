import { buildEmptyGrid, buildEmptySlotMatrix, buildIndex, toSet } from './utils';

/**
 * Initialize timetable state with empty grids and indexes.
 */
export function initialiseTimetable(config) {
  const {
    academicYear,
    termId,
    timetableId = null,
    workingDays,
    periods,
    classes,
    teachers,
    subjects,
    rooms,
    activeTimetables = [],
  } = config;

  const slotMatrix = buildEmptySlotMatrix({ classes, workingDays, periods });
  const teacherGrid = buildEmptyGrid(
    teachers.map((t) => t.teacherId),
    workingDays,
    periods
  );
  const roomGrid = buildEmptyGrid(
    rooms.map((r) => r.roomId),
    workingDays,
    periods
  );

  const subjectRequirements = {};
  classes.forEach((cls) => {
    subjectRequirements[cls.classId] = {};
    cls.sections.forEach((sectionId) => {
      subjectRequirements[cls.classId][sectionId] = {};
      subjects.forEach((subject) => {
        subjectRequirements[cls.classId][sectionId][subject.subjectId] = {
          required: subject.periodsPerWeek || 0,
          filled: 0,
        };
      });
    });
  });

  const leaveMap = teachers.reduce((acc, teacher) => {
    acc[teacher.teacherId] = toSet(teacher.leavedays || []);
    return acc;
  }, {});

  return {
    slotMatrix,
    teacherGrid,
    roomGrid,
    subjectRequirements,
    leaveMap,
    workingDays,
    periods,
    indexes: {
      teachersById: buildIndex(teachers, 'teacherId'),
      subjectsById: buildIndex(subjects, 'subjectId'),
      classesById: buildIndex(classes, 'classId'),
      roomsById: buildIndex(rooms, 'roomId'),
    },
    meta: {
      academicYear,
      termId,
      timetableId,
      activeTimetables,
    },
    rules: {
      soft: {
        maxDailyPeriodsDefault: 6,
        workloadImbalanceRatio: 1.3,
        firstLastThreshold: 3,
      },
    },
  };
}
