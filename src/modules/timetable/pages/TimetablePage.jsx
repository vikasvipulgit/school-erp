import React, { useState, useEffect, useRef } from "react";
import { Plus, AlertTriangle } from "lucide-react";
// Import shadcn/ui Select and Dialog components
// (Assume these are available as Select, SelectTrigger, SelectContent, SelectItem, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button)
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
import classData from "@/data/classes.json";
import subjectsData from "@/data/subjects.json";
import teachersData from "@/data/teachers.json";

const classOptions = classData.flatMap((entry) =>
  entry.sections.map((section) => ({
    value: `${entry.class}-${section}`,
    label: `${entry.class} - ${section}`,
  }))
);
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const periods = [
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
export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [view, setView] = useState("class");
  const [gridsByClass, setGridsByClass] = useState({});
  const [dialog, setDialog] = useState({ open: false, pi: null, di: null });
  const [assignSubject, setAssignSubject] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");
  const [teachers, setTeachers] = useState(teachersData);
  const publishedRef = useRef(false);
  const [showNavGuard, setShowNavGuard] = useState(false);
  const [pendingNav, setPendingNav] = useState(false);
  const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false);

  // Load timetable from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("erp_timetable");
    if (saved) {
      try {
        setGridsByClass(JSON.parse(saved));
      } catch {}
    }
    // Load teacher assignments from sessionStorage
    const tSaved = sessionStorage.getItem("erp_teacher_assignments");
    if (tSaved) {
      try {
        setTeachers(JSON.parse(tSaved));
      } catch {}
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
  }, []);

  // Save timetable to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("erp_timetable", JSON.stringify(gridsByClass));
  }, [gridsByClass]);

  // Save teacher assignments to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("erp_teacher_assignments", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    if (!hasLoadedPrefs) return;
    sessionStorage.setItem(
      "erp_timetable_prefs",
      JSON.stringify({ selectedClass, view })
    );
  }, [selectedClass, view, hasLoadedPrefs]);

  // Count filled periods
  const grid =
    gridsByClass[selectedClass] || getInitialGrid({ periods, days, isHolidayDay });
  const filledCount = grid.flat().filter((c) => c.type === "filled" || c.type === "proxy" || c.type === "conflict").length;
  const totalPeriods = grid.flat().filter((c) => c.type !== "break" && c.type !== "holiday").length;
  const conflictCount = grid.flat().filter((c) => c.type === "conflict").length;
  const unassignedCount = grid.flat().filter((c) => c.type === "empty").length;
  const missingTeacherSubjects = selectedClass
    ? getSubjectsForClass(subjectsData, selectedClass.split("-")[0]).filter(
        (subject) =>
          getTeachersForSubject(teachers, subject, selectedClass.split("-")[0]).length === 0
      )
    : [];

  const handleCellClick = (pi, di) => {
    if (!selectedClass) return;
    if (grid[pi][di].type === "break" || grid[pi][di].type === "holiday") return;
    const cell = grid[pi][di];
    setDialog({ open: true, pi, di });
    setAssignSubject(cell?.subject || "");
    setAssignTeacher(cell?.teacher || "");
  };

  const handleAssign = () => {
    // Check availability before assignment
    if (assignSubject && selectedClass) {
      if (dialog.di === null || dialog.di === undefined) return;
      const status = getAvailabilityStatus({
        subjectsData,
        gridsByClass,
        selectedClass,
        subjectName: assignSubject,
      });
      if (
        !canAssignSubjectForClass({
          subjectsData,
          gridsByClass,
          classKey: selectedClass,
          subjectName: assignSubject,
        })
      ) {
        alert(
          `Cannot assign ${assignSubject}. Max ${SUBJECT_MAX_PERIODS} periods per class (currently ${status.usedClass}), or global availability limit reached.`
        );
        return;
      }
      if (
        !canAssignSubjectForClassDay({
          gridsByClass,
          classKey: selectedClass,
          subjectName: assignSubject,
          dayIndex: dialog.di,
        })
      ) {
        alert(
          `Cannot assign ${assignSubject}. Max ${SUBJECT_MAX_PER_DAY} periods per day for a class (already ${getUsedPeriodsForSubjectInClassDay(
            gridsByClass,
            selectedClass,
            assignSubject,
            dialog.di
          )}).`
        );
        return;
      }
    }

    setGridsByClass((prev) => {
      const current =
        prev[selectedClass] || getInitialGrid({ periods, days, isHolidayDay });
      const next = current.map((row) => [...row]);
      next[dialog.pi][dialog.di] = {
        type: "filled",
        subject: assignSubject,
        teacher: assignTeacher,
        room: "101",
      };
      // Save to localStorage handled by useEffect
      return { ...prev, [selectedClass]: next };
    });
    // Close dialog and reset form
    setDialog({ open: false, pi: null, di: null });
    setAssignSubject("");
    setAssignTeacher("");
  };

  // Auto-assign handler (page-level)
  const handleAutoAssign = () => {
    if (!selectedClass) return;
    publishedRef.current = false;
    setGridsByClass((prev) =>
      autoAssignForClass({
        selectedClass,
        gridsByClass: prev,
        periods,
        days,
        subjectsData,
        teachersData: teachers,
        isHolidayDay,
      })
    );
  };

  // Publish handler
  const handlePublish = () => {
    const classKeys = new Set(Object.keys(gridsByClass));
    if (selectedClass) classKeys.add(selectedClass);
    const violations = Array.from(classKeys).flatMap((classKey) =>
      getSubjectRuleViolationsForClass({
        classKey,
        gridsByClass,
        subjectsData,
        days,
        getSubjectsForClass,
        isHolidayDay,
      })
    );
    if (violations.length > 0) {
      const preview = violations
        .slice(0, 10)
        .map((v) =>
          v.day
            ? `${v.classKey}: ${v.subject} (${v.used}) on ${v.day}`
            : `${v.classKey}: ${v.subject} (${v.used})`
        )
        .join("\n");
      const more =
        violations.length > 10
          ? `\n...and ${violations.length - 10} more`
          : "";
      alert(
        `Cannot publish. Each subject must have ${SUBJECT_MIN_PERIODS}-${SUBJECT_MAX_PERIODS} periods per class and max ${SUBJECT_MAX_PER_DAY} per day.\n` +
          preview +
          more
      );
      return;
    }
    sessionStorage.setItem("erp_teacher_assignments", JSON.stringify(teachers));
    publishedRef.current = true;
    setShowNavGuard(false);
    setPendingNav(false);
    alert("Assignments published and saved for this session.");
  };

  // Confirm navigation handler
  const confirmNav = () => {
    setShowNavGuard(false);
    setPendingNav(false);
    publishedRef.current = true;
    window.history.back();
  };

  // Derived states
  const isClassSelected = !!selectedClass;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex gap-3 items-center p-4 border-b border-gray-100">
        {/* Class Select */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-40 bg-white border border-gray-300 rounded-lg">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg">
            {classOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* View Toggle */}
        <div className="flex gap-0.5 ml-2">
          <button
            className={
              view === "class"
                ? "bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm"
                : "bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
            }
            onClick={() => setView("class")}
          >
            Class View
          </button>
          <button
            className={
              view === "teacher"
                ? "bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm"
                : "bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
            }
            onClick={() => setView("teacher")}
          >
            Teacher View
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={handleAutoAssign}
            disabled={!isClassSelected}
          >
            Auto Assign
          </button>
          <button 
            className="bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
            onClick={handlePublish}
          >
            Publish Timetable
          </button>
        </div>
      </div>
      {/* Timetable Grid */}
      <div className={`overflow-x-auto ${!isClassSelected ? "opacity-60 pointer-events-none" : ""}`}>
        {isClassSelected && (missingTeacherSubjects.length > 0 || unassignedCount > 0) && (
          <div className="mx-4 mt-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {missingTeacherSubjects.length > 0 && (
              <div>
                No teacher found for:
                <span className="ml-2 font-medium">
                  {missingTeacherSubjects.join(", ")}
                </span>
                <div className="mt-1 text-xs text-amber-800">
                  Reason: No teacher in `teachers.json` is assigned to this subject for the selected class.
                </div>
              </div>
            )}
            {unassignedCount > 0 && (
              <div className={missingTeacherSubjects.length > 0 ? "mt-1" : ""}>
                Unallotted periods remaining:{" "}
                <span className="font-medium">{unassignedCount}</span>
                <div className="mt-1 text-xs text-amber-800">
                  Reason: There are empty slots in the timetable that have not been assigned a subject and teacher yet.
                </div>
              </div>
            )}
          </div>
        )}
        <table className="w-full">
          <thead>
            <tr>
              <th className="bg-gray-50 sticky left-0 z-10 w-20"></th>
              {days.map((day) => (
                <th
                  key={day}
                  className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase text-center py-3 px-2"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, pi) => (
              <tr key={pi}>
                <td className={`sticky left-0 bg-white z-10 text-xs text-gray-500 font-medium text-center w-20 ${period.break ? "text-amber-600 font-medium" : ""}`}>
                  {period.break ? "Break" : (
                    <>
                      {period.label}
                      <br />
                      <span className="font-normal">{period.time}</span>
                    </>
                  )}
                </td>
                {days.map((day, di) => {
                  const cell = grid[pi][di];
                  if (cell.type === "holiday") {
                    return (
                      <td
                        key={di}
                        className="bg-gray-50 cursor-not-allowed border border-gray-100 h-20 w-36 align-top p-1.5 relative"
                      >
                        <div className="flex items-center justify-center h-full text-xs text-gray-500 font-medium">
                          Holiday
                        </div>
                      </td>
                    );
                  }
                  if (cell.type === "break") {
                    return (
                      <td
                        key={di}
                        className="bg-amber-50 cursor-not-allowed border border-gray-100 h-20 w-36 align-top p-1.5 relative"
                      >
                        <div className="flex items-center justify-center h-full text-xs text-amber-600 font-medium">Break</div>
                      </td>
                    );
                  }
                  if (cell.type === "conflict") {
                    return (
                      <td
                        key={di}
                        className="bg-red-50 border-red-300 border h-20 w-36 align-top p-1.5 relative cursor-pointer hover:bg-red-100"
                        onClick={() => handleCellClick(pi, di)}
                      >
                        <div className="absolute top-1 right-1"><AlertTriangle size={12} className="text-red-400" /></div>
                        <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block">{cell.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{cell.teacher}</div>
                        <div className="text-xs text-gray-400">{cell.room}</div>
                      </td>
                    );
                  }
                  if (cell.type === "proxy") {
                    return (
                      <td
                        key={di}
                        className="bg-yellow-50 border-yellow-300 border h-20 w-36 align-top p-1.5 relative cursor-pointer hover:bg-yellow-100"
                        onClick={() => handleCellClick(pi, di)}
                      >
                        <div className="absolute top-1 right-1 bg-yellow-100 rounded px-1 text-xs text-yellow-700">Proxy</div>
                        <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block">{cell.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{cell.teacher}</div>
                        <div className="text-xs text-gray-400">{cell.room}</div>
                      </td>
                    );
                  }
                  if (cell.type === "filled") {
                    return (
                      <td
                        key={di}
                        className="bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => handleCellClick(pi, di)}
                      >
                        <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block">{cell.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{cell.teacher}</div>
                        <div className="text-xs text-gray-400">{cell.room}</div>
                      </td>
                    );
                  }
                  // empty
                  return (
                    <td
                      key={di}
                      className="bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => handleCellClick(pi, di)}
                    >
                      <div className="flex items-center justify-center h-full w-full">
                        <Plus size={24} className="text-gray-300 group-hover:opacity-100" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary Bar */}
      <div className="flex gap-6 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl items-center">
        <span className="text-sm text-gray-600">{filledCount}/{totalPeriods} periods filled</span>
        <span className={`text-sm ${conflictCount === 0 ? "text-emerald-600" : "text-red-600"}`}>
          Conflicts: {conflictCount === 0 ? conflictCount : <span className="bg-red-100 text-red-700 rounded px-2 py-0.5">{conflictCount}</span>}
        </span>
        <button className="border rounded-lg px-3 py-1.5 text-sm ml-auto">Export</button>
      </div>
      {/* Dialog for slot assignment */}
      <Dialog open={dialog.open} onOpenChange={open => setDialog({ ...dialog, open })}>
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
                <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg">
                  {selectedClass &&
                    getSubjectsForClass(subjectsData, selectedClass.split("-")[0]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assignSubject && (
                <div className={`mt-2 text-xs p-2 rounded ${
                  selectedClass &&
                  canAssignSubjectForClass({
                    subjectsData,
                    gridsByClass,
                    classKey: selectedClass,
                    subjectName: assignSubject,
                  })
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {(() => {
                    const status = getAvailabilityStatus({
                      subjectsData,
                      gridsByClass,
                      selectedClass,
                      subjectName: assignSubject,
                    });
                    const usedDay =
                      selectedClass && dialog.di !== null
                        ? getUsedPeriodsForSubjectInClassDay(
                            gridsByClass,
                            selectedClass,
                            assignSubject,
                            dialog.di
                          )
                        : 0;
                    return `Availability: ${status.used}/${status.available} used (${status.remaining} remaining) • Class: ${status.usedClass}/${SUBJECT_MAX_PERIODS} used • Day: ${usedDay}/${SUBJECT_MAX_PER_DAY}`;
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
                <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-lg">
                  {assignSubject &&
                    selectedClass &&
                    getTeachersForSubject(teachers, assignSubject, selectedClass.split("-")[0]).map((t) => {
                    const currentTeacher =
                      dialog.pi !== null && dialog.di !== null
                        ? grid[dialog.pi][dialog.di].teacher
                        : null;
                    const booked =
                      dialog.pi !== null && dialog.di !== null
                        ? getBookedTeachersForSlot(gridsByClass, dialog.pi, dialog.di).has(t.name) && t.name !== currentTeacher
                        : false;
                    return (
                      <SelectItem key={t.id} value={t.name} disabled={booked}>
                        {t.name}{booked ? " (Booked)" : ""}
                      </SelectItem>
                    );
                  })}
                  {assignSubject &&
                    selectedClass &&
                    getTeachersForSubject(teachers, assignSubject, selectedClass.split("-")[0]).length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-xs">No teacher available for this subject/class</div>
                  )}
                </SelectContent>
              </Select>
          </div>
          <DialogFooter>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                !assignSubject ||
                !assignTeacher ||
                (assignSubject &&
                  selectedClass &&
                  !canAssignSubjectForClass({
                    subjectsData,
                    gridsByClass,
                    classKey: selectedClass,
                    subjectName: assignSubject,
                  }))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              onClick={handleAssign}
              disabled={
                !assignSubject ||
                !assignTeacher ||
                (assignSubject &&
                  selectedClass &&
                  !canAssignSubjectForClass({
                    subjectsData,
                    gridsByClass,
                    classKey: selectedClass,
                    subjectName: assignSubject,
                  }))
              }
            >
              {assignSubject &&
              selectedClass &&
              !canAssignSubjectForClass({
                subjectsData,
                gridsByClass,
                classKey: selectedClass,
                subjectName: assignSubject,
              })
                ? 'Limit Reached'
                : 'Assign'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
