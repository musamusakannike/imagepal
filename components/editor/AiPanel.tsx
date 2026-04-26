'use client';

/* ─── AI Magic Panel ─── */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, Eraser, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEditorActions } from '@/lib/editor-context';
import { removeImageBackground } from '@/lib/canvas/ai';
import { cloneImageData } from '@/lib/utils';
import toast from 'react-hot-toast';

export function AiPanel() {
  const { state, dispatch, updateLayer, pushHistoryState } = useEditorActions();
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [progress, setProgress] = useState('');

  const handleRemoveBackground = useCallback(async () => {
    if (!state.image || !state.activeLayerId) {
      toast.error('No image or layer selected');
      return;
    }

    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return;

    try {
      setIsRemovingBackground(true);
      setProgress('Initializing AI...');
      
      dispatch({ type: 'SET_PROCESSING', payload: true });

      const processedData = await removeImageBackground(
        activeLayer.imageData,
        (step) => setProgress(step)
      );

      updateLayer(activeLayer.id, { imageData: processedData });
      pushHistoryState('Remove Background');
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsRemovingBackground(false);
      setProgress('');
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.image, state.activeLayerId, state.layers, dispatch, updateLayer, pushHistoryState]);

  return (
    <div className="p-4 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Wand2 size={18} />
        </div>
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            AI Magic Tools
          </h3>
          <p className="text-[10px] text-tertiary uppercase tracking-wider font-medium">
            Powered by WebAssembly
          </p>
        </div>
      </div>

      {/* Tool Card */}
      <div 
        className="rounded-2xl border p-5 flex flex-col gap-4 relative overflow-hidden group"
        style={{ 
          background: 'var(--surface-2)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
              <Eraser size={16} className="text-accent" />
              Background Remover
            </h4>
            <p className="text-xs text-secondary leading-relaxed max-w-[200px]">
              Remove backgrounds automatically using on-device AI. No data leaves your browser.
            </p>
          </div>
        </div>

        <motion.button
          disabled={isRemovingBackground || !state.image}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRemoveBackground}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden transition-all shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            cursor: (isRemovingBackground || !state.image) ? 'not-allowed' : 'pointer',
            opacity: !state.image ? 0.5 : 1
          }}
        >
          {isRemovingBackground ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="animate-pulse">Processing...</span>
            </>
          ) : (
            <>
              <Eraser size={18} />
              Remove Background
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {progress && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-accent">
                <span>{progress}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Eraser size={64} />
        </div>
      </div>

      {/* Info Card */}
      <div 
        className="p-4 rounded-xl border flex gap-3"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="text-accent shrink-0 pt-0.5">
          <Info size={16} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Local Processing</span>
          <p className="text-[11px] text-tertiary leading-normal">
            The first run will download about 40MB of AI models. Subsequent removals will be much faster.
          </p>
        </div>
      </div>

      {/* Benefits List */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center gap-2 text-xs text-secondary">
          <CheckCircle2 size={14} className="text-green-500" />
          <span>100% Privacy Focused</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <CheckCircle2 size={14} className="text-green-500" />
          <span>High-precision Masking</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <AlertCircle size={14} className="text-amber-500" />
          <span>Works best with clear subjects</span>
        </div>
      </div>
    </div>
  );
}
