import React, { useRef, useState, useEffect } from "react";
import ClassSubjectsView from "./ClassSubjectsView";
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  BookOpen,
  FlaskConical,
  Calculator,
  Globe,
  Monitor,
  Dumbbell,
  Palette,
  Landmark,
  Leaf,
  Sigma,
  Languages,
  Check,
} from "lucide-react";
import { getSubjects, addSubject, updateSubject, deleteSubject, invalidateSubjectsCache } from "@/modules/timetable/services/subjectsService";
import { useClasses } from "@/core/context/ClassesContext";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


export default function SubjectsPage() {
  const { classes: classesRaw } = useClasses();
  const classesData = classesRaw; // { class, sections[] }[]
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [difficulty, setDifficulty] = useState(5);
  const [availability, setAvailability] = useState(20);
  const [subjectClasses, setSubjectClasses] = useState([]);
  const [tab, setTab] = useState("subjects");
  const [saveError, setSaveError] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {});
  }, []);

  const filtered = subjects.filter((s) =>
    [s.name, s.shortName]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setShortName("");
    setDifficulty(5);
    setAvailability(20);
    setSubjectClasses([]);
    setEditingId(null);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaveError("");
    try {
      if (editingId) {
        await updateSubject(editingId, {
          name: name.trim(),
          shortName: shortName.trim() || autoShortName(name.trim()),
          difficulty: Number(difficulty),
          availability: Number(availability),
          classes: subjectClasses,
        });
      } else {
        await addSubject({
          name: name.trim(),
          shortName: shortName.trim() || autoShortName(name.trim()),
          difficulty: Number(difficulty),
          availability: Number(availability),
          classes: subjectClasses,
        });
      }
      invalidateSubjectsCache();
      setSubjects(await getSubjects());
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      setSaveError(err.message || "Failed to save subject.");
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setName(subject.name || "");
    setShortName(subject.shortName || "");
    setDifficulty(subject.difficulty ?? 5);
    setAvailability(subject.availability ?? 20);
    setSubjectClasses(subject.classes || []);
    setSaveError("");
    setIsAddOpen(true);
  };

  const handleClone = (subject) => {
    resetForm();
    setName(`${subject.name} (Copy)`);
    setShortName(subject.shortName ? `${subject.shortName}-2` : "");
    setDifficulty(subject.difficulty ?? 5);
    setAvailability(subject.availability ?? 20);
    setSubjectClasses(subject.classes || []);
    setIsAddOpen(true);
  };

  const confirmDelete = (subject) => {
    setSubjectToDelete(subject);
  };

  const executeDelete = async () => {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSubject(subjectToDelete.id);
      invalidateSubjectsCache();
      setSubjects(await getSubjects());
      toast.success("Subject deleted successfully.");
      setSubjectToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete subject.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAvailabilityChange = async (subjectId, value) => {
    setSubjects((prev) =>
      prev.map((s) => s.id === subjectId ? { ...s, availability: Number(value) } : s)
    );
    try {
      await updateSubject(subjectId, { availability: Number(value) });
      invalidateSubjectsCache();
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  const handleImportClick = () => {
    if (importRef.current) importRef.current.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .filter((item) => item && item.name)
        .map((item, idx) => ({
          id: item.id || `S-${String(subjects.length + idx + 1).padStart(3, "0")}`,
          name: String(item.name),
          shortName: item.shortName || autoShortName(String(item.name)),
          difficulty: Number(item.difficulty ?? 5),
          availability: Number(item.availability ?? 20),
        }));
      setSubjects((prev) => [...normalized, ...prev]);
    } catch (err) {
      // ignore invalid import
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t ${tab === "subjects" ? "bg-white border-x border-t border-gray-200 font-semibold" : "bg-gray-100 text-gray-500"}`}
          onClick={() => setTab("subjects")}
        >Subjects</button>
        <button
          className={`px-4 py-2 rounded-t ${tab === "classview" ? "bg-white border-x border-t border-gray-200 font-semibold" : "bg-gray-100 text-gray-500"}`}
          onClick={() => setTab("classview")}
        >Class View</button>
      </div>
      {tab === "subjects" ? (
        <>
          <SectionHeader
            className="mb-4"
            title="Subjects"
            description="Manage subjects and their availability"
            action={
              <div className="flex items-center gap-2">
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <Button variant="outline" className="flex items-center gap-2" onClick={handleImportClick}>
                  Import
                </Button>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus size={16} /> Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                      <DialogTitle>{editingId ? "Edit Subject" : "Add Subject"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <Input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!shortName) setShortName(autoShortName(e.target.value));
                            }}
                            placeholder="e.g., Mathematics"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Short Name</label>
                          <Input
                            type="text"
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            placeholder="Auto-generated"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Difficulty (1-10)</label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={difficulty}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val === "") {
                                setDifficulty("");
                                return;
                              }
                              let num = Number(val);
                              if (num > 10) num = 10;
                              if (num < 1) num = 1;
                              setDifficulty(num);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Availability (periods)</label>
                          <Input
                            type="number"
                            min={1}
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Classes Taught In</label>
                      <div className="flex flex-wrap gap-2">
                        {classesData.map((c) => (
                          <label key={c.class} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={subjectClasses.includes(c.class)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSubjectClasses([...subjectClasses, c.class]);
                                } else {
                                  setSubjectClasses(subjectClasses.filter(cls => cls !== c.class));
                                }
                              }}
                            />
                            {c.class}
                          </label>
                        ))}
                      </div>
                    </div>
                    {saveError && (
                      <p className="text-sm text-red-600">{saveError}</p>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" type="button" onClick={resetForm}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="button" onClick={handleSave} disabled={!name.trim()}>
                        {editingId ? "Save Changes" : "Save Subject"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            }
          />

          <div className="mb-4 max-w-md">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects..."
            />
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1.8fr_1.5fr] gap-4 px-4 py-3 border-b text-sm font-semibold text-gray-700">
              <div>Name</div>
              <div>Short Name</div>
              <div>Difficulty</div>
              <div>Availability</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {filtered.map((s) => (
                <div key={s.id} className="grid grid-cols-[2fr_1fr_1.5fr_1.8fr_1.5fr] gap-4 px-4 py-3 text-sm items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        "w-10 h-10 rounded-xl border flex items-center justify-center " +
                        getSubjectBadge(s.name).containerClass
                      }
                    >
                      {getSubjectBadge(s.name).icon}
                    </div>
                    <div className="font-medium text-gray-900">{s.name}</div>
                  </div>
                  <div className="text-gray-700">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {s.shortName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DifficultyBar value={Number(s.difficulty) || 0} />
                    <span className="text-gray-500">{Number(s.difficulty) || 0}/10</span>
                  </div>
                  <AvailabilityInput 
                    subject={s} 
                    onChange={handleAvailabilityChange} 
                  />
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      onClick={() => handleEdit(s)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                      onClick={() => handleClone(s)}
                    >
                      <Copy size={14} /> Clone
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      onClick={() => confirmDelete(s)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {!filtered.length ? (
                <div className="px-4 py-6 text-sm text-gray-500">No subjects found.</div>
              ) : null}
            </div>
          </Card>

          <Dialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
            <DialogContent className="bg-white border border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle>Delete Subject</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <p className="text-sm text-gray-700">Are you sure you want to delete this subject?</p>
                <p className="text-sm text-gray-700 mt-1">This action cannot be undone.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubjectToDelete(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white" 
                  onClick={executeDelete} 
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <ClassSubjectsView />
      )}
    </div>
  );
}

function DifficultyBar({ value }) {
  const percentage = Math.min(100, Math.max(0, (Number(value) / 10) * 100));
  return (
    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-orange-500 transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function autoShortName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 4).toUpperCase();
  const first = parts[0][0].toUpperCase();
  const last = parts[parts.length - 1];
  return `${first}${last.slice(0, 3).toUpperCase()}`;
}

function getSubjectBadge(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("math")) {
    return {
      icon: <Calculator size={18} className="text-blue-600" />,
      containerClass: "bg-blue-50 border-blue-200",
    };
  }
  if (lower.includes("physics") || lower.includes("chem") || lower.includes("biology") || lower.includes("science")) {
    return {
      icon: <FlaskConical size={18} className="text-purple-600" />,
      containerClass: "bg-purple-50 border-purple-200",
    };
  }
  if (lower.includes("history") || lower.includes("civics")) {
    return {
      icon: <Landmark size={18} className="text-amber-600" />,
      containerClass: "bg-amber-50 border-amber-200",
    };
  }
  if (lower.includes("english") || lower.includes("hindi") || lower.includes("german") || lower.includes("language")) {
    return {
      icon: <Languages size={18} className="text-emerald-600" />,
      containerClass: "bg-emerald-50 border-emerald-200",
    };
  }
  if (lower.includes("computer")) {
    return {
      icon: <Monitor size={18} className="text-indigo-600" />,
      containerClass: "bg-indigo-50 border-indigo-200",
    };
  }
  if (lower.includes("evs") || lower.includes("environment")) {
    return {
      icon: <Leaf size={18} className="text-green-600" />,
      containerClass: "bg-green-50 border-green-200",
    };
  }
  if (lower.includes("physical") || lower.includes("sports") || lower.includes("pe")) {
    return {
      icon: <Dumbbell size={18} className="text-orange-600" />,
      containerClass: "bg-orange-50 border-orange-200",
    };
  }
  if (lower.includes("art") || lower.includes("a&c") || lower.includes("ac")) {
    return {
      icon: <Palette size={18} className="text-pink-600" />,
      containerClass: "bg-pink-50 border-pink-200",
    };
  }
  return {
    icon: <BookOpen size={18} className="text-gray-600" />,
    containerClass: "bg-gray-50 border-gray-200",
  };
}

function AvailabilityInput({ subject, onChange }) {
  const [value, setValue] = useState(Number(subject.availability) || 0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(Number(subject.availability) || 0);
  }, [subject.availability]);

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleCommit = async (newValue) => {
    const parsed = parseInt(newValue, 10);
    if (isNaN(parsed) || String(newValue).trim() === "") {
      setValue(Number(subject.availability) || 0);
      return;
    }
    if (parsed < 0) {
      toast.error("Periods cannot be negative");
      setValue(Number(subject.availability) || 0);
      return;
    }
    if (parsed > 40) {
      toast.error("Maximum allowed periods is 40");
      setValue(Number(subject.availability) || 0);
      return;
    }
    if (parsed !== Number(subject.availability)) {
      setValue(parsed);
      await onChange(subject.id, parsed);
      setSaved(true);
    } else {
      setValue(parsed);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min="0"
        max="40"
        placeholder="Periods"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => handleCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.target.blur();
          } else if (e.key === "Escape") {
            const original = Number(subject.availability) || 0;
            e.target.value = original;
            setValue(original);
            e.target.blur();
          }
        }}
        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-emerald-600 font-medium flex items-center gap-1">
        periods
        {saved && <Check size={16} className="text-emerald-500" />}
      </span>
    </div>
  );
}
