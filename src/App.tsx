import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AppShell } from './components/layout/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGraphStore } from './store/useGraphStore';
import './styles/global.css';

function AppInner() {
  useKeyboardShortcuts();

  useEffect(() => {
    // Push initial history entry so the first "back" works
    history.replaceState({ subsystemId: 'root' }, '');

    function onPopState() {
      useGraphStore.getState().navigateUp();
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <AppShell />;
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
