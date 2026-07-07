import { useMemo } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import DashboardSection from "./DashboardSection";
import LoadingCard from "./LoadingCard";

const rankIcons = [Trophy, Medal, Award];
const rankColors = ["text-yellow-500", "text-gray-400", "text-orange-500"];

export default function TopDonorsTable({ data, loading }) {
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
              <th className="pb-3 pr-4">Donor</th>
              <th className="pb-3 pr-4 text-right">Amount</th>
              <th className="pb-3 text-right">Donations</th>
            </tr>
          </thead>
          <tbody>
            {data.map((donor, index) => {
              const RankIcon = rankIcons[index] || null;
              return (
                <tr
                  key={donor.name}
                  className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 pr-4">
                    {index < 3 && RankIcon ? (
                      <RankIcon size={20} className={rankColors[index]} />
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                    {donor.name}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-gray-900 dark:text-white">
                    ${donor.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                    {donor.donationCount}
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
    <DashboardSection title="Top Donors">
      {table}
    </DashboardSection>
  );
}
