const STORAGE_SLOTS_KEY = 'erp_period_slots';

export const DEFAULT_PERIODS = [
  { label: "P1", time: "08:00-08:45" },
  { label: "P2", time: "08:50-09:35" },
  { label: "P3", time: "09:40-10:25" },
  { label: "Break", break: true },
  { label: "P4", time: "10:40-11:25" },
  { label: "P5", time: "11:30-12:15" },
  { label: "P6", time: "12:20-13:05" },
  { label: "Break", break: true },
  { label: "P7", time: "13:20-14:05" },
  { label: "P8", time: "14:10-14:55" },
];

export const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

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
