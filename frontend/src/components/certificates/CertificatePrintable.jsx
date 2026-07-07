const SCHOOL_NAME = "Sunday School";

export default function CertificatePrintable({ certificate }) {
  if (!certificate) return null;

  return (
    <div
      id="certificate-print"
      className="relative mx-auto max-w-3xl border-8 border-double border-amber-700/30 bg-linear-to-b from-amber-50 to-white p-10 print:border-amber-800 print:p-8 dark:from-amber-950 dark:to-slate-900"
    >
      <div className="absolute inset-4 border border-amber-600/20 pointer-events-none" />

      <div className="relative text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          SS
        </div>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
          {SCHOOL_NAME}
        </p>
        <h1 className="mt-6 font-serif text-4xl font-bold text-slate-900 dark:text-white">
          Certificate of Completion
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">This is to certify that</p>
        <p className="mt-4 font-serif text-3xl font-bold text-indigo-800 underline decoration-amber-400 decoration-2 underline-offset-4 dark:text-indigo-300">
          {certificate.student?.name || "Student Name"}
        </p>
        <p className="mt-6 text-slate-600 dark:text-slate-300">
          has successfully completed the course
        </p>
        <p className="mt-3 font-serif text-2xl font-semibold text-slate-900 dark:text-white">
          {certificate.course?.title || "Course Title"}
        </p>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Completion Date:{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {new Date(certificate.issuedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </p>
      </div>

      <div className="relative mt-10 grid grid-cols-3 gap-6 border-t border-amber-200 pt-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500">
            QR Code
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Scan to verify</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Certificate No.
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {certificate.certificateNumber}
          </p>
          <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
            Verification
          </p>
          <p className="mt-1 break-all text-xs font-mono text-slate-700 dark:text-slate-300">
            {certificate.verificationCode}
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex h-16 items-end justify-center border-b border-slate-400 pb-1 dark:border-slate-500">
            <span className="font-serif italic text-slate-600 dark:text-slate-300">
              {certificate.issuedBy?.name || "Director"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
