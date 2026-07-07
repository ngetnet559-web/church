import { useMemo } from "react";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

export default function TeacherPerformanceTable({ data, loading }) {
  const table = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-[350px] items-center justify-center text-gray-400 dark:text-gray-500">
          No analytics available.
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="pb-3 pr-4">Teacher</th>
              <th className="pb-3 pr-4 text-right">Courses</th>
              <th className="pb-3 pr-4 text-right">Students</th>
              <th className="pb-3 pr-4 text-right">Completion %</th>
              <th className="pb-3 text-right">Avg Attendance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((teacher) => (
              <tr
                key={teacher.teacher}
                className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                  {teacher.teacher}
                </td>
                <td className="py-3 pr-4 text-right text-gray-900 dark:text-white">
                  {teacher.courses}
                </td>
                <td className="py-3 pr-4 text-right text-gray-900 dark:text-white">
                  {teacher.students}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      teacher.completionPercentage >= 70
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : teacher.completionPercentage >= 40
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {teacher.completionPercentage}%
                  </span>
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-white">
                  {teacher.averageAttendance}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [data]);

  if (loading) return <LoadingCard />;

  return (
    <DashboardSection title="Teacher Performance">
      {table}
    </DashboardSection>
  );
}
