import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, Download, Share2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import FeedbackCertificateCard from './FeedbackCertificateCard';
import {
  downloadCertificate,
  shareCertificate,
  getWhatsAppShareUrl,
  getLinkedInShareUrl,
} from '@/utils/certificateGenerator';

/**
 * CertificatePreviewModal
 *
 * Props:
 *   open         – boolean
 *   onClose      – () => void
 *   teacherName  – string
 *   feedbackTitle – string
 *   feedbackMessage – string
 *   rating       – number
 *   principalName – string
 *   createdAt    – ISO date string
 *   session      – string
 *   type         – 'appreciation' | 'general' | 'suggestion'
 */
export default function CertificatePreviewModal({
  open,
  onClose,
  teacherName,
  feedbackTitle,
  feedbackMessage,
  rating,
  principalName,
  createdAt,
  session,
  type = 'appreciation',
}) {
  const cardRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const withStatus = useCallback(async (action, successMsg, errorMsg) => {
    setStatus('loading');
    setStatusMsg('');
    try {
      await action();
      setStatus('success');
      setStatusMsg(successMsg);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMsg(errorMsg);
      setTimeout(() => setStatus(null), 4000);
    }
  }, []);

  const handleDownload = () =>
    withStatus(
      () => downloadCertificate(cardRef.current, teacherName),
      'Certificate downloaded successfully!',
      'Download failed. Please try again.'
    );

  const handleShare = () =>
    withStatus(
      async () => {
        const result = await shareCertificate(cardRef.current, teacherName, feedbackTitle);
        if (result.fallback) {
          setStatusMsg('Sharing not supported — certificate downloaded instead.');
        }
      },
      'Shared successfully!',
      'Share failed. Try downloading instead.'
    );

  if (!open) return null;

  const isAppreciation = type === 'appreciation';
  const accentColor = isAppreciation ? '#059669' : '#6366f1';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#0f172a',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '900px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '95vh',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isAppreciation
                  ? 'linear-gradient(135deg,#065f46,#059669)'
                  : 'linear-gradient(135deg,#312e81,#6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🏆
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '15px' }}>
                Appreciation Certificate
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                Preview, download or share your achievement
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Certificate Preview */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Visible scaled preview */}
          <div
            style={{
              width: '100%',
              maxWidth: '842px',
              transform: 'scale(1)',
              transformOrigin: 'top center',
            }}
          >
            <FeedbackCertificateCard
              ref={cardRef}
              teacherName={teacherName}
              feedbackTitle={feedbackTitle}
              feedbackMessage={feedbackMessage}
              rating={rating}
              principalName={principalName}
              createdAt={createdAt}
              session={session}
              type={type}
            />
          </div>
        </div>

        {/* Status Toast */}
        {status && (
          <div
            style={{
              margin: '0 24px 4px',
              padding: '10px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: '500',
              background:
                status === 'loading'
                  ? 'rgba(100,116,139,0.15)'
                  : status === 'success'
                  ? 'rgba(5,150,105,0.15)'
                  : 'rgba(239,68,68,0.15)',
              color:
                status === 'loading'
                  ? '#94a3b8'
                  : status === 'success'
                  ? '#34d399'
                  : '#f87171',
              border: `1px solid ${
                status === 'loading'
                  ? 'rgba(100,116,139,0.2)'
                  : status === 'success'
                  ? 'rgba(52,211,153,0.3)'
                  : 'rgba(248,113,113,0.3)'
              }`,
            }}
          >
            {status === 'loading' && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'success' && <CheckCircle size={15} />}
            {status === 'error' && <AlertCircle size={15} />}
            {status === 'loading' ? 'Processing…' : statusMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Primary actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownload}
              disabled={status === 'loading'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: isAppreciation
                  ? 'linear-gradient(135deg,#065f46,#059669)'
                  : 'linear-gradient(135deg,#312e81,#6366f1)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {status === 'loading' ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={16} />
              )}
              Download PNG
            </button>

            <button
              onClick={handleShare}
              disabled={status === 'loading'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#e2e8f0',
                fontWeight: '600',
                fontSize: '14px',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={getWhatsAppShareUrl(teacherName, feedbackTitle)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(37,211,102,0.3)',
                background: 'rgba(37,211,102,0.08)',
                color: '#4ade80',
                fontWeight: '600',
                fontSize: '12.5px',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              {/* WhatsApp SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </a>

            <a
              href={getLinkedInShareUrl(teacherName, feedbackTitle)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(10,102,194,0.4)',
                background: 'rgba(10,102,194,0.08)',
                color: '#60a5fa',
                fontWeight: '600',
                fontSize: '12.5px',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              {/* LinkedIn SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Spin keyframe via style tag */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
