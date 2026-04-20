import React, { useState, useEffect } from "react";
import {
  Clock,
  Coffee,
  GripVertical,
  Trash2,
  Plus,
  BookOpen,
  X,
} from "lucide-react";
import { Input } from "@/core/components/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useClasses } from "@/core/context/ClassesContext";
import { loadTimetableSettings, saveTimetableSettings } from "@/modules/timetable/services/timetableFirebaseService";

// ─── Period Slot Management ────────────────────────────────────────────────

const STORAGE_SLOTS_KEY = "erp_period_slots";

function getDefaultSlots() {
  return [
    { id: "period-1", type: "period", label: "Period 1", startTime: "08:00", endTime: "08:45" },
    { id: "break-1",  type: "break",  label: "Morning Break", duration: 15 },
    { id: "period-2", type: "period", label: "Period 2", startTime: "09:00", endTime: "09:45" },
    { id: "break-2",  type: "break",  label: "Long Break", duration: 30 },
    { id: "period-3", type: "period", label: "Period 3", startTime: "10:00", endTime: "10:45" },
    { id: "period-4", type: "period", label: "Period 4", startTime: "10:45", endTime: "11:30" },
    { id: "period-5", type: "period", label: "Period 5", startTime: "11:30", endTime: "12:15" },
  ];
}

