import html2canvas from 'html2canvas';

/**
 * Renders a DOM element to a PNG blob using html2canvas.
 * @param {HTMLElement} element - The element to capture.
 * @returns {Promise<Blob>} - The PNG blob.
 */
export async function generateCertificateImage(element) {
  const canvas = await html2canvas(element, {
    scale: 2,          // High-DPI / retina quality
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image generation failed'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Triggers a browser download of the generated certificate image.
 * @param {HTMLElement} element - Certificate DOM element.
 * @param {string} teacherName - Used for the filename.
 */
export async function downloadCertificate(element, teacherName = 'teacher') {
  const blob = await generateCertificateImage(element);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = teacherName.toLowerCase().replace(/\s+/g, '-');
  a.href = url;
  a.download = `teacher-appreciation-${slug}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares the certificate using the Web Share API (mobile native sheet).
 * Falls back to triggering a download if the API is not supported.
 * @param {HTMLElement} element - Certificate DOM element.
 * @param {string} teacherName - Teacher's name.
 * @param {string} title - Appreciation title.
 * @returns {{ shared: boolean, fallback: boolean }}
 */
export async function shareCertificate(element, teacherName = 'Teacher', title = 'Appreciation') {
  const blob = await generateCertificateImage(element);

  const shareText = `🎉 I received appreciation from my school principal!\n"${title}"\n\n#TeacherAppreciation #Education`;

  // Web Share API level-2 supports files
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `teacher-appreciation-${teacherName}.png`, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Teacher Appreciation – ${teacherName}`,
        text: shareText,
        files: [file],
      });
      return { shared: true, fallback: false };
    }
  }

  // Level-1 Web Share (no file, just text/url) – mobile browsers
  if (navigator.share) {
    await navigator.share({
      title: `Teacher Appreciation – ${teacherName}`,
      text: shareText,
    });
    return { shared: true, fallback: false };
  }

  // Fallback: trigger download
  await downloadCertificate(element, teacherName);
  return { shared: false, fallback: true };
}

/**
 * Returns a WhatsApp share URL with pre-filled text.
 */
export function getWhatsAppShareUrl(teacherName = 'Teacher', title = 'Appreciation') {
  const text = encodeURIComponent(
    `🎉 I received the "${title}" appreciation from my school principal!\n#TeacherAppreciation #Education`
  );
  return `https://wa.me/?text=${text}`;
}

/**
 * Returns a LinkedIn share URL with pre-filled text.
 */
export function getLinkedInShareUrl(teacherName = 'Teacher', title = 'Appreciation') {
  const summary = encodeURIComponent(
    `Proud to have received the "${title}" recognition from my school principal! 🎉 #TeacherAppreciation #Education #ProudTeacher`
  );
  return `https://www.linkedin.com/sharing/share-offsite/?summary=${summary}`;
}
