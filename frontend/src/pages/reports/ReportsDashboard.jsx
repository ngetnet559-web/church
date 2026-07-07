import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportService } from "../../services/report.service";
import { BarChart3, Users, BookOpen, GraduationCap, DollarSign, FileText, Award, Activity } from "lucide-react";
import ReportSkeleton from "../../components/reports/ReportSkeleton.jsx";

const reportGroups = [
  {
    title: "Academic",
    reports: [
      { type: "users", label: "Users Report", icon: Users, color: "text-indigo-500", desc: "User accounts, roles, and activity" },
      { type: "members", label: "Members Report", icon: Users, color: "text-blue-500", desc: "Member profiles and demographics" },
      { type: "courses", label: "Courses Report", icon: BookOpen, color: "text-purple-500", desc: "Course overview, lessons, and enrollments" },
      { type: "enrollments", label: "Enrollments Report", icon: GraduationCap, color: "text-green-500", desc: "Enrollment trends and completion rates" },
      { type: "attendance", label: "Attendance Report", icon: Activity, color: "text-yellow-500", desc: "Session attendance and trends" },
      { type: "certificates", label: "Certificates Report", icon: Award, color: "text-amber-500", desc: "Certificate issuance history" },
    ],
  },
  {
    title: "Financial",
    reports: [
      { type: "finance", label: "Finance Report", icon: DollarSign, color: "text-emerald-500", desc: "Income, expenses, and balance" },
      { type: "donations", label: "Donations Report", icon: DollarSign, color: "text-red-500", desc: "Donation breakdown by method" },
      { type: "expenses", label: "Expenses Report", icon: FileText, color: "text-orange-500", desc: "Expense categories and totals" },
      { type: "campaigns", label: "Campaigns Report", icon: BarChart3, color: "text-cyan-500", desc: "Campaign progress and goals" },
    ],
  },
  {
    title: "Analytics",
    reports: [
      { type: "analytics", label: "Analytics Report", icon: BarChart3, color: "text-pink-500", desc: "Platform-wide statistics and KPIs" },
    ],
  },
];

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await reportService.getReport("analytics");
        setQuickStats(res.data?.summary);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate and export comprehensive reports
        </p>
      </div>

      {loading ? (
        <ReportSkeleton rows={3} />
      ) : quickStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: quickStats.totalUsers, icon: Users, color: "text-indigo-500" },
            { label: "Total Courses", value: quickStats.totalCourses, icon: BookOpen, color: "text-purple-500" },
            { label: "Total Enrollments", value: quickStats.totalEnrollments, icon: GraduationCap, color: "text-green-500" },
            { label: "Certificates", value: quickStats.totalCertificates, icon: Award, color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {s.value?.toLocaleString() || "—"}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {reportGroups.map((group) => (
        <div key={group.title}>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{group.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.reports.map((r) => (
              <button
                key={r.type}
                onClick={() => navigate(`/dashboard/reports/${r.type}`)}
                className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                  <r.icon size={20} className={`${r.color} transition group-hover:scale-110`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{r.label}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
