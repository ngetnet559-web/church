import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#8b5cf6"];

export default function AttendanceGauge({ data, loading }) {
  const chart = useMemo(() => {
    if (!data || (!data.present && !data.absent && !data.late && !data.excused)) {
      return (
        <div className="flex h-[350px] items-center justify-center text-gray-400 dark:text-gray-500">
          No analytics available.
        </div>
      );
    }

    const pieData = [
      { name: "Present", value: data.present },
      { name: "Absent", value: data.absent },
      { name: "Late", value: data.late },
      { name: "Excused", value: data.excused },
    ].filter((d) => d.value > 0);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {data.overallAttendance}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Overall Attendance
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }, [data]);

  if (loading) return <LoadingCard />;

  return (
    <DashboardSection title="Attendance Rate">
      {chart}
    </DashboardSection>
  );
}
