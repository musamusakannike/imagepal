'use client';

/* ─── Filter Panel ─── */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditorActions } from '@/lib/editor-context';
import { FILTER_PRESETS, getFilterCategories, blendFilterAdjustments } from '@/lib/canvas/filters';
import { DEFAULT_ADJUSTMENTS } from '@/lib/types';
import { applyAdjustments } from '@/lib/canvas/adjustments';
import { imageDataToDataURL } from '@/lib/utils';
import toast from 'react-hot-toast';

export function FilterPanel() {
  const { state, setAdjustments, pushHistoryState } = useEditorActions();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(1);
  const categories = useMemo(() => ['All', ...getFilterCategories()], []);

  const filteredPresets = useMemo(
    () =>
      activeCategory === 'All'
        ? FILTER_PRESETS
        : FILTER_PRESETS.filter((f) => f.category === activeCategory),
    [activeCategory]
  );

  const applyFilter = useCallback(
    (filterId: string) => {
      const filter = FILTER_PRESETS.find((f) => f.id === filterId);
      if (!filter) return;

      setActiveFilter(filterId);
      const blended = blendFilterAdjustments(
        DEFAULT_ADJUSTMENTS,
        filter.adjustments,
        intensity
      );
      setAdjustments(blended);
      pushHistoryState(`Filter: ${filter.name}`);
      toast.success(`Applied "${filter.name}"`, { duration: 1500 });
    },
    [intensity, setAdjustments, pushHistoryState]
  );

  const clearFilter = useCallback(() => {
    setActiveFilter(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    pushHistoryState('Clear Filter');
  }, [setAdjustments, pushHistoryState]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          Filters
        </h3>
        {activeFilter && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilter}
            className="text-xs px-2 py-1 rounded-md cursor-pointer"
            style={{
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border)',
              background: 'transparent',
            }}
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
            style={{
              background: activeCategory === cat ? 'var(--accent)' : 'var(--surface-3)',
              color: activeCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Intensity slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Intensity
          </span>
          <span
            className="text-xs font-mono tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {Math.round(intensity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={intensity}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setIntensity(val);
            if (activeFilter) {
              const filter = FILTER_PRESETS.find((f) => f.id === activeFilter);
              if (filter) {
                const blended = blendFilterAdjustments(
                  DEFAULT_ADJUSTMENTS,
                  filter.adjustments,
                  val
                );
                setAdjustments(blended);
              }
            }
          }}
          className="w-full"
        />
      </div>

      {/* Filter grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredPresets.map((filter) => (
          <FilterThumbnail
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            imageData={state.image?.data || null}
            onClick={() => applyFilter(filter.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Filter Thumbnail ─── */

function FilterThumbnail({
  filter,
  isActive,
  imageData,
  onClick,
}: {
  filter: (typeof FILTER_PRESETS)[number];
  isActive: boolean;
  imageData: ImageData | null;
  onClick: () => void;
}) {
  const [thumbUrl, setThumbUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a tiny preview thumbnail
  useEffect(() => {
    if (!imageData) return;

    // Downsample to 64px for fast preview
    const size = 64;
    const canvas = document.createElement('canvas');
    const ratio = imageData.width / imageData.height;
    canvas.width = size;
    canvas.height = Math.round(size / ratio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw source scaled down
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    const smallData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Apply filter adjustments
    const adj = blendFilterAdjustments(DEFAULT_ADJUSTMENTS, filter.adjustments, 1);
    const filtered = applyAdjustments(smallData, adj);

    ctx.putImageData(filtered, 0, 0);
    setThumbUrl(canvas.toDataURL('image/jpeg', 0.6));
  }, [imageData, filter]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 cursor-pointer group"
      style={{ background: 'none', border: 'none' }}
    >
      <div
        className="w-full aspect-square rounded-lg overflow-hidden"
        style={{
          border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={filter.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'var(--surface-3)' }}
          />
        )}
      </div>
      <span
        className="text-[10px] font-medium leading-tight text-center"
        style={{
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        }}
      >
        {filter.name}
      </span>
    </motion.button>
  );
}
