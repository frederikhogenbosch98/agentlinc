import { useMemo } from 'react';
import { Toolbar } from './Toolbar';
import { FlowCanvas } from '../canvas/FlowCanvas';
import { BlockPalette } from '../palette/BlockPalette';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { ModelEditor } from '../panels/ModelEditor';
import { useUIStore } from '../../store/useUIStore';
import { useGraphStore } from '../../store/useGraphStore';
import type { SystemNodeData } from '../../types';

export function AppShell() {
  const isPaletteOpen = useUIStore((s) => s.isPaletteOpen);
  const isPropertiesPanelOpen = useUIStore((s) => s.isPropertiesPanelOpen);
  const project = useGraphStore((s) => s.project);
  const activeSubsystemId = useGraphStore((s) => s.activeSubsystemId);

  const isModelSubsystem = useMemo(() => {
    for (const node of Object.values(project.nodes)) {
      if (
        node.data.kind === 'system' &&
        (node.data as SystemNodeData).subsystemId === activeSubsystemId &&
        (node.data as SystemNodeData).systemType === 'model'
      ) {
        return true;
      }
    }
    return false;
  }, [project.nodes, activeSubsystemId]);

  // In a model subsystem: show ModelEditor when nothing is selected, PropertiesPanel when a node is selected
  // Outside model subsystem: show PropertiesPanel when a node is selected
  const showModelEditor = isModelSubsystem && !isPropertiesPanelOpen;
  const showProperties = isPropertiesPanelOpen;

  return (
    <div className="app-shell">
      <Toolbar />
      <div className="app-body">
        {isPaletteOpen && <BlockPalette />}
        <FlowCanvas />
        {showModelEditor && <ModelEditor />}
        {showProperties && <PropertiesPanel />}
      </div>
    </div>
  );
}
