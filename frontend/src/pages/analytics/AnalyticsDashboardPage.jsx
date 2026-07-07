import { useEffect, useState, useRef } from "react";

import AnalyticsHeader from "../../components/analytics/AnalyticsHeader";
import AnalyticsFilters from "../../components/analytics/AnalyticsFilters";
import KPICards from "../../components/analytics/KPICards";
import DashboardSkeleton from "../../components/analytics/DashboardSkeleton";
import { analyticsService } from "../../services/analytics.service";
import UserGrowthChart from "../../components/analytics/UserGrowthChart";
import RolePieChart from "../../components/analytics/RolePieChart";
import CoursePopularityChart from "../../components/analytics/CoursePopularityChart";
import DonationExpenseChart from "../../components/analytics/DonationExpenseChart";
import EnrollmentTrendChart from "../../components/analytics/EnrollmentTrendChart";
import CompletionRateChart from "../../components/analytics/CompletionRateChart";
import AttendanceGauge from "../../components/analytics/AttendanceGauge";
import IncomeExpenseChart from "../../components/analytics/IncomeExpenseChart";
import TopDonorsTable from "../../components/analytics/TopDonorsTable";
import TopStudentsTable from "../../components/analytics/TopStudentsTable";
import TeacherPerformanceTable from "../../components/analytics/TeacherPerformanceTable";
import CertificateTrendChart from "../../components/analytics/CertificateTrendChart";
import MemberGrowthChart from "../../components/analytics/MemberGrowthChart";

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("all");
  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState({
    userGrowth: [],
    roleDistribution: [],
    coursePopularity: [],
    donationExpense: [],
  });

  const [enrollmentTrend, setEnrollmentTrend] = useState([]);
  const [completionRate, setCompletionRate] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [netIncome, setNetIncome] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [teacherPerformance, setTeacherPerformance] = useState([]);
  const [certificateTrend, setCertificateTrend] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);

  const staticLoadedRef = useRef(false);

  async function safeFetch(fn, fallback) {
    try {
      const res = await fn();
      return res.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Analytics] API error:", err.message || err, err.status ? `(Status: ${err.status})` : "");
      }
      return fallback;
    }
  }

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    const [dashData, chartData] = await Promise.all([
      safeFetch(() => analyticsService.getDashboard(period), null),
      safeFetch(() => analyticsService.getCharts(period), {
        userGrowth: [],
        roleDistribution: [],
        coursePopularity: [],
        donationExpense: [],
      }),
    ]);

    if (dashData === null) {
      setError("Failed to load analytics data. Please try again.");
      setLoading(false);
      return;
    }

    setDashboard(dashData);

    if (chartData) {
      setCharts(chartData);
    }

    const [
      enrollmentData,
      attendanceData,
      incomeData,
      certificateData,
      memberGrowthData,
    ] = await Promise.all([
      safeFetch(() => analyticsService.getEnrollmentTrend(period), []),
      safeFetch(() => analyticsService.getAttendanceRate(period), null),
      safeFetch(() => analyticsService.getNetIncome(period), []),
      safeFetch(() => analyticsService.getCertificateTrend(period), []),
      safeFetch(() => analyticsService.getMemberGrowth(period), []),
    ]);

    setEnrollmentTrend(enrollmentData);
    setAttendanceRate(attendanceData);
    setNetIncome(incomeData);
    setCertificateTrend(certificateData);
    setMemberGrowth(memberGrowthData);

    if (!staticLoadedRef.current) {
      const [
        completionData,
        donorsData,
        studentsData,
        teachersData,
      ] = await Promise.all([
        safeFetch(() => analyticsService.getCompletionRate(), []),
        safeFetch(() => analyticsService.getTopDonors(), []),
        safeFetch(() => analyticsService.getTopStudents(), []),
        safeFetch(() => analyticsService.getTeacherPerformance(), []),
      ]);

      setCompletionRate(completionData);
      setTopDonors(donorsData);
      setTopStudents(studentsData);
      setTeacherPerformance(teachersData);
      staticLoadedRef.current = true;
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [period]);

  function handlePeriodChange(newPeriod) {
    setPeriod(newPeriod);
  }

  function handleRefresh() {
    loadDashboard();
  }

  function handleExportPDF() {
    window.print();
  }

  function handleExportExcel() {
    const tables = captureTableData();
    if (tables.length === 0) return;
    let csv = "";
    tables.forEach(({ name, rows }) => {
      csv += `\n${name}\n`;
      if (rows.length > 0) {
        csv += Object.keys(rows[0]).join(",") + "\n";
        rows.forEach((row) => {
          csv += Object.values(row).join(",") + "\n";
        });
      }
    });
    downloadFile(csv, "analytics-report.csv", "text/csv");
  }

  function handleExportCSV() {
    handleExportExcel();
  }

  function captureTableData() {
    const tables = [];
    if (topDonors.length > 0) tables.push({ name: "Top Donors", rows: topDonors });
    if (topStudents.length > 0) {
      tables.push({
        name: "Most Active Students",
        rows: topStudents.map((s) => ({
          name: s.name,
          email: s.email,
          attendanceRate: `${s.attendanceRate}%`,
          averageProgress: `${s.averageProgress}%`,
          completedCourses: s.completedCourses,
          score: s.score,
        })),
      });
    }
    if (teacherPerformance.length > 0) tables.push({ name: "Teacher Performance", rows: teacherPerformance });
    if (completionRate.length > 0) tables.push({ name: "Course Completion", rows: completionRate });
    if (netIncome.length > 0) tables.push({ name: "Net Income", rows: netIncome });
    return tables;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !dashboard) {
    return (
      <div className="w-full p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-lg font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>
          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6">
      <AnalyticsHeader
        title="Analytics Dashboard"
        onRefresh={handleRefresh}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        loading={loading}
      />

      <AnalyticsFilters period={period} onChange={handlePeriodChange} />

      <KPICards data={dashboard} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart data={charts.userGrowth} />
        <EnrollmentTrendChart data={enrollmentTrend} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Role Distribution
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-900">
            <RolePieChart data={charts.roleDistribution} />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Course Popularity
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-900">
            <CoursePopularityChart data={charts.coursePopularity} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Donations vs Expenses
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-900">
            <DonationExpenseChart data={charts.donationExpense} />
          </div>
        </div>
        <IncomeExpenseChart data={netIncome} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionRateChart data={completionRate} loading={loading} />
        <AttendanceGauge data={attendanceRate} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDonorsTable data={topDonors} loading={loading} />
        <TopStudentsTable data={topStudents} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TeacherPerformanceTable data={teacherPerformance} loading={loading} />
        <CertificateTrendChart data={certificateTrend} loading={loading} />
      </div>

      <MemberGrowthChart data={memberGrowth} loading={loading} />
    </div>
  );
}
