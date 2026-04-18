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

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

        <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Timetable module */}
          <Route path="/organization" element={<OrganizationSettingsPage />} />
          <Route path="/class-time" element={<ClassTimeManagement />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/timetable" element={<TimetablePage />} />

          {/* Tasks module */}
          <Route path="/tasks" element={<TasksListPage />} />
          <Route path="/tasks/create" element={<CreateTaskPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          {/* Leave module */}
          <Route path="/leave" element={<LeaveListPage />} />
          <Route path="/leave/apply" element={<LeaveApplicationPage />} />
          <Route path="/leave/:leaveId/proxy" element={<ProxyAssignmentPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
