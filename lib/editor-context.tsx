'use client';

/* ─── Editor State Context ─── */
/* Central store for the entire editor application */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  EditorState,
  EditorTool,
  Adjustments,
  Layer,
  BlendMode,
  CropState,
  ImageFile,
} from '@/lib/types';
import { DEFAULT_ADJUSTMENTS } from '@/lib/types';
import { generateId, cloneImageData } from '@/lib/utils';
import { createHistoryEntry, pushHistory } from '@/lib/canvas/history';
import { createLayer } from '@/lib/canvas/layers';

/* ─── Action types ─── */
type EditorAction =
  | { type: 'SET_IMAGE'; payload: ImageFile }
  | { type: 'SET_TOOL'; payload: EditorTool }
  | { type: 'SET_ADJUSTMENTS'; payload: Adjustments }
  | { type: 'SET_CROP_STATE'; payload: CropState | null }
  | { type: 'APPLY_CROP'; payload: ImageData }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'REMOVE_LAYER'; payload: string }
  | { type: 'UPDATE_LAYER'; payload: { id: string; changes: Partial<Layer> } }
  | { type: 'SET_ACTIVE_LAYER'; payload: string | null }
  | { type: 'REORDER_LAYERS'; payload: Layer[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'PUSH_HISTORY'; payload: { label: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESIZE_IMAGE'; payload: { imageData: ImageData; width: number; height: number } }
  | { type: 'RESET' };

const initialState: EditorState = {
  image: null,
  layers: [],
  activeLayerId: null,
  activeTool: 'select',
  adjustments: DEFAULT_ADJUSTMENTS,
  cropState: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  history: [],
  historyIndex: -1,
  isProcessing: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_IMAGE': {
      const image = action.payload;
      const baseLayer = createLayer(image.data, 'Background', 0);
      const entry = createHistoryEntry(
        'Open Image',
        image.data,
        DEFAULT_ADJUSTMENTS,
        [baseLayer]
      );
      return {
        ...initialState,
        image,
        layers: [baseLayer],
        activeLayerId: baseLayer.id,
        history: [entry],
        historyIndex: 0,
      };
    }

    case 'SET_TOOL':
      return { ...state, activeTool: action.payload };

    case 'SET_ADJUSTMENTS':
      return { ...state, adjustments: action.payload };

    case 'SET_CROP_STATE':
      return { ...state, cropState: action.payload };

    case 'APPLY_CROP': {
      const newData = action.payload;
      const updatedImage = state.image
        ? {
            ...state.image,
            data: newData,
            width: newData.width,
            height: newData.height,
          }
        : null;
      const updatedLayers = state.layers.map((l, i) =>
        i === 0
          ? { ...l, imageData: cloneImageData(newData) }
          : l
      );
      return {
        ...state,
        image: updatedImage,
        layers: updatedLayers,
        cropState: null,
      };
    }

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'SET_PAN':
      return { ...state, panX: action.payload.x, panY: action.payload.y };

    case 'ADD_LAYER':
      return {
        ...state,
        layers: [...state.layers, action.payload],
        activeLayerId: action.payload.id,
      };

    case 'REMOVE_LAYER': {
      const filtered = state.layers.filter(l => l.id !== action.payload);
      return {
        ...state,
        layers: filtered,
        activeLayerId:
          state.activeLayerId === action.payload
            ? filtered[filtered.length - 1]?.id ?? null
            : state.activeLayerId,
      };
    }

    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map(l =>
          l.id === action.payload.id
            ? { ...l, ...action.payload.changes }
            : l
        ),
      };

    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.payload };

    case 'REORDER_LAYERS':
      return { ...state, layers: action.payload };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'PUSH_HISTORY': {
      if (!state.image) return state;
      const entry = createHistoryEntry(
        action.payload.label,
        state.image.data,
        state.adjustments,
        state.layers
      );
      const { history, historyIndex } = pushHistory(
        state.history,
        state.historyIndex,
        entry
      );
      return { ...state, history, historyIndex };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const idx = state.historyIndex - 1;
      const entry = state.history[idx];
      return {
        ...state,
        historyIndex: idx,
        adjustments: { ...entry.adjustments },
        layers: entry.layers.map(l => ({
          ...l,
          imageData: cloneImageData(l.imageData),
        })),
        image: state.image
          ? {
              ...state.image,
              data: cloneImageData(entry.imageData),
              width: entry.imageData.width,
              height: entry.imageData.height,
            }
          : null,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      const entry = state.history[idx];
      return {
        ...state,
        historyIndex: idx,
        adjustments: { ...entry.adjustments },
        layers: entry.layers.map(l => ({
          ...l,
          imageData: cloneImageData(l.imageData),
        })),
        image: state.image
          ? {
              ...state.image,
              data: cloneImageData(entry.imageData),
              width: entry.imageData.width,
              height: entry.imageData.height,
            }
          : null,
      };
    }

    case 'RESIZE_IMAGE': {
      const { imageData, width, height } = action.payload;
      return {
        ...state,
        image: state.image
          ? { ...state.image, data: imageData, width, height }
          : null,
        layers: state.layers.map((l, i) =>
          i === 0 ? { ...l, imageData: cloneImageData(imageData) } : l
        ),
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/* ─── Context ─── */

interface EditorContextType {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}

export function useEditorActions() {
  const { state, dispatch } = useEditor();

  const setTool = useCallback(
    (tool: EditorTool) => dispatch({ type: 'SET_TOOL', payload: tool }),
    [dispatch]
  );

  const setAdjustments = useCallback(
    (adj: Adjustments) => dispatch({ type: 'SET_ADJUSTMENTS', payload: adj }),
    [dispatch]
  );

  const setZoom = useCallback(
    (zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }),
    [dispatch]
  );

  const setPan = useCallback(
    (x: number, y: number) => dispatch({ type: 'SET_PAN', payload: { x, y } }),
    [dispatch]
  );

  const addLayer = useCallback(
    (layer: Layer) => {
      dispatch({ type: 'ADD_LAYER', payload: layer });
      dispatch({ type: 'PUSH_HISTORY', payload: { label: 'Add Layer' } });
    },
    [dispatch]
  );

  const removeLayer = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_LAYER', payload: id });
      dispatch({ type: 'PUSH_HISTORY', payload: { label: 'Delete Layer' } });
    },
    [dispatch]
  );

  const updateLayer = useCallback(
    (id: string, changes: Partial<Layer>) =>
      dispatch({ type: 'UPDATE_LAYER', payload: { id, changes } }),
    [dispatch]
  );

  const setActiveLayer = useCallback(
    (id: string | null) => dispatch({ type: 'SET_ACTIVE_LAYER', payload: id }),
    [dispatch]
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  const pushHistoryState = useCallback(
    (label: string) => dispatch({ type: 'PUSH_HISTORY', payload: { label } }),
    [dispatch]
  );

  return {
    state,
    dispatch,
    setTool,
    setAdjustments,
    setZoom,
    setPan,
    addLayer,
    removeLayer,
    updateLayer,
    setActiveLayer,
    undo,
    redo,
    pushHistoryState,
  };
}
