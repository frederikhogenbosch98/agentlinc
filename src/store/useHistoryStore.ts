import { create } from 'zustand';
import type { Project } from '../types';

interface HistoryState {
  undoStack: Project[];
  redoStack: Project[];
  maxHistory: number;

  pushSnapshot: (project: Project) => void;
  undo: () => Project | null;
  redo: () => Project | null;
  clear: () => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistory: 50,

  pushSnapshot: (project) => {
    set((state) => {
      const newStack = [...state.undoStack, deepClone(project)];
      if (newStack.length > state.maxHistory) {
        newStack.shift();
      }
      return { undoStack: newStack, redoStack: [] };
    });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;

    const snapshot = undoStack[undoStack.length - 1];
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
    }));
    return deepClone(snapshot);
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;

    const snapshot = redoStack[redoStack.length - 1];
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
    }));
    return deepClone(snapshot);
  },

  clear: () => set({ undoStack: [], redoStack: [] }),
}));
