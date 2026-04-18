import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../core/layouts/AppLayout';
import LoginPage from '../modules/auth/pages/LoginPage';
import SignupPage from '../modules/auth/pages/SignupPage';
import { useAuth } from '../core/context/AuthContext';

import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import TimetablePage from '../modules/timetable/pages/TimetablePage';
import OrganizationSettingsPage from '../modules/timetable/pages/OrganizationSettingsPage';
import ClassTimeManagement from '../modules/timetable/pages/ClassTimeManagement';
import TeachersPage from '../modules/timetable/pages/TeachersPage';
import SubjectsPage from '../modules/timetable/pages/SubjectsPage';
import RoomsPage from '../modules/rooms/pages/RoomsPage';

import TasksListPage from '../modules/tasks/pages/TasksListPage';
import CreateTaskPage from '../modules/tasks/pages/CreateTaskPage';
import TaskDetailPage from '../modules/tasks/pages/TaskDetailPage';

import LeaveListPage from '../modules/leave/pages/LeaveListPage';
import LeaveApplicationPage from '../modules/leave/pages/LeaveApplicationPage';
import ProxyAssignmentPage from '../modules/leave/pages/ProxyAssignmentPage';

import ReportsPage from '../modules/reports/pages/ReportsPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';

// Redirects to "/" if the current user's role is in the denied list
function DenyRole({ deniedRoles, children }) {
  const { role } = useAuth();
  if (deniedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

const TEACHER_DENIED = ['teacher'];

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

        <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
          {/* Dashboard — all roles */}
          <Route path="/" element={<DashboardPage />} />

          {/* Timetable setup — visible to all, but Teachers/Subjects/Rooms restricted */}
          <Route path="/organization" element={<OrganizationSettingsPage />} />
          <Route path="/class-time" element={<ClassTimeManagement />} />
          <Route
            path="/teachers"
            element={<DenyRole deniedRoles={TEACHER_DENIED}><TeachersPage /></DenyRole>}
          />
          <Route
            path="/subjects"
            element={<DenyRole deniedRoles={TEACHER_DENIED}><SubjectsPage /></DenyRole>}
          />
          <Route
            path="/rooms"
            element={<DenyRole deniedRoles={TEACHER_DENIED}><RoomsPage /></DenyRole>}
          />
          <Route path="/timetable" element={<TimetablePage />} />

          {/* Tasks — all roles (teachers see their own, admins/principals see all) */}
          <Route path="/tasks" element={<TasksListPage />} />
          <Route
            path="/tasks/create"
            element={<DenyRole deniedRoles={TEACHER_DENIED}><CreateTaskPage /></DenyRole>}
          />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          {/* Leave — all roles */}
          <Route path="/leave" element={<LeaveListPage />} />
          <Route path="/leave/apply" element={<LeaveApplicationPage />} />
          <Route path="/leave/:leaveId/proxy" element={<ProxyAssignmentPage />} />

          {/* Reports — restricted to non-teacher roles (ReportsPage also guards internally) */}
          <Route
            path="/reports"
            element={<DenyRole deniedRoles={TEACHER_DENIED}><ReportsPage /></DenyRole>}
          />

          {/* Profile — all roles */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
