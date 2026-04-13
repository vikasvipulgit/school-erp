// Public API for timetable module
export { fetchTimetableList } from './services/timetableService';
export {
  initialiseTimetable,
  checkConflicts,
  assignSlot,
  findProxySuggestions,
  calculateProxyScore,
  validateSubjectFrequency,
  canPublishTimetable,
  scanForConflicts,
  getUnfilledPeriods,
} from './engine';
