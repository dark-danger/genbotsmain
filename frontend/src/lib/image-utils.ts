/**
 * Image processing utilities for client-side compression and Data URL generation.
 * Ensures uploaded images are lightweight, self-contained, and render reliably across all environments.
 */

export async function compressImageFile(
  file: File | Blob,
  maxDimension = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not a raster image (e.g. SVG or generic file), convert directly via FileReader
    const mimeType = file.type || "";
    if (!mimeType.startsWith("image/") || mimeType === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        resolve("");
        return;
      }

      if (typeof window === "undefined" || typeof document === "undefined") {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while bounding within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // Fill background with white for transparency fallback if converting to JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp") && webpData.length > 50) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback to jpeg
        }

        try {
          const jpegData = canvas.toDataURL("image/jpeg", quality);
          resolve(jpegData);
        } catch {
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
