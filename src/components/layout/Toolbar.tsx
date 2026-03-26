import { useCallback, useRef } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useUIStore } from '../../store/useUIStore';
import { serializeProject } from '../../export/serialize';
import { deserializeProject } from '../../export/deserialize';
import type { ExportSchema } from '../../types/export';

export function Toolbar() {
  const projectName = useGraphStore((s) => s.project.name);
  const navigationStack = useGraphStore((s) => s.navigationStack);
  const project = useGraphStore((s) => s.project);
  const navigateTo = useGraphStore((s) => s.navigateTo);
  const navigateUp = useGraphStore((s) => s.navigateUp);
  const setProject = useGraphStore((s) => s.setProject);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const undoStack = useHistoryStore((s) => s.undoStack);
  const redoStack = useHistoryStore((s) => s.redoStack);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs = navigationStack.map((id) => {
    const subsystem = project.subsystems[id];
    return { id, name: subsystem?.name || id };
  });

  const canGoUp = navigationStack.length > 1;

  const handleUndo = () => {
    const snapshot = undo();
    if (snapshot) {
      useHistoryStore.setState((state) => ({
        redoStack: [...state.redoStack, JSON.parse(JSON.stringify(project))],
      }));
      setProject(snapshot);
    }
  };

  const handleRedo = () => {
    const snapshot = redo();
    if (snapshot) {
      useHistoryStore.setState((state) => ({
        undoStack: [...state.undoStack, JSON.parse(JSON.stringify(project))],
      }));
      setProject(snapshot);
    }
  };

  const handleExport = useCallback(() => {
    const exportData = serializeProject(project);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase()}.agentlinc.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string) as ExportSchema;
          const imported = deserializeProject(json);
          setProject(imported);
        } catch (err) {
          console.error('Failed to import project:', err);
          alert('Failed to import: invalid AgentLinc JSON file');
        }
      };
      reader.readAsText(file);
      // Reset so the same file can be re-imported
      e.target.value = '';
    },
    [setProject]
  );

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-logo">AgentLinc</span>
        <span className="toolbar-separator">/</span>
        <span className="toolbar-project-name">{projectName}</span>
      </div>
      <div className="toolbar-center">
        {canGoUp && (
          <button className="toolbar-btn toolbar-back-btn" onClick={navigateUp} title="Go up">
            &#x2190;
          </button>
        )}
        <nav className="breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id}>
              {i > 0 && <span className="breadcrumb-separator">&gt;</span>}
              <button
                className={`breadcrumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}
                onClick={() => navigateTo(crumb.id)}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      </div>
      <div className="toolbar-right">
        <button
          className="toolbar-btn"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          className="toolbar-btn"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Shift+Z)"
        >
          Redo
        </button>
        <span className="toolbar-separator">|</span>
        <button className="toolbar-btn" onClick={handleImport} title="Import project">
          Import
        </button>
        <button className="toolbar-btn toolbar-btn-primary" onClick={handleExport} title="Export project as JSON">
          Export
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <span className="toolbar-separator">|</span>
        <button
          className="toolbar-btn theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
