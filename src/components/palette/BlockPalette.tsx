import { useState, useMemo, type DragEvent } from 'react';
import type { AppNodeData, SystemType, LayerType, SystemNodeData } from '../../types';
import { createEmptyDocs, createDefaultModelConfig, LAYER_TYPES } from '../../types';
import { useGraphStore } from '../../store/useGraphStore';

interface PaletteBlock {
  label: string;
  systemType?: SystemType;
  defaultData: () => AppNodeData;
  icon: JSX.Element;
  submenu?: { label: string; defaultData: () => AppNodeData }[];
}

const SYSTEM_ICON = (
  <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="4" cy="9" r="1.5" fill="currentColor" />
    <circle cx="14" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

const PALETTE_BLOCKS: PaletteBlock[] = [
  {
    label: 'System',
    systemType: 'default',
    defaultData: () => ({
      kind: 'system',
      name: 'New System',
      systemType: 'default' as SystemType,
      inputs: [{ id: 'in_0', name: 'input' }],
      outputs: [{ id: 'out_0', name: 'output' }],
      docs: createEmptyDocs(),
    }),
    icon: SYSTEM_ICON,
    submenu: [
      {
        label: 'Default',
        defaultData: () => ({
          kind: 'system',
          name: 'New System',
          systemType: 'default' as SystemType,
          inputs: [{ id: 'in_0', name: 'input' }],
          outputs: [{ id: 'out_0', name: 'output' }],
          docs: createEmptyDocs(),
        }),
      },
      {
        label: 'Model',
        defaultData: () => ({
          kind: 'system',
          name: 'Model',
          systemType: 'model' as SystemType,
          inputs: [{ id: 'in_0', name: 'input' }],
          outputs: [{ id: 'out_0', name: 'output' }],
          docs: createEmptyDocs(),
          modelConfig: createDefaultModelConfig(),
          modelLayers: [],
        }),
      },
    ],
  },
  {
    label: 'Database',
    systemType: 'database',
    defaultData: () => ({
      kind: 'system',
      name: 'Database',
      systemType: 'database' as SystemType,
      inputs: [{ id: 'in_0', name: 'input' }],
      outputs: [{ id: 'out_0', name: 'output' }],
      docs: createEmptyDocs(),
    }),
    icon: (
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        <ellipse cx="9" cy="5" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 5v8c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Remote Server',
    systemType: 'remote-server',
    defaultData: () => ({
      kind: 'system',
      name: 'Remote Server',
      systemType: 'remote-server' as SystemType,
      inputs: [{ id: 'in_0', name: 'input' }],
      outputs: [{ id: 'out_0', name: 'output' }],
      docs: createEmptyDocs(),
    }),
    icon: (
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="5.5" r="1" fill="currentColor" />
        <circle cx="5" cy="12.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Custom Code',
    systemType: 'custom-code',
    defaultData: () => ({
      kind: 'system',
      name: 'Custom Code',
      systemType: 'custom-code' as SystemType,
      inputs: [{ id: 'in_0', name: 'input' }],
      outputs: [{ id: 'out_0', name: 'output' }],
      docs: createEmptyDocs(),
    }),
    icon: (
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        <path d="M6 5L2.5 9L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5L15.5 9L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="3" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Note',
    defaultData: () => ({
      kind: 'note',
      markdown: '',
    }),
    icon: (
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        <path d="M3 3h12v10l-4 4H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 13v4l4-4h-4z" fill="currentColor" opacity="0.3" />
        <line x1="6" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
];

function onDragStart(event: DragEvent, getData: () => AppNodeData) {
  const data = JSON.stringify(getData());
  event.dataTransfer.setData('application/agentlinc-block', data);
  event.dataTransfer.effectAllowed = 'move';
}

function PaletteItem({ block }: { block: PaletteBlock }) {
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (!block.submenu) {
    return (
      <div
        className={`palette-icon-item palette-type-${block.systemType || 'note'}`}
        draggable
        onDragStart={(e) => onDragStart(e, block.defaultData)}
        title={block.label}
      >
        {block.icon}
      </div>
    );
  }

  return (
    <div
      className="palette-icon-wrapper"
      onMouseEnter={() => setShowSubmenu(true)}
      onMouseLeave={() => setShowSubmenu(false)}
    >
      <div
        className={`palette-icon-item palette-type-${block.systemType || 'note'}`}
        draggable
        onDragStart={(e) => onDragStart(e, block.defaultData)}
        title={block.label}
      >
        {block.icon}
      </div>
      {showSubmenu && (
        <div className="palette-submenu">
          {block.submenu.map((sub) => (
            <div
              key={sub.label}
              className="palette-submenu-item"
              draggable
              onDragStart={(e) => onDragStart(e, sub.defaultData)}
            >
              {sub.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface LayerPaletteItem {
  type: LayerType;
  label: string;
  icon: JSX.Element;
  category: string;
}

const LAYER_ICON_MAP: Record<string, JSX.Element> = {
  linear: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <line x1="3" y1="14" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="3" cy="14" r="2" stroke="currentColor" strokeWidth="1" />
      <circle cx="15" cy="4" r="2" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  conv2d: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="10" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  lstm: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  gru: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  maxpool2d: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="2" x2="9" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1" />
      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
    </svg>
  ),
  avgpool2d: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="2" x2="9" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1" />
      <text x="9" y="10" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="sans-serif">μ</text>
    </svg>
  ),
  dropout: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      <circle cx="9" cy="5" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="13" cy="5" r="1.5" fill="currentColor" />
      <circle cx="5" cy="9" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="13" cy="9" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="5" cy="13" r="1.5" fill="currentColor" />
      <circle cx="9" cy="13" r="1.5" fill="currentColor" />
      <circle cx="13" cy="13" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  batchnorm: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <path d="M3 14 C5 4, 8 4, 9 9 C10 14, 13 14, 15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  relu: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <polyline points="3,12 9,12 15,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sigmoid: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <path d="M3 14 C6 14, 8 4, 15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  softmax: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <path d="M3 13 C5 13, 7 5, 9 5 C11 5, 13 13, 15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  flatten: (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="3" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 5h2v8H7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
};

function makeLayerData(type: LayerType): AppNodeData {
  const def = LAYER_TYPES.find((l) => l.value === type)!;
  return {
    kind: 'layer',
    layerType: type,
    params: { ...def.defaultParams },
  };
}

export function BlockPalette() {
  const project = useGraphStore((s) => s.project);
  const activeSubsystemId = useGraphStore((s) => s.activeSubsystemId);

  const isModelSubsystem = useMemo(() => {
    for (const node of Object.values(project.nodes)) {
      if (
        node.data.kind === 'system' &&
        (node.data as SystemNodeData).subsystemId === activeSubsystemId &&
        (node.data as SystemNodeData).systemType === 'model'
      ) {
        return true;
      }
    }
    return false;
  }, [project.nodes, activeSubsystemId]);

  if (isModelSubsystem) {
    return (
      <div className="sidebar sidebar-left palette-compact">
        <div className="palette-icons">
          {LAYER_TYPES.map((lt) => (
            <div
              key={lt.value}
              className="palette-icon-item palette-type-layer"
              draggable
              onDragStart={(e) => onDragStart(e, () => makeLayerData(lt.value))}
              title={lt.label}
            >
              {LAYER_ICON_MAP[lt.value] || (
                <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar sidebar-left palette-compact">
      <div className="palette-icons">
        {PALETTE_BLOCKS.map((block) => (
          <PaletteItem key={block.label} block={block} />
        ))}
      </div>
    </div>
  );
}
