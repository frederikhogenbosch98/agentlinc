import { useCallback } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { useUIStore } from '../../store/useUIStore';
import { DocTabs } from './DocTabs';
import { DebouncedInput, DebouncedTextarea } from './DebouncedInput';
import type { SystemNodeData, NoteNodeData, Docs, SystemType, ModelConfig, ModelLayer, LayerNodeData } from '../../types';
import { SYSTEM_TYPES, LAYER_TYPES, createDefaultModelConfig } from '../../types';
import { ModelConfigEditor } from './ModelConfigEditor';
import { ModelLayerBuilder } from './ModelLayerBuilder';

export function PropertiesPanel() {
  const selectedNodeIds = useUIStore((s) => s.selectedNodeIds);
  const project = useGraphStore((s) => s.project);
  const updateNodeData = useGraphStore((s) => s.updateNodeData);

  const nodeId = selectedNodeIds[0];
  const node = nodeId ? project.nodes[nodeId] : null;

  if (!node) {
    return (
      <div className="sidebar sidebar-right">
        <div className="sidebar-header">Properties</div>
        <div className="sidebar-content">
          <p className="sidebar-placeholder">Select a block to edit</p>
        </div>
      </div>
    );
  }

  const { data } = node;

  return (
    <div className="sidebar sidebar-right">
      <div className="sidebar-header">Properties</div>
      <div className="sidebar-content properties-content">
        {data.kind === 'system' && (
          <SystemProperties nodeId={nodeId} data={data} onChange={(d) => updateNodeData(nodeId, d)} />
        )}
        {data.kind === 'note' && (
          <NoteProperties nodeId={nodeId} data={data} onChange={(d) => updateNodeData(nodeId, d)} />
        )}
        {data.kind === 'ioport' && (
          <IOPortProperties nodeId={nodeId} data={data} onChange={(d) => updateNodeData(nodeId, d)} />
        )}
        {data.kind === 'layer' && (
          <LayerProperties nodeId={nodeId} data={data} onChange={(d) => updateNodeData(nodeId, d)} />
        )}
      </div>
    </div>
  );
}

function SystemProperties({
  nodeId,
  data,
  onChange,
}: {
  nodeId: string;
  data: SystemNodeData;
  onChange: (d: Partial<SystemNodeData>) => void;
}) {
  const createSubsystem = useGraphStore((s) => s.createSubsystem);
  const navigateInto = useGraphStore((s) => s.navigateInto);

  const handleSubsystem = useCallback(() => {
    if (data.subsystemId) {
      navigateInto(data.subsystemId);
    } else {
      const subId = createSubsystem(nodeId);
      navigateInto(subId);
    }
  }, [data.subsystemId, nodeId, createSubsystem, navigateInto]);

  const handleDocsChange = useCallback(
    (docs: Docs) => onChange({ docs }),
    [onChange]
  );

  return (
    <>
      <div className="prop-section">
        <label className="prop-label">Name</label>
        <DebouncedInput
          className="prop-input"
          value={data.name}
          onChange={(v) => onChange({ name: v })}
        />
      </div>

      <div className="prop-section">
        <label className="prop-label">Type</label>
        <select
          className="prop-input prop-select"
          value={data.systemType || 'default'}
          onChange={(e) => {
            const newType = e.target.value as SystemType;
            const updates: Partial<SystemNodeData> = { systemType: newType };
            if (newType === 'model' && !data.modelConfig) {
              updates.modelConfig = createDefaultModelConfig();
              updates.modelLayers = [];
            }
            onChange(updates);
          }}
        >
          {SYSTEM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="prop-section">
        <button className="prop-subsystem-btn" onClick={handleSubsystem}>
          {data.subsystemId ? 'Open Subsystem' : 'Create Subsystem'}
        </button>
      </div>

      <div className="prop-section prop-section-docs">
        <label className="prop-label">Documentation</label>
        <DocTabs docs={data.docs} onChange={handleDocsChange} />
      </div>
    </>
  );
}

function NoteProperties({
  nodeId,
  data,
  onChange,
}: {
  nodeId: string;
  data: NoteNodeData;
  onChange: (d: Partial<NoteNodeData>) => void;
}) {
  return (
    <div className="prop-section">
      <label className="prop-label">Markdown</label>
      <DebouncedTextarea
        className="prop-textarea"
        value={data.markdown}
        onChange={(v) => onChange({ markdown: v })}
        placeholder="Write markdown notes..."
        rows={12}
      />
    </div>
  );
}

function IOPortProperties({
  nodeId,
  data,
  onChange,
}: {
  nodeId: string;
  data: any;
  onChange: (d: any) => void;
}) {
  return (
    <>
      <div className="prop-section">
        <label className="prop-label">Port Name</label>
        <DebouncedInput
          className="prop-input"
          value={data.name}
          onChange={(v) => onChange({ name: v })}
        />
      </div>
      <div className="prop-section">
        <label className="prop-label">Direction</label>
        <span className="prop-badge">{data.direction}</span>
      </div>
    </>
  );
}

function LayerProperties({
  nodeId,
  data,
  onChange,
}: {
  nodeId: string;
  data: LayerNodeData;
  onChange: (d: Partial<LayerNodeData>) => void;
}) {
  const def = LAYER_TYPES.find((l) => l.value === data.layerType);

  const handleParamChange = useCallback(
    (key: string, value: any) => {
      onChange({ params: { ...data.params, [key]: value } });
    },
    [data.params, onChange]
  );

  return (
    <>
      <div className="prop-section">
        <label className="prop-label">Layer Type</label>
        <span className="prop-badge">{def?.label || data.layerType}</span>
      </div>

      {Object.entries(data.params).map(([key, value]) => (
        <div key={key} className="prop-section">
          <label className="prop-label">{key}</label>
          {typeof value === 'boolean' ? (
            <input
              type="checkbox"
              className="layer-param-checkbox"
              checked={value}
              onChange={(e) => handleParamChange(key, e.target.checked)}
            />
          ) : (
            <input
              className="prop-input"
              type="number"
              value={value}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                handleParamChange(key, isNaN(num) ? e.target.value : num);
              }}
            />
          )}
        </div>
      ))}
    </>
  );
}
