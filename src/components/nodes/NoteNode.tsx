import { memo } from 'react';

function NoteNodeComponent({ data, selected }: any) {
  if (!data || data.kind !== 'note') return null;

  return (
    <div className={`note-node ${selected ? 'selected' : ''}`}>
      <div className="note-node-content">
        {data.markdown || 'Double-click to edit note...'}
      </div>
    </div>
  );
}

export const NoteNodeType = memo(NoteNodeComponent);
