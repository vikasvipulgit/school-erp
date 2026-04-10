// All routes in one place
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppLayout from '../core/layouts/AppLayout';
import TimetablePage from '../modules/timetable/pages/TimetablePage';
import OrganizationSettingsPage from '../modules/timetable/pages/OrganizationSettingsPage';
import ClassTimeManagement from '../modules/timetable/pages/ClassTimeManagement';
import TeachersPage from '../modules/timetable/pages/TeachersPage';
import SubjectsPage from '../modules/timetable/pages/SubjectsPage';

export default function AppRouter() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TimetablePage />} />
          <Route path="/organization" element={<OrganizationSettingsPage />} />
          <Route path="/class-time" element={<ClassTimeManagement />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
