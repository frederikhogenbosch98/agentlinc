import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SYSTEM_TYPES } from '../../types';
import { useGraphStore } from '../../store/useGraphStore';

const BIDIRECTIONAL_TYPES = new Set(['database', 'remote-server']);

function SystemNodeComponent({ id, data, selected }: any) {
  if (!data || data.kind !== 'system') return null;
  const hasSubsystem = Boolean(data.subsystemId);
  const typeLabel = SYSTEM_TYPES.find((t) => t.value === data.systemType)?.label || 'Default';
  const isBidirectional = BIDIRECTIONAL_TYPES.has(data.systemType);

  const navigateInto = useGraphStore((s) => s.navigateInto);
  const createSubsystem = useGraphStore((s) => s.createSubsystem);

  const handleSubsystemClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (data.subsystemId) {
        navigateInto(data.subsystemId);
      } else {
        const subId = createSubsystem(id);
        navigateInto(subId);
      }
    },
    [id, data.subsystemId, navigateInto, createSubsystem]
  );

  return (
    <div
      className={`system-node ${selected ? 'selected' : ''} ${hasSubsystem ? 'has-subsystem' : ''}`}
    >
      <div className="system-node-header">
        <span className="system-node-name">{data.name}</span>
        <button
          className="system-node-subsystem-btn"
          onClick={handleSubsystemClick}
          title={hasSubsystem ? 'Open subsystem' : 'Create subsystem'}
        >
          &#x25BC;
        </button>
      </div>

      <div className={`system-node-type system-type-${data.systemType || 'default'}`}>
        {typeLabel}
      </div>

      {isBidirectional ? (
        /* Single handle on the bottom that accepts both in and out */
        <>
          <Handle type="target" position={Position.Bottom} id="io" className="port-handle port-handle-bidi" />
          <Handle type="source" position={Position.Bottom} id="io" className="port-handle port-handle-bidi" />
        </>
      ) : (
        <>
          <Handle type="target" position={Position.Left} id="in" className="port-handle" />
          <Handle type="source" position={Position.Right} id="out" className="port-handle" />
        </>
      )}
    </div>
  );
}

export const SystemNodeType = memo(SystemNodeComponent);
