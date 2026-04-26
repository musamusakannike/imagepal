'use client';

/* ─── Layer Panel ─── */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Trash2, Plus, Lock, Unlock, Copy } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { createEmptyLayer, BLEND_MODES } from '@/lib/canvas/layers';
import { cloneImageData } from '@/lib/utils';
import type { Layer, BlendMode } from '@/lib/types';
import toast from 'react-hot-toast';

export function LayerPanel() {
  const { state, dispatch, addLayer, removeLayer, updateLayer, setActiveLayer, pushHistoryState } =
    useEditorActions();

  const handleAddLayer = useCallback(() => {
    if (!state.image) return;
    const newLayer = createEmptyLayer(
      state.image.width, state.image.height,
      `Layer ${state.layers.length + 1}`, state.layers.length
    );
    addLayer(newLayer);
    toast.success('New layer added');
  }, [state.image, state.layers.length, addLayer]);

  const handleDuplicate = useCallback((layer: Layer) => {
    const dupe: Layer = {
      ...layer,
      id: Math.random().toString(36).substring(2, 10),
      name: `${layer.name} Copy`,
      imageData: cloneImageData(layer.imageData),
      order: state.layers.length,
    };
    addLayer(dupe);
    toast.success(`Duplicated "${layer.name}"`);
  }, [state.layers.length, addLayer]);

  const handleDelete = useCallback((layer: Layer) => {
    if (state.layers.length <= 1) { toast.error('Cannot delete the last layer'); return; }
    removeLayer(layer.id);
    toast.success(`Deleted "${layer.name}"`);
  }, [state.layers.length, removeLayer]);

  const activeLayer = state.layers.find(l => l.id === state.activeLayerId);

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Layers</h3>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleAddLayer}
          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
          <Plus size={14} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {[...state.layers].reverse().map((layer) => (
          <div key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer group"
            style={{
              background: state.activeLayerId === layer.id ? 'var(--surface-3)' : 'transparent',
              border: `1px solid ${state.activeLayerId === layer.id ? 'var(--border-hover)' : 'transparent'}`,
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}>
            <div className="w-8 h-8 rounded flex-shrink-0 checkerboard overflow-hidden" style={{ border: '1px solid var(--border)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{layer.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{Math.round(layer.opacity * 100)}% · {layer.blendMode}</div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <SmBtn icon={layer.visible ? <Eye size={12} /> : <EyeOff size={12} />} onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} />
              <SmBtn icon={layer.locked ? <Lock size={12} /> : <Unlock size={12} />} onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }} />
              <SmBtn icon={<Copy size={12} />} onClick={(e) => { e.stopPropagation(); handleDuplicate(layer); }} />
              <SmBtn icon={<Trash2 size={12} />} onClick={(e) => { e.stopPropagation(); handleDelete(layer); }} />
            </div>
          </div>
        ))}
      </div>

      {activeLayer && (
        <div className="flex flex-col gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Opacity</span>
              <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{Math.round(activeLayer.opacity * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={activeLayer.opacity}
              onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
              onMouseUp={() => pushHistoryState('Layer Opacity')} className="w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Blend Mode</span>
            <select value={activeLayer.blendMode}
              onChange={(e) => { updateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode }); pushHistoryState('Blend Mode'); }}
              className="w-full px-2 py-1.5 rounded-md text-xs cursor-pointer"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}>
              {BLEND_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function SmBtn({ icon, onClick }: { icon: React.ReactNode; onClick: (e: React.MouseEvent) => void }) {
  return (
    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={onClick}
      className="w-6 h-6 flex items-center justify-center rounded cursor-pointer"
      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
      {icon}
    </motion.button>
  );
}
