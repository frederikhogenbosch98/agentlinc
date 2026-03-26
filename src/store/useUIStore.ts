import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface UIState {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  isPaletteOpen: boolean;
  isPropertiesPanelOpen: boolean;
  theme: Theme;

  selectNodes: (ids: string[], append?: boolean) => void;
  selectEdges: (ids: string[], append?: boolean) => void;
  clearSelection: () => void;
  togglePalette: () => void;
  toggleProperties: () => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('agentlinc-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('agentlinc-theme', theme);
  } catch {}
}

// Apply on load
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  selectedNodeIds: [],
  selectedEdgeIds: [],
  isPaletteOpen: true,
  isPropertiesPanelOpen: false,
  theme: initialTheme,

  selectNodes: (ids, append = false) => {
    set((state) => ({
      selectedNodeIds: append ? [...state.selectedNodeIds, ...ids] : ids,
      selectedEdgeIds: append ? state.selectedEdgeIds : [],
      isPropertiesPanelOpen: ids.length > 0,
    }));
  },

  selectEdges: (ids, append = false) => {
    set((state) => ({
      selectedEdgeIds: append ? [...state.selectedEdgeIds, ...ids] : ids,
      selectedNodeIds: append ? state.selectedNodeIds : [],
    }));
  },

  clearSelection: () => {
    set({ selectedNodeIds: [], selectedEdgeIds: [], isPropertiesPanelOpen: false });
  },

  togglePalette: () => set((s) => ({ isPaletteOpen: !s.isPaletteOpen })),
  toggleProperties: () => set((s) => ({ isPropertiesPanelOpen: !s.isPropertiesPanelOpen })),
  setPropertiesPanelOpen: (open) => set({ isPropertiesPanelOpen: open }),

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    });
  },
}));
