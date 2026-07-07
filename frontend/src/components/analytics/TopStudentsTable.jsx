import { useMemo } from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

const rankIcons = [Trophy, Medal, Award];
const rankColors = ["text-yellow-500", "text-gray-400", "text-orange-500"];

export default function TopStudentsTable({ data, loading }) {
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
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Student</th>
              <th className="pb-3 pr-4 text-right">Attendance</th>
              <th className="pb-3 pr-4 text-right">Progress</th>
              <th className="pb-3 pr-4 text-right">Completed</th>
              <th className="pb-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, index) => {
              const RankIcon = rankIcons[index] || null;
              return (
                <tr
                  key={student.name}
                  className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 pr-4">
                    {index < 3 && RankIcon ? (
                      <RankIcon size={20} className={rankColors[index]} />
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-900 dark:text-white">
                    {student.attendanceRate}%
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-900 dark:text-white">
                    {student.averageProgress}%
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-900 dark:text-white">
                    {student.completedCourses}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      <TrendingUp size={14} />
                      {student.score}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [data]);

  if (loading) return <LoadingCard />;

  return (
    <DashboardSection title="Most Active Students">
      {table}
    </DashboardSection>
  );
}
