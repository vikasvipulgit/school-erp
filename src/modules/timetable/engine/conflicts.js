import {
  getAverageWeeklyLoad,
  getDailyCount,
  getFirstLastCounts,
  getWeeklyCount,
  isThirdConsecutive,
} from './utils';

function hasAcademicYearOverlap(entry, state) {
  const { academicYear, termId, timetableId, activeTimetables } = state.meta;

  return activeTimetables.some((timetable) => {
    const sameClass = timetable.classId === entry.classId;
    const sameTerm = timetable.termId === termId;
    const sameYear = timetable.academicYear === academicYear;
    const differentTimetable = timetableId ? timetable.timetableId !== timetableId : true;
    const isActive = timetable.status === 'active';

    return sameClass && sameTerm && sameYear && differentTimetable && isActive;
  });
}

function isBreakPeriod(entry, state) {
  const period = state.periods.find((p) => p.number === entry.period);
  return Boolean(period?.isBreak);
}

function getPeriodLabel(entry, state) {
  const period = state.periods.find((p) => p.number === entry.period);
  return period?.label || `Period ${entry.period}`;
}

function getTeacher(entry, state) {
  return state.indexes.teachersById[entry.teacherId];
}

function getSubject(entry, state) {
  return state.indexes.subjectsById[entry.subjectId];
}

function getClass(entry, state) {
  return state.indexes.classesById[entry.classId];
}

function getRoom(entry, state) {
  return state.indexes.roomsById[entry.roomId];
}

export function checkConflicts(entry, state) {
  const errors = [];
  const warnings = [];

  const teacher = getTeacher(entry, state);
  const subject = getSubject(entry, state);
  const classInfo = getClass(entry, state);
  const room = entry.roomId ? getRoom(entry, state) : null;
  const classGrade = classInfo?.name;
  const teacherName = teacher?.name || 'Teacher';
  const subjectName = subject?.name || 'Subject';
  const roomName = room?.name || 'Room';
  const className = classInfo?.name || 'Class';
  const maxDailyDefault = state.rules.soft.maxDailyPeriodsDefault;

  // ── HARD CHECKS ──────────────────────────────────────────

  // H1: Teacher double booking
  if (state.teacherGrid[entry.teacherId]?.[entry.day]?.[entry.period]) {
    errors.push({
      code: 'H1',
      message: `${teacherName} is already assigned to another class this period`,
    });
  }

  // H2: Room double booking
  if (entry.roomId && state.roomGrid[entry.roomId]?.[entry.day]?.[entry.period]) {
    errors.push({
      code: 'H2',
      message: `Room ${roomName} is already occupied this period`,
    });
  }

  // H3: Teacher on leave
  if (state.leaveMap[entry.teacherId]?.has(entry.date)) {
    errors.push({
      code: 'H3',
      message: `${teacherName} has approved leave on this date`,
    });
  }

  // H4: Max weekly periods
  if (teacher?.maxPeriodsWeek != null) {
    const weeklyCount = getWeeklyCount(entry.teacherId, state);
    if (weeklyCount >= teacher.maxPeriodsWeek) {
      errors.push({
        code: 'H4',
        message: `${teacherName} has reached weekly limit of ${teacher.maxPeriodsWeek} periods`,
      });
    }
  }

  // H5: Break period protection
  if (isBreakPeriod(entry, state)) {
    errors.push({
      code: 'H5',
      message: `${getPeriodLabel(entry, state)} is a designated break — cannot assign`,
    });
  }

  // H6: Proxy conflict (proxy teacher already has a class that slot)
  if (entry.isProxy && state.teacherGrid[entry.teacherId]?.[entry.day]?.[entry.period]) {
    errors.push({
      code: 'H6',
      message: `${teacherName} is already assigned during this proxy period`,
    });
  }

  // H7: Academic year overlap
  if (hasAcademicYearOverlap(entry, state)) {
    errors.push({
      code: 'H7',
      message: `${className} already has an active timetable for this term`,
    });
  }

  // H8: Teacher-subject link
  if (teacher && !teacher.subjects?.includes(entry.subjectId)) {
    errors.push({
      code: 'H8',
      message: `${teacherName} is not qualified to teach ${subjectName}`,
    });
  }

  // H9: Teacher-grade link
  if (teacher && classGrade && !teacher.grades?.includes(classGrade)) {
    errors.push({
      code: 'H9',
      message: `${teacherName} is not eligible for ${classGrade}`,
    });
  }

  // H10: Section uniqueness
  if (state.slotMatrix[entry.classId]?.[entry.sectionId]?.[entry.day]?.[entry.period]) {
    errors.push({
      code: 'H10',
      message: `${className} ${entry.sectionId} already has a subject assigned this period`,
    });
  }

  // ── SOFT CHECKS ──────────────────────────────────────────

  // S1: Daily period max
  if (teacher) {
    const dailyCount = getDailyCount(entry.teacherId, entry.day, state);
    const dailyMax = teacher.maxPeriodsDay ?? maxDailyDefault;

    if (dailyCount >= dailyMax) {
      warnings.push({
        code: 'S1',
        message: `${teacherName} will exceed daily max of ${dailyMax} periods`,
      });
    }
  }

  // S2: Subject frequency
  const subjectRequirement =
    state.subjectRequirements?.[entry.classId]?.[entry.sectionId]?.[entry.subjectId];
  if (subjectRequirement && subjectRequirement.filled + 1 > subjectRequirement.required) {
    warnings.push({
      code: 'S2',
      message: `${subjectName} exceeds its required ${subjectRequirement.required} periods/week`,
    });
  }

  // S3: Workload balance
  if (teacher) {
    const weeklyCount = getWeeklyCount(entry.teacherId, state);
    const avgLoad = getAverageWeeklyLoad(state);

    if (avgLoad > 0 && weeklyCount > avgLoad * state.rules.soft.workloadImbalanceRatio) {
      warnings.push({
        code: 'S3',
        message: `${teacherName} carries significantly more load than school average`,
      });
    }
  }

  // S4: Consecutive periods (3+ in a row)
  if (teacher && isThirdConsecutive(entry.teacherId, entry.day, entry.period, state)) {
    warnings.push({
      code: 'S4',
      message: `${teacherName} will have 3 or more consecutive periods`,
    });
  }

  // S5: First/last period fairness
  if (teacher) {
    const { first, last } = getFirstLastCounts(entry.teacherId, state);
    const firstThreshold = state.rules.soft.firstLastThreshold;
    const lastThreshold = state.rules.soft.firstLastThreshold;
    const firstPeriod = state.periods.find((p) => !p.isBreak)?.number;
    const lastPeriod = [...state.periods].reverse().find((p) => !p.isBreak)?.number;

    if (entry.period === firstPeriod && first >= firstThreshold) {
      warnings.push({
        code: 'S5',
        message: `${teacherName} is frequently assigned the first period`,
      });
    }

    if (entry.period === lastPeriod && last >= lastThreshold) {
      warnings.push({
        code: 'S5',
        message: `${teacherName} is frequently assigned the last period`,
      });
    }
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, warnings };
}
