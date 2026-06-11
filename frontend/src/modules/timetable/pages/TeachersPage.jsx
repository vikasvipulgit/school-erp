

import React, { useMemo, useState, useEffect } from "react";
import { days, periods } from "./TimetablePage";

import { Plus, Check, Pencil, Copy, Trash2 } from "lucide-react";
import {
  getTeachers,
  getSubjects,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../services/teachersService";
import { useClasses } from "@/core/context/ClassesContext";
import { useAuth } from "@/core/context/AuthContext";
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
  const { classes } = useClasses();
  const { role } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Load teachers and subjects on mount
  React.useEffect(() => {
    (async () => {
      const [teacherList, subjectList] = await Promise.all([
        getTeachers(),
        getSubjects()
      ]);
      setTeachers(teacherList);
      setSubjects(subjectList);
    })();
  }, []);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacherClassId, setClassTeacherClassId] = useState("");
  const [tab, setTab] = useState("list");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherTimetable, setTeacherTimetable] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, teacher: null });
  const [saveError, setSaveError] = useState("");

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
    const teacherMap = {};
    Object.entries(gridsByClass).forEach(([classSection, grid]) => {
      grid.forEach((row, pi) => {
        row.forEach((cell, di) => {
          if (cell && cell.teacher) {
            const teacher = teachers.find(t => t.name === cell.teacher);
            if (!teacher) return;
            if (!teacherMap[teacher.id]) {
              teacherMap[teacher.id] = periods.map(() => days.map(() => null));
            }
            teacherMap[teacher.id][pi][di] = { ...cell, classSection };
          }
        });
      });
    });
    setTeacherTimetable(teacherMap);
  }, [tab, teachers]);

  const classList = useMemo(() => flattenClasses(classes), [classes]);

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
    setSubjectId("");
    setEmail("");
    setPassword("");
    setSelectedClasses([]);
    setIsClassTeacher(false);
    setClassTeacherClassId("");
    setEditingId(null);
    setSaveError("");
  };

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !subjectId) {
      setSaveError("Name and Subject are required.");
      return;
    }
    if (!editingId && (!email.trim() || !password.trim())) {
      setSaveError("Email and password are required.");
      return;
    }
    if (isClassTeacher && !classTeacherClassId) {
      setSaveError("Class Teacher Of is required when assigning as Class Teacher.");
      return;
    }
    setSaveError("");
    const selectedSubject = subjects.find(s => s.id === subjectId);
    const subjectName = selectedSubject ? selectedSubject.name : "";

    try {
      if (editingId) {
        await updateTeacher(editingId, {
          name: name.trim(),
          shortName: shortName.trim() || autoShortName(name.trim()),
          subjectId,
          subjectName,
          classes: selectedClasses.length ? selectedClasses : [],
          isClassTeacher,
          classTeacherClassId: isClassTeacher ? classTeacherClassId : null,
        });
      } else {
        await addTeacher({
          name: name.trim(),
          shortName: shortName.trim() || autoShortName(name.trim()),
          subjectId,
          subjectName,
          email: email.trim(),
          password: password.trim(),
          phone: "",
          classes: selectedClasses.length ? selectedClasses : [],
          isClassTeacher,
          classTeacherClassId: isClassTeacher ? classTeacherClassId : null,
        });
      }
      setTeachers(await getTeachers());
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      setSaveError(err.message || "Failed to save teacher.");
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setName(teacher.name || "");
    setShortName(teacher.shortName || "");
    setSubjectId(teacher.subjectId || "");
    setSubject(teacher.subject || "");
    setEmail(teacher.email || "");
    setPassword("");
    setSelectedClasses(teacher.classes || []);
    setIsClassTeacher(teacher.isClassTeacher || false);
    setClassTeacherClassId(teacher.classTeacherClassId || "");
    setSaveError("");
    setIsAddOpen(true);
  };

  const handleClone = (teacher) => {
    // Pre-fill the add form with cloned data; user must provide a unique email/password
    resetForm();
    setName(`${teacher.name} (Copy)`);
    setShortName(teacher.shortName ? `${teacher.shortName}-2` : "");
    setSubjectId(teacher.subjectId || "");
    setSubject(teacher.subject || "");
    setSelectedClasses(teacher.classes || []);
    setIsClassTeacher(false);
    setClassTeacherClassId("");
    setIsAddOpen(true);
  };

  const handleDelete = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setConfirmDialog({ open: true, action: "delete", teacher });
  };

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
            {role !== 'coordinator' && (
              <button
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center gap-2"
                onClick={() => {
                  resetForm();
                  setIsAddOpen(true);
                }}
              >
                <Plus size={16} /> Add Teacher
              </button>
            )}
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
                  <div className="font-medium text-gray-900">
                    {t.name}
                    {t.isClassTeacher && (
                      <div className="text-xs text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1 whitespace-nowrap">
                        Class Teacher • {t.classTeacherClassId || 'Unknown'}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700">{t.shortName}</div>
                  <div className="text-gray-700">{t.subject}</div>
                  <div className="text-gray-700">
                    {t.classes && t.classes.length ? t.classes.join(", ") : "—"}
                  </div>
                    {role !== 'coordinator' && (
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
                    )}
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
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddOpen(open); }}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {saveError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Name</label>
              <Input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g., J.Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <select
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email * {editingId && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
            )}
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

            <div className="border-t pt-4 mt-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClassTeacher}
                  onChange={(e) => setIsClassTeacher(e.target.checked)}
                  className="rounded"
                />
                Assign as Class Teacher
              </label>
              
              {isClassTeacher && (
                <div className="pl-6 animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium mb-1">Class Teacher Of *</label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={classTeacherClassId}
                    onChange={(e) => setClassTeacherClassId(e.target.value)}
                  >
                    <option value="">[ Select Class ▼ ]</option>
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => { setIsAddOpen(false); resetForm(); }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Delete Teacher?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            <p>Are you sure you want to delete <strong>{confirmDialog.teacher?.name}</strong>? This will also remove their login account. This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setConfirmDialog({ open: false, action: null, teacher: null })}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
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
