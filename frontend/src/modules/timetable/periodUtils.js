const STORAGE_SLOTS_KEY = 'erp_period_slots';
export const WORKING_DAYS_KEY = 'erp_working_days';

export const DEFAULT_PERIODS = [
  { label: "P1", time: "08:00-08:45" },
  { label: "Morning Break", break: true },
  { label: "P2", time: "09:00-09:45" },
  { label: "Long Break", break: true },
  { label: "P3", time: "10:00-10:45" },
  { label: "P4", time: "10:45-11:30" },
  { label: "P5", time: "11:30-12:15" },
];

export const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_LABEL_TO_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};
const DAY_SHORT_TO_LABEL = Object.fromEntries(
  Object.entries(DAY_LABEL_TO_SHORT).map(([label, short]) => [short, label])
);

export function getWorkingDays() {
  try {
    const saved = localStorage.getItem(WORKING_DAYS_KEY);
    if (!saved) return DEFAULT_DAYS;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_DAYS;
    return parsed
      .map((day) => DAY_LABEL_TO_SHORT[day] || day)
      .filter(Boolean);
  } catch {
    return DEFAULT_DAYS;
  }
}

export function getWorkingDayLabels() {
  return getWorkingDays().map((day) => DAY_SHORT_TO_LABEL[day] || day);
}

export function saveWorkingDays(days) {
  localStorage.setItem(WORKING_DAYS_KEY, JSON.stringify(days));
}

/**
 * Converts the period slots stored in localStorage (erp_period_slots)
 * to the timetable period format used by TimetablePage and ReportsPage.
 */
export function getPeriodsFromSlots() {
  try {
    const saved = localStorage.getItem(STORAGE_SLOTS_KEY);
    if (!saved) return DEFAULT_PERIODS;
    const slots = JSON.parse(saved);
    if (!Array.isArray(slots) || slots.length === 0) return DEFAULT_PERIODS;
    let periodCount = 0;
    return slots.map((slot) => {
      if (slot.type === 'break') {
        return { label: slot.label || 'Break', break: true };
      }
      periodCount++;
      return {
        label: `P${periodCount}`,
        time: `${slot.startTime}-${slot.endTime}`,
      };
    });
  } catch {
    return DEFAULT_PERIODS;
  }
}
