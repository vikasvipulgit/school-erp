import React, { useState, useEffect } from 'react';
import { Save, Check, X, Clock, AlertCircle } from 'lucide-react';
import attendanceService from '../services/attendanceService';

export default function AttendanceMarkingPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass, date]);

  const loadClasses = async () => {
    try {
      const data = await attendanceService.getTeacherClasses();
      setClasses(data);
      if (data.length > 0) setSelectedClass(data[0].id);

      // Mock subjects for Phase 3 Subject-wise attendance
      setSubjects([
        { id: '', name: '-- Daily Attendance (No Subject) --' },
        { id: 'sub_math', name: 'Mathematics' },
        { id: 'sub_sci', name: 'Science' },
        { id: 'sub_eng', name: 'English' },
        { id: 'sub_comp', name: 'Computer' },
        { id: 'sub_sst', name: 'Social Science' }
      ]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load classes' });
    }
  };

  const loadStudents = async (classId) => {
    setLoading(true);
    try {
      const realStudents = await attendanceService.getStudentsByClass(classId);
      setStudents(realStudents);

      // Key by studentId (e.g. ST101) — this is what gets saved to DB and matched on student login
      const initialMap = {};
      realStudents.forEach(s => {
        initialMap[s.studentId] = { status: 'present', remarks: '' };
      });
      setAttendanceMap(initialMap);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (sId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [sId]: { ...prev[sId], status }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        classId: selectedClass,
        date: date,
        ...(selectedSubject ? { subjectId: selectedSubject } : {}),
        attendance: Object.entries(attendanceMap).map(([studentId, data]) => ({
          studentId,
          status: data.status,
          remarks: data.remarks
        }))
      };
      
      await attendanceService.markAttendance(payload);
      setMessage({ type: 'success', text: 'Attendance saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save attendance. Duplicate or error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    present: 'bg-green-100 text-green-700 border-green-300',
    absent: 'bg-red-100 text-red-700 border-red-300',
    leave: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
        <button 
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle size={20} />
          {message.text}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject (Optional)</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No students found for this class.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium text-gray-600">Student ID</th>
                <th className="p-4 font-medium text-gray-600">Student Name</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                  {/* Show the real seeded studentId (ST101) */}
                  <td className="p-4 text-gray-600 font-mono text-sm">{student.studentId}</td>
                  <td className="p-4 font-medium text-gray-900">{student.name}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {['present', 'absent', 'leave'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.studentId, status)}
                          className={`px-3 py-1 text-sm rounded-full border capitalize transition-all ${
                            attendanceMap[student.studentId]?.status === status 
                              ? statusColors[status] 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
