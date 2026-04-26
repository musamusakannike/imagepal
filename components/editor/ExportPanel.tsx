'use client';

/* ─── Export Panel ─── */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileImage, AlertTriangle } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { applyAdjustments } from '@/lib/canvas/adjustments';
import { compositeLayers } from '@/lib/canvas/layers';
import { imageDataToBlob, downloadBlob, formatFileSize } from '@/lib/utils';
import type { ExportFormat } from '@/lib/types';
import toast from 'react-hot-toast';

const FORMATS: { value: ExportFormat; label: string; mime: string; supportsAlpha: boolean }[] = [
  { value: 'png', label: 'PNG', mime: 'image/png', supportsAlpha: true },
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', supportsAlpha: false },
  { value: 'webp', label: 'WebP', mime: 'image/webp', supportsAlpha: true },
  { value: 'avif', label: 'AVIF', mime: 'image/avif', supportsAlpha: true },
  { value: 'bmp', label: 'BMP', mime: 'image/bmp', supportsAlpha: false },
];

export function ExportPanel() {
  const { state } = useEditorActions();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(92);
  const [filename, setFilename] = useState(
    state.image?.name?.replace(/\.[^.]+$/, '') || 'export'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  const selectedFormat = FORMATS.find(f => f.value === format)!;
  const showQuality = format !== 'png' && format !== 'bmp';

  // Estimate file size
  const estimateSize = useCallback(async () => {
    if (!state.image) return;
    try {
      const composited = compositeLayers(state.layers, state.image.width, state.image.height);
      const adjusted = applyAdjustments(composited, state.adjustments);
      const blob = await imageDataToBlob(adjusted, selectedFormat.mime, quality / 100);
      setEstimatedSize(blob.size);
    } catch {
      setEstimatedSize(null);
    }
  }, [state.image, state.layers, state.adjustments, selectedFormat.mime, quality]);

  const handleExport = useCallback(async () => {
    if (!state.image) return;
    setIsExporting(true);

    try {
      const composited = compositeLayers(state.layers, state.image.width, state.image.height);
      const adjusted = applyAdjustments(composited, state.adjustments);
      const blob = await imageDataToBlob(adjusted, selectedFormat.mime, quality / 100);
      const ext = format;
      const fullFilename = `${filename}.${ext}`;
      downloadBlob(blob, fullFilename);
      toast.success(`Saved "${fullFilename}" (${formatFileSize(blob.size)})`);
    } catch (err) {
      toast.error('Export failed. Try a different format.');
    } finally {
      setIsExporting(false);
    }
  }, [state.image, state.layers, state.adjustments, format, quality, filename, selectedFormat.mime]);

  return (
    <div className="p-4 flex flex-col gap-5">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        Export
      </h3>

      {/* Filename */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Filename</label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
          placeholder="export"
        />
      </div>

      {/* Format grid */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Format</label>
        <div className="grid grid-cols-5 gap-1.5">
          {FORMATS.map((f) => (
            <motion.button
              key={f.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setFormat(f.value); setEstimatedSize(null); }}
              className="py-2 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                background: format === f.value ? 'var(--accent)' : 'var(--surface-3)',
                color: format === f.value ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: format === f.value ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transparency warning */}
      {!selectedFormat.supportsAlpha && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: '#e8a84915', border: '1px solid #e8a84930', color: 'var(--warning)' }}>
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{selectedFormat.label} does not support transparency. Alpha will be flattened to white.</span>
        </div>
      )}

      {/* Quality slider */}
      {showQuality && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Quality</span>
            <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{quality}%</span>
          </div>
          <input type="range" min={1} max={100} step={1} value={quality}
            onChange={(e) => { setQuality(parseInt(e.target.value)); setEstimatedSize(null); }}
            className="w-full" />
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>Smaller file</span><span>Higher quality</span>
          </div>
        </div>
      )}

      {/* Estimate button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={estimateSize}
        className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        <FileImage size={13} />
        {estimatedSize !== null ? `~${formatFileSize(estimatedSize)}` : 'Estimate Size'}
      </motion.button>

      {/* Info */}
      <div className="text-xs rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}>
        {state.image?.width} × {state.image?.height} px · {selectedFormat.label.toUpperCase()}
        {showQuality && ` · ${quality}%`}
      </div>

      {/* Export button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--accent)', color: 'var(--text-inverse)', border: 'none' }}
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--text-inverse)', borderTopColor: 'transparent' }} />
            Exporting...
          </>
        ) : (
          <>
            <Download size={16} />
            Download {selectedFormat.label.toUpperCase()}
          </>
        )}
      </motion.button>
    </div>
  );
}
