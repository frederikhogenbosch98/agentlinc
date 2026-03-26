import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function IOPortNodeComponent({ data, selected }: any) {
  if (!data || data.kind !== 'ioport') return null;
  const isInput = data.direction === 'input';

  return (
    <div className={`ioport-node ${isInput ? 'input' : 'output'} ${selected ? 'selected' : ''}`}>
      <div className="ioport-node-label">
        {isInput ? 'IN' : 'OUT'}
      </div>
      <div className="ioport-node-name">{data.name}</div>
      <Handle
        type={isInput ? 'source' : 'target'}
        position={isInput ? Position.Right : Position.Left}
        id="port"
        className="port-handle"
      />
    </div>
  );
}

export const IOPortNodeType = memo(IOPortNodeComponent);
