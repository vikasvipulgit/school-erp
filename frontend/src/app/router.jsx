// All routes in one place
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../core/layouts/AppLayout';
import TimetablePage from '../modules/timetable/pages/TimetablePage';
import OrganizationSettingsPage from '../modules/timetable/pages/OrganizationSettingsPage';
import ClassTimeManagement from '../modules/timetable/pages/ClassTimeManagement';
import TeachersPage from '../modules/timetable/pages/TeachersPage';
import SubjectsPage from '../modules/timetable/pages/SubjectsPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import SignupPage from '../modules/auth/pages/SignupPage';
import { useAuth } from '../core/context/AuthContext';

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
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignupPage />}
        />
        <Route
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<TimetablePage />} />
          <Route path="/organization" element={<OrganizationSettingsPage />} />
          <Route path="/class-time" element={<ClassTimeManagement />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
