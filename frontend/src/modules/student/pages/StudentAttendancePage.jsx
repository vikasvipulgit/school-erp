import React, { useState, useEffect } from 'react';
import { CalendarCheck, ClipboardCheck, Download, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import attendanceService from '../../attendance/services/attendanceService';

function getStatusInfo(percentage) {
  if (percentage >= 85) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
  if (percentage >= 75) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' };
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' };
}

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    leave: 0,
    percentage: 0
  });

  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [subjectWiseAttendance, setSubjectWiseAttendance] = useState([]);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getStudentAttendance();
      
      setAttendanceSummary({
        totalClasses: data.totalClasses || 0,
        present: data.presentDays || 0,
        absent: data.absentDays || 0,
        leave: data.leaveDays || 0,
        percentage: data.attendancePercentage || 0
      });
      
      setMonthlyAttendance(data.monthlyProgress || []);
      
      if (data.subjectWiseAttendance) {
        setSubjectWiseAttendance(data.subjectWiseAttendance);
      }
    } catch (err) {
      setError('Failed to load attendance data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const BASE_URL = 'http://localhost:4000/api'; 
    const token = localStorage.getItem('access_token');
    
    fetch(`${BASE_URL}/attendance/student/me/report`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error('Download failed', err);
    });
  };

  const overallStatus = getStatusInfo(attendanceSummary.percentage);

  const chartData = [
    { name: "Present", value: attendanceSummary.present },
    { name: "Absent", value: attendanceSummary.absent },
    { name: "Leave", value: attendanceSummary.leave },
  ];

  const CHART_COLORS = {
    Present: '#10b981', // emerald-500
    Absent: '#ef4444',  // red-500
    Leave: '#f97316'    // orange-500
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex justify-center gap-5 text-sm mt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-1.5">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 font-medium">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <SectionHeader 
          title="My Attendance"
          description="Track your academic attendance and performance"
        />
        <button 
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-gray-500 text-sm font-medium mb-1">Attendance</div>
          <div className="flex items-end gap-2">
            <div className={`text-3xl font-bold ${overallStatus.color}`}>
              {attendanceSummary.percentage}%
            </div>
          </div>
          <div className={`mt-2 text-xs font-semibold px-2 py-1 inline-block rounded-full w-max ${overallStatus.bg} ${overallStatus.color}`}>
            {overallStatus.label}
          </div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Classes</div>
          <div className="text-3xl font-bold text-gray-900">{attendanceSummary.totalClasses}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-b-4 border-emerald-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Present Days</div>
          <div className="text-3xl font-bold text-emerald-600">{attendanceSummary.present}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-b-4 border-red-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Absent Days</div>
          <div className="text-3xl font-bold text-red-600">{attendanceSummary.absent}</div>
          <div className="text-xs text-gray-400 mt-1">Leaves: {attendanceSummary.leave}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Attendance Distribution Pie Chart */}
        <Card className="p-5 col-span-1 lg:col-span-1 bg-white shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChartIcon size={18} className="text-blue-600" />
            Attendance Distribution
          </h2>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            {attendanceSummary.totalClasses === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No attendance data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} days`, name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} content={renderLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Subject-wise Attendance */}
        <Card className="col-span-1 lg:col-span-2 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-blue-600" />
              Subject-wise Attendance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Attendance %</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectWiseAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-sm text-gray-500">
                      No subject-wise data available
                    </td>
                  </tr>
                ) : (
                  subjectWiseAttendance.map((item, idx) => {
                    const status = getStatusInfo(item.attendance);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-900">
                          {item.subject}
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-700">
                          {item.attendance}%
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Attendance */}
        <Card className="p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarCheck size={18} className="text-blue-600" />
            Monthly Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {monthlyAttendance.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4 col-span-full">No data available</div>
            ) : (
              monthlyAttendance.map((item, idx) => {
                const status = getStatusInfo(item.attendance);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.month}</span>
                      <span className={`font-semibold ${status.color}`}>{item.attendance}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${status.bar}`} 
                        style={{ width: `${item.attendance}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
