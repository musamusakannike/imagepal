import { motion, AnimatePresence } from 'framer-motion';
import { useEditorActions } from '@/lib/editor-context';
import { FilterPanel } from './FilterPanel';
import { AdjustmentPanel } from './AdjustmentPanel';
import { CropPanel } from './CropPanel';
import { ResizePanel } from './ResizePanel';
import { LayerPanel } from './LayerPanel';
import { ExportPanel } from './ExportPanel';
import { AiPanel } from './AiPanel';
import { useIsMobile } from '@/lib/hooks';
import { X } from 'lucide-react';

export function SidePanel() {
  const { state, setTool } = useEditorActions();
  const isMobile = useIsMobile();

  // Only show panel for tools that need it
  const showPanel = ['crop', 'filters', 'adjust', 'resize', 'layers', 'export', 'ai'].includes(
    state.activeTool
  );

  if (!showPanel) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-[72px] z-40 max-h-[60vh] flex flex-col overflow-hidden"
          style={{
            background: 'var(--surface-1)',
            borderTop: '1px solid var(--border)',
            borderTopLeftRadius: 'var(--radius-xl)',
            borderTopRightRadius: 'var(--radius-xl)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Handle bar */}
          <div className="w-full flex flex-col items-center py-2 shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-white/10" />
            <div className="w-full flex items-center justify-between px-4 mt-1">
              <span className="text-sm font-bold uppercase tracking-widest text-accent">
                {state.activeTool}
              </span>
              <button 
                onClick={() => setTool('select')}
                className="p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {state.activeTool === 'crop' && <CropPanel />}
            {state.activeTool === 'filters' && <FilterPanel />}
            {state.activeTool === 'adjust' && <AdjustmentPanel />}
            {state.activeTool === 'resize' && <ResizePanel />}
            {state.activeTool === 'layers' && <LayerPanel />}
            {state.activeTool === 'export' && <ExportPanel />}
            {state.activeTool === 'ai' && <AiPanel />}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          {state.activeTool === 'ai' && <AiPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
