import { useMemo } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  BadgeCheck,
  HeartHandshake,
  Wallet,
  UserCheck,
  UserCog,
  UsersRound,
  Percent,
  DollarSign,
  PiggyBank,
} from "lucide-react";

const cards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "text-blue-600 dark:text-blue-400" },
  { key: "totalStudents", label: "Students", icon: UsersRound, color: "text-green-600 dark:text-green-400" },
  { key: "totalTeachers", label: "Teachers", icon: UserCog, color: "text-purple-600 dark:text-purple-400" },
  { key: "totalParents", label: "Parents", icon: UserCheck, color: "text-teal-600 dark:text-teal-400" },
  { key: "totalCourses", label: "Courses", icon: BookOpen, color: "text-orange-600 dark:text-orange-400" },
  { key: "totalEnrollments", label: "Enrollments", icon: GraduationCap, color: "text-indigo-600 dark:text-indigo-400" },
  { key: "totalCertificates", label: "Certificates", icon: BadgeCheck, color: "text-cyan-600 dark:text-cyan-400" },
  { key: "attendanceRate", label: "Attendance %", icon: Percent, color: "text-pink-600 dark:text-pink-400", suffix: "%" },
  { key: "revenue", label: "Revenue", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", prefix: "$" },
  { key: "expenses", label: "Expenses", icon: Wallet, color: "text-red-600 dark:text-red-400", prefix: "$" },
  { key: "netIncome", label: "Net Income", icon: PiggyBank, color: "text-yellow-600 dark:text-yellow-400", prefix: "$" },
  { key: "totalProfiles", label: "Member Profiles", icon: HeartHandshake, color: "text-violet-600 dark:text-violet-400" },
];

export default function KPICards({ data, loading }) {
  const skeleton = useMemo(
    () => (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="mt-4 h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    ),
    [],
  );

  if (loading) return skeleton;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        let value = data?.[card.key];
        if (value === undefined || value === null) value = 0;
        const display = `${card.prefix || ""}${typeof value === "number" ? value.toLocaleString() : value}${card.suffix || ""}`;
        return (
          <div
            key={card.key}
            className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {display}
                </p>
              </div>
              <div className={`rounded-xl p-3 transition-all duration-300 group-hover:scale-110 ${card.color} bg-opacity-10`}>
                <Icon size={32} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
