import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { certificateService } from '../../services/certificate.service.js';

export default function CertificatePreview({ certificateId, downloadStatus, onRequestDownload }) {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isApproved = downloadStatus === 'APPROVED';
  const [approvedSvg, setApprovedSvg] = useState(null);

  const drawCanvas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const raw = await certificateService.getPreview(certificateId);

      if (isApproved) {
        setApprovedSvg(raw);
        setLoading(false);
        return;
      }

      const blob = new Blob([raw], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) {
          URL.revokeObjectURL(url);
          setLoading(false);
          setError('Preview container not ready. Please try again.');
          return;
        }

        const containerWidth = container.clientWidth - 48;
        const scale = Math.min(1, containerWidth / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';

        const watermarkText = `${user?.name || 'Student'} | ${user?.email || ''} | PREVIEW ONLY - NOT APPROVED FOR DOWNLOAD`;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.6);

        for (let row = -6; row <= 6; row++) {
          for (let col = -6; col <= 6; col++) {
            ctx.fillText(watermarkText, col * 220, row * 90);
          }
        }
        ctx.restore();

        URL.revokeObjectURL(url);
        setLoading(false);
      };

      img.onerror = () => {
        setError('Failed to load preview image');
        setLoading(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [certificateId, isApproved, user]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (['s', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) {
        e.preventDefault();
      }
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCanvasContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Certificate Preview
        </span>
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
          isApproved
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isApproved ? 'APPROVED' : 'PREVIEW'}
        </span>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      )}

      {error && (
        <div className="p-4">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      <div className={`relative flex justify-center p-4 ${loading || error ? 'hidden' : ''}`}>
        <div
          className="relative max-w-full"
          style={{ touchAction: 'none' }}
        >
          {isApproved ? (
            <div
              className="pointer-events-none"
              dangerouslySetInnerHTML={{ __html: approvedSvg }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="block max-w-full"
              onContextMenu={handleCanvasContextMenu}
              onDragStart={handleDragStart}
              style={{ touchAction: 'none' }}
            />
          )}
        </div>
      </div>

      {!error && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isApproved
                ? 'You have download approval. Click the download button above to get the original certificate.'
                : 'This is a protected preview. Download requires admin approval.'}
            </p>
            {!isApproved && (
              <button
                type="button"
                onClick={onRequestDownload}
                disabled={downloadStatus === 'PENDING'}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  downloadStatus === 'PENDING'
                    ? 'cursor-not-allowed bg-amber-400'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {downloadStatus === 'PENDING'
                  ? 'Approval Pending...'
                  : 'Request Download Permission'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
