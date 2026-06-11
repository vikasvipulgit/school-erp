import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../core/layouts/AppLayout';
import { useAuth } from '../core/context/AuthContext';

// ─── Auth pages: kept eager — they're tiny and load on app start ───────────
import LoginPage from '../modules/auth/pages/LoginPage';
import SignupPage from '../modules/auth/pages/SignupPage';

// ─── All dashboard/feature pages: lazy-loaded per route ──────────────────
// This is the PRIMARY fix for ERR_INSUFFICIENT_RESOURCES.
// Previously all 16 pages were eagerly imported, causing Vite dev-mode to fire
// 100+ simultaneous ESM HTTP requests at startup, exhausting browser limits.
// With React.lazy() each page's module tree is only fetched when first visited.
const DashboardPage          = React.lazy(() => import('../modules/dashboard/pages/DashboardPage'));
const StudentDashboard       = React.lazy(() => import('../modules/dashboard/pages/StudentDashboard'));
const StudentCircularsPage   = React.lazy(() => import('../modules/student/pages/StudentCircularsPage'));
const StudentMailboxPage     = React.lazy(() => import('../modules/student/pages/StudentMailboxPage'));
const StudentAttendancePage  = React.lazy(() => import('../modules/student/pages/StudentAttendancePage'));
const StudentHomeworkPage    = React.lazy(() => import('../modules/student/pages/StudentHomeworkPage'));
const StudentAchievementsPage = React.lazy(() => import('../modules/student/pages/StudentAchievementsPage'));
const StudentSyllabusPage    = React.lazy(() => import('../modules/student/pages/StudentSyllabusPage'));
const StudentPerformancePage = React.lazy(() => import('../modules/student/pages/StudentPerformancePage'));
const StudentLeavePage       = React.lazy(() => import('../modules/student/pages/StudentLeavePage'));
const TimetablePage          = React.lazy(() => import('../modules/timetable/pages/TimetablePage'));
const OrganizationSettingsPage = React.lazy(() => import('../modules/timetable/pages/OrganizationSettingsPage'));
const ClassTimeManagement    = React.lazy(() => import('../modules/timetable/pages/ClassTimeManagement'));
const TeachersPage           = React.lazy(() => import('../modules/timetable/pages/TeachersPage'));
const SubjectsPage           = React.lazy(() => import('../modules/timetable/pages/SubjectsPage'));
const RoomsPage              = React.lazy(() => import('../modules/rooms/pages/RoomsPage'));
const TasksListPage          = React.lazy(() => import('../modules/tasks/pages/TasksListPage'));
const CreateTaskPage         = React.lazy(() => import('../modules/tasks/pages/CreateTaskPage'));
const TaskDetailPage         = React.lazy(() => import('../modules/tasks/pages/TaskDetailPage'));
const LeaveListPage          = React.lazy(() => import('../modules/leave/pages/LeaveListPage'));
const LeaveApplicationPage   = React.lazy(() => import('../modules/leave/pages/LeaveApplicationPage'));
const ProxyAssignmentPage    = React.lazy(() => import('../modules/leave/pages/ProxyAssignmentPage'));
const ReportsPage            = React.lazy(() => import('../modules/reports/pages/ReportsPage'));
const ProfilePage            = React.lazy(() => import('../modules/profile/pages/ProfilePage'));
const AcademicYearsPage      = React.lazy(() => import('../modules/settings/pages/AcademicYearsPage'));
const PrincipalFeedbackPage  = React.lazy(() => import('../modules/feedback/pages/PrincipalFeedbackPage'));
const TeacherFeedbackPage    = React.lazy(() => import('../modules/feedback/pages/TeacherFeedbackPage'));
const CircularManagementPage = React.lazy(() => import('../modules/circulars/pages/CircularManagementPage'));
const MailboxManagementPage  = React.lazy(() => import('../modules/mailbox/pages/MailboxManagementPage'));
const TeacherMailboxPage     = React.lazy(() => import('../modules/mailbox/pages/TeacherMailboxPage'));
const AchievementManagementPage = React.lazy(() => import('../modules/achievements/pages/AchievementManagementPage'));
const AttendanceMarkingPage  = React.lazy(() => import('../modules/attendance/pages/AttendanceMarkingPage'));

// Shared route-level loading spinner
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Redirects to "/" if the current user's role is in the denied list
function DenyRole({ deniedRoles, children }) {
  const { role } = useAuth();
  if (deniedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

const TEACHER_DENIED = ['teacher'];

export default function AppRouter() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

          <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
            {/* Dashboard — all roles */}
            <Route path="/" element={role === 'student' ? <StudentDashboard /> : <DashboardPage />} />

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

            {/* Reports — restricted to non-teacher roles */}
            <Route
              path="/reports"
              element={<DenyRole deniedRoles={TEACHER_DENIED}><ReportsPage /></DenyRole>}
            />

            {/* Settings — restricted to non-teacher roles */}
            <Route
              path="/academic-years"
              element={<DenyRole deniedRoles={TEACHER_DENIED}><AcademicYearsPage /></DenyRole>}
            />

            {/* Feedback — only Principal and Teacher */}
            <Route
              path="/feedback"
              element={
                role === 'principal' ? (
                  <PrincipalFeedbackPage />
                ) : role === 'teacher' ? (
                  <TeacherFeedbackPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Student-only routes */}
            <Route
              path="/student/circulars"
              element={role === 'student' ? <StudentCircularsPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/mailbox"
              element={role === 'student' ? <StudentMailboxPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/attendance"
              element={role === 'student' ? <StudentAttendancePage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/homework"
              element={role === 'student' ? <StudentHomeworkPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/achievements"
              element={role === 'student' ? <StudentAchievementsPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/syllabus"
              element={role === 'student' ? <StudentSyllabusPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/performance"
              element={role === 'student' ? <StudentPerformancePage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/student/leave"
              element={role === 'student' ? <StudentLeavePage /> : <Navigate to="/" replace />}
            />

            {/* Reports */}
            <Route path="/reports" element={['admin', 'principal', 'coordinator'].includes(role) ? <ReportsPage /> : <Navigate to="/" replace />} />

            {/* Circulars Management */}
            <Route path="/circulars" element={['admin', 'principal'].includes(role) ? <CircularManagementPage /> : <Navigate to="/" replace />} />

            {/* Mailbox Management */}
            <Route path="/mailbox" element={['admin', 'principal'].includes(role) ? <MailboxManagementPage /> : <Navigate to="/" replace />} />
            <Route path="/teacher/mailbox" element={role === 'teacher' ? <TeacherMailboxPage /> : <Navigate to="/" replace />} />

            {/* Achievement Management */}
            <Route path="/achievements" element={['admin', 'principal'].includes(role) ? <AchievementManagementPage /> : <Navigate to="/" replace />} />

            {/* Attendance Marking */}
            <Route path="/attendance/mark" element={['admin', 'principal', 'teacher'].includes(role) ? <AttendanceMarkingPage /> : <Navigate to="/" replace />} />

            {/* Profile — all roles */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
