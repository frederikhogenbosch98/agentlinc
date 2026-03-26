import { Toolbar } from './Toolbar';
import { FlowCanvas } from '../canvas/FlowCanvas';
import { BlockPalette } from '../palette/BlockPalette';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { useUIStore } from '../../store/useUIStore';

export function AppShell() {
  const isPaletteOpen = useUIStore((s) => s.isPaletteOpen);
  const isPropertiesPanelOpen = useUIStore((s) => s.isPropertiesPanelOpen);

  return (
    <div className="app-shell">
      <Toolbar />
      <div className="app-body">
        {isPaletteOpen && <BlockPalette />}
        <FlowCanvas />
        {isPropertiesPanelOpen && <PropertiesPanel />}
      </div>
    </div>
  );
}
