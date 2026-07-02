import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Unauthorized from "../pages/Unauthorized.jsx";
import DashboardRouter from "../pages/dashboards/DashboardRouter.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";
import CoursesListPage from "../pages/courses/CoursesListPage.jsx";
import MyCoursesPage from "../pages/courses/MyCoursesPage.jsx";
import CreateCoursePage from "../pages/courses/CreateCoursePage.jsx";
import CourseDetailPage from "../pages/courses/CourseDetailPage.jsx";
import LessonViewerPage from "../pages/courses/LessonViewerPage.jsx";
import AttendanceDashboardPage from "../pages/attendance/AttendanceDashboardPage.jsx";
import AttendanceSessionsPage from "../pages/attendance/AttendanceSessionsPage.jsx";
import TakeAttendancePage from "../pages/attendance/TakeAttendancePage.jsx";
import MyAttendancePage from "../pages/attendance/MyAttendancePage.jsx";
import ParentAttendancePage from "../pages/attendance/ParentAttendancePage.jsx";
import CertificatesPage from "../pages/certificates/CertificatesPage.jsx";
import CertificateDetailPage from "../pages/certificates/CertificateDetailPage.jsx";
import CertificateVerifyPage from "../pages/certificates/CertificateVerifyPage.jsx";
import FinanceDashboardPage from "../pages/finance/FinanceDashboardPage.jsx";
import CampaignsPage from "../pages/finance/CampaignsPage.jsx";
import CampaignDetailPage from "../pages/finance/CampaignDetailPage.jsx";
import DonationsPage from "../pages/finance/DonationsPage.jsx";
import DonationDetailPage from "../pages/finance/DonationDetailPage.jsx";
import MyDonationsPage from "../pages/finance/MyDonationsPage.jsx";
import ExpensesPage from "../pages/finance/ExpensesPage.jsx";
import ExpenseDetailPage from "../pages/finance/ExpenseDetailPage.jsx";
import BudgetsPage from "../pages/finance/BudgetsPage.jsx";
import ReportsPage from "../pages/finance/ReportsPage.jsx";
import PublicDonationPage from "../pages/finance/PublicDonationPage.jsx";
import PublicCampaignsPage from "../pages/finance/PublicCampaignsPage.jsx";
import PublicCampaignDetailPage from "../pages/finance/PublicCampaignDetailPage.jsx";
import DonationSuccessPage from "../pages/finance/DonationSuccessPage.jsx";
import DonationFailurePage from "../pages/finance/DonationFailurePage.jsx";
import ProfilePage from "../pages/profile/ProfilePage.jsx";
import EditProfilePage from "../pages/profile/EditProfilePage.jsx";
import ProfilesPage from "../pages/admin/ProfilesPage.jsx";
import { ROLES } from "../constants/roles.js";

function AppRoutes() {
  return (
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
