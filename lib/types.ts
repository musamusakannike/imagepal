/* ─── ImagePal Core Types ─── */

export interface ImageFile {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  size: number;
  data: ImageData;
  originalData: ImageData;
  thumbnail?: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  imageData: ImageData;
  locked: boolean;
  order: number;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface Adjustments {
  brightness: number;    // -100 to 100
  contrast: number;      // -100 to 100
  saturation: number;    // -100 to 100
  temperature: number;   // -100 to 100
  exposure: number;      // -100 to 100
  highlights: number;    // -100 to 100
  shadows: number;       // -100 to 100
  vibrance: number;      // -100 to 100
  sharpness: number;     // 0 to 100
  blur: number;          // 0 to 100
  noise: number;         // 0 to 100
  hue: number;           // -180 to 180
  gamma: number;         // 0.1 to 3
  vignette: number;      // 0 to 100
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  vibrance: 0,
  sharpness: 0,
  blur: 0,
  noise: 0,
  hue: 0,
  gamma: 1,
  vignette: 0,
};

export interface FilterPreset {
  id: string;
  name: string;
  category: string;
  adjustments: Partial<Adjustments>;
  intensity: number;
}

export interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number | null;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  unit: 'px' | '%';
  resampleMethod: 'nearest' | 'bilinear' | 'bicubic';
}

export interface ExportOptions {
  format: ExportFormat;
  quality: number;        // 0 to 100
  filename: string;
}

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp';

export type EditorTool =
  | 'select'
  | 'crop'
  | 'filters'
  | 'adjust'
  | 'resize'
  | 'layers'
  | 'export';

export interface HistoryEntry {
  id: string;
  label: string;
  timestamp: number;
  imageData: ImageData;
  adjustments: Adjustments;
  layers: Layer[];
}

export interface EditorState {
  image: ImageFile | null;
  layers: Layer[];
  activeLayerId: string | null;
  activeTool: EditorTool;
  adjustments: Adjustments;
  cropState: CropState | null;
  zoom: number;
  panX: number;
  panY: number;
  history: HistoryEntry[];
  historyIndex: number;
  isProcessing: boolean;
}
