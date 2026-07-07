import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#6366f1", "#06b6d4", "#8b5cf6", "#ec4899"];

export default function CompletionRateChart({ data, loading }) {
  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-[350px] items-center justify-center text-gray-400 dark:text-gray-500">
          No analytics available.
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="course" width={150} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="completionPercentage" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }, [data]);

  if (loading) return <LoadingCard />;

  return (
    <DashboardSection title="Course Completion Rate">
      {chart}
    </DashboardSection>
  );
}
