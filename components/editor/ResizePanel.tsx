'use client';

/* ─── Resize Panel ─── */

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Link2Off, Check } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { formatFileSize } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ResizePanel() {
  const { state, dispatch, pushHistoryState } = useEditorActions();
  const imgW = state.image?.width || 1;
  const imgH = state.image?.height || 1;

  const [width, setWidth] = useState(imgW);
  const [height, setHeight] = useState(imgH);
  const [lockAspect, setLockAspect] = useState(true);
  const [unit, setUnit] = useState<'px' | '%'>('px');

  const aspectRatio = imgW / imgH;

  useEffect(() => {
    setWidth(imgW);
    setHeight(imgH);
  }, [imgW, imgH]);

  const handleWidthChange = useCallback(
    (val: number) => {
      setWidth(val);
      if (lockAspect) {
        const actualW = unit === '%' ? (imgW * val) / 100 : val;
        const newH = Math.round(actualW / aspectRatio);
        setHeight(unit === '%' ? Math.round((newH / imgH) * 100) : newH);
      }
    },
    [lockAspect, aspectRatio, unit, imgW, imgH]
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      setHeight(val);
      if (lockAspect) {
        const actualH = unit === '%' ? (imgH * val) / 100 : val;
        const newW = Math.round(actualH * aspectRatio);
        setWidth(unit === '%' ? Math.round((newW / imgW) * 100) : newW);
      }
    },
    [lockAspect, aspectRatio, unit, imgW, imgH]
  );

  const applyResize = useCallback(() => {
    if (!state.image) return;

    const targetW = unit === '%' ? Math.round((imgW * width) / 100) : width;
    const targetH = unit === '%' ? Math.round((imgH * height) / 100) : height;

    if (targetW < 1 || targetH < 1 || targetW > 10000 || targetH > 10000) {
      toast.error('Dimensions must be between 1 and 10000 px');
      return;
    }

    // Use canvas for high-quality resize
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = imgW;
    srcCanvas.height = imgH;
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) return;
    srcCtx.putImageData(state.image.data, 0, 0);

    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = targetW;
    dstCanvas.height = targetH;
    const dstCtx = dstCanvas.getContext('2d');
    if (!dstCtx) return;

    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = 'high';
    dstCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);

    const resizedData = dstCtx.getImageData(0, 0, targetW, targetH);

    dispatch({
      type: 'RESIZE_IMAGE',
      payload: { imageData: resizedData, width: targetW, height: targetH },
    });
    pushHistoryState(`Resize to ${targetW}×${targetH}`);
    toast.success(`Resized to ${targetW} × ${targetH}`);
  }, [state.image, width, height, unit, imgW, imgH, dispatch, pushHistoryState]);

  const scaleFactor = unit === '%'
    ? width / 100
    : width / imgW;
  const estimatedPixels = Math.round(imgW * scaleFactor) * Math.round(imgH * scaleFactor);

  return (
    <div className="p-4 flex flex-col gap-5">
      <h3
        className="text-sm font-semibold"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
      >
        Resize
      </h3>

      {/* Current dimensions */}
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        Current: {imgW} × {imgH} px · {formatFileSize(state.image?.size || 0)}
      </div>

      {/* Unit toggle */}
      <div className="flex gap-1">
        {(['px', '%'] as const).map((u) => (
          <motion.button
            key={u}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUnit(u);
              if (u === '%') {
                setWidth(100);
                setHeight(100);
              } else {
                setWidth(imgW);
                setHeight(imgH);
              }
            }}
            className="flex-1 py-1.5 rounded-md text-xs font-medium cursor-pointer"
            style={{
              background: unit === u ? 'var(--accent)' : 'var(--surface-3)',
              color: unit === u ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: 'none',
            }}
          >
            {u}
          </motion.button>
        ))}
      </div>

      {/* Dimension inputs */}
      <div className="flex items-end gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Width
          </label>
          <input
            type="number"
            min={1}
            max={unit === '%' ? 1000 : 10000}
            value={width}
            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
            className="w-full px-2.5 py-2 rounded-md text-sm font-mono tabular-nums"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Lock aspect */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLockAspect(!lockAspect)}
          className="w-9 h-9 flex items-center justify-center rounded-lg mb-0.5 cursor-pointer"
          style={{
            background: lockAspect ? 'var(--accent-muted)' : 'var(--surface-3)',
            border: `1px solid ${lockAspect ? 'var(--accent)' : 'var(--border)'}`,
            color: lockAspect ? 'var(--accent)' : 'var(--text-tertiary)',
          }}
          title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
        >
          {lockAspect ? <Link2 size={14} /> : <Link2Off size={14} />}
        </motion.button>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Height
          </label>
          <input
            type="number"
            min={1}
            max={unit === '%' ? 1000 : 10000}
            value={height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
            className="w-full px-2.5 py-2 rounded-md text-sm font-mono tabular-nums"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Quick presets */}
      <div>
        <span
          className="text-xs font-medium uppercase tracking-wider mb-2 block"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Quick Resize
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '50%', w: Math.round(imgW * 0.5), h: Math.round(imgH * 0.5) },
            { label: '75%', w: Math.round(imgW * 0.75), h: Math.round(imgH * 0.75) },
            { label: '150%', w: Math.round(imgW * 1.5), h: Math.round(imgH * 1.5) },
            { label: '200%', w: imgW * 2, h: imgH * 2 },
            { label: '1080p', w: 1920, h: 1080 },
            { label: '720p', w: 1280, h: 720 },
          ].map((preset) => (
            <motion.button
              key={preset.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setUnit('px');
                setWidth(preset.w);
                setHeight(lockAspect ? Math.round(preset.w / aspectRatio) : preset.h);
              }}
              className="px-2.5 py-1 rounded-md text-xs cursor-pointer"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div
        className="text-xs rounded-lg px-3 py-2"
        style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}
      >
        Output: {Math.round(unit === '%' ? imgW * width / 100 : width)} × {Math.round(unit === '%' ? imgH * height / 100 : height)} px
        · ~{(estimatedPixels / 1_000_000).toFixed(1)} MP
      </div>

      {/* Apply */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={applyResize}
        className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: 'var(--accent)',
          color: 'var(--text-inverse)',
          border: 'none',
        }}
      >
        <Check size={16} />
        Apply Resize
      </motion.button>
    </div>
  );
}
