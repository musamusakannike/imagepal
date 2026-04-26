/* ─── Image Adjustment Algorithms ─── */
/* All operations work directly on pixel data for offline/local processing */

import { cloneImageData } from '@/lib/utils';
import type { Adjustments } from '@/lib/types';

/** Apply all adjustments to image data */
export function applyAdjustments(
  source: ImageData,
  adj: Adjustments
): ImageData {
  const result = cloneImageData(source);
  const d = result.data;
  const len = d.length;

  for (let i = 0; i < len; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    // Exposure
    if (adj.exposure !== 0) {
      const factor = Math.pow(2, adj.exposure / 50);
      r *= factor;
      g *= factor;
      b *= factor;
    }

    // Brightness
    if (adj.brightness !== 0) {
      const amount = adj.brightness * 2.55;
      r += amount;
      g += amount;
      b += amount;
    }

    // Contrast
    if (adj.contrast !== 0) {
      const factor = (259 * (adj.contrast + 255)) / (255 * (259 - adj.contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }

    // Temperature (shift blue-orange axis)
    if (adj.temperature !== 0) {
      const t = adj.temperature * 1.5;
      r += t;
      b -= t;
    }

    // Highlights & Shadows
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (adj.highlights !== 0 && luminance > 128) {
      const highlightFactor = ((luminance - 128) / 127) * (adj.highlights / 100);
      r += r * highlightFactor * 0.5;
      g += g * highlightFactor * 0.5;
      b += b * highlightFactor * 0.5;
    }
    if (adj.shadows !== 0 && luminance < 128) {
      const shadowFactor = ((128 - luminance) / 128) * (adj.shadows / 100);
      r += (255 - r) * shadowFactor * 0.5;
      g += (255 - g) * shadowFactor * 0.5;
      b += (255 - b) * shadowFactor * 0.5;
    }

    // Saturation
    if (adj.saturation !== 0) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const s = 1 + adj.saturation / 100;
      r = gray + s * (r - gray);
      g = gray + s * (g - gray);
      b = gray + s * (b - gray);
    }

    // Vibrance (smart saturation — boosts less saturated colors more)
    if (adj.vibrance !== 0) {
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;
      const amt = ((max - avg) / 255) * (-adj.vibrance / 50);
      r += (max - r) * amt;
      g += (max - g) * amt;
      b += (max - b) * amt;
    }

    // Hue rotation
    if (adj.hue !== 0) {
      const [h, s, l] = rgbToHsl(r, g, b);
      const newH = ((h + adj.hue / 360) % 1 + 1) % 1;
      const [nr, ng, nb] = hslToRgb(newH, s, l);
      r = nr;
      g = ng;
      b = nb;
    }

    // Gamma
    if (adj.gamma !== 1) {
      const invGamma = 1 / adj.gamma;
      r = 255 * Math.pow(r / 255, invGamma);
      g = 255 * Math.pow(g / 255, invGamma);
      b = 255 * Math.pow(b / 255, invGamma);
    }

    // Clamp final values
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Post-processing effects
  if (adj.blur > 0) {
    applyBoxBlur(result, Math.ceil(adj.blur / 10));
  }

  if (adj.sharpness > 0) {
    applySharpness(result, adj.sharpness / 100);
  }

  if (adj.noise > 0) {
    applyNoise(result, adj.noise / 100);
  }

  if (adj.vignette > 0) {
    applyVignette(result, adj.vignette / 100);
  }

  return result;
}

/* ─── Post-processing ─── */

function applyBoxBlur(data: ImageData, radius: number): void {
  if (radius < 1) return;
  const { width, height } = data;
  const d = data.data;
  const copy = new Uint8ClampedArray(d);
  const size = radius * 2 + 1;
  const div = size * size;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const idx = (py * width + px) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
        }
      }
      const idx = (y * width + x) * 4;
      d[idx] = rSum / div;
      d[idx + 1] = gSum / div;
      d[idx + 2] = bSum / div;
    }
  }
}

function applySharpness(data: ImageData, amount: number): void {
  const { width, height } = data;
  const d = data.data;
  const copy = new Uint8ClampedArray(d);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            val += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        d[idx] = Math.max(0, Math.min(255, copy[idx] + (val - copy[idx]) * amount));
      }
    }
  }
}

function applyNoise(data: ImageData, amount: number): void {
  const d = data.data;
  const intensity = amount * 50;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise));
  }
}

function applyVignette(data: ImageData, amount: number): void {
  const { width, height } = data;
  const d = data.data;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const factor = 1 - dist * dist * amount;
      const idx = (y * width + x) * 4;
      d[idx] *= factor;
      d[idx + 1] *= factor;
      d[idx + 2] *= factor;
    }
  }
}

/* ─── Color space helpers ─── */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1/3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1/3) * 255,
  ];
}
