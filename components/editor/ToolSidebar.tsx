import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2,
  Crop,
  Sparkles,
  SlidersHorizontal,
  Maximize,
  Layers,
  Download,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import type { EditorTool } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/hooks';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className="shrink-0 z-30 pb-safe"
        style={{
          background: 'var(--surface-1)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center overflow-x-auto no-scrollbar px-4 py-2 gap-4">
          {TOOLS.map((tool) => {
            const isActive = state.activeTool === tool.id;
            const Icon = tool.icon;

            return (
              <motion.button
                key={tool.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTool(tool.id)}
                className="flex flex-col items-center gap-1 shrink-0 min-w-[56px]"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                  border: 'none',
                  background: 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: isActive ? 'var(--accent-muted)' : 'transparent',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                >
                  <Icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tool-indicator"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-current"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {tool.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 200 : 56 }}
      className="flex flex-col items-center py-3 shrink-0 h-full relative z-20"
      style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="flex flex-col gap-1 w-full px-2 flex-1">
        {TOOLS.map((tool) => {
          const isActive = state.activeTool === tool.id;
          const Icon = tool.icon;

          return (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTool(tool.id)}
              className={cn(
                "relative group flex items-center rounded-xl cursor-pointer",
                isExpanded ? "w-full h-10 px-3 justify-start" : "w-10 h-10 mx-auto justify-center"
              )}
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
              <div className={cn("relative z-10 flex items-center w-full min-w-0", !isExpanded && "justify-center")}>
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                      animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                      exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between flex-1 overflow-hidden whitespace-nowrap"
                    >
                      <span className="text-sm font-medium">{tool.label}</span>
                      <span className="text-xs opacity-50 ml-2">{tool.shortcut}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isExpanded && (
                <div
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center gap-2 shadow-sm"
                  style={{
                    background: 'var(--surface-3)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {tool.label}
                  <span className="opacity-50 text-[10px]">{tool.shortcut}</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="w-full px-2 mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "relative group flex items-center rounded-xl cursor-pointer",
            isExpanded ? "w-full h-10 px-3 justify-start" : "w-10 h-10 mx-auto justify-center"
          )}
          style={{
            background: 'transparent',
            color: 'var(--text-tertiary)',
            border: 'none',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-3)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <div className={cn("relative z-10 flex items-center w-full min-w-0", !isExpanded && "justify-center")}>
            {isExpanded ? <ChevronLeft size={18} className="shrink-0" /> : <ChevronRight size={18} className="shrink-0" />}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center flex-1 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm font-medium">Collapse</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isExpanded && (
            <div
              className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center gap-2 shadow-sm"
              style={{
                background: 'var(--surface-3)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              Expand
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
