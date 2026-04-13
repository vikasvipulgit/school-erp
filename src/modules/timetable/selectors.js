export const getSubjectsForClass = (subjectsData, className) => {
  return subjectsData
    .filter((subject) => (subject.classes || []).includes(className))
    .map((subject) => subject.name);
};

export const getTeachersForSubject = (teachersData, subjectName, className) => {
  return teachersData.filter(
    (teacher) => teacher.subject === subjectName && teacher.classes.includes(className)
  );
};

export const getInitialGrid = ({ periods, days, isHolidayDay }) => {
  return periods.map((period) =>
    days.map((day) => {
      if (isHolidayDay(day)) return { type: "holiday" };
      if (period.break) return { type: "break" };
      return { type: "empty" };
    })
  );
};

export const getBookedTeachersForSlot = (gridsByClass, pi, di) => {
  return Object.entries(gridsByClass).reduce((acc, [_, grid]) => {
    if (!grid || !grid[pi] || !grid[pi][di]) return acc;
    const cell = grid[pi][di];
    if (cell && cell.teacher) acc.add(cell.teacher);
    return acc;
  }, new Set());
};
