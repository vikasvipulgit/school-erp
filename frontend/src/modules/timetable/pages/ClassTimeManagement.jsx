import React, { useState } from "react";
import {
  Clock,
  Coffee,
  GripVertical,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/core/components/Button";
import { Input } from "@/core/components/Input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getDefaultSlots() {
  return [
    {
      id: "period-1",
      type: "period",
      label: "Period 1",
      startTime: "08:00",
      endTime: "08:45",
    },
    {
      id: "break-1",
      type: "break",
      label: "Morning Break",
      duration: 15,
    },
    {
      id: "period-2",
      type: "period",
      label: "Period 2",
      startTime: "09:00",
      endTime: "09:45",
    },
    {
      id: "break-2",
      type: "break",
      label: "Long Break",
      duration: 30,
    },
    {
      id: "period-3",
      type: "period",
      label: "Period 3",
      startTime: "10:00",
      endTime: "10:45",
    },
  ];
}

function ClassTimeManagement() {
  const [slots, setSlots] = useState(getDefaultSlots());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("Period");
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("08:45");

  const resetForm = () => {
    setNewLabel("Period");
    setNewStart("08:00");
    setNewEnd("08:45");
  };

  const handleAddPeriod = () => {
    if (!newLabel.trim() || !newStart.trim() || !newEnd.trim()) return;
    const nextId = `period-${Date.now()}`;
    setSlots((prev) => [
      ...prev,
      {
        id: nextId,
        type: "period",
        label: newLabel.trim(),
        startTime: newStart.trim(),
        endTime: newEnd.trim(),
      },
    ]);
    setIsAddOpen(false);
    resetForm();
  };
  // Placeholder UI, you can enhance as needed
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Class Time Management</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="flex items-center gap-2">
              <Plus size={16} /> Add Period
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle>Add Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <Input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Period 4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleAddPeriod}
                disabled={!newLabel.trim() || !newStart.trim() || !newEnd.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {slots.map(slot => (
        <SortableSlot
          key={slot.id}
          slot={slot}
          onChange={updatedSlot => setSlots(slots.map(s => s.id === slot.id ? updatedSlot : s))}
          onDelete={() => setSlots(slots.filter(s => s.id !== slot.id))}
          onAddBreak={() => {}}
        />
      ))}
    </div>
  );
}

export default ClassTimeManagement;

function SortableSlot({ slot, onChange, onDelete, onAddBreak, listeners, attributes, isDragging }) {
  const { setNodeRef, transform, transition } = useSortable({ id: slot.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  if (slot.type === "period") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3 flex items-center gap-4 mb-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} className="text-gray-400 cursor-grab" />
        <Clock size={20} className="text-blue-500" />
        <Input
          className="text-sm font-medium flex-1 bg-transparent outline-none"
          value={slot.label}
          onChange={e => onChange({ ...slot, label: e.target.value })}
        />
        <span className="text-sm text-gray-500">Start:</span>
        <div className="flex items-center gap-1">
          <Input
            type="time"
            className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
            value={slot.startTime}
            onChange={e => onChange({ ...slot, startTime: e.target.value })}
          />
          <Clock size={16} className="text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">End:</span>
        <div className="flex items-center gap-1">
          <Input
            type="time"
            className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
            value={slot.endTime}
            onChange={e => onChange({ ...slot, endTime: e.target.value })}
          />
          <Clock size={16} className="text-gray-400" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-orange-500 border-orange-200"
          type="button"
          onClick={onAddBreak}
        >
          <Coffee size={16} /> Add Break
        </Button>
        <Trash2 size={20} className="text-red-400 cursor-pointer" onClick={onDelete} />
      </div>
    );
  } else {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-orange-50 border border-dashed border-orange-200 rounded-xl px-4 py-3 flex items-center gap-4 mb-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} className="text-gray-400 cursor-grab" />
        <Coffee size={20} className="text-orange-500" />
        <Input
          className="text-sm font-medium flex-1 bg-transparent outline-none"
          value={slot.label}
          onChange={e => onChange({ ...slot, label: e.target.value })}
        />
        <span className="text-sm text-gray-500">Duration:</span>
        <Input
          type="number"
          min={1}
          className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
          value={slot.duration}
          onChange={e => onChange({ ...slot, duration: Number(e.target.value) })}
        />
        <span className="text-sm text-gray-500">minutes</span>
        <Trash2 size={20} className="text-red-400 cursor-pointer" onClick={onDelete} />
      </div>
    );
  }
}
