import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { certificateService } from '../../services/certificate.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import CertificatePreview from '../../components/certificates/CertificatePreview.jsx';

function formatDate(value) {
  if (!value) return 'Not available';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Not available';
    return d.toLocaleDateString();
  } catch {
    return 'Not available';
  }
}

function getDashboardLink(user) {
  if (!user) return '/dashboard';
  const role = user.role;
  if (role === ROLES.SUPER_ADMIN) return '/dashboard';
  if (role === ROLES.ADMIN) return '/dashboard';
  if (role === ROLES.TEACHER) return '/dashboard';
  if (role === ROLES.STUDENT) return '/dashboard';
  if (role === ROLES.PARENT) return '/dashboard';
  return '/dashboard';
}

export default function CertificateDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isStudent = user?.role === ROLES.STUDENT;
  const downloadStatus = certificate?.downloadStatus;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await certificateService.getCertificateById(id);
      setCertificate(res.data.certificate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRequestDownload = async () => {
    try {
      setMessage('');
      await certificateService.requestDownload(id);
      setMessage('Download request submitted. Waiting for admin approval.');
      setCertificate((prev) => ({ ...prev, downloadStatus: 'PENDING' }));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDownload = async () => {
    try {
      await certificateService.downloadCertificate(id);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center text-slate-600 dark:text-slate-300">
        Certificate not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/dashboard/certificates"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          >
            ← Back to certificates
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {certificate.course?.title || 'Certificate'}
          </h1>
          <Link
            to={getDashboardLink(user)}
            className="mt-1 inline-block text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Back to Home
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStudent && downloadStatus === 'APPROVED' && (
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Download Original Certificate
            </button>
          )}
          {isStudent && downloadStatus === 'REJECTED' && (
            <span className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Download request was rejected
            </span>
          )}
          <Link
            to={`/certificate-verify/${certificate.verificationCode}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Verify Certificate
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.includes('submitted')
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      {isStudent ? (
        <CertificatePreview
          certificateId={id}
          downloadStatus={downloadStatus}
          onRequestDownload={handleRequestDownload}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Certificate Preview
          </div>
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400">
            <p>Preview is only available to the certificate owner.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              Certificate Number
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {certificate.certificateNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">Course</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {certificate.course?.title || certificate.courseName || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">Student</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {certificate.student?.name || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              Issued Date
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {new Date(certificate.issuedDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              Completion Date
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {formatDate(certificate.completionDate || certificate.completedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              Issued By
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {certificate.issuedBy?.name || '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
