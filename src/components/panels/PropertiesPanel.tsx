import { useCallback } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { useUIStore } from '../../store/useUIStore';
import { DocTabs } from './DocTabs';
import { DebouncedInput, DebouncedTextarea } from './DebouncedInput';
import type { SystemNodeData, NoteNodeData, Port, Docs } from '../../types';
import { nanoid } from 'nanoid';

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

  const handleAddInput = useCallback(() => {
    const newPort: Port = { id: `in_${nanoid(6)}`, name: `input_${data.inputs.length}` };
    onChange({ inputs: [...data.inputs, newPort] });
  }, [data.inputs, onChange]);

  const handleAddOutput = useCallback(() => {
    const newPort: Port = { id: `out_${nanoid(6)}`, name: `output_${data.outputs.length}` };
    onChange({ outputs: [...data.outputs, newPort] });
  }, [data.outputs, onChange]);

  const handleRemovePort = useCallback(
    (direction: 'inputs' | 'outputs', portId: string) => {
      onChange({ [direction]: data[direction].filter((p) => p.id !== portId) });
    },
    [data, onChange]
  );

  const handleRenamePort = useCallback(
    (direction: 'inputs' | 'outputs', portId: string, name: string) => {
      onChange({
        [direction]: data[direction].map((p) => (p.id === portId ? { ...p, name } : p)),
      });
    },
    [data, onChange]
  );

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
        <button className="prop-subsystem-btn" onClick={handleSubsystem}>
          {data.subsystemId ? 'Open Subsystem' : 'Create Subsystem'}
        </button>
      </div>

      <div className="prop-section">
        <div className="prop-section-header">
          <label className="prop-label">Inputs</label>
          <button className="prop-add-btn" onClick={handleAddInput}>+ Add</button>
        </div>
        {data.inputs.map((port) => (
          <div key={port.id} className="port-editor">
            <DebouncedInput
              className="prop-input port-input"
              value={port.name}
              onChange={(v) => handleRenamePort('inputs', port.id, v)}
            />
            <button
              className="port-remove-btn"
              onClick={() => handleRemovePort('inputs', port.id)}
              title="Remove port"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="prop-section">
        <div className="prop-section-header">
          <label className="prop-label">Outputs</label>
          <button className="prop-add-btn" onClick={handleAddOutput}>+ Add</button>
        </div>
        {data.outputs.map((port) => (
          <div key={port.id} className="port-editor">
            <DebouncedInput
              className="prop-input port-input"
              value={port.name}
              onChange={(v) => handleRenamePort('outputs', port.id, v)}
            />
            <button
              className="port-remove-btn"
              onClick={() => handleRemovePort('outputs', port.id)}
              title="Remove port"
            >
              x
            </button>
          </div>
        ))}
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
