import { useCallback, useMemo } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import type { SystemNodeData, ModelConfig, ModelLayer } from '../../types';
import { ModelConfigEditor } from './ModelConfigEditor';
import { ModelLayerBuilder } from './ModelLayerBuilder';

export function ModelEditor() {
  const project = useGraphStore((s) => s.project);
  const activeSubsystemId = useGraphStore((s) => s.activeSubsystemId);
  const updateNodeData = useGraphStore((s) => s.updateNodeData);

  // Find the parent node that owns this subsystem
  const parentNode = useMemo(() => {
    for (const node of Object.values(project.nodes)) {
      if (node.data.kind === 'system' && (node.data as SystemNodeData).subsystemId === activeSubsystemId) {
        return node;
      }
    }
    return null;
  }, [project.nodes, activeSubsystemId]);

  const data = parentNode?.data as SystemNodeData | undefined;

  const handleConfigChange = useCallback(
    (config: ModelConfig) => {
      if (parentNode) updateNodeData(parentNode.id, { modelConfig: config });
    },
    [parentNode, updateNodeData]
  );

  const handleLayersChange = useCallback(
    (layers: ModelLayer[]) => {
      if (parentNode) updateNodeData(parentNode.id, { modelLayers: layers });
    },
    [parentNode, updateNodeData]
  );

  if (!data || data.systemType !== 'model') return null;

  return (
    <div className="model-editor">
      <div className="model-editor-header">Model Configuration</div>
      <div className="model-editor-content">
        <div className="model-editor-section">
          <div className="model-editor-section-title">Training Config</div>
          <ModelConfigEditor
            config={data.modelConfig!}
            onChange={handleConfigChange}
          />
        </div>
        <div className="model-editor-section">
          <div className="model-editor-section-title">Architecture</div>
          <ModelLayerBuilder
            layers={data.modelLayers || []}
            onChange={handleLayersChange}
          />
        </div>
      </div>
    </div>
  );
}
