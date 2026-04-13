import { getWeeklyCount } from './utils';
import { validateSubjectFrequency } from './frequency';

function getUnfilledPeriods(classId, sectionId, state) {
  const unfilled = [];
  const days = state.slotMatrix?.[classId]?.[sectionId] || {};

  Object.entries(days).forEach(([day, periods]) => {
    Object.entries(periods).forEach(([periodNumber, cell]) => {
      const period = state.periods.find((p) => p.number === Number(periodNumber));
      if (period?.isBreak) return;
      if (!cell) {
        unfilled.push({ day, period: Number(periodNumber) });
      }
    });
  });

  return unfilled;
}

function scanForConflicts(classId, sectionId, state) {
  const conflicts = [];
  const days = state.slotMatrix?.[classId]?.[sectionId] || {};
  const teacherSlotCount = new Map();
  const roomSlotCount = new Map();

  Object.entries(days).forEach(([day, periods]) => {
    Object.entries(periods).forEach(([periodNumber, cell]) => {
      const period = state.periods.find((p) => p.number === Number(periodNumber));
      if (!cell) return;

      if (period?.isBreak) {
        conflicts.push({
          code: 'H5',
          message: `Break period has an assignment on ${day} period ${periodNumber}`,
        });
      }

      const teacherKey = `${cell.teacherId}|${day}|${periodNumber}`;
      teacherSlotCount.set(teacherKey, (teacherSlotCount.get(teacherKey) || 0) + 1);

      if (cell.roomId) {
        const roomKey = `${cell.roomId}|${day}|${periodNumber}`;
        roomSlotCount.set(roomKey, (roomSlotCount.get(roomKey) || 0) + 1);
      }

      const teacher = state.indexes.teachersById[cell.teacherId];
      const subject = state.indexes.subjectsById[cell.subjectId];
      const classInfo = state.indexes.classesById[classId];

      if (teacher && subject && !teacher.subjects?.includes(cell.subjectId)) {
        conflicts.push({
          code: 'H8',
          message: `${teacher.name} is not qualified to teach ${subject.name}`,
        });
      }

      if (teacher && classInfo && !teacher.grades?.includes(classInfo.name)) {
        conflicts.push({
          code: 'H9',
          message: `${teacher.name} is not eligible for ${classInfo.name}`,
        });
      }

      if (cell.date && state.leaveMap[teacher?.teacherId]?.has(cell.date)) {
        conflicts.push({
          code: 'H3',
          message: `${teacher?.name || 'Teacher'} has approved leave on ${cell.date}`,
        });
      }
    });
  });

  teacherSlotCount.forEach((count, key) => {
    if (count > 1) {
      conflicts.push({ code: 'H1', message: `Teacher double booking at ${key}` });
    }
  });

  roomSlotCount.forEach((count, key) => {
    if (count > 1) {
      conflicts.push({ code: 'H2', message: `Room double booking at ${key}` });
    }
  });

  const activeOverlap = state.meta.activeTimetables.some(
    (t) =>
      t.classId === classId &&
      t.termId === state.meta.termId &&
      t.academicYear === state.meta.academicYear &&
      t.status === 'active'
  );

  if (activeOverlap) {
    conflicts.push({
      code: 'H7',
      message: `Class already has an active timetable for this term`,
    });
  }

  Object.values(state.indexes.teachersById).forEach((teacher) => {
    if (teacher.maxPeriodsWeek == null) return;
    const weeklyCount = getWeeklyCount(teacher.teacherId, state);
    if (weeklyCount > teacher.maxPeriodsWeek) {
      conflicts.push({
        code: 'H4',
        message: `${teacher.name} exceeds weekly limit of ${teacher.maxPeriodsWeek} periods`,
      });
    }
  });

  return conflicts;
}

export function canPublishTimetable(classId, sectionId, state) {
  const blockers = [];
  const warnings = [];

  const conflicts = scanForConflicts(classId, sectionId, state);
  if (conflicts.length) blockers.push(...conflicts);

  const unfilled = getUnfilledPeriods(classId, sectionId, state);
  if (unfilled.length) {
    blockers.push({
      message: `${unfilled.length} periods are still unassigned`,
      details: unfilled,
    });
  }

  const freqIssues = validateSubjectFrequency(classId, sectionId, state);
  freqIssues.forEach((issue) => {
    if (issue.type === 'UNDER_SCHEDULED') blockers.push(issue);
    else warnings.push(issue);
  });

  return {
    canPublish: blockers.length === 0,
    blockers,
    warnings,
  };
}

export { scanForConflicts, getUnfilledPeriods };
