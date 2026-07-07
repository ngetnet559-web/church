import { useEffect, useState } from 'react';
import { certificateService } from '../../services/certificate.service.js';

export default function CertificateDownloadRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getDownloadRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (requestId, action) => {
    try {
      setMessage('');
      await certificateService.reviewDownloadRequest(requestId, action);
      setMessage(`Request ${action.toLowerCase()} successfully.`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="space-y-6 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Certificate Download Requests</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Review and manage student certificate download requests.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <p>No download requests yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Student</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Course</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Certificate #</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Requested</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{req.student?.name || '—'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{req.student?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {req.certificate?.courseTitle || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {req.certificate?.certificateNumber || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview(req.id, 'APPROVED')}
                          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(req.id, 'REJECTED')}
                          className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
