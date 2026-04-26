import removeBackground, { Config } from '@imgly/background-removal';

/**
 * Removes background from an ImageData object
 * @param imageData The image data to process
 * @param onProgress Callback for progress updates
 * @returns Processed ImageData
 */
export async function removeImageBackground(
  imageData: ImageData,
  onProgress?: (step: string) => void
): Promise<ImageData> {
  // Convert ImageData to Blob/URL for @imgly
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.putImageData(imageData, 0, 0);
  
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Blob creation failed')), 'image/png');
  });

  const config: Config = {
    progress: (key, current, total) => {
      if (onProgress) {
        const step = key.split(':').pop() || key;
        const percent = Math.round((current / total) * 100);
        onProgress(`${step} (${percent}%)`);
      }
    },
    publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/', // CDN for WASM assets to avoid local setup complexity for now
  };

  const resultBlob = await removeBackground(blob, config);
  
  // Convert result Blob back to ImageData
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(resultBlob);
    img.onload = () => {
      const outCanvas = document.createElement('canvas');
      outCanvas.width = img.width;
      outCanvas.height = img.height;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        reject(new Error('Could not get output canvas context'));
        return;
      }
      outCtx.drawImage(img, 0, 0);
      const outData = outCtx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      resolve(outData);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load processed image'));
    };
    img.src = url;
  });
}
