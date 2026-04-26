'use client';

/* ─── Editor Canvas ─── */
/* Main canvas viewport with zoom/pan and layer compositing */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorActions } from '@/lib/editor-context';
import { applyAdjustments } from '@/lib/canvas/adjustments';
import { compositeLayers } from '@/lib/canvas/layers';

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setZoom, setPan } = useEditorActions();
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Render the canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !state.image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to container size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard pattern in image area
    const imgW = state.image.width * state.zoom;
    const imgH = state.image.height * state.zoom;
    const offsetX = (canvas.width - imgW) / 2 + state.panX;
    const offsetY = (canvas.height - imgH) / 2 + state.panY;

    // Checkerboard
    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, imgW, imgH);
    ctx.clip();

    const checkSize = 8 * state.zoom;
    for (let y = offsetY; y < offsetY + imgH; y += checkSize) {
      for (let x = offsetX; x < offsetX + imgW; x += checkSize) {
        const isLight =
          (Math.floor((x - offsetX) / checkSize) + Math.floor((y - offsetY) / checkSize)) % 2 === 0;
        ctx.fillStyle = isLight ? '#2a2a32' : '#222228';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }
    ctx.restore();

    // Composite layers
    let composited: ImageData;
    if (state.layers.length > 0) {
      composited = compositeLayers(
        state.layers,
        state.image.width,
        state.image.height
      );
    } else {
      composited = state.image.data;
    }

    // Apply adjustments
    const adjusted = applyAdjustments(composited, state.adjustments);

    // Draw onto temporary canvas then scale to viewport
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = state.image.width;
    tempCanvas.height = state.image.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.putImageData(adjusted, 0, 0);

    // Draw scaled
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, offsetX, offsetY, imgW, imgH);

    // Draw border around image
    ctx.strokeStyle = '#ffffff0d';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, imgW, imgH);
  }, [state.image, state.layers, state.adjustments, state.zoom, state.panX, state.panY]);

  useEffect(() => {
    render();
  }, [render]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => render());
    observer.observe(container);
    return () => observer.disconnect();
  }, [render]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.05, Math.min(10, state.zoom * delta));
      setZoom(newZoom);
    },
    [state.zoom, setZoom]
  );

  // Pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey) || state.activeTool === 'select') {
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX: state.panX,
          panY: state.panY,
        };
      }
    },
    [state.panX, state.panY, state.activeTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
    },
    [isPanning, setPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Zoom
      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        setZoom(Math.min(5, state.zoom * 1.25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(0.1, state.zoom / 1.25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.zoom, setZoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        cursor: isPanning ? 'grabbing' : state.activeTool === 'select' ? 'grab' : 'crosshair',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: state.zoom > 3 ? 'pixelated' : 'auto' }}
      />

      {/* Zoom indicator */}
      <div
        className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium select-none"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        {Math.round(state.zoom * 100)}%
      </div>
    </div>
  );
}
