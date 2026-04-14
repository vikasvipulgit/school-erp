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
import { authService } from '../core/services/authService';

export default function AppRouter() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
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
