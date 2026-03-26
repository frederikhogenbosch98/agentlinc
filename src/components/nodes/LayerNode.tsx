import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LAYER_TYPES } from '../../types';

const LAYER_COLORS: Record<string, string> = {
  linear: '#3B82F6',
  conv2d: '#10B981',
  lstm: '#F59E0B',
  gru: '#F59E0B',
  maxpool2d: '#8B5CF6',
  avgpool2d: '#8B5CF6',
  dropout: '#6B7280',
  batchnorm: '#6B7280',
  relu: '#EF4444',
  sigmoid: '#EF4444',
  softmax: '#EF4444',
  flatten: '#6B7280',
};

function LayerNodeComponent({ data, selected }: any) {
  if (!data || data.kind !== 'layer') return null;

  const def = LAYER_TYPES.find((l) => l.value === data.layerType);
  const label = def?.label || data.layerType;
  const color = LAYER_COLORS[data.layerType] || '#6B7280';
  const params = data.params || {};
  const paramEntries = Object.entries(params);

  return (
    <div
      className={`layer-node ${selected ? 'selected' : ''}`}
      style={{ borderLeftColor: color }}
    >
      <div className="layer-node-header" style={{ color }}>
        {label}
      </div>

      {paramEntries.length > 0 && (
        <div className="layer-node-params">
          {paramEntries.map(([key, value]) => (
            <div key={key} className="layer-node-param">
              <span className="layer-node-param-key">{key}</span>
              <span className="layer-node-param-val">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      <Handle type="target" position={Position.Left} id="in" className="port-handle" />
      <Handle type="source" position={Position.Right} id="out" className="port-handle" />
    </div>
  );
}

export const LayerNodeType = memo(LayerNodeComponent);
