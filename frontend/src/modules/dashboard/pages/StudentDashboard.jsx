import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { CalendarDays, ClipboardList, CheckCircle } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';

export default function StudentDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader 
        title={`Welcome back, ${userProfile?.fullName || 'Student'}!`}
        description="Here is your overview for today."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Student ID</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.studentId || 'N/A'}</div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Class</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.className || 'N/A'}</div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Section</div>
            <div className="text-lg font-semibold text-gray-900">{userProfile?.section || 'N/A'}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">My Timetable</h2>
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <CalendarDays size={48} className="text-gray-300 mb-3" />
            <p>Your timetable will appear here.</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">My Assignments</h2>
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <ClipboardList size={48} className="text-gray-300 mb-3" />
            <p>Your assignments will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
