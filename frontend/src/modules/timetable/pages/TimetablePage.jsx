import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, AlertTriangle, Save, AlertCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getSubjectsForClass,
  getTeachersForSubject,
  getInitialGrid,
  getBookedTeachersForSlot,
} from "@/modules/timetable/selectors";
import { canAssignTeacherForDay } from "@/modules/timetable/rules";
import {
  SUBJECT_MIN_PERIODS,
  SUBJECT_MAX_PERIODS,
  SUBJECT_MAX_PER_DAY,
  isHolidayDay,
  getAvailabilityStatus,
  getUsedPeriodsForSubjectInClassDay,
  canAssignSubjectForClass,
  canAssignSubjectForClassDay,
  getSubjectRuleViolationsForClass,
} from "@/modules/timetable/rules";
import { autoAssignForClass } from "@/modules/timetable/autoAssign";
import { getPeriodsFromSlots, DEFAULT_DAYS } from "@/modules/timetable/periodUtils";
import {
  saveTimetableToDb,
  loadTimetableFromDb,
} from "@/modules/timetable/services/timetableFirebaseService";
import { useClasses } from "@/core/context/ClassesContext";
import { useAuth } from "@/core/context/AuthContext";
import subjectsData from "@/data/subjects.json";
import teachersData from "@/data/teachers.json";

export const days = DEFAULT_DAYS;
// Module-level export so other pages can import periods without triggering component re-renders.
// Reads erp_period_slots on first import; navigating to ClassTimeManagement and back causes a fresh read.
export const periods = getPeriodsFromSlots();

function normalizeGridsForPeriods(savedGrids, periods) {
  if (!savedGrids || typeof savedGrids !== "object") return {};
  const normalized = {};
  for (const [key, grid] of Object.entries(savedGrids)) {
    if (
      Array.isArray(grid) &&
      grid.length === periods.length &&
      Array.isArray(grid[0]) &&
      grid[0].length === days.length
    ) {
      normalized[key] = grid;
    }
  }
  return normalized;
}

