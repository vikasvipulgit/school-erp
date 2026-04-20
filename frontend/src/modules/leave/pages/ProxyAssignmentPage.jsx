import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, AlertCircle } from 'lucide-react';
import {
  getLeaveApplications,
  createProxyAssignment,
  getProxyAssignments,
  approveProxy,
} from '@/modules/leave/services/leaveFirebaseService';
import { useAuth } from '@/core/context/AuthContext';
import teachersData from '@/data/teachers.json';
import { days, periods } from '@/modules/timetable/pages/TimetablePage';

function getAffectedPeriods(leaveTeacherId, startDate, endDate) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}

  const start = new Date(startDate);
  const leaveEnd = new Date(endDate);
  const affected = [];

  Object.entries(saved).forEach(([classKey, grid]) => {
    grid.forEach((row, pi) => {
      row.forEach((cell, di) => {
        if (cell?.teacher && cell.teacher === teachersData.find(t => t.id === leaveTeacherId)?.name) {
          const dayName = days[di];
          const period = periods[pi];
          if (!period || period.break) return;

          // Find all dates during leave that fall on this day of week
          const dayIndex = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(dayName);
          const d = new Date(start);
          while (d <= leaveEnd) {
            if (d.getDay() - 1 === dayIndex || (dayIndex === 6 && d.getDay() === 0)) {
              affected.push({
                date: d.toISOString().split('T')[0],
                dayName,
                periodLabel: period.label,
                periodTime: period.time,
                classKey,
                subject: cell.subject,
                originalTeacherId: leaveTeacherId,
                periodIndex: pi,
                dayIndex: di,
              });
            }
            d.setDate(d.getDate() + 1);
          }
        }
      });
    });
  });
  return affected;
}

function getSuggestedProxies(subject, leaveTeacherId, periodIndex, dayIndex) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}

  return teachersData
    .filter((t) => {
      if (t.id === leaveTeacherId) return false;
      if (t.subject !== subject) return false;
      // Check not booked in this slot
      const isBooked = Object.values(saved).some((grid) => {
        const cell = grid?.[periodIndex]?.[dayIndex];
        return cell?.teacher === t.name;
      });
      return !isBooked;
    })
    .slice(0, 5);
}

export default function ProxyAssignmentPage() {
  const { leaveId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState(null);
  const [affected, setAffected] = useState([]);
  const [existing, setExisting] = useState([]);
  const [selections, setSelections] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [all, proxies] = await Promise.all([
        getLeaveApplications(),
        getProxyAssignments(),
      ]);
      const found = all.find((l) => l.id === leaveId);
      setLeave(found);
      if (found) {
        const ap = getAffectedPeriods(found.teacherId, found.startDate, found.endDate);
        setAffected(ap);
        setExisting(proxies.filter((p) => p.leaveId === leaveId));
      }
      setLoading(false);
    }
    load();
  }, [leaveId]);

  const handleSelect = (key, teacherId) => {
    setSelections((prev) => ({ ...prev, [key]: teacherId }));
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      await Promise.all(
        affected
          .filter((ap) => selections[`${ap.date}-${ap.periodIndex}-${ap.dayIndex}`])
          .map((ap) =>
            createProxyAssignment({
              leaveApplicationId: leaveId,
              originalTeacherId: ap.originalTeacherId,
              proxyTeacherId: selections[`${ap.date}-${ap.periodIndex}-${ap.dayIndex}`],
              date: ap.date,
              classId: ap.classKey,
              subjectId: ap.subject,
            })
          )
      );
      navigate('/leave');
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!leave) return <div className="text-gray-500 text-center py-16">Leave not found.</div>;

  const teacher = teachersData.find((t) => t.id === leave.teacherId);
  const assignedKeys = new Set(existing.map((p) => `${p.date}-${p.periodLabel}`));

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/leave')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={16} /> Back to Leave
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assign Proxy Teachers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cover periods for {teacher?.name}'s approved leave ({leave.startDate} – {leave.endDate})
        </p>
      </div>

      {affected.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-10 text-center text-gray-500">
          <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm">No timetable periods found for this teacher during the leave dates.</div>
          <div className="text-xs text-gray-400 mt-1">Make sure the timetable is published before assigning proxies.</div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {affected.map((ap) => {
              const key = `${ap.date}-${ap.periodIndex}-${ap.dayIndex}`;
              const alreadyAssigned = assignedKeys.has(`${ap.date}-${ap.periodLabel}`);
              const suggestions = getSuggestedProxies(ap.subject, ap.originalTeacherId, ap.periodIndex, ap.dayIndex);

              return (
                <div
                  key={key}
                  className={`bg-white rounded-xl border p-4 ${alreadyAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{ap.date}</span>
                      <span className="text-gray-400 text-sm mx-2">·</span>
                      <span className="text-sm text-gray-700">{ap.periodLabel} ({ap.periodTime})</span>
                      <span className="text-gray-400 text-sm mx-2">·</span>
                      <span className="text-sm text-gray-700">{ap.classKey}</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {ap.subject}
                    </span>
                  </div>

                  {alreadyAssigned ? (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <UserCheck size={15} /> Proxy already assigned
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-3 py-2">
                      No available substitute teachers found for {ap.subject} during this slot.
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Select substitute teacher:</div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelect(key, t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              selections[key] === t.id
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/leave')}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={saving || Object.keys(selections).length === 0}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : `Assign ${Object.keys(selections).length} Proxy Teacher${Object.keys(selections).length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
