

import React, { useMemo, useState, useEffect } from "react";
import teachersData from "@/data/teachers.json";
import { days, periods } from "./TimetablePage";

import { Plus, Check, Pencil, Copy, Trash2 } from "lucide-react";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  cloneTeacher,
} from "../services/teachersService";
import classesData from "@/data/classes.json";
import { Button } from "@/core/components/Button";
import { Input } from "@/core/components/Input";
import { Card } from "@/core/components/Card";
import { SectionHeader } from "@/core/components/SectionHeader";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

function flattenClasses(data) {
  return data.map((item) => item.class);
}

export default function TeachersPage() {
  // Defensive: check config
  if (!Array.isArray(days) || !Array.isArray(periods)) {
    return <div className="text-red-600 p-4">Error: Timetable configuration missing. Please check your imports.</div>;
  }
  // Teachers state is loaded from service for modularity and backend readiness
  const [teachers, setTeachers] = useState([]);
    // Load teachers on mount
    React.useEffect(() => {
      (async () => {
        const list = await getTeachers();
        setTeachers(list);
      })();
    }, []);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [tab, setTab] = useState("list");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherTimetable, setTeacherTimetable] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, teacher: null });

  // Load timetable from localStorage and build teacher-wise timetable
  useEffect(() => {
    let gridsByClass = {};
    try {
      const saved = localStorage.getItem("erp_timetable");
      if (saved) gridsByClass = JSON.parse(saved);
    } catch {
      setTeacherTimetable({});
      return;
    }
    // Build teacher-wise timetable: { [teacherId]: grid }
    const teacherMap = {};
    Object.entries(gridsByClass).forEach(([classSection, grid]) => {
      grid.forEach((row, pi) => {
        row.forEach((cell, di) => {
          if (cell && cell.teacher) {
            // Find teacher by name
            const teacher = teachersData.find(t => t.name === cell.teacher);
            if (!teacher) return;
            if (!teacherMap[teacher.id]) {
              // Initialize empty grid for teacher
              teacherMap[teacher.id] = periods.map(() => days.map(() => null));
            }
            teacherMap[teacher.id][pi][di] = {
              ...cell,
              classSection,
            };
          }
        });
      });
    });
    setTeacherTimetable(teacherMap);
  }, [tab]);

  const classList = useMemo(() => flattenClasses(classesData), []);

  const filtered = teachers.filter((t) =>
    [t.name, t.shortName, t.subject]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setShortName("");
    setSubject("");
    setSelectedClasses([]);
    setEditingId(null);
  };

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  /**
   * Save teacher (add or update)
   * If backend is ready, replace with API call and handle errors
   */
  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) return;
    if (editingId) {
      await updateTeacher(editingId, {
        name: name.trim(),
        shortName: shortName.trim() || autoShortName(name.trim()),
        subject: subject.trim(),
        classes: selectedClasses.length ? selectedClasses : [],
      });
    } else {
      await addTeacher({
        name: name.trim(),
        shortName: shortName.trim() || autoShortName(name.trim()),
        subject: subject.trim(),
        phone: "",
        classes: selectedClasses.length ? selectedClasses : [],
      });
    }
    setTeachers(await getTeachers());
    setIsAddOpen(false);
    resetForm();
  };

  /**
   * Edit teacher (populate form)
   */
  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setName(teacher.name || "");
    setShortName(teacher.shortName || "");
    setSubject(teacher.subject || "");
    setSelectedClasses(teacher.classes || []);
    setIsAddOpen(true);
  };

  /**
   * Clone teacher
   * If backend is ready, replace with API call and handle errors
   */
  const handleClone = (teacher) => {
    setConfirmDialog({ open: true, action: "clone", teacher });
  };

  /**
   * Delete teacher
   * If backend is ready, replace with API call and handle errors
   */
  const handleDelete = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setConfirmDialog({ open: true, action: "delete", teacher });
  };

  /**
   * Confirm clone action
   */
  const confirmClone = async () => {
    await cloneTeacher(confirmDialog.teacher);
    setTeachers(await getTeachers());
    setConfirmDialog({ open: false, action: null, teacher: null });
  };

  /**
   * Confirm delete action
   */
  const confirmDelete = async () => {
    await deleteTeacher(confirmDialog.teacher.id);
    setTeachers(await getTeachers());
    setConfirmDialog({ open: false, action: null, teacher: null });
  };

  return (
    <div>
      <SectionHeader
        className="mb-4"
        title="Teachers"
        description="Manage teachers and their subject assignments"
      />
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border-gray-200"}`}
          onClick={() => setTab("list")}
        >Teacher List</button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === "timetable" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border-gray-200"}`}
          onClick={() => setTab("timetable")}
        >Teacher Timetable</button>
      </div>

      {tab === "list" && (
        <>
          <div className="mb-4 flex gap-2 items-end">
            <button
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center gap-2"
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
            >
              <Plus size={16} /> Add Teacher
            </button>
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teachers..."
              />
            </div>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_2fr_1.5fr] gap-4 px-4 py-3 border-b text-sm font-semibold text-gray-700">
              <div>Name</div>
              <div>Short Name</div>
              <div>Subject</div>
              <div>Classes</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {filtered.map((t) => (
                <div key={t.id} className="grid grid-cols-[1.5fr_1fr_1fr_2fr_1.5fr] gap-4 px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-gray-700">{t.shortName}</div>
                  <div className="text-gray-700">{t.subject}</div>
                  <div className="text-gray-700">
                    {t.classes && t.classes.length ? t.classes.join(", ") : "—"}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      onClick={() => handleEdit(t)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                      onClick={() => handleClone(t)}
                    >
                      <Copy size={14} /> Clone
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {!filtered.length ? (
                <div className="px-4 py-6 text-sm text-gray-500">No teachers found.</div>
              ) : null}
            </div>
          </Card>
        </>
      )}

      {tab === "timetable" && (
        <div className="bg-white border rounded-xl p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Teacher</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={selectedTeacher}
              onChange={e => setSelectedTeacher(e.target.value)}
            >
              <option value="">-- Select --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
              ))}
            </select>
          </div>
          {selectedTeacher && teacherTimetable[selectedTeacher] && (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="bg-gray-50 sticky left-0 z-10 w-20">Period</th>
                    {days.map(day => (
                      <th key={day} className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase text-center py-3 px-2">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, pi) => (
                    <tr key={pi}>
                      <td className="sticky left-0 bg-white z-10 text-xs text-gray-500 font-medium text-center w-20">{period.break ? "Break" : (<>{period.label}<br /><span className="font-normal">{period.time}</span></>)}</td>
                      {days.map((day, di) => {
                        const cell = teacherTimetable[selectedTeacher][pi][di];
                        if (period.break) {
                          return <td key={di} className="bg-amber-50 border border-gray-100 h-20 w-36 align-top p-1.5 relative text-xs text-amber-600 font-medium text-center">Break</td>;
                        }
                        if (!cell) {
                          return <td key={di} className="bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative"></td>;
                        }
                        return (
                          <td key={di} className="bg-white border border-gray-100 h-20 w-36 align-top p-1.5 relative">
                            <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block">{cell.subject}</div>
                            <div className="text-xs text-gray-500 mt-1">{cell.classSection}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedTeacher && !teacherTimetable[selectedTeacher] && (
            <div className="text-gray-500 text-sm">No timetable assigned for this teacher.</div>
          )}
        </div>
      )}

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Name</label>
              <Input
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g., J.Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Classes</label>
              <div className="grid grid-cols-3 gap-2">
                {classList.map((cls) => (
                  <label key={cls} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls)}
                      onChange={() => toggleClass(cls)}
                      className="rounded"
                    />
                    {cls}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setIsAddOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              onClick={handleSave}
            >
              {editingId ? "Update" : "Add"} Teacher
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "clone" ? "Clone Teacher?" : "Delete Teacher?"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            {confirmDialog.action === "clone" ? (
              <p>Are you sure you want to clone <strong>{confirmDialog.teacher?.name}</strong>? This will create a new teacher with the same details.</p>
            ) : (
              <p>Are you sure you want to delete <strong>{confirmDialog.teacher?.name}</strong>? This action cannot be undone.</p>
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setConfirmDialog({ open: false, action: null, teacher: null })}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                confirmDialog.action === "clone"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={() => {
                if (confirmDialog.action === "clone") {
                  confirmClone();
                } else {
                  confirmDelete();
                }
              }}
            >
              {confirmDialog.action === "clone" ? "Clone" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function autoShortName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  const first = parts[0][0].toUpperCase();
  const last = parts[parts.length - 1];
  return `${first}.${capitalize(last)}`;
}

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}
