import React, { useState } from "react";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import classData from "@/data/classes.json";
import subjectsData from "@/data/subjects.json";
import teachersData from "@/data/teachers.json";

const classOptions = classData.flatMap((entry) =>
  entry.sections.map((section) => ({
    value: `${entry.class}-${section}`,
    label: `${entry.class} - ${section}`,
  }))
);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periods = [
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
const subjects = subjectsData.map((s) => s.name);
const teachers = teachersData.map((t) => t.name);

function getInitialGrid() {
  // Mock grid: [periodIdx][dayIdx] = cell
  // cell: { type: 'empty'|'filled'|'conflict'|'break'|'proxy', ... }
  return periods.map((period, pi) =>
    days.map((day, di) => {
      if (period.break) return { type: "break" };
      if (pi === 2 && di === 1) return { type: "conflict", subject: "Math", teacher: "Mr. Smith", room: "201" };
      if (pi === 4 && di === 3) return { type: "proxy", subject: "English", teacher: "Ms. Lee", room: "105" };
      if (pi === 0 && di === 0) return { type: "filled", subject: "Math", teacher: "Mr. Smith", room: "201" };
      return { type: "empty" };
    })
  );
}

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [view, setView] = useState("class");
  const [gridsByClass, setGridsByClass] = useState({});
  const [dialog, setDialog] = useState({ open: false, pi: null, di: null });
  const [assignSubject, setAssignSubject] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");

  // Count filled periods
  const grid = gridsByClass[selectedClass] || getInitialGrid();
  const filledCount = grid.flat().filter((c) => c.type === "filled" || c.type === "proxy" || c.type === "conflict").length;
  const totalPeriods = grid.flat().filter((c) => !c.break).length;
  const conflictCount = grid.flat().filter((c) => c.type === "conflict").length;

  const isClassSelected = Boolean(selectedClass);

  // Cell click handler
  const handleCellClick = (pi, di) => {
    if (!isClassSelected) return;
    if (grid[pi][di].type === "break") return;
    setDialog({ open: true, pi, di });
    setAssignSubject("");
    setAssignTeacher("");
  };
  // Assign slot
  const handleAssign = () => {
    setGridsByClass((prev) => {
      const current = prev[selectedClass] || getInitialGrid();
      const next = current.map((row) => [...row]);
      next[dialog.pi][dialog.di] = {
        type: "filled",
        subject: assignSubject,
        teacher: assignTeacher,
        room: "101",
      };
      return { ...prev, [selectedClass]: next };
    });
    setDialog({ open: false, pi: null, di: null });
  };

  const getBookedTeachersForSlot = (pi, di) => {
    return Object.entries(gridsByClass).reduce((acc, [cls, g]) => {
      if (!g || !g[pi] || !g[pi][di]) return acc;
      const cell = g[pi][di];
      if (cell && cell.teacher) {
        acc.add(cell.teacher);
      }
      return acc;
    }, new Set());
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex gap-3 items-center p-4 border-b border-gray-100">
        {/* Class Select */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md">
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
        <div className="ml-auto">
          <button className="bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium">
            Publish Timetable
          </button>
        </div>
      </div>
      {!isClassSelected ? (
        <div className="px-4 py-3 text-sm text-gray-500">
          Select a class to enable timetable editing.
        </div>
      ) : null}
      {/* Timetable Grid */}
      <div className={`overflow-x-auto ${!isClassSelected ? "opacity-60 pointer-events-none" : ""}`}>
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
                        className="bg-red-50 border-red-300 border h-20 w-36 align-top p-1.5 relative"
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
                        className="bg-yellow-50 border-yellow-300 border h-20 w-36 align-top p-1.5 relative"
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
                        className="bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative"
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
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md">
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Teacher</label>
              <Select value={assignTeacher} onValueChange={setAssignTeacher}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md">
                  {teachers.map((t) => {
                    const currentTeacher =
                      dialog.pi !== null && dialog.di !== null
                        ? grid[dialog.pi][dialog.di].teacher
                        : null;
                    const booked =
                      dialog.pi !== null && dialog.di !== null
                        ? getBookedTeachersForSlot(dialog.pi, dialog.di).has(t) && t !== currentTeacher
                        : false;
                    return (
                      <SelectItem key={t} value={t} disabled={booked}>
                        {t}{booked ? " (Booked)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              className="bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
              onClick={handleAssign}
              disabled={!assignSubject || !assignTeacher}
            >
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
