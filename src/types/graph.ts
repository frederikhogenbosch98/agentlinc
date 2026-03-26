export interface Port {
  id: string;
  name: string;
  label?: string;
}

export interface Docs {
  description: string;
  tests: string;
  logging: string;
  debug: string;
}

export function createEmptyDocs(): Docs {
  return { description: '', tests: '', logging: '', debug: '' };
}

export type NodeKind = 'system' | 'note' | 'ioport';

export interface SystemNodeData {
  kind: 'system';
  name: string;
  inputs: Port[];
  outputs: Port[];
  subsystemId?: string;
  docs: Docs;
}

export interface NoteNodeData {
  kind: 'note';
  markdown: string;
}

export interface IOPortNodeData {
  kind: 'ioport';
  name: string;
  direction: 'input' | 'output';
}

export type AppNodeData = SystemNodeData | NoteNodeData | IOPortNodeData;

export interface AppEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
}

export interface Subsystem {
  id: string;
  name: string;
  nodeIds: string[];
  edgeIds: string[];
  inputPortNodeIds: string[];
  outputPortNodeIds: string[];
}

export interface Project {
  name: string;
  rootSubsystemId: string;
  nodes: Record<string, { id: string; position: { x: number; y: number }; data: AppNodeData }>;
  edges: Record<string, AppEdge>;
  subsystems: Record<string, Subsystem>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export function createDefaultProject(): Project {
  const rootId = 'root';
  return {
    name: 'Untitled Project',
    rootSubsystemId: rootId,
    nodes: {},
    edges: {},
    subsystems: {
      [rootId]: {
        id: rootId,
        name: 'Main',
        nodeIds: [],
        edgeIds: [],
        inputPortNodeIds: [],
        outputPortNodeIds: [],
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
    },
  };
}
