'use client';

/* ─── Editor Shell ─── */
/* Main layout: Toolbar (top) + Sidebar (left) + Canvas (center) + Panels (right) */

import { useEffect } from 'react';
import { useEditorActions } from '@/lib/editor-context';
import type { EditorTool } from '@/lib/types';
import { useIsMobile } from '@/lib/hooks';
import { Toolbar } from './Toolbar';
import { ToolSidebar } from './ToolSidebar';
import { EditorCanvas } from './EditorCanvas';
import { SidePanel } from './SidePanel';

const TOOL_SHORTCUTS: Record<string, EditorTool> = {
  v: 'select',
  c: 'crop',
  f: 'filters',
  a: 'adjust',
  r: 'resize',
  l: 'layers',
  e: 'export',
};

export function EditorShell() {
  const { state, setTool, undo, redo } = useEditorActions();
  const isMobile = useIsMobile();

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      // Tool shortcuts (single key, no modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const tool = TOOL_SHORTCUTS[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          setTool(tool);
          return;
        }
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool, undo, redo]);

  if (isMobile) {
    return (
      <div
        className="h-screen w-screen flex flex-col overflow-hidden select-none"
        style={{ background: 'var(--surface-0)' }}
      >
        {/* Mobile Header */}
        <Toolbar />

        {/* Canvas Area - Priority space on mobile */}
        <div className="flex-1 relative overflow-hidden">
          <EditorCanvas />
        </div>

        {/* Tool Options (Bottom Sheet style) */}
        <SidePanel />

        {/* Bottom Tool Navigation */}
        <ToolSidebar />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--surface-0)' }}
    >
      {/* Top toolbar */}
      <Toolbar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left tool sidebar */}
        <ToolSidebar />

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <EditorCanvas />
        </div>

        {/* Right panel */}
        <SidePanel />
      </div>
    </div>
  );
}
