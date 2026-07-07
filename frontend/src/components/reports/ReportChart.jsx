import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function ReportChart({ data, type, dataKey, nameKey, title }) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (type === "pie") return data;
    return data.map((d) => ({
      ...d,
      label: d.label || d._id || `${d.year}-${String(d.month).padStart(2, "0")}`,
    }));
  }, [data, type]);

  if (!chartData.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {type === "line" ? (
          <LineChart data={chartData}>
            <XAxis dataKey={nameKey || "label"} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey || "count"} stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={chartData} dataKey={dataKey || "count"} nameKey={nameKey || "_id"} cx="50%" cy="50%" outerRadius={90} label>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={chartData}>
            <XAxis dataKey={nameKey || "label"} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={dataKey || "count"} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
