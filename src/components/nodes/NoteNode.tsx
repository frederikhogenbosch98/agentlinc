import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function FunctionNodeComponent({ data, selected }: any) {
  if (!data || data.kind !== 'function') return null;

  return (
    <div className={`system-node function-node ${selected ? 'selected' : ''}`}>
      <div className="system-node-header">
        <span className="function-node-logo">f(x)</span>
        <span className="system-node-name">{data.description ? data.description.split('\n')[0].slice(0, 40) : 'Function'}</span>
      </div>

      {data.description && data.description.includes('\n') && (
        <div className="function-node-body">
          {data.description.split('\n').slice(1).join('\n').slice(0, 100)}
        </div>
      )}

      <Handle type="target" position={Position.Left} id="in" className="port-handle" />
      <Handle type="source" position={Position.Right} id="out" className="port-handle" />
    </div>
  );
}

export const FunctionNodeType = memo(FunctionNodeComponent);
