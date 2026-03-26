import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function SystemNodeComponent({ data, selected }: any) {
  if (!data || data.kind !== 'system') return null;
  const hasSubsystem = Boolean(data.subsystemId);

  return (
    <div
      className={`system-node ${selected ? 'selected' : ''} ${hasSubsystem ? 'has-subsystem' : ''}`}
    >
      <div className="system-node-header">
        <span className="system-node-name">{data.name}</span>
        {hasSubsystem && <span className="system-node-badge" title="Double-click to open">&#x25B6;</span>}
      </div>

      <div className="system-node-body">
        <div className="system-node-ports">
          <div className="system-node-inputs">
            {(data.inputs || []).map((port: any, i: number) => (
              <div key={port.id} className="system-node-port">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  style={{ top: `${32 + 24 + i * 24}px` }}
                  className="port-handle"
                />
                <span className="port-name input-port-name">{port.name}</span>
              </div>
            ))}
          </div>
          <div className="system-node-outputs">
            {(data.outputs || []).map((port: any, i: number) => (
              <div key={port.id} className="system-node-port output">
                <span className="port-name output-port-name">{port.name}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  style={{ top: `${32 + 24 + i * 24}px` }}
                  className="port-handle"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.docs?.description && (
        <div className="system-node-description">
          {data.docs.description.slice(0, 80)}
          {data.docs.description.length > 80 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

export const SystemNodeType = memo(SystemNodeComponent);
