'use client';

/* ─── Left Tool Sidebar ─── */

import { motion } from 'framer-motion';
import {
  MousePointer2,
  Crop,
  Sparkles,
  SlidersHorizontal,
  Maximize,
  Layers,
  Download,
} from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import type { EditorTool } from '@/lib/types';
import { cn } from '@/lib/utils';

const TOOLS: { id: EditorTool; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
  { id: 'filters', icon: Sparkles, label: 'Filters', shortcut: 'F' },
  { id: 'adjust', icon: SlidersHorizontal, label: 'Adjust', shortcut: 'A' },
  { id: 'resize', icon: Maximize, label: 'Resize', shortcut: 'R' },
  { id: 'layers', icon: Layers, label: 'Layers', shortcut: 'L' },
  { id: 'export', icon: Download, label: 'Export', shortcut: 'E' },
];

export function ToolSidebar() {
  const { state, setTool } = useEditorActions();

  return (
    <div
      className="w-14 flex flex-col items-center py-3 gap-1 shrink-0"
      style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {TOOLS.map((tool) => {
        const isActive = state.activeTool === tool.id;
        const Icon = tool.icon;

        return (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
            style={{
              background: isActive ? 'var(--accent-muted)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
              border: 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--surface-3)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            {isActive && (
              <motion.div
                layoutId="tool-indicator"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent)',
                  borderColor: 'var(--accent-muted)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Icon size={18} className="relative z-10" />
          </motion.button>
        );
      })}
    </div>
  );
}
