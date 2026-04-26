'use client';

/* ─── Adjustment Panel ─── */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { DEFAULT_ADJUSTMENTS } from '@/lib/types';
import type { Adjustments } from '@/lib/types';
import toast from 'react-hot-toast';

interface SliderConfig {
  key: keyof Adjustments;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  group: string;
}

const SLIDERS: SliderConfig[] = [
  // Light
  { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1, group: 'Light' },
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, group: 'Light' },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, group: 'Light' },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1, group: 'Light' },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1, group: 'Light' },
  { key: 'gamma', label: 'Gamma', min: 0.1, max: 3, step: 0.05, group: 'Light' },

  // Color
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, group: 'Color' },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1, group: 'Color' },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1, group: 'Color' },
  { key: 'hue', label: 'Hue', min: -180, max: 180, step: 1, unit: '°', group: 'Color' },

  // Detail
  { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1, group: 'Detail' },
  { key: 'blur', label: 'Blur', min: 0, max: 100, step: 1, group: 'Detail' },
  { key: 'noise', label: 'Noise', min: 0, max: 100, step: 1, group: 'Detail' },

  // Effects
  { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1, group: 'Effects' },
];

export function AdjustmentPanel() {
  const { state, setAdjustments, pushHistoryState } = useEditorActions();

  const handleChange = useCallback(
    (key: keyof Adjustments, value: number) => {
      setAdjustments({ ...state.adjustments, [key]: value });
    },
    [state.adjustments, setAdjustments]
  );

  const handleChangeEnd = useCallback(() => {
    pushHistoryState('Adjust');
  }, [pushHistoryState]);

  const resetAll = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    pushHistoryState('Reset Adjustments');
    toast.success('Adjustments reset');
  }, [setAdjustments, pushHistoryState]);

  const groups = [...new Set(SLIDERS.map(s => s.group))];

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          Adjustments
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetAll}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md cursor-pointer"
          style={{
            color: 'var(--text-tertiary)',
            background: 'transparent',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <RotateCcw size={12} />
          Reset
        </motion.button>
      </div>

      {/* Slider groups */}
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {group}
          </span>

          {SLIDERS.filter(s => s.group === group).map((slider) => {
            const value = state.adjustments[slider.key];
            const defaultVal = DEFAULT_ADJUSTMENTS[slider.key];
            const isModified = Math.abs(value - defaultVal) > 0.01;

            return (
              <div key={slider.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs"
                    style={{ color: isModified ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {slider.label}
                  </label>
                  <span
                    className="text-xs font-mono tabular-nums w-12 text-right"
                    style={{ color: isModified ? 'var(--accent)' : 'var(--text-tertiary)' }}
                  >
                    {slider.key === 'gamma'
                      ? value.toFixed(2)
                      : Math.round(value)}
                    {slider.unit || ''}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={value}
                    onChange={(e) => handleChange(slider.key, parseFloat(e.target.value))}
                    onMouseUp={handleChangeEnd}
                    onTouchEnd={handleChangeEnd}
                    className="w-full"
                    style={
                      {
                        '--slider-fill': isModified
                          ? `${((value - slider.min) / (slider.max - slider.min)) * 100}%`
                          : '50%',
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
