import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

export default function ExpenseTrendChart({ data, loading }) {
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={data[0]?.date ? "date" : "period"} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }, [data]);

  if (loading) return <LoadingCard />;

  return (
    <DashboardSection title="Expense Trends">
      {chart}
    </DashboardSection>
  );
}
