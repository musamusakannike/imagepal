'use client';

/* ─── Right Side Panel ─── */
/* Renders the appropriate tool panel based on active tool */

import { motion, AnimatePresence } from 'framer-motion';
import { useEditorActions } from '@/lib/editor-context';
import { FilterPanel } from './FilterPanel';
import { AdjustmentPanel } from './AdjustmentPanel';
import { CropPanel } from './CropPanel';
import { ResizePanel } from './ResizePanel';
import { LayerPanel } from './LayerPanel';
import { ExportPanel } from './ExportPanel';

export function SidePanel() {
  const { state } = useEditorActions();

  // Only show panel for tools that need it
  const showPanel = ['crop', 'filters', 'adjust', 'resize', 'layers', 'export'].includes(
    state.activeTool
  );

  if (!showPanel) return null;

  return (
    <div
      className="w-72 shrink-0 flex flex-col overflow-hidden"
      style={{
        background: 'var(--surface-1)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state.activeTool}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto"
        >
          {state.activeTool === 'crop' && <CropPanel />}
          {state.activeTool === 'filters' && <FilterPanel />}
          {state.activeTool === 'adjust' && <AdjustmentPanel />}
          {state.activeTool === 'resize' && <ResizePanel />}
          {state.activeTool === 'layers' && <LayerPanel />}
          {state.activeTool === 'export' && <ExportPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
