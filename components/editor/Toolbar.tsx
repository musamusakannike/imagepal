import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Home,
  ImageIcon,
} from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { canUndo, canRedo } from '@/lib/canvas/history';
import { formatDimensions, formatFileSize } from '@/lib/utils';
import { useIsMobile } from '@/lib/hooks';
import toast from 'react-hot-toast';

export function Toolbar() {
  const { state, undo, redo, setZoom, setTool } = useEditorActions();
  const router = useRouter();
  const isMobile = useIsMobile();

  const zoomIn = () => setZoom(Math.min(5, state.zoom * 1.25));
  const zoomOut = () => setZoom(Math.max(0.1, state.zoom / 1.25));
  const fitToScreen = () => setZoom(1);

  const handleExport = () => {
    setTool('export');
    if (!isMobile) {
      toast('Configure export in the right panel', { icon: '📦' });
    }
  };

  if (isMobile) {
    return (
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0 z-40"
        style={{
          background: 'var(--surface-1)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-white/5"
          >
            <Home size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-accent leading-tight">
              ImagePal
            </span>
            <span className="text-[10px] text-tertiary truncate max-w-[120px]">
              {state.image?.name || 'Untitled'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Undo2 size={18} />}
            tooltip="Undo"
            disabled={!canUndo(state.historyIndex)}
            onClick={undo}
          />
          <ToolbarButton
            icon={<Redo2 size={18} />}
            tooltip="Redo"
            disabled={!canRedo(state.history, state.historyIndex)}
            onClick={redo}
          />
          <div className="w-px h-4 mx-1 bg-white/10" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
            }}
          >
            Export
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-12 flex items-center justify-between px-3 shrink-0"
      style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: nav + file info */}
      <div className="flex items-center gap-3">
        <ToolbarButton
          icon={<Home size={16} />}
          tooltip="Back to Home"
          onClick={() => router.push('/')}
        />

        <div
          className="w-px h-5"
          style={{ background: 'var(--border)' }}
        />

        <div className="flex items-center gap-2">
          <ImageIcon size={14} style={{ color: 'var(--accent)' }} />
          <span
            className="text-sm font-medium truncate max-w-[160px]"
            style={{ color: 'var(--text-primary)' }}
          >
            {state.image?.name || 'Untitled'}
          </span>
          {state.image && (
            <span
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatDimensions(state.image.width, state.image.height)}
              {' · '}
              {formatFileSize(state.image.size)}
            </span>
          )}
        </div>
      </div>

      {/* Center: undo/redo + zoom */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Undo2 size={16} />}
          tooltip="Undo"
          disabled={!canUndo(state.historyIndex)}
          onClick={undo}
        />
        <ToolbarButton
          icon={<Redo2 size={16} />}
          tooltip="Redo"
          disabled={!canRedo(state.history, state.historyIndex)}
          onClick={redo}
        />

        <div
          className="w-px h-5 mx-2"
          style={{ background: 'var(--border)' }}
        />

        <ToolbarButton icon={<ZoomOut size={15} />} tooltip="Zoom Out" onClick={zoomOut} />
        <span
          className="text-xs font-medium w-12 text-center select-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {Math.round(state.zoom * 100)}%
        </span>
        <ToolbarButton icon={<ZoomIn size={15} />} tooltip="Zoom In" onClick={zoomIn} />
        <ToolbarButton
          icon={<Maximize2 size={14} />}
          tooltip="Fit to Screen"
          onClick={fitToScreen}
        />
      </div>

      {/* Right: export */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer"
          style={{
            background: 'var(--accent)',
            color: 'var(--text-inverse)',
          }}
        >
          <Download size={14} />
          Export
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Toolbar icon button ─── */

function ToolbarButton({
  icon,
  tooltip,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
      style={{
        color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
        background: 'transparent',
        border: 'none',
        opacity: disabled ? 0.4 : 1,
        transition: 'all var(--duration-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = 'var(--surface-3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}
    </motion.button>
  );
}
