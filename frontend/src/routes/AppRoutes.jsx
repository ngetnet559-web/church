import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import { ROLES } from "../constants/roles.js";

const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Unauthorized = lazy(() => import("../pages/Unauthorized.jsx"));
const DashboardRouter = lazy(() => import("../pages/dashboards/DashboardRouter.jsx"));
const UsersPage = lazy(() => import("../pages/admin/UsersPage.jsx"));
const PlaceholderPage = lazy(() => import("../pages/PlaceholderPage.jsx"));
const CoursesListPage = lazy(() => import("../pages/courses/CoursesListPage.jsx"));
const MyCoursesPage = lazy(() => import("../pages/courses/MyCoursesPage.jsx"));
const CreateCoursePage = lazy(() => import("../pages/courses/CreateCoursePage.jsx"));
const CourseDetailPage = lazy(() => import("../pages/courses/CourseDetailPage.jsx"));
const LessonViewerPage = lazy(() => import("../pages/courses/LessonViewerPage.jsx"));
const AttendanceDashboardPage = lazy(() => import("../pages/attendance/AttendanceDashboardPage.jsx"));
const AttendanceSessionsPage = lazy(() => import("../pages/attendance/AttendanceSessionsPage.jsx"));
const TakeAttendancePage = lazy(() => import("../pages/attendance/TakeAttendancePage.jsx"));
const MyAttendancePage = lazy(() => import("../pages/attendance/MyAttendancePage.jsx"));
const ParentAttendancePage = lazy(() => import("../pages/attendance/ParentAttendancePage.jsx"));
const CertificatesPage = lazy(() => import("../pages/certificates/CertificatesPage.jsx"));
const CertificateDetailPage = lazy(() => import("../pages/certificates/CertificateDetailPage.jsx"));
const CertificateVerifyPage = lazy(() => import("../pages/certificates/CertificateVerifyPage.jsx"));
const CertificateDownloadRequestsPage = lazy(() => import("../pages/certificates/CertificateDownloadRequestsPage.jsx"));
const FinanceDashboardPage = lazy(() => import("../pages/finance/FinanceDashboardPage.jsx"));
const CampaignsPage = lazy(() => import("../pages/finance/CampaignsPage.jsx"));
const CampaignDetailPage = lazy(() => import("../pages/finance/CampaignDetailPage.jsx"));
const DonationsPage = lazy(() => import("../pages/finance/DonationsPage.jsx"));
const DonationDetailPage = lazy(() => import("../pages/finance/DonationDetailPage.jsx"));
const MyDonationsPage = lazy(() => import("../pages/finance/MyDonationsPage.jsx"));
const ExpensesPage = lazy(() => import("../pages/finance/ExpensesPage.jsx"));
const ExpenseDetailPage = lazy(() => import("../pages/finance/ExpenseDetailPage.jsx"));
const BudgetsPage = lazy(() => import("../pages/finance/BudgetsPage.jsx"));
const ReportsPage = lazy(() => import("../pages/finance/ReportsPage.jsx"));
const PublicDonationPage = lazy(() => import("../pages/finance/PublicDonationPage.jsx"));
const PublicCampaignsPage = lazy(() => import("../pages/finance/PublicCampaignsPage.jsx"));
const PublicCampaignDetailPage = lazy(() => import("../pages/finance/PublicCampaignDetailPage.jsx"));
const DonationSuccessPage = lazy(() => import("../pages/finance/DonationSuccessPage.jsx"));
const DonationFailurePage = lazy(() => import("../pages/finance/DonationFailurePage.jsx"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage.jsx"));
const EditProfilePage = lazy(() => import("../pages/profile/EditProfilePage.jsx"));
const ProfilesPage = lazy(() => import("../pages/admin/ProfilesPage.jsx"));
const AnalyticsDashboardPage = lazy(() => import("../pages/analytics/AnalyticsDashboardPage"));
const NotificationsPage = lazy(() => import("../pages/notifications/NotificationsPage"));
const AdminNotificationsPage = lazy(() => import("../pages/notifications/AdminNotificationsPage"));
const AnnouncementPage = lazy(() => import("../pages/notifications/AnnouncementPage"));
const NotificationSettingsPage = lazy(() => import("../pages/notifications/NotificationSettingsPage"));
const CalendarPage = lazy(() => import("../pages/events/CalendarPage"));
const EventsPage = lazy(() => import("../pages/events/EventsPage"));
const EventDetailPage = lazy(() => import("../pages/events/EventDetailPage"));
const MyEventsPage = lazy(() => import("../pages/events/MyEventsPage"));
const AdminEventsPage = lazy(() => import("../pages/events/AdminEventsPage"));
const RoomsPage = lazy(() => import("../pages/rooms/RoomsPage"));
const RoomDetailPage = lazy(() => import("../pages/rooms/RoomDetailPage"));
const AdminRoomsPage = lazy(() => import("../pages/rooms/AdminRoomsPage"));
const AdminBookingsPage = lazy(() => import("../pages/rooms/AdminBookingsPage"));
const ReportsDashboard = lazy(() => import("../pages/reports/ReportsDashboard"));
const UsersReport = lazy(() => import("../pages/reports/UsersReport"));
const CoursesReport = lazy(() => import("../pages/reports/CoursesReport"));
const AttendanceReport = lazy(() => import("../pages/reports/AttendanceReport"));
const FinanceReport = lazy(() => import("../pages/reports/FinanceReport"));
const DonationReport = lazy(() => import("../pages/reports/DonationReport"));
const AnalyticsReport = lazy(() => import("../pages/reports/AnalyticsReport"));
const MembersReport = lazy(() => import("../pages/reports/MembersReport"));
const EnrollmentsReport = lazy(() => import("../pages/reports/EnrollmentsReport"));
const CertificatesReport = lazy(() => import("../pages/reports/CertificatesReport"));
const ExpensesReport = lazy(() => import("../pages/reports/ExpensesReport"));
const CampaignsReport = lazy(() => import("../pages/reports/CampaignsReport"));
const AuditLogsPage = lazy(() => import("../pages/system/AuditLogsPage"));
const ActivityPage = lazy(() => import("../pages/system/ActivityPage"));
const LoginHistoryPage = lazy(() => import("../pages/system/LoginHistoryPage"));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/donate" element={<PublicDonationPage />} />
        <Route path="/campaigns" element={<PublicCampaignsPage />} />
        <Route path="/campaigns/:id" element={<PublicCampaignDetailPage />} />
        <Route path="/donation-success" element={<DonationSuccessPage />} />
        <Route path="/donation-failed" element={<DonationFailurePage />} />
        <Route
          path="/certificate-verify/:code"
          element={<CertificateVerifyPage />}
        />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          <Route
            path="/dashboard/users"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/system"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <PlaceholderPage
                  title="System Settings"
                  description="Configure platform-wide settings."
                />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/audit-logs"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/activity"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ActivityPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/login-history"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <LoginHistoryPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/teachers"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <PlaceholderPage
                  title="Teachers"
                  description="Manage teacher accounts and assignments."
                />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/students"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                <PlaceholderPage
                  title="Students"
                  description="View and manage student records."
                />
              </RoleRoute>
            }
          />

          <Route path="/dashboard/courses" element={<CoursesListPage />} />
          <Route
            path="/dashboard/my-courses"
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <MyCoursesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/courses/create"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}
              >
                <CreateCoursePage />
              </RoleRoute>
            }
          />
          <Route path="/dashboard/courses/:id" element={<CourseDetailPage />} />
          <Route
            path="/dashboard/courses/:id/lessons/:lessonId"
            element={<LessonViewerPage />}
          />

          <Route
            path="/dashboard/attendance"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}
              >
                <AttendanceDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/attendance/sessions"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}
              >
                <AttendanceSessionsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/attendance/:id"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}
              >
                <TakeAttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/my-attendance"
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <MyAttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/parent-attendance"
            element={
              <RoleRoute allowedRoles={[ROLES.PARENT]}>
                <ParentAttendancePage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/certificates"
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <CertificatesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/certificates/download-requests"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <CertificateDownloadRequestsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/certificates/:id"
            element={
              <RoleRoute
                allowedRoles={[ROLES.STUDENT, ROLES.SUPER_ADMIN, ROLES.ADMIN]}
              >
                <CertificateDetailPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/finance"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <FinanceDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/campaigns"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}>
                <CampaignsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/campaigns/:id"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <CampaignDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/donations/:id"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT]}
              >
                <DonationDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/donations"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <DonationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/my-donations"
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT, ROLES.PARENT, ROLES.TEACHER]}>
                <MyDonationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/expenses/:id"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ExpenseDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/expenses"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ExpensesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/budgets"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <BudgetsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/finance/reports"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ReportsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/progress"
            element={
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <MyCoursesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/progress-parent"
            element={
              <RoleRoute allowedRoles={[ROLES.PARENT]}>
                <PlaceholderPage
                  title="Progress"
                  description="View your children's learning progress."
                />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/children"
            element={
              <RoleRoute allowedRoles={[ROLES.PARENT]}>
                <PlaceholderPage
                  title="Children"
                  description="View your children's profiles."
                />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/profile"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.STUDENT,
                  ROLES.PARENT,
                  ROLES.TEACHER,
                  ROLES.ADMIN,
                  ROLES.SUPER_ADMIN,
                ]}
              >
                <ProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/profile/edit"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.STUDENT,
                  ROLES.PARENT,
                  ROLES.TEACHER,
                  ROLES.ADMIN,
                  ROLES.SUPER_ADMIN,
                ]}
              >
                <EditProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/profiles"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}
              >
                <ProfilesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/profiles/:id"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT,
                ]}
              >
                <ProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/profiles/:id/edit"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT,
                ]}
              >
                <EditProfilePage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/notifications"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT,
                ]}
              >
                <NotificationsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/notifications/send"
            element={
              <RoleRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}
              >
                <AdminNotificationsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/notifications/settings"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT,
                ]}
              >
                <NotificationSettingsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard/announcements"
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.ADMIN,
                  ROLES.TEACHER,
                  ROLES.STUDENT,
                  ROLES.PARENT,
                ]}
              >
                <AnnouncementPage />
              </RoleRoute>
            }
          />

          <Route
  path="/dashboard/analytics"
  element={
    <RoleRoute
      allowedRoles={[
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.TEACHER,
      ]}
    >
      <AnalyticsDashboardPage />
    </RoleRoute>
  }
