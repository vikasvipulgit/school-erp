import React, { useState } from 'react';
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import { Input } from '@/core/components/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const INITIAL_ROOMS = [
  { id: 'R-001', name: 'Room 101', capacity: 40, type: 'classroom' },
  { id: 'R-002', name: 'Room 102', capacity: 40, type: 'classroom' },
  { id: 'R-003', name: 'Lab A', capacity: 30, type: 'lab' },
  { id: 'R-004', name: 'Lab B', capacity: 30, type: 'lab' },
  { id: 'R-005', name: 'Computer Lab', capacity: 25, type: 'computer_lab' },
  { id: 'R-006', name: 'Library', capacity: 50, type: 'library' },
];

const ROOM_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Science Lab' },
  { value: 'computer_lab', label: 'Computer Lab' },
  { value: 'library', label: 'Library' },
  { value: 'hall', label: 'Hall' },
  { value: 'other', label: 'Other' },
];

const TYPE_CLS = {
  classroom: 'bg-blue-50 text-blue-700',
  lab: 'bg-green-50 text-green-700',
  computer_lab: 'bg-purple-50 text-purple-700',
  library: 'bg-orange-50 text-orange-700',
  hall: 'bg-indigo-50 text-indigo-700',
  other: 'bg-gray-50 text-gray-600',
};

function loadRooms() {
  try {
    const saved = localStorage.getItem('erp_rooms');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_ROOMS;
}

function saveRooms(rooms) {
  localStorage.setItem('erp_rooms', JSON.stringify(rooms));
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState(loadRooms);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('classroom');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.type.includes(query.toLowerCase())
  );

  const resetForm = () => {
    setName(''); setCapacity(''); setType('classroom'); setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    let updated;
    if (editingId) {
      updated = rooms.map((r) =>
        r.id === editingId ? { ...r, name: name.trim(), capacity: parseInt(capacity) || 0, type } : r
      );
    } else {
      const newRoom = {
        id: `R-${String(rooms.length + 1).padStart(3, '0')}`,
        name: name.trim(),
        capacity: parseInt(capacity) || 0,
        type,
      };
      updated = [...rooms, newRoom];
    }
    setRooms(updated);
    saveRooms(updated);
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setName(room.name);
    setCapacity(String(room.capacity));
    setType(room.type);
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    const updated = rooms.filter((r) => r.id !== id);
    setRooms(updated);
    saveRooms(updated);
    setConfirmDelete(null);
  };

  const typeLabel = (t) => ROOM_TYPES.find((r) => r.value === t)?.label || t;

  return (
    <div>
      <SectionHeader
        className="mb-4"
        title="Rooms"
        description="Manage classrooms and facilities available for scheduling"
      />

      <div className="mb-4 flex gap-3 items-center">
        <button
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Room
        </button>
        <div className="flex-1 max-w-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms..."
          />
        </div>
        <div className="text-sm text-gray-400">{filtered.length} rooms</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room) => (
          <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <LayoutGrid size={18} className="text-gray-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{room.name}</div>
                  <div className="text-xs text-gray-400">{room.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(room)} className="text-blue-500 hover:text-blue-700">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmDelete(room)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_CLS[room.type] || 'bg-gray-50 text-gray-600'}`}>
                {typeLabel(room.type)}
              </span>
              {room.capacity > 0 && (
                <span className="text-xs text-gray-500">Capacity: {room.capacity}</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400 text-sm">No rooms found.</div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Room 101" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (optional)</label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 40"
                min="0"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => { setIsOpen(false); resetForm(); }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
            >
              {editingId ? 'Update' : 'Add'} Room
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Delete Room?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
