import React, { forwardRef } from 'react';
import logo from '@/assets/logo.png';

/**
 * FeedbackCertificateCard
 *
 * A fully self-contained, print-quality appreciation certificate.
 * Rendered into a hidden DOM node, captured by html2canvas.
 */
const FeedbackCertificateCard = forwardRef(function FeedbackCertificateCard(
  {
    teacherName = 'Teacher Name',
    feedbackTitle = 'Outstanding Performance',
    feedbackMessage = '',
    rating = 5,
    principalName = 'Principal',
    createdAt,
    session = '2024-25',
    type = 'appreciation',
  },
  ref
) {
  const isAppreciation = type === 'appreciation';

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Colors - Premium Navy & Gold
  const colors = {
    navy: '#0B1F5C',
    gold: '#D4A437',
    text: '#1e293b',
    lightText: '#64748b',
    white: '#ffffff',
    offWhite: '#fcfcfc'
  };

  const styles = {
    card: {
      position: 'relative',
      width: '842px', // A4 Landscape ratio
      minHeight: '595px',
      background: colors.offWhite,
      fontFamily: "'Times New Roman', Times, serif",
      color: colors.text,
      padding: '0',
      overflow: 'visible', // Prevent clipping
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.gold}`, // Thin gold outer border
    },
    // Elegant double border
    innerBorder1: {
      position: 'absolute',
      inset: '12px',
      border: `2px solid ${colors.navy}`,
      pointerEvents: 'none',
      zIndex: 1,
    },
    innerBorder2: {
      position: 'absolute',
      inset: '16px',
      border: `1px solid ${colors.gold}`,
      pointerEvents: 'none',
      zIndex: 1,
    },
    // Subtle, non-overlapping corner ornaments
    cornerTL: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100px',
      height: '100px',
      background: `linear-gradient(135deg, ${colors.navy} 50%, transparent 50%)`,
      zIndex: 0,
    },
    cornerBR: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      width: '100px',
      height: '100px',
      background: `linear-gradient(-45deg, ${colors.navy} 50%, transparent 50%)`,
      zIndex: 0,
    },
    cornerGoldTL: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '110px',
      height: '110px',
      borderTop: `6px solid ${colors.gold}`,
      borderLeft: `6px solid ${colors.gold}`,
      zIndex: 1,
    },
    cornerGoldBR: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      width: '110px',
      height: '110px',
      borderBottom: `6px solid ${colors.gold}`,
      borderRight: `6px solid ${colors.gold}`,
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      padding: '40px 60px 60px 60px', // Safe padding to prevent overlap
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
    header: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px',
      paddingLeft: '60px', // Extra padding to clear the top-left corner
      paddingRight: '20px',
      boxSizing: 'border-box',
    },
    schoolInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      background: 'rgba(255,255,255,0.8)', // slight protection behind text
      padding: '5px 10px',
      borderRadius: '8px',
    },
    logoBox: {
      width: '65px',
      height: '65px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    schoolName: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: colors.navy,
      letterSpacing: '1px',
      fontFamily: "Arial, sans-serif",
    },
    schoolSession: {
      fontSize: '13px',
      color: colors.lightText,
      marginTop: '2px',
      fontFamily: "Arial, sans-serif",
    },
    badge: {
      background: colors.navy,
      color: colors.gold,
      padding: '8px 20px',
      borderRadius: '50px',
      fontSize: '11px',
      fontWeight: 'bold',
      border: `1.5px solid ${colors.gold}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      fontFamily: "Arial, sans-serif",
      letterSpacing: '1px',
    },
    mainTitleSection: {
      textAlign: 'center',
      marginTop: '10px',
      marginBottom: '10px',
    },
    certOf: {
      fontSize: '18px',
      letterSpacing: '6px',
      color: colors.navy,
      marginBottom: '5px',
    },
    appreciationTitle: {
      fontSize: '52px',
      fontWeight: '900',
      color: colors.navy,
      letterSpacing: '3px',
      margin: '0',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    },
    laurel: {
      fontSize: '35px',
      color: colors.gold,
    },
    goldLine: {
      width: '250px',
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
      margin: '15px auto 5px',
    },
    recipientText: {
      fontSize: '18px',
      fontStyle: 'italic',
      color: colors.lightText,
      marginBottom: '5px',
    },
    name: {
      fontSize: '44px',
      fontWeight: 'bold',
      color: colors.navy,
      margin: '0 0 15px',
      fontFamily: "Georgia, serif",
      borderBottom: `1px solid ${colors.gold}`,
      paddingBottom: '5px',
      minWidth: '350px',
      textAlign: 'center',
    },
    feedbackRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '10px',
    },
    feedbackTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: colors.navy,
      fontFamily: "Arial, sans-serif",
    },
    stars: {
      display: 'flex',
      gap: '4px',
      color: colors.gold,
      fontSize: '20px',
    },
    quote: {
      fontSize: '16px',
      fontStyle: 'italic',
      color: colors.lightText,
      maxWidth: '600px',
      textAlign: 'center',
      lineHeight: '1.6',
      marginBottom: '10px',
      flex: 1, // pushes footer down
    },
    footer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: '0 30px',
      boxSizing: 'border-box',
      marginTop: 'auto',
    },
    signatureSection: {
      textAlign: 'center',
      minWidth: '200px',
      paddingBottom: '5px',
    },
    signatureFont: {
      fontFamily: "'Dancing Script', cursive",
      fontSize: '28px',
      color: colors.navy,
      marginBottom: '2px',
      lineHeight: '1',
    },
    sigLine: {
      width: '100%',
      height: '1.5px',
      background: colors.navy,
      marginBottom: '5px',
    },
    sigLabel: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: colors.navy,
      letterSpacing: '1px',
      fontFamily: "Arial, sans-serif",
    },
    seal: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      border: `3px solid ${colors.gold}`,
      background: colors.navy,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative',
      marginBottom: '5px',
    },
    sealInner: {
      position: 'absolute',
      width: '82%',
      height: '82%',
      border: `1px dashed ${colors.gold}`,
      borderRadius: '50%'
    },
    sealStar: {
      color: colors.gold,
      zIndex: 2,
    },
    metaSection: {
      textAlign: 'right',
      minWidth: '200px',
      paddingBottom: '5px',
    },
    metaItem: {
      marginBottom: '4px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      fontFamily: "Arial, sans-serif",
      fontSize: '13px',
      color: colors.lightText,
    },
    metaLabel: {
      fontWeight: 'bold',
      color: colors.navy,
    },
  };

  return (
    <div ref={ref} style={styles.card}>
      {/* Borders */}
      <div style={styles.innerBorder1} />
      <div style={styles.innerBorder2} />
      
      {/* Decorative Corners */}
      <div style={styles.cornerTL} />
      <div style={styles.cornerGoldTL} />
      <div style={styles.cornerBR} />
      <div style={styles.cornerGoldBR} />

      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.schoolInfo}>
            <div style={styles.logoBox}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={styles.schoolName}>JAVIYA SCHOOLING SYSTEM</div>
              <div style={styles.schoolSession}>Academic Session {session}</div>
            </div>
          </div>
          <div style={styles.badge}>
            <span>⭐</span>
            <span>APPRECIATION CERTIFICATE</span>
          </div>
        </header>

        {/* Center Title */}
        <div style={styles.mainTitleSection}>
          <div style={styles.certOf}>CERTIFICATE OF</div>
          <h1 style={styles.appreciationTitle}>
            <span style={styles.laurel}>🌿</span>
            APPRECIATION
            <span style={{ ...styles.laurel, transform: 'scaleX(-1)' }}>🌿</span>
          </h1>
          <div style={styles.goldLine} />
        </div>

        {/* Recipient */}
        <div style={styles.recipientText}>This is to proudly recognize</div>
        <div style={styles.name}>{teacherName}</div>

        {/* Appreciation Details */}
        <div style={styles.feedbackRow}>
          <div style={styles.feedbackTitle}>🏆 {feedbackTitle}</div>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s}>{s <= rating ? '★' : '☆'}</span>
            ))}
          </div>
        </div>

        {/* Message */}
        {feedbackMessage && (
          <div style={styles.quote}>
            "{feedbackMessage}"
          </div>
        )}

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.signatureSection}>
            <div style={styles.signatureFont}>{principalName.toLowerCase()}</div>
            <div style={styles.sigLine} />
            <div style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: "Arial, sans-serif", color: colors.text }}>
              {principalName}
            </div>
            <div style={styles.sigLabel}>PRINCIPAL</div>
          </div>

          <div style={styles.seal}>
            <div style={styles.sealInner} />
            <div style={styles.sealStar}>★</div>
          </div>

          <div style={styles.metaSection}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Date:</span>
              <span>{dateStr}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Session:</span>
              <span>{session}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Font Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
      `}</style>
    </div>
  );
});

export default FeedbackCertificateCard;
