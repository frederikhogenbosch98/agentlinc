import { type DragEvent } from 'react';
import type { AppNodeData } from '../../types';
import { createEmptyDocs } from '../../types';

interface PaletteBlock {
  label: string;
  description: string;
  kind: AppNodeData['kind'];
  defaultData: () => AppNodeData;
}

const PALETTE_BLOCKS: PaletteBlock[] = [
  {
    label: 'System',
    description: 'A functional block with inputs and outputs',
    kind: 'system',
    defaultData: () => ({
      kind: 'system',
      name: 'New System',
      inputs: [{ id: 'in_0', name: 'input' }],
      outputs: [{ id: 'out_0', name: 'output' }],
      docs: createEmptyDocs(),
    }),
  },
  {
    label: 'Note',
    description: 'A floating markdown annotation',
    kind: 'note',
    defaultData: () => ({
      kind: 'note',
      markdown: '',
    }),
  },
  {
    label: 'Input Port',
    description: 'Defines a subsystem input',
    kind: 'ioport',
    defaultData: () => ({
      kind: 'ioport',
      name: 'input',
      direction: 'input' as const,
    }),
  },
  {
    label: 'Output Port',
    description: 'Defines a subsystem output',
    kind: 'ioport',
    defaultData: () => ({
      kind: 'ioport',
      name: 'output',
      direction: 'output' as const,
    }),
  },
];

function onDragStart(event: DragEvent, block: PaletteBlock) {
  const data = JSON.stringify(block.defaultData());
  event.dataTransfer.setData('application/agentlinc-block', data);
  event.dataTransfer.effectAllowed = 'move';
}

export function BlockPalette() {
  return (
    <div className="sidebar sidebar-left">
      <div className="sidebar-header">Blocks</div>
      <div className="sidebar-content">
        <div className="palette-list">
          {PALETTE_BLOCKS.map((block) => (
            <div
              key={block.label}
              className={`palette-item palette-item-${block.kind}`}
              draggable
              onDragStart={(e) => onDragStart(e, block)}
            >
              <div className="palette-item-icon">
                {block.kind === 'system' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="4" cy="9" r="1.5" fill="currentColor" />
                    <circle cx="14" cy="9" r="1.5" fill="currentColor" />
                  </svg>
                )}
                {block.kind === 'note' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 3h12v10l-4 4H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M11 13v4l4-4h-4z" fill="currentColor" opacity="0.3" />
                    <line x1="6" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1" />
                    <line x1="6" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1" />
                  </svg>
                )}
                {block.kind === 'ioport' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                    {block.label === 'Input Port' ? (
                      <path d="M7 9h5M10 7l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M6 9h5M9 7l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                )}
              </div>
              <div className="palette-item-text">
                <div className="palette-item-label">{block.label}</div>
                <div className="palette-item-desc">{block.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