/>

          <Route
            path="/dashboard/reports"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ReportsDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/users"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <UsersReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/courses"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}>
                <CoursesReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/attendance"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}>
                <AttendanceReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/finance"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <FinanceReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/donations"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <DonationReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/analytics"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AnalyticsReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/members"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <MembersReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/enrollments"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}>
                <EnrollmentsReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/certificates"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER]}>
                <CertificatesReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/expenses"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <ExpensesReport />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/reports/campaigns"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <CampaignsReport />
              </RoleRoute>
            }
          />

          <Route path="/dashboard/calendar" element={<CalendarPage />} />
          <Route path="/dashboard/events" element={<EventsPage />} />
          <Route path="/dashboard/events/my" element={<MyEventsPage />} />
          <Route path="/dashboard/events/:id" element={<EventDetailPage />} />
          <Route
            path="/dashboard/admin/events"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AdminEventsPage />
              </RoleRoute>
            }
          />
          <Route path="/dashboard/rooms" element={<RoomsPage />} />
          <Route path="/dashboard/rooms/:id" element={<RoomDetailPage />} />
          <Route
            path="/dashboard/admin/rooms"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AdminRoomsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/admin/bookings"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AdminBookingsPage />
              </RoleRoute>
            }
          />
        </Route>

        
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
