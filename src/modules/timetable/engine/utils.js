export function buildIndex(items, idKey) {
  return items.reduce((acc, item) => {
    acc[item[idKey]] = item;
    return acc;
  }, {});
}

export function toSet(list = []) {
  return new Set(list);
}

export function buildEmptySlotMatrix({ classes, workingDays, periods }) {
  const slotMatrix = {};

  classes.forEach((cls) => {
    slotMatrix[cls.classId] = {};

    cls.sections.forEach((sectionId) => {
      slotMatrix[cls.classId][sectionId] = {};

      workingDays.forEach((day) => {
        slotMatrix[cls.classId][sectionId][day] = {};

        periods.forEach((period) => {
          slotMatrix[cls.classId][sectionId][day][period.number] = null;
        });
      });
    });
  });

  return slotMatrix;
}

export function buildEmptyGrid(ids, workingDays, periods) {
  const grid = {};

  ids.forEach((id) => {
    grid[id] = {};

    workingDays.forEach((day) => {
      grid[id][day] = {};

      periods.forEach((period) => {
        grid[id][day][period.number] = null;
      });
    });
  });

  return grid;
}

export function getWeeklyCount(teacherId, state) {
  const grid = state.teacherGrid[teacherId];
  if (!grid) return 0;

  let count = 0;
  state.workingDays.forEach((day) => {
    state.periods.forEach((period) => {
      if (grid[day][period.number]) count += 1;
    });
  });

  return count;
}

export function getDailyCount(teacherId, day, state) {
  const grid = state.teacherGrid[teacherId];
  if (!grid) return 0;

  let count = 0;
  state.periods.forEach((period) => {
    if (grid[day][period.number]) count += 1;
  });

  return count;
}

export function getAverageWeeklyLoad(state) {
  const teacherIds = Object.keys(state.teacherGrid);
  if (!teacherIds.length) return 0;

  const total = teacherIds.reduce((sum, teacherId) => sum + getWeeklyCount(teacherId, state), 0);
  return total / teacherIds.length;
}

export function isThirdConsecutive(teacherId, day, periodNumber, state) {
  const teachingPeriods = state.periods.filter((p) => !p.isBreak).map((p) => p.number);
  const periodIndex = teachingPeriods.indexOf(periodNumber);

  if (periodIndex < 2) return false;

  const grid = state.teacherGrid[teacherId];
  if (!grid) return false;

  const prev1 = teachingPeriods[periodIndex - 1];
  const prev2 = teachingPeriods[periodIndex - 2];

  return Boolean(grid[day][prev1] && grid[day][prev2]);
}

export function getFirstLastCounts(teacherId, state) {
  const first = state.periods.find((p) => !p.isBreak)?.number;
  const last = [...state.periods].reverse().find((p) => !p.isBreak)?.number;

  if (!first || !last) return { first: 0, last: 0 };

  const grid = state.teacherGrid[teacherId];
  if (!grid) return { first: 0, last: 0 };

  let firstCount = 0;
  let lastCount = 0;

  state.workingDays.forEach((day) => {
    if (grid[day][first]) firstCount += 1;
    if (grid[day][last]) lastCount += 1;
  });

  return { first: firstCount, last: lastCount };
}
