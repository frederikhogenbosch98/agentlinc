import { useEffect } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useUIStore } from '../store/useUIStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      // Don't intercept when typing in text inputs/textareas
      if (target.isContentEditable) return;
      if (target.tagName === 'TEXTAREA') return;
      if (target.tagName === 'INPUT') {
        const inputType = (target as HTMLInputElement).type;
        // Allow delete/backspace to work for non-text inputs (checkboxes, etc.)
        if (inputType === 'text' || inputType === 'number' || inputType === 'search' || inputType === 'password') {
          return;
        }
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+Z: Undo
      if (isMod && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const snapshot = useHistoryStore.getState().undo();
        if (snapshot) {
          const current = useGraphStore.getState().project;
          useHistoryStore.setState((state) => ({
            redoStack: [...state.redoStack, JSON.parse(JSON.stringify(current))],
          }));
          useGraphStore.getState().setProject(snapshot);
        }
      }

      // Ctrl/Cmd+Shift+Z: Redo
      if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const snapshot = useHistoryStore.getState().redo();
        if (snapshot) {
          const current = useGraphStore.getState().project;
          useHistoryStore.setState((state) => ({
            undoStack: [...state.undoStack, JSON.parse(JSON.stringify(current))],
          }));
          useGraphStore.getState().setProject(snapshot);
        }
      }

      // Cmd/Ctrl+D: Duplicate selected nodes
      if (isMod && e.key === 'd') {
        const selected = useUIStore.getState().selectedNodeIds;
        if (selected.length > 0) {
          e.preventDefault();
          const newIds = useGraphStore.getState().duplicateNodes(selected);
          useUIStore.getState().selectNodes(newIds);
        }
      }

      // Backspace or Delete: Delete selected nodes
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const selected = useUIStore.getState().selectedNodeIds;
        if (selected.length > 0) {
          e.preventDefault();
          useGraphStore.getState().removeNodes(selected);
          useUIStore.getState().clearSelection();
        }
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        useUIStore.getState().clearSelection();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