export default function TimetablePage() {
  const { classOptions } = useClasses();
  const { isTeacher, teacherId, user } = useAuth();

  // Periods are derived from the ClassTimeManagement localStorage slots
  const [periods] = useState(() => getPeriodsFromSlots());

  const myTeacherRecord = React.useMemo(() => {
    if (!isTeacher) return null;
    return teachersData.find((t) => t.id === teacherId || t.email === user?.email) || null;
  }, [isTeacher, teacherId, user?.email]);

  const [selectedClass, setSelectedClass] = useState("");
  const [view, setView] = useState(isTeacher ? "teacher" : "class");
  const [selectedTeacher, setSelectedTeacher] = useState(myTeacherRecord?.name || "");
  const [gridsByClass, setGridsByClass] = useState({});
  const [dialog, setDialog] = useState({ open: false, pi: null, di: null });
  const [assignSubject, setAssignSubject] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");
  const [teachers, setTeachers] = useState(teachersData);
  const [isDirty, setIsDirty] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(null);
  const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const isFirstLoad = useRef(true);

  // Load from Firestore on mount, fall back to localStorage
  useEffect(() => {
    async function init() {
      setDbLoading(true);
      try {
        const dbData = await loadTimetableFromDb();
        if (dbData) {
          setGridsByClass(normalizeGridsForPeriods(dbData, periods));
        } else {
          const local = localStorage.getItem("erp_timetable");
          if (local) {
            setGridsByClass(normalizeGridsForPeriods(JSON.parse(local), periods));
          }
        }
      } catch {
        try {
          const local = localStorage.getItem("erp_timetable");
          if (local) {
            setGridsByClass(normalizeGridsForPeriods(JSON.parse(local), periods));
          }
        } catch {}
      }
      setDbLoading(false);

      const tSaved = sessionStorage.getItem("erp_teacher_assignments");
      if (tSaved) {
        try { setTeachers(JSON.parse(tSaved)); } catch {}
      }

      if (isTeacher) {
        setHasLoadedPrefs(true);
        return;
      }
      const prefs = sessionStorage.getItem("erp_timetable_prefs");
      if (prefs) {
        try {
          const parsed = JSON.parse(prefs);
          if (parsed?.selectedClass) setSelectedClass(parsed.selectedClass);
          if (parsed?.view) setView(parsed.view);
        } catch {}
      }
      setHasLoadedPrefs(true);
    }
    init();
  }, []);

  // Sync to localStorage whenever gridsByClass changes
  useEffect(() => {
    if (dbLoading) return;
    localStorage.setItem("erp_timetable", JSON.stringify(gridsByClass));
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    setIsDirty(true);
  }, [gridsByClass, dbLoading]);

  useEffect(() => {
    sessionStorage.setItem("erp_teacher_assignments", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    if (!hasLoadedPrefs) return;
    sessionStorage.setItem("erp_timetable_prefs", JSON.stringify({ selectedClass, view }));
  }, [selectedClass, view, hasLoadedPrefs]);

  // Warn on browser close/refresh when there are unpublished changes
  useEffect(() => {
    if (isTeacher) return;
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isTeacher]);

  // Intercept NavLink clicks when dirty
  useEffect(() => {
    if (isTeacher || !isDirty) return;
    const handleClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href === window.location.pathname) return;
      e.preventDefault();
      setLeaveConfirm(href);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  const subjectColorMap = React.useMemo(() => {
    const palette = [
      { bg: "#EFF6FF", border: "#93C5FD", text: "#1E3A8A" },
      { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
      { bg: "#DCFCE7", border: "#34D399", text: "#166534" },
      { bg: "#EDE9FE", border: "#8B5CF6", text: "#4C1D95" },
      { bg: "#FFE4E6", border: "#F472B6", text: "#9D174D" },
      { bg: "#F1F5F9", border: "#94A3B8", text: "#334155" },
      { bg: "#ECFCCB", border: "#84CC16", text: "#3F6212" },
      { bg: "#FFEDD5", border: "#FB923C", text: "#9A3412" },
      { bg: "#E0E7FF", border: "#818CF8", text: "#3730A3" },
      { bg: "#FCE7F3", border: "#F472B6", text: "#9D174D" },
    ];
    return subjectsData.reduce((acc, subject, index) => {
      acc[subject.name] = palette[index % palette.length];
      return acc;
    }, {});
  }, []);

  const getSubjectColors = (subjectName) =>
    subjectColorMap[subjectName] || { bg: "#F1F5F9", border: "#94A3B8", text: "#334155" };

  const handleDropAssign = useCallback((pi, di, payload) => {
    if (isTeacher || view !== "class" || !selectedClass) return;
    if (!payload?.subject || !payload?.teacher) return;
    const cell = gridsByClass[selectedClass]?.[pi]?.[di];
    if (!cell || cell.type === "break" || cell.type === "holiday") return;

    const booked = getBookedTeachersForSlot(gridsByClass, pi, di);
    const currentTeacher = cell?.teacher;
    if (booked.has(payload.teacher) && payload.teacher !== currentTeacher) {
      alert(`${payload.teacher} is already booked for this slot.`);
      return;
    }
    if (!canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: payload.subject })) {
      const status = getAvailabilityStatus({ subjectsData, gridsByClass, selectedClass, subjectName: payload.subject });
      alert(`Cannot assign ${payload.subject}. Max ${SUBJECT_MAX_PERIODS} periods per class (currently ${status.usedClass}), or global availability limit reached.`);
      return;
    }
    if (!canAssignSubjectForClassDay({ gridsByClass, classKey: selectedClass, subjectName: payload.subject, dayIndex: di })) {
      alert(`Cannot assign ${payload.subject}. Max ${SUBJECT_MAX_PER_DAY} periods per day for a class.`);
      return;
    }
    setGridsByClass((prev) => {
      const current = prev[selectedClass] || getInitialGrid({ periods, days, isHolidayDay });
      const next = current.map((row) => [...row]);
      next[pi][di] = { type: "filled", subject: payload.subject, teacher: payload.teacher, room: "101" };
      return { ...prev, [selectedClass]: next };
    });
  }, [isTeacher, view, selectedClass, gridsByClass, periods]);

  const handleCellClick = useCallback((pi, di) => {
    if (isTeacher || view === "teacher" || !selectedClass) return;
    const cell = gridsByClass[selectedClass]?.[pi]?.[di];
    if (!cell || cell.type === "break" || cell.type === "holiday") return;
    setDialog({ open: true, pi, di });
    setAssignSubject(cell?.subject || "");
    setAssignTeacher(cell?.teacher || "");
  }, [isTeacher, view, selectedClass, gridsByClass]);

  const teacherOptions = React.useMemo(
    () => teachers.map((t) => ({ value: t.name, label: t.name })),
    [teachers]
  );

  const teacherGrid = React.useMemo(() => {
    if (!selectedTeacher) return getInitialGrid({ periods, days, isHolidayDay });
    const grid = getInitialGrid({ periods, days, isHolidayDay }).map((row) =>
      row.map((cell) => ({ ...cell }))
    );
    Object.entries(gridsByClass).forEach(([classKey, classGrid]) => {
      if (!classGrid) return;
      classGrid.forEach((row, pi) => {
        row?.forEach((cell, di) => {
          if (cell?.teacher === selectedTeacher) {
            grid[pi][di] = { ...cell, classKey };
          }
        });
      });
    });
    return grid;
  }, [selectedTeacher, gridsByClass, periods]);

  const classGrid =
    gridsByClass[selectedClass] || getInitialGrid({ periods, days, isHolidayDay });
  const grid = view === "teacher" ? teacherGrid : classGrid;

  const filledCount = grid.flat().filter((c) => c?.type === "filled" || c?.type === "proxy" || c?.type === "conflict").length;
  const totalPeriods = grid.flat().filter((c) => c?.type !== "break" && c?.type !== "holiday").length;
  const conflictCount = grid.flat().filter((c) => c?.type === "conflict").length;
  const unassignedCount = grid.flat().filter((c) => c?.type === "empty").length;

  const missingTeacherSubjects = selectedClass
    ? getSubjectsForClass(subjectsData, selectedClass.split("-")[0]).filter(
        (subject) => getTeachersForSubject(teachers, subject, selectedClass.split("-")[0]).length === 0
      )
    : [];

  const handleAssign = () => {
    if (!assignSubject || !assignTeacher || !selectedClass) return;
    if (dialog.di === null || dialog.di === undefined) return;

    if (!canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: assignSubject })) {
      const status = getAvailabilityStatus({ subjectsData, gridsByClass, selectedClass, subjectName: assignSubject });
      alert(`Cannot assign ${assignSubject}. Max ${SUBJECT_MAX_PERIODS} periods per class (currently ${status.usedClass}), or global availability limit reached.`);
      return;
    }
    if (!canAssignSubjectForClassDay({ gridsByClass, classKey: selectedClass, subjectName: assignSubject, dayIndex: dialog.di })) {
      alert(`Cannot assign ${assignSubject}. Max ${SUBJECT_MAX_PER_DAY} periods per day for a class (already ${getUsedPeriodsForSubjectInClassDay(gridsByClass, selectedClass, assignSubject, dialog.di)}).`);
      return;
    }

    setGridsByClass((prev) => {
      const current = prev[selectedClass] || getInitialGrid({ periods, days, isHolidayDay });
      const next = current.map((row) => [...row]);
      next[dialog.pi][dialog.di] = { type: "filled", subject: assignSubject, teacher: assignTeacher, room: "101" };
      return { ...prev, [selectedClass]: next };
    });
    setDialog({ open: false, pi: null, di: null });
    setAssignSubject("");
    setAssignTeacher("");
  };

  const handleAutoAssign = () => {
    if (!selectedClass) return;
    setGridsByClass((prev) =>
      autoAssignForClass({ selectedClass, gridsByClass: prev, periods, days, subjectsData, teachersData: teachers, isHolidayDay })
    );
  };

  const handlePublish = async () => {
    const classKeys = new Set(Object.keys(gridsByClass));
    if (selectedClass) classKeys.add(selectedClass);
    const violations = Array.from(classKeys).flatMap((classKey) =>
      getSubjectRuleViolationsForClass({ classKey, gridsByClass, subjectsData, days, getSubjectsForClass, isHolidayDay })
    );
    if (violations.length > 0) {
      const preview = violations
        .slice(0, 10)
        .map((v) => (v.day ? `${v.classKey}: ${v.subject} (${v.used}) on ${v.day}` : `${v.classKey}: ${v.subject} (${v.used})`))
        .join("\n");
      const more = violations.length > 10 ? `\n...and ${violations.length - 10} more` : "";
      alert(
        `Cannot publish. Each subject must have ${SUBJECT_MIN_PERIODS}-${SUBJECT_MAX_PERIODS} periods per class and max ${SUBJECT_MAX_PER_DAY} per day.\n${preview}${more}`
      );
      return;
    }

    try {
      await saveTimetableToDb(gridsByClass);
      sessionStorage.setItem("erp_teacher_assignments", JSON.stringify(teachers));
      setIsDirty(false);
      alert("Timetable published and saved to database.");
    } catch {
      alert("Published locally (database save failed — check your connection).");
      setIsDirty(false);
    }
  };

  const isClassSelected = !!selectedClass;
  const isTeacherSelected = !!selectedTeacher;

  const makeDragDropProps = (pi, di) => ({
    onDragOver: (e) => { if (!isTeacher) e.preventDefault(); },
    onDrop: (e) => {
      if (isTeacher) return;
      e.preventDefault();
      try {
        const payload = JSON.parse(e.dataTransfer.getData("application/json"));
        handleDropAssign(pi, di, payload);
      } catch {}
    },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Unsaved changes banner */}
      {isDirty && !isTeacher && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 rounded-t-xl">
          <AlertCircle size={15} className="shrink-0" />
          <span>You have unpublished changes. Click <strong>Publish Timetable</strong> to save them to the database.</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3 items-center p-4 border-b border-gray-100 flex-wrap">
        {isTeacher ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
            {myTeacherRecord?.name || user?.displayName || "My Timetable"}
          </div>
        ) : view === "class" ? (
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg z-50">
              {classOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-52 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg z-50">
              {teacherOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!isTeacher && (
          <div className="flex gap-0.5 ml-2">
            <button
              className={view === "class" ? "bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm" : "bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"}
              onClick={() => setView("class")}
            >
              Class View
            </button>
            <button
              className={view === "teacher" ? "bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm" : "bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"}
              onClick={() => setView("teacher")}
            >
              Teacher View
            </button>
          </div>
        )}

        {!isTeacher && (
          <div className="ml-auto flex items-center gap-2">
            <button
              className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleAutoAssign}
              disabled={view !== "class" || !isClassSelected || dbLoading}
            >
              Auto Assign
            </button>
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isDirty ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              onClick={handlePublish}
            >
              <Save size={14} />
              Publish Timetable
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {dbLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Timetable Grid */}
      {!dbLoading && (
        <div className={`flex gap-4 ${view === "class" ? (!isClassSelected ? "opacity-60 pointer-events-none" : "") : (!isTeacherSelected ? "opacity-60 pointer-events-none" : "")}`}>
          <div className="flex-1 overflow-x-auto">
            {view === "class" && isClassSelected && (missingTeacherSubjects.length > 0 || unassignedCount > 0) && (
              <div className="mx-4 mt-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {missingTeacherSubjects.length > 0 && (
                  <div>
                    No teacher found for: <span className="ml-2 font-medium">{missingTeacherSubjects.join(", ")}</span>
                  </div>
                )}
                {unassignedCount > 0 && (
                  <div className={missingTeacherSubjects.length > 0 ? "mt-1" : ""}>
                    Unallotted periods: <span className="font-medium">{unassignedCount}</span>
                  </div>
                )}
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 sticky left-0 z-10 w-20" />
                  {days.map((day) => (
                    <th key={day} className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase text-center py-3 px-2">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, pi) => (
                  <tr key={pi}>
                    <td className={`sticky left-0 bg-white z-10 text-xs text-gray-500 font-medium text-center w-20 ${period.break ? "text-amber-600" : ""}`}>
                      {period.break ? "Break" : (
                        <>{period.label}<br /><span className="font-normal">{period.time}</span></>
                      )}
                    </td>
                    {days.map((_day, di) => {
                      const cell = grid[pi]?.[di] || { type: "empty" };

                      if (cell.type === "holiday") {
                        return (
                          <td key={di} className="bg-gray-50 cursor-not-allowed border border-gray-100 h-20 w-36 align-top p-1.5">
                            <div className="flex items-center justify-center h-full text-xs text-gray-400 font-medium">Holiday</div>
                          </td>
                        );
                      }
                      if (cell.type === "break") {
                        return (
                          <td key={di} className="bg-amber-50 cursor-not-allowed border border-gray-100 h-20 w-36 align-top p-1.5">
                            <div className="flex items-center justify-center h-full text-xs text-amber-600 font-medium">Break</div>
                          </td>
                        );
                      }
                      if (cell.type === "conflict") {
                        return (
                          <td
                            key={di}
                            className={`bg-red-50 border-red-300 border h-20 w-36 align-top p-1.5 relative ${isTeacher ? "cursor-default" : "cursor-pointer hover:bg-red-100"}`}
                            onClick={() => !isTeacher && handleCellClick(pi, di)}
                            {...(!isTeacher ? makeDragDropProps(pi, di) : {})}
                          >
                            <div className="absolute top-1 right-1"><AlertTriangle size={12} className="text-red-400" /></div>
                            <div className="text-xs font-semibold text-red-700">{cell.subject}</div>
                            <div className="text-xs text-gray-500 mt-1">{cell.teacher}</div>
                          </td>
                        );
                      }
                      if (cell.type === "proxy") {
                        const colors = getSubjectColors(cell.subject);
                        return (
                          <td
                            key={di}
                            className={`bg-yellow-50 border-yellow-300 border h-20 w-36 align-top p-1.5 relative ${isTeacher ? "cursor-default" : "cursor-pointer hover:bg-yellow-100"}`}
                            onClick={() => !isTeacher && handleCellClick(pi, di)}
                            {...(!isTeacher ? makeDragDropProps(pi, di) : {})}
                          >
                            <div className="absolute top-1 right-1 bg-yellow-100 rounded px-1 text-xs text-yellow-700">Proxy</div>
                            <div className="rounded-lg px-2 py-1" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                              <div className="text-xs font-semibold">{cell.subject}</div>
                              <div className="text-xs opacity-80 mt-0.5">{cell.teacher}</div>
                            </div>
                          </td>
                        );
                      }
                      if (cell.type === "filled") {
                        const colors = getSubjectColors(cell.subject);
                        return (
                          <td
                            key={di}
                            className={`bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative ${isTeacher ? "cursor-default" : "cursor-pointer hover:bg-blue-50 hover:border-blue-200"}`}
                            onClick={() => !isTeacher && handleCellClick(pi, di)}
                            {...(!isTeacher ? makeDragDropProps(pi, di) : {})}
                          >
                            <div className="rounded-lg px-2 py-1" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                              <div className="text-xs font-semibold">{cell.subject}</div>
                              <div className="text-xs opacity-80 mt-0.5">{cell.teacher}</div>
                              <div className="text-xs opacity-70">
                                {view === "teacher" && cell.classKey ? cell.classKey : cell.room}
                              </div>
                            </div>
                          </td>
                        );
                      }
                      // empty
                      return (
                        <td
                          key={di}
                          className={`bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative ${isTeacher ? "cursor-default" : "cursor-pointer hover:bg-blue-50 hover:border-blue-200"}`}
                          onClick={() => !isTeacher && handleCellClick(pi, di)}
                          {...(!isTeacher ? makeDragDropProps(pi, di) : {})}
                        >
                          {!isTeacher && (
                            <div className="flex items-center justify-center h-full w-full">
                              <Plus size={20} className="text-gray-300" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {view === "class" && (
            <div className="w-72 shrink-0">
              <div className="rounded-xl border border-gray-200 bg-white p-3 mr-4 mt-4">
                <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Drag & Drop</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">Subjects & Teachers</div>
                <div className="mt-3 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {selectedClass &&
                    getSubjectsForClass(subjectsData, selectedClass.split("-")[0]).map((subject) => {
                      const teachersForSubject = getTeachersForSubject(teachers, subject, selectedClass.split("-")[0]);
                      const colors = getSubjectColors(subject);
                      if (teachersForSubject.length === 0) {
                        return (
                          <div key={subject} className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
                            {subject} — No teacher
                          </div>
                        );
                      }
                      return teachersForSubject.map((teacher) => (
                        <div
                          key={`${subject}-${teacher.id}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/json", JSON.stringify({ subject, teacher: teacher.name }));
                          }}
                          className="rounded-lg border px-3 py-2 text-xs cursor-grab active:cursor-grabbing shadow-sm select-none"
                          style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                        >
                          <div className="font-semibold text-sm">{subject}</div>
                          <div className="text-xs opacity-80">{teacher.name}</div>
                        </div>
                      ));
                    })}
                  {!selectedClass && (
                    <div className="text-xs text-gray-400">Select a class to see draggable tiles.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Bar */}
      <div className="flex gap-6 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl items-center">
        <span className="text-sm text-gray-600">{filledCount}/{totalPeriods} periods filled</span>
        <span className={`text-sm ${conflictCount === 0 ? "text-green-600" : "text-red-600"}`}>
          Conflicts: {conflictCount === 0 ? "0" : <span className="bg-red-100 text-red-700 rounded px-2 py-0.5">{conflictCount}</span>}
        </span>
        <button className="border rounded-lg px-3 py-1.5 text-sm ml-auto text-gray-600 hover:bg-white">Export</button>
      </div>

      {/* Slot assignment Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Assign Slot</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select value={assignSubject} onValueChange={setAssignSubject}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg z-[200]">
                {selectedClass &&
                  getSubjectsForClass(subjectsData, selectedClass.split("-")[0]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {assignSubject && selectedClass && (
              <div className={`mt-2 text-xs p-2 rounded ${canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: assignSubject }) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {(() => {
                  const status = getAvailabilityStatus({ subjectsData, gridsByClass, selectedClass, subjectName: assignSubject });
                  const usedDay = dialog.di !== null ? getUsedPeriodsForSubjectInClassDay(gridsByClass, selectedClass, assignSubject, dialog.di) : 0;
                  return `Availability: ${status.used}/${status.available} • Class: ${status.usedClass}/${SUBJECT_MAX_PERIODS} • Day: ${usedDay}/${SUBJECT_MAX_PER_DAY}`;
                })()}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Teacher</label>
            <Select value={assignTeacher} onValueChange={setAssignTeacher}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg z-[200]">
                {assignSubject && selectedClass &&
                  getTeachersForSubject(teachers, assignSubject, selectedClass.split("-")[0]).map((t) => {
                    const currentTeacher = dialog.pi !== null && dialog.di !== null
                      ? grid[dialog.pi]?.[dialog.di]?.teacher
                      : null;
                    const booked = dialog.pi !== null && dialog.di !== null
                      ? getBookedTeachersForSlot(gridsByClass, dialog.pi, dialog.di).has(t.name) && t.name !== currentTeacher
                      : false;
                    const dailyLimitReached = dialog.di !== null
                      ? !canAssignTeacherForDay(gridsByClass, t.name, dialog.di, currentTeacher)
                      : false;
                    const disabled = booked || dailyLimitReached;
                    const suffix = booked ? " (Booked)" : dailyLimitReached ? " (Daily limit reached)" : "";
                    return (
                      <SelectItem key={t.id} value={t.name} disabled={disabled}>
                        {t.name}{suffix}
                      </SelectItem>
                    );
                  })}
                {assignSubject && selectedClass &&
                  getTeachersForSubject(teachers, assignSubject, selectedClass.split("-")[0]).length === 0 && (
                  <div className="px-3 py-2 text-gray-400 text-xs">No teacher available</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 mr-2"
              onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                !assignSubject || !assignTeacher ||
                (assignSubject && selectedClass && !canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: assignSubject }))
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleAssign}
              disabled={!assignSubject || !assignTeacher || (assignSubject && selectedClass && !canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: assignSubject }))}
            >
              {assignSubject && selectedClass && !canAssignSubjectForClass({ subjectsData, gridsByClass, classKey: selectedClass, subjectName: assignSubject }) ? "Limit Reached" : "Assign"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirmation dialog (SPA navigation guard) */}
      {leaveConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0" />
              <h3 className="font-semibold text-gray-900">Unpublished Changes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              You have timetable changes that haven't been published to the database. Leave anyway?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setLeaveConfirm(null)}
              >
                Stay
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                onClick={() => {
                  setIsDirty(false);
                  window.location.href = leaveConfirm;
                }}
              >
                Leave Without Publishing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
