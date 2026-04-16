import { getWeeklyCount, isThirdConsecutive } from './utils';

function getAffectedPeriods(leaveEntry, state) {
  const dayDateMap = new Map((leaveEntry.dayDates || []).map((d) => [d.day, d.date]));
  const affected = [];

  Object.entries(state.slotMatrix).forEach(([classId, sections]) => {
    Object.entries(sections).forEach(([sectionId, days]) => {
      Object.entries(days).forEach(([day, periods]) => {
        if (!dayDateMap.has(day)) return;

        Object.entries(periods).forEach(([periodNumber, cell]) => {
          if (!cell) return;
          if (cell.teacherId !== leaveEntry.teacherId) return;

          affected.push({
            classId,
            sectionId,
            day,
            period: Number(periodNumber),
            date: dayDateMap.get(day),
            subjectId: cell.subjectId,
            classGrade: state.indexes.classesById[classId]?.name,
          });
        });
      });
    });
  });

  return affected;
}

/**
 * Find proxy suggestions for an approved leave window.
 * `leaveEntry.dayDates` should include the specific days impacted.
 */
export function findProxySuggestions(leaveEntry, state) {
  const affectedPeriods = getAffectedPeriods(leaveEntry, state);

  return affectedPeriods.map((period) => {
    const candidates = Object.values(state.indexes.teachersById).filter((teacher) => {
      const isFree = !state.teacherGrid[teacher.teacherId][period.day][period.period];
      const knowsSubject = teacher.subjects?.includes(period.subjectId);
      const knowsGrade = teacher.grades?.includes(period.classGrade);
      const notOnLeave = !state.leaveMap[teacher.teacherId]?.has(period.date);
      const withinLimit = getWeeklyCount(teacher.teacherId, state) < teacher.maxPeriodsWeek;

      return isFree && knowsSubject && knowsGrade && notOnLeave && withinLimit;
    });

    const ranked = candidates
      .map((teacher) => ({
        teacher,
        score: calculateProxyScore(teacher, period, state),
      }))
      .sort((a, b) => a.score - b.score);

    return { period, suggestions: ranked };
  });
}

export function calculateProxyScore(teacher, period, state) {
  const load = getWeeklyCount(teacher.teacherId, state) / teacher.maxPeriodsWeek;
  const consecutivePenalty = isThirdConsecutive(teacher.teacherId, period.day, period.period, state)
    ? 1
    : 0;

  return load * 0.4 + consecutivePenalty * 0.1;
}
