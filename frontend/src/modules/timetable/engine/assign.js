function generateId() {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save a valid entry into the timetable state.
 */
export function assignSlot(entry, state, context = {}) {
  const entryId = generateId();
  const { userId = null, auditLog = null } = context;

  state.slotMatrix[entry.classId][entry.sectionId][entry.day][entry.period] = {
    entryId,
    subjectId: entry.subjectId,
    teacherId: entry.teacherId,
    roomId: entry.roomId || null,
    isProxy: Boolean(entry.isProxy),
    status: 'active',
    date: entry.date || null,
  };

  state.teacherGrid[entry.teacherId][entry.day][entry.period] = entry.classId;

  if (entry.roomId) {
    state.roomGrid[entry.roomId][entry.day][entry.period] = entry.classId;
  }

  const subjectRequirement =
    state.subjectRequirements?.[entry.classId]?.[entry.sectionId]?.[entry.subjectId];
  if (subjectRequirement) {
    subjectRequirement.filled += 1;
  }

  if (auditLog) {
    auditLog({
      action: 'SLOT_ASSIGNED',
      entryId,
      userId,
      timestamp: new Date().toISOString(),
      snapshot: entry,
    });
  }

  return state;
}
