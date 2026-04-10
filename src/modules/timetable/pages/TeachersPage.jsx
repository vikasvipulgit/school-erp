import React, { useMemo, useState } from "react";
import { Plus, Check, Pencil, Copy, Trash2 } from "lucide-react";
import teachersData from "@/data/teachers.json";
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
  const [teachers, setTeachers] = useState(teachersData);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

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

  const handleSave = () => {
    if (!name.trim() || !subject.trim()) return;
    if (editingId) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: name.trim(),
                shortName: shortName.trim() || autoShortName(name.trim()),
                subject: subject.trim(),
                classes: selectedClasses.length ? selectedClasses : [],
              }
            : t
        )
      );
    } else {
      const next = {
        id: `T-${String(teachers.length + 1).padStart(3, "0")}`,
        name: name.trim(),
        shortName: shortName.trim() || autoShortName(name.trim()),
        subject: subject.trim(),
        phone: "",
        classes: selectedClasses.length ? selectedClasses : [],
      };
      setTeachers((prev) => [next, ...prev]);
    }
    setIsAddOpen(false);
    resetForm();
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setName(teacher.name || "");
    setShortName(teacher.shortName || "");
    setSubject(teacher.subject || "");
    setSelectedClasses(teacher.classes || []);
    setIsAddOpen(true);
  };

  const handleClone = (teacher) => {
    const next = {
      ...teacher,
      id: `T-${String(teachers.length + 1).padStart(3, "0")}`,
      name: `${teacher.name} (Copy)`,
      shortName: teacher.shortName ? `${teacher.shortName}-2` : autoShortName(teacher.name),
    };
    setTeachers((prev) => [next, ...prev]);
  };

  const handleDelete = (teacherId) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  return (
    <div>
      <SectionHeader
        className="mb-4"
        title="Teachers"
        description="Manage teachers and their subject assignments"
        action={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-xl">
              <DialogHeader>
              <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!shortName) setShortName(autoShortName(e.target.value));
                      }}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Short Name / Code</label>
                    <Input
                      type="text"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      placeholder="Auto-generated"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Classes</label>
                  <div className="flex flex-wrap gap-2">
                    {classList.map((cls) => {
                      const active = selectedClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className={
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
                            (active
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-white border-gray-200 text-gray-600")
                          }
                        >
                          <span
                            className={
                              "flex items-center justify-center w-4 h-4 " +
                              (active
                                ? "bg-emerald-500 text-white rounded-sm"
                                : "border border-gray-300 rounded-sm")
                            }
                          >
                            {active ? <Check size={12} /> : null}
                          </span>
                          {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!name.trim() || !subject.trim()}
                >
                  {editingId ? "Save Changes" : "Save Teacher"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 max-w-md">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teachers..."
        />
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
