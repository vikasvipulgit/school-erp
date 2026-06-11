import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  MessageSquare,
  Star,
  AlertCircle,
  ThumbsUp,
  Info,
  Calendar,
  User,
  Award,
  Download,
  Share2,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '@/core/context/AuthContext';
import { useAcademicYear } from '@/core/context/AcademicYearContext';
import { downloadCertificate, shareCertificate } from '@/utils/certificateGenerator';
import FeedbackCertificateCard from '@/components/feedback/FeedbackCertificateCard';

// Lazy-load heavy modal so it doesn't block initial paint
const CertificatePreviewModal = lazy(() =>
  import('@/components/feedback/CertificatePreviewModal')
);

// ── Types ──────────────────────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  { value: 'appreciation', label: 'Appreciation',     icon: ThumbsUp,      color: 'text-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-200', shareable: true  },
  { value: 'warning',      label: 'Warning',           icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-50',      border: 'border-red-200',     shareable: false },
  { value: 'suggestion',   label: 'Suggestion',        icon: Info,          color: 'text-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-200',    shareable: true  },
  { value: 'general',      label: 'General Feedback',  icon: MessageSquare, color: 'text-gray-500',    bg: 'bg-gray-50',     border: 'border-gray-200',    shareable: true  },
];

// ── Left-accent colour strip ───────────────────────────────────────────────────
const ACCENT_STRIP = {
  appreciation: 'bg-emerald-500',
  warning:      'bg-red-500',
  suggestion:   'bg-blue-500',
  general:      'bg-gray-400',
};

// ── Small toast for quick actions (download / share triggered without modal) ───
function ActionToast({ state }) {
  if (!state) return null;
  const map = {
    loading: { icon: <Loader2 size={14} className="animate-spin" />, text: 'Processing…',                 cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    success: { icon: <CheckCircle size={14} />,                       text: 'Done!',                       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    error:   { icon: <AlertCircle size={14} />,                       text: 'Something went wrong.',        cls: 'bg-red-50 text-red-600 border-red-200' },
    fallback:{ icon: <CheckCircle size={14} />,                       text: 'Downloaded (share unavailable).', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const { icon, text, cls } = map[state] || map.loading;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {icon}{text}
    </span>
  );
}

// ── Individual feedback card ───────────────────────────────────────────────────
function FeedbackCard({ fb, teacherName, session, onViewCertificate }) {
  const config   = FEEDBACK_TYPES.find(t => t.value === fb.type) || FEEDBACK_TYPES[3];
  const Icon     = config.icon;
  const cardRef  = useRef(null);
  const [quickState, setQuickState] = useState(null); // null | 'loading' | 'success' | 'error' | 'fallback'

  const runQuick = useCallback(async (action) => {
    setQuickState('loading');
    try {
      const result = await action();
      setQuickState(result?.fallback ? 'fallback' : 'success');
    } catch {
      setQuickState('error');
    } finally {
      setTimeout(() => setQuickState(null), 3000);
    }
  }, []);

  const handleQuickDownload = () =>
    runQuick(() => downloadCertificate(cardRef.current, teacherName));

  const handleQuickShare = () =>
    runQuick(() => shareCertificate(cardRef.current, teacherName, fb.title));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Hidden certificate card — captured by html2canvas for quick actions */}
      {config.shareable && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <FeedbackCertificateCard
            ref={cardRef}
            teacherName={teacherName}
            feedbackTitle={fb.title}
            feedbackMessage={fb.message}
            rating={fb.rating}
            principalName={fb.principal?.name}
            createdAt={fb.createdAt}
            session={session}
            type={fb.type}
          />
        </div>
      )}

      <div className="flex">
        {/* Left accent strip */}
        <div className={`w-1.5 shrink-0 ${ACCENT_STRIP[fb.type] || 'bg-gray-400'}`} />

        <div className="flex-1 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Left — badge + title + message */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.color} mb-1 inline-block`}>
                    {config.label}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{fb.title}</h3>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{fb.message}</p>
            </div>

            {/* Right — stars + meta */}
            <div className="shrink-0 md:text-right">
              <div className="flex items-center md:justify-end gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16}
                    fill={i < (fb.rating || 0) ? 'currentColor' : 'none'}
                    className={i < (fb.rating || 0) ? 'text-amber-400' : 'text-gray-200'} />
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center md:justify-end gap-1.5 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400" />
                  {new Date(fb.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
                <div className="flex items-center md:justify-end gap-1.5 text-xs text-gray-500">
                  <User size={12} className="text-gray-400" />
                  Principal {fb.principal?.name}
                </div>
              </div>
            </div>
          </div>

          {/* ── Share action bar — only for shareable types ── */}
          {config.shareable && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {/* View Certificate */}
              <button
                onClick={() => onViewCertificate(fb)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-gradient-to-r from-emerald-600 to-teal-600 text-white
                  hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md"
              >
                <Award size={13} />
                View Certificate
              </button>

              {/* Quick Download */}
              <button
                onClick={handleQuickDownload}
                disabled={quickState === 'loading'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  border border-gray-200 bg-white text-gray-700
                  hover:bg-gray-50 hover:border-gray-300 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickState === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Download
              </button>

              {/* Quick Share */}
              <button
                onClick={handleQuickShare}
                disabled={quickState === 'loading'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  border border-gray-200 bg-white text-gray-700
                  hover:bg-gray-50 hover:border-gray-300 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 size={13} />
                Share
              </button>

              {/* Quick action status */}
              <ActionToast state={quickState} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TeacherFeedbackPage() {
  const { userProfile }        = useAuth();
  const { activeYear }         = useAcademicYear();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [certModal, setCertModal] = useState(null); // null | feedback object

  const teacherName = userProfile?.name || 'Teacher';
  const session     = activeYear?.name || activeYear?.year || new Date().getFullYear().toString();

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getMyFeedback();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load feedback', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeedbacks(); }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Feedback &amp; Appreciation</h1>
        <p className="text-sm text-gray-500 mt-1">
          View feedback and appreciation received from the Principal
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>

      ) : feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No feedback received yet</h3>
          <p className="text-gray-500 mt-1">When the Principal sends you feedback, it will appear here.</p>
        </div>

      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <FeedbackCard
              key={fb.id}
              fb={fb}
              teacherName={teacherName}
              session={session}
              onViewCertificate={setCertModal}
            />
          ))}
        </div>
      )}

      {/* Certificate Preview Modal — lazy loaded */}
      {certModal && (
        <Suspense fallback={null}>
          <CertificatePreviewModal
            open={!!certModal}
            onClose={() => setCertModal(null)}
            teacherName={teacherName}
            feedbackTitle={certModal.title}
            feedbackMessage={certModal.message}
            rating={certModal.rating}
            principalName={certModal.principal?.name}
            createdAt={certModal.createdAt}
            session={session}
            type={certModal.type}
          />
        </Suspense>
      )}
    </div>
  );
}

