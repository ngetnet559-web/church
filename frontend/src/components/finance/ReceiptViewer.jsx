import { useEffect, useState } from "react";
import { financeApi } from "../../services/finance.service.js";

function ReceiptViewer({ donationId }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!donationId) return;
    const load = async () => {
      try {
        const response = await financeApi.getReceipt(donationId);
        setReceipt(response.data?.receipt);
      } catch (err) {
        setError(err.message || "Unable to load receipt");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [donationId]);

  if (loading) return <p className="text-sm text-gray-500 dark:text-slate-400">Loading receipt...</p>;
  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!receipt) return null;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(receipt.html);
    win.document.close();
    win.print();
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Receipt {receipt.receiptNumber}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{receipt.receiptUrl}</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Download / Print
        </button>
      </div>
      <div
        className="mt-4 overflow-auto rounded border p-4 dark:border-slate-700"
        dangerouslySetInnerHTML={{ __html: receipt.html }}
      />
    </div>
  );
}

export default ReceiptViewer;
