import { Printer } from "lucide-react";

export default function PrintButton({ title }) {
  function handlePrint() {
    const original = document.title;
    if (title) document.title = title;
    window.print();
    document.title = original;
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <Printer size={16} />
      Print
    </button>
  );
}
