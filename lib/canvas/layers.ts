/* ─── Layer Compositing Engine ─── */

import type { Layer, BlendMode } from '@/lib/types';
import { cloneImageData } from '@/lib/utils';

/** Blend two pixel values given a blend mode */
function blendPixel(
  base: number,
  overlay: number,
  mode: BlendMode
): number {
  const a = base / 255;
  const b = overlay / 255;
  let result: number;

  switch (mode) {
    case 'multiply':
      result = a * b;
      break;
    case 'screen':
      result = 1 - (1 - a) * (1 - b);
      break;
    case 'overlay':
      result = a < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
      break;
    case 'darken':
      result = Math.min(a, b);
      break;
    case 'lighten':
      result = Math.max(a, b);
      break;
    case 'color-dodge':
      result = b === 1 ? 1 : Math.min(1, a / (1 - b));
      break;
    case 'color-burn':
      result = b === 0 ? 0 : Math.max(0, 1 - (1 - a) / b);
      break;
    case 'hard-light':
      result = b < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
      break;
    case 'soft-light':
      result = b < 0.5
        ? a - (1 - 2 * b) * a * (1 - a)
        : a + (2 * b - 1) * (Math.sqrt(a) - a);
      break;
    case 'difference':
      result = Math.abs(a - b);
      break;
    case 'exclusion':
      result = a + b - 2 * a * b;
      break;
    case 'normal':
    default:
      result = b;
      break;
  }

  return result * 255;
}

/** Composite all visible layers into a single ImageData */
export function compositeLayers(
  layers: Layer[],
  width: number,
  height: number
): ImageData {
  const result = new ImageData(width, height);
  const sortedLayers = [...layers]
    .filter(l => l.visible)
    .sort((a, b) => a.order - b.order);

  if (sortedLayers.length === 0) return result;

  // Start with first layer
  const first = sortedLayers[0];
  const firstData = first.imageData.data;
  const resultData = result.data;

  for (let i = 0; i < resultData.length; i += 4) {
    resultData[i] = firstData[i];
    resultData[i + 1] = firstData[i + 1];
    resultData[i + 2] = firstData[i + 2];
    resultData[i + 3] = firstData[i + 3] * first.opacity;
  }

  // Composite remaining layers
  for (let li = 1; li < sortedLayers.length; li++) {
    const layer = sortedLayers[li];
    const layerData = layer.imageData.data;
    const opacity = layer.opacity;
    const mode = layer.blendMode;

    for (let i = 0; i < resultData.length; i += 4) {
      const layerAlpha = (layerData[i + 3] / 255) * opacity;
      if (layerAlpha === 0) continue;

      for (let c = 0; c < 3; c++) {
        const blended = blendPixel(resultData[i + c], layerData[i + c], mode);
        resultData[i + c] = resultData[i + c] * (1 - layerAlpha) + blended * layerAlpha;
      }
      resultData[i + 3] = Math.min(255, resultData[i + 3] + layerData[i + 3] * opacity);
    }
  }

  return result;
}

/** Create a new layer from ImageData */
export function createLayer(
  imageData: ImageData,
  name: string,
  order: number
): Layer {
  return {
    id: Math.random().toString(36).substring(2, 10),
    name,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    imageData: cloneImageData(imageData),
    locked: false,
    order,
  };
}

/** Create an empty transparent layer */
export function createEmptyLayer(
  width: number,
  height: number,
  name: string,
  order: number
): Layer {
  return {
    id: Math.random().toString(36).substring(2, 10),
    name,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    imageData: new ImageData(width, height),
    locked: false,
    order,
  };
}

/** Flatten all layers into a single ImageData */
export function flattenLayers(layers: Layer[], width: number, height: number): ImageData {
  return compositeLayers(layers, width, height);
}

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
];
