/* ─── Undo/Redo History System ─── */

import type { HistoryEntry, Adjustments, Layer } from '@/lib/types';
import { cloneImageData, generateId } from '@/lib/utils';

const MAX_HISTORY = 30;

export function createHistoryEntry(
  label: string,
  imageData: ImageData,
  adjustments: Adjustments,
  layers: Layer[]
): HistoryEntry {
  return {
    id: generateId(),
    label,
    timestamp: Date.now(),
    imageData: cloneImageData(imageData),
    adjustments: { ...adjustments },
    layers: layers.map(l => ({
      ...l,
      imageData: cloneImageData(l.imageData),
    })),
  };
}

export function pushHistory(
  history: HistoryEntry[],
  historyIndex: number,
  entry: HistoryEntry
): { history: HistoryEntry[]; historyIndex: number } {
  // Discard any future history when branching
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(entry);

  // Cap history size
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export function canUndo(historyIndex: number): boolean {
  return historyIndex > 0;
}

export function canRedo(history: HistoryEntry[], historyIndex: number): boolean {
  return historyIndex < history.length - 1;
}
