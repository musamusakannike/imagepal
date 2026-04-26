'use client';

/* ─── Crop Panel ─── */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FlipHorizontal2, FlipVertical2, RotateCcw, Check, X } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { cloneImageData } from '@/lib/utils';
import toast from 'react-hot-toast';

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '5:4', value: 5 / 4 },
  { label: '2:3', value: 2 / 3 },
];

export function CropPanel() {
  const { state, dispatch, pushHistoryState } = useEditorActions();
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(state.image?.width || 100);
  const [cropH, setCropH] = useState(state.image?.height || 100);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const imgW = state.image?.width || 1;
  const imgH = state.image?.height || 1;

  const handleAspectRatio = useCallback(
    (ratio: number | null) => {
      setAspectRatio(ratio);
      if (ratio !== null) {
        const newW = Math.min(imgW, imgH * ratio);
        const newH = newW / ratio;
        setCropW(Math.round(newW));
        setCropH(Math.round(newH));
        setCropX(Math.round((imgW - newW) / 2));
        setCropY(Math.round((imgH - newH) / 2));
      }
    },
    [imgW, imgH]
  );

  const handleFlipH = useCallback(() => {
    if (!state.image) return;
    const src = state.image.data;
    const result = cloneImageData(src);
    const { width, height } = src;
    const d = result.data;
    const s = src.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + (width - 1 - x)) * 4;
        d[dstIdx] = s[srcIdx];
        d[dstIdx + 1] = s[srcIdx + 1];
        d[dstIdx + 2] = s[srcIdx + 2];
        d[dstIdx + 3] = s[srcIdx + 3];
      }
    }

    dispatch({ type: 'APPLY_CROP', payload: result });
    pushHistoryState('Flip Horizontal');
    toast.success('Flipped horizontally');
  }, [state.image, dispatch, pushHistoryState]);

  const handleFlipV = useCallback(() => {
    if (!state.image) return;
    const src = state.image.data;
    const result = cloneImageData(src);
    const { width, height } = src;
    const d = result.data;
    const s = src.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = ((height - 1 - y) * width + x) * 4;
        d[dstIdx] = s[srcIdx];
        d[dstIdx + 1] = s[srcIdx + 1];
        d[dstIdx + 2] = s[srcIdx + 2];
        d[dstIdx + 3] = s[srcIdx + 3];
      }
    }

    dispatch({ type: 'APPLY_CROP', payload: result });
    pushHistoryState('Flip Vertical');
    toast.success('Flipped vertically');
  }, [state.image, dispatch, pushHistoryState]);

  const handleRotate90 = useCallback(() => {
    if (!state.image) return;
    const src = state.image.data;
    const { width, height } = src;
    const result = new ImageData(height, width);
    const d = result.data;
    const s = src.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (x * height + (height - 1 - y)) * 4;
        d[dstIdx] = s[srcIdx];
        d[dstIdx + 1] = s[srcIdx + 1];
        d[dstIdx + 2] = s[srcIdx + 2];
        d[dstIdx + 3] = s[srcIdx + 3];
      }
    }

    dispatch({ type: 'APPLY_CROP', payload: result });
    setCropW(result.width);
    setCropH(result.height);
    setCropX(0);
    setCropY(0);
    pushHistoryState('Rotate 90°');
    toast.success('Rotated 90°');
  }, [state.image, dispatch, pushHistoryState]);

  const applyCrop = useCallback(() => {
    if (!state.image) return;
    const src = state.image.data;
    const cw = Math.min(cropW, imgW - cropX);
    const ch = Math.min(cropH, imgH - cropY);
    const result = new ImageData(cw, ch);
    const d = result.data;
    const s = src.data;

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const srcIdx = ((cropY + y) * imgW + (cropX + x)) * 4;
        const dstIdx = (y * cw + x) * 4;
        d[dstIdx] = s[srcIdx];
        d[dstIdx + 1] = s[srcIdx + 1];
        d[dstIdx + 2] = s[srcIdx + 2];
        d[dstIdx + 3] = s[srcIdx + 3];
      }
    }

    dispatch({ type: 'APPLY_CROP', payload: result });
    setCropW(cw);
    setCropH(ch);
    setCropX(0);
    setCropY(0);
    pushHistoryState('Crop');
    toast.success(`Cropped to ${cw} × ${ch}`);
  }, [state.image, cropX, cropY, cropW, cropH, imgW, imgH, dispatch, pushHistoryState]);

  return (
    <div className="p-4 flex flex-col gap-5">
      <h3
        className="text-sm font-semibold"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
      >
        Crop & Transform
      </h3>

      {/* Aspect ratio pills */}
      <div>
        <span
          className="text-xs font-medium uppercase tracking-wider mb-2 block"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Aspect Ratio
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_RATIOS.map((ar) => (
            <motion.button
              key={ar.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAspectRatio(ar.value)}
              className="px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
              style={{
                background:
                  aspectRatio === ar.value
                    ? 'var(--accent)'
                    : 'var(--surface-3)',
                color:
                  aspectRatio === ar.value
                    ? 'var(--text-inverse)'
                    : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              {ar.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Crop dimensions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'X', value: cropX, setter: setCropX, max: imgW },
          { label: 'Y', value: cropY, setter: setCropY, max: imgH },
          { label: 'W', value: cropW, setter: setCropW, max: imgW },
          { label: 'H', value: cropH, setter: setCropH, max: imgH },
        ].map((field) => (
          <div key={field.label} className="flex flex-col gap-1">
            <label
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {field.label}
            </label>
            <input
              type="number"
              min={0}
              max={field.max}
              value={field.value}
              onChange={(e) => field.setter(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono tabular-nums"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Transform buttons */}
      <div>
        <span
          className="text-xs font-medium uppercase tracking-wider mb-2 block"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Transform
        </span>
        <div className="flex gap-2">
          <TransformButton icon={<FlipHorizontal2 size={16} />} label="Flip H" onClick={handleFlipH} />
          <TransformButton icon={<FlipVertical2 size={16} />} label="Flip V" onClick={handleFlipV} />
          <TransformButton icon={<RotateCcw size={16} />} label="Rotate" onClick={handleRotate90} />
        </div>
      </div>

      {/* Apply button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={applyCrop}
        className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: 'var(--accent)',
          color: 'var(--text-inverse)',
          border: 'none',
        }}
      >
        <Check size={16} />
        Apply Crop
      </motion.button>
    </div>
  );
}

function TransformButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg cursor-pointer"
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </motion.button>
  );
}
