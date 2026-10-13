export function generateIcsFile(weddingData: any) {
  const startDate = new Date(weddingData.weddingDate);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//EN
BEGIN:VEVENT
UID:${startDate.getTime()}@wedding.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Wedding of ${weddingData.groom.name} & ${weddingData.bride.name}
LOCATION:${weddingData.venue.name}, ${weddingData.venue.addressLine1}
DESCRIPTION:Join us to celebrate the wedding of ${weddingData.groom.name} & ${weddingData.bride.name}.
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "wedding-invitation.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Optimizes an uploaded image file using an offscreen canvas to prevent
 * excessive Firestore document payload sizes, converting to clean JPEG/WebP base64.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
