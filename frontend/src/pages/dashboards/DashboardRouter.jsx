import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import SuperAdminDashboard from './SuperAdminDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import ParentDashboard from './ParentDashboard.jsx';

const DASHBOARD_COMPONENTS = {
  [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.TEACHER]: TeacherDashboard,
  [ROLES.STUDENT]: StudentDashboard,
  [ROLES.PARENT]: ParentDashboard,
};

export default function DashboardRouter() {
  const { user } = useAuth();
  const Dashboard = DASHBOARD_COMPONENTS[user?.role] || StudentDashboard;
  return <Dashboard />;
}