function loadSlots() {
  try {
    const saved = localStorage.getItem(STORAGE_SLOTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  // Persist defaults immediately so TimetablePage reads the same data
  const defaults = getDefaultSlots();
  saveSlots(defaults);
  return defaults;
}

function saveSlots(slots) {
  localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(slots));
}

function SortableSlot({ slot, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (slot.type === "period") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-2 group"
      >
        <span {...attributes} {...listeners} className="cursor-grab touch-none">
          <GripVertical size={16} className="text-gray-400" />
        </span>
        <Clock size={16} className="text-blue-500 shrink-0" />
        <input
          className="text-sm font-medium flex-1 bg-transparent outline-none min-w-0"
          value={slot.label}
          onChange={(e) => onChange({ ...slot, label: e.target.value })}
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">Start</span>
          <input
            type="time"
            className="border border-gray-200 rounded px-2 py-1 text-xs bg-white"
            value={slot.startTime}
            onChange={(e) => onChange({ ...slot, startTime: e.target.value })}
          />
          <span className="text-xs text-gray-500">End</span>
          <input
            type="time"
            className="border border-gray-200 rounded px-2 py-1 text-xs bg-white"
            value={slot.endTime}
            onChange={(e) => onChange({ ...slot, endTime: e.target.value })}
          />
        </div>
        <button type="button" onClick={onDelete}>
          <Trash2 size={15} className="text-red-400 hover:text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-2"
    >
      <span {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical size={16} className="text-gray-400" />
      </span>
      <Coffee size={16} className="text-orange-500 shrink-0" />
      <input
        className="text-sm font-medium flex-1 bg-transparent outline-none min-w-0"
        value={slot.label}
        onChange={(e) => onChange({ ...slot, label: e.target.value })}
      />
      <span className="text-xs text-gray-500 shrink-0">Duration</span>
      <input
        type="number"
        min={1}
        className="w-16 border border-gray-200 rounded px-2 py-1 text-xs bg-white"
        value={slot.duration}
        onChange={(e) => onChange({ ...slot, duration: Number(e.target.value) })}
      />
      <span className="text-xs text-gray-500 shrink-0">min</span>
      <button type="button" onClick={onDelete}>
        <Trash2 size={15} className="text-red-400 hover:text-red-600" />
      </button>
    </div>
  );
}

function PeriodSlotManager({ onSlotsChange }) {
  const [slots, setSlots] = useState(loadSlots);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState("period");
  const [newLabel, setNewLabel] = useState("");
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("08:45");
  const [newDuration, setNewDuration] = useState(15);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const update = (next) => { setSlots(next); saveSlots(next); };

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      const oldIdx = slots.findIndex((s) => s.id === active.id);
      const newIdx = slots.findIndex((s) => s.id === over.id);
      update(arrayMove(slots, oldIdx, newIdx));
    }
  };

  const handleAdd = () => {
    const id = `${addType}-${Date.now()}`;
    const slot =
      addType === "period"
        ? { id, type: "period", label: newLabel || "New Period", startTime: newStart, endTime: newEnd }
        : { id, type: "break", label: newLabel || "Break", duration: newDuration };
    update([...slots, slot]);
    setIsAddOpen(false);
    setNewLabel("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-800">Period Schedule</div>
          <div className="text-xs text-gray-400">Drag rows to reorder. Changes apply to all classes.</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setAddType("break"); setIsAddOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50"
          >
            <Coffee size={14} /> Add Break
          </button>
          <button
            type="button"
            onClick={() => { setAddType("period"); setIsAddOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Plus size={14} /> Add Period
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {slots.map((slot) => (
            <SortableSlot
              key={slot.id}
              slot={slot}
              onChange={(updated) => update(slots.map((s) => (s.id === slot.id ? updated : s)))}
              onDelete={() => update(slots.filter((s) => s.id !== slot.id))}
            />
          ))}
        </SortableContext>
      </DndContext>

      {slots.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-xl">
          No slots yet. Add periods and breaks above.
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>{addType === "period" ? "Add Period" : "Add Break"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={addType === "period" ? "e.g. Period 4" : "e.g. Lunch Break"}
              />
            </div>
            {addType === "period" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
            >
              Add
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Classes Manager ───────────────────────────────────────────────────────

const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

function ClassesManager() {
  const { classes, addClass, removeClass, addSection, removeSection } = useClasses();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSections, setNewSections] = useState(["A"]);
  const [confirmRemove, setConfirmRemove] = useState(null); // { type: 'class'|'section', className, section? }

  const toggleSection = (s) => {
    setNewSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAdd = () => {
    if (!newClassName.trim() || newSections.length === 0) return;
    addClass(newClassName.trim(), newSections);
    setNewClassName("");
    setNewSections(["A"]);
    setIsAddOpen(false);
  };

  const confirmAction = () => {
    if (!confirmRemove) return;
    if (confirmRemove.type === "class") {
      removeClass(confirmRemove.className);
    } else {
      removeSection(confirmRemove.className, confirmRemove.section);
    }
    setConfirmRemove(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-800">Classes & Sections</div>
          <div className="text-xs text-gray-400">
            {classes.reduce((n, c) => n + c.sections.length, 0)} sections across {classes.length} classes · Removing a class also clears its timetable
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          <Plus size={14} /> Add Class
        </button>
      </div>

      <div className="space-y-3">
        {classes.map((cls) => (
          <div key={cls.class} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-emerald-600" />
                <span className="font-semibold text-gray-900 text-sm">{cls.class}</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmRemove({ type: "class", className: cls.class })}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove class
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {cls.sections.map((section) => (
                <span
                  key={section}
                  className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                >
                  Section {section}
                  <button
                    type="button"
                    onClick={() => setConfirmRemove({ type: "section", className: cls.class, section })}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {/* Add section inline */}
              {SECTION_OPTIONS.filter((s) => !cls.sections.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSection(cls.class, s)}
                  className="inline-flex items-center gap-1 border border-dashed border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 text-xs px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-xl">
            No classes configured yet.
          </div>
        )}
      </div>

      {/* Add class dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Class 11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sections</label>
              <div className="flex gap-2">
                {SECTION_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSection(s)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                      newSections.includes(s)
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newClassName.trim() || newSections.length === 0}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
            >
              Add Class
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm remove dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>
              {confirmRemove?.type === "class" ? "Remove Class?" : "Remove Section?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {confirmRemove?.type === "class" ? (
              <>
                Removing <strong>{confirmRemove?.className}</strong> will also delete all timetable
                data for this class. This cannot be undone.
              </>
            ) : (
              <>
                Removing <strong>Section {confirmRemove?.section}</strong> from{" "}
                <strong>{confirmRemove?.className}</strong> will also delete its timetable data.
              </>
            )}
          </p>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmRemove(null)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ClassTimeManagement() {
  return (
    <div className="space-y-8">
      <ClassesManager />
      <hr className="border-gray-200" />
      <PeriodSlotManager />
    </div>
  );
}
