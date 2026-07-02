import { useEffect, useState } from "react";
import { financeApi } from "../../services/finance.service.js";

function ReportsPage() {
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [monthlyRes, yearlyRes, donorsRes] = await Promise.all([
          financeApi.getMonthlyReport(),
          financeApi.getYearlyReport(),
          financeApi.getTopDonors(5),
        ]);
        setMonthly(monthlyRes.data?.report);
        setYearly(yearlyRes.data?.report);
        setTopDonors(donorsRes.data?.donors || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = async (type, format) => {
    try {
      const response = await financeApi.exportReport(type, format);
      if (response.data) {
        setExportMsg("Export ready (JSON format returned via API)");
      }
    } catch (err) {
      setExportMsg(err.message);
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports & Export</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Report</h2>
          <p className="mt-2 text-sm text-gray-600">Income: {monthly?.income?.toLocaleString()} ETB</p>
          <p className="text-sm text-gray-600">Expenses: {monthly?.expenses?.toLocaleString()} ETB</p>
          <p className="text-sm font-medium text-emerald-700">Net: {monthly?.net?.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Yearly Report ({yearly?.year})</h2>
          <p className="mt-2 text-sm text-gray-600">Income: {yearly?.income?.toLocaleString()} ETB</p>
          <p className="text-sm text-gray-600">Expenses: {yearly?.expenses?.toLocaleString()} ETB</p>
          <p className="text-sm font-medium text-emerald-700">Net: {yearly?.net?.toLocaleString()} ETB</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Top Donors</h2>
        <ul className="mt-3 space-y-2">
          {topDonors.map((donor) => (
            <li key={donor.email || donor.name} className="flex justify-between text-sm">
              <span>{donor.name}</span>
              <span className="font-medium">{donor.total?.toLocaleString()} ETB ({donor.count} gifts)</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {["csv", "excel", "pdf"].map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => handleExport("donations", format)}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Export Donations ({format.toUpperCase()})
          </button>
        ))}
      </div>
      {exportMsg ? <p className="text-sm text-gray-600">{exportMsg}</p> : null}
    </div>
  );
}

export default ReportsPage;
