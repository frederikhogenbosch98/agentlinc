import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  Project,
  AppNodeData,
  AppEdge,
  SystemNodeData,
  Subsystem,
} from '../types';
import { createDefaultProject, createEmptyDocs } from '../types';
import { useHistoryStore } from './useHistoryStore';

interface GraphState {
  project: Project;
  activeSubsystemId: string;
  navigationStack: string[];

  // Selectors
  getActiveSubsystem: () => Subsystem;
  getActiveNodes: () => { id: string; position: { x: number; y: number }; data: AppNodeData }[];
  getActiveEdges: () => AppEdge[];

  // Node mutations
  addNode: (data: AppNodeData, position: { x: number; y: number }) => string;
  removeNodes: (nodeIds: string[]) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<AppNodeData>) => void;

  // Edge mutations
  addEdge: (edge: Omit<AppEdge, 'id'>) => string;
  removeEdges: (edgeIds: string[]) => void;

  // Subsystem navigation
  navigateInto: (subsystemId: string) => void;
  navigateUp: () => void;
  navigateTo: (subsystemId: string) => void;

  // Subsystem management
  createSubsystem: (parentNodeId: string) => string;

  // Duplicate
  duplicateNodes: (nodeIds: string[]) => string[];

  // Project
  setProject: (project: Project) => void;
  setProjectName: (name: string) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  project: createDefaultProject(),
  activeSubsystemId: 'root',
  navigationStack: ['root'],

  getActiveSubsystem: () => {
    const { project, activeSubsystemId } = get();
    return project.subsystems[activeSubsystemId];
  },

  getActiveNodes: () => {
    const { project } = get();
    const subsystem = get().getActiveSubsystem();
    if (!subsystem) return [];
    return subsystem.nodeIds
      .map((id) => project.nodes[id])
      .filter(Boolean);
  },

  getActiveEdges: () => {
    const { project } = get();
    const subsystem = get().getActiveSubsystem();
    if (!subsystem) return [];
    return subsystem.edgeIds
      .map((id) => project.edges[id])
      .filter(Boolean);
  },

  addNode: (data, position) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    const id = nanoid(10);
    set((state) => {
      const subsystem = state.project.subsystems[state.activeSubsystemId];
      if (!subsystem) return state;
      return {
        project: {
          ...state.project,
          nodes: {
            ...state.project.nodes,
            [id]: { id, position, data },
          },
          subsystems: {
            ...state.project.subsystems,
            [state.activeSubsystemId]: {
              ...subsystem,
              nodeIds: [...subsystem.nodeIds, id],
            },
          },
          metadata: {
            ...state.project.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
    return id;
  },

  removeNodes: (nodeIds) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    set((state) => {
      const nodeIdSet = new Set(nodeIds);
      const subsystem = state.project.subsystems[state.activeSubsystemId];
      if (!subsystem) return state;

      // Remove edges connected to these nodes
      const edgesToRemove = new Set<string>();
      for (const edgeId of subsystem.edgeIds) {
        const edge = state.project.edges[edgeId];
        if (edge && (nodeIdSet.has(edge.sourceNodeId) || nodeIdSet.has(edge.targetNodeId))) {
          edgesToRemove.add(edgeId);
        }
      }

      const newNodes = { ...state.project.nodes };
      for (const id of nodeIds) delete newNodes[id];

      const newEdges = { ...state.project.edges };
      for (const id of edgesToRemove) delete newEdges[id];

      return {
        project: {
          ...state.project,
          nodes: newNodes,
          edges: newEdges,
          subsystems: {
            ...state.project.subsystems,
            [state.activeSubsystemId]: {
              ...subsystem,
              nodeIds: subsystem.nodeIds.filter((id) => !nodeIdSet.has(id)),
              edgeIds: subsystem.edgeIds.filter((id) => !edgesToRemove.has(id)),
            },
          },
          metadata: {
            ...state.project.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  },

  updateNodePosition: (nodeId, position) => {
    set((state) => {
      const node = state.project.nodes[nodeId];
      if (!node) return state;
      return {
        project: {
          ...state.project,
          nodes: {
            ...state.project.nodes,
            [nodeId]: { ...node, position },
          },
        },
      };
    });
  },

  updateNodeData: (nodeId, partialData) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    set((state) => {
      const node = state.project.nodes[nodeId];
      if (!node) return state;
      return {
        project: {
          ...state.project,
          nodes: {
            ...state.project.nodes,
            [nodeId]: {
              ...node,
              data: { ...node.data, ...partialData } as AppNodeData,
            },
          },
          metadata: {
            ...state.project.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  },

  addEdge: (edgeData) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    const id = nanoid(10);
    const edge: AppEdge = { id, ...edgeData };
    set((state) => {
      const subsystem = state.project.subsystems[state.activeSubsystemId];
      if (!subsystem) return state;
      return {
        project: {
          ...state.project,
          edges: {
            ...state.project.edges,
            [id]: edge,
          },
          subsystems: {
            ...state.project.subsystems,
            [state.activeSubsystemId]: {
              ...subsystem,
              edgeIds: [...subsystem.edgeIds, id],
            },
          },
          metadata: {
            ...state.project.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
    return id;
  },

  removeEdges: (edgeIds) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    set((state) => {
      const edgeIdSet = new Set(edgeIds);
      const subsystem = state.project.subsystems[state.activeSubsystemId];
      if (!subsystem) return state;

      const newEdges = { ...state.project.edges };
      for (const id of edgeIds) delete newEdges[id];

      return {
        project: {
          ...state.project,
          edges: newEdges,
          subsystems: {
            ...state.project.subsystems,
            [state.activeSubsystemId]: {
              ...subsystem,
              edgeIds: subsystem.edgeIds.filter((id) => !edgeIdSet.has(id)),
            },
          },
        },
      };
    });
  },

  navigateInto: (subsystemId) => {
    set((state) => ({
      activeSubsystemId: subsystemId,
      navigationStack: [...state.navigationStack, subsystemId],
    }));
    history.pushState({ subsystemId }, '');
  },

  navigateUp: () => {
    set((state) => {
      if (state.navigationStack.length <= 1) return state;
      const newStack = state.navigationStack.slice(0, -1);
      return {
        activeSubsystemId: newStack[newStack.length - 1],
        navigationStack: newStack,
      };
    });
  },

  navigateTo: (subsystemId) => {
    set((state) => {
      const idx = state.navigationStack.indexOf(subsystemId);
      if (idx === -1) return state;
      const newStack = state.navigationStack.slice(0, idx + 1);
      return {
        activeSubsystemId: subsystemId,
        navigationStack: newStack,
      };
    });
  },

  createSubsystem: (parentNodeId) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    const subsystemId = nanoid(10);
    set((state) => {
      const parentNode = state.project.nodes[parentNodeId];
      if (!parentNode || parentNode.data.kind !== 'system') return state;

      const systemData = parentNode.data as SystemNodeData;

      // Create IO port nodes for each input/output of the parent
      const newNodes: typeof state.project.nodes = {};
      const inputPortNodeIds: string[] = [];
      const outputPortNodeIds: string[] = [];

      systemData.inputs.forEach((port, i) => {
        const ioId = nanoid(10);
        newNodes[ioId] = {
          id: ioId,
          position: { x: 50, y: 100 + i * 120 },
          data: { kind: 'ioport', name: port.name, direction: 'input' },
        };
        inputPortNodeIds.push(ioId);
      });

      systemData.outputs.forEach((port, i) => {
        const ioId = nanoid(10);
        newNodes[ioId] = {
          id: ioId,
          position: { x: 600, y: 100 + i * 120 },
          data: { kind: 'ioport', name: port.name, direction: 'output' },
        };
        outputPortNodeIds.push(ioId);
      });

      return {
        project: {
          ...state.project,
          nodes: {
            ...state.project.nodes,
            ...newNodes,
            [parentNodeId]: {
              ...parentNode,
              data: { ...systemData, subsystemId },
            },
          },
          subsystems: {
            ...state.project.subsystems,
            [subsystemId]: {
              id: subsystemId,
              name: systemData.name,
              nodeIds: [...inputPortNodeIds, ...outputPortNodeIds],
              edgeIds: [],
              inputPortNodeIds,
              outputPortNodeIds,
            },
          },
        },
      };
    });
    return subsystemId;
  },

  duplicateNodes: (nodeIds) => {
    useHistoryStore.getState().pushSnapshot(get().project);
    const newIds: string[] = [];
    set((state) => {
      const subsystem = state.project.subsystems[state.activeSubsystemId];
      if (!subsystem) return state;

      const newNodes = { ...state.project.nodes };
      const addedIds: string[] = [];

      for (const oldId of nodeIds) {
        const oldNode = state.project.nodes[oldId];
        if (!oldNode) continue;
        const newId = nanoid(10);
        addedIds.push(newId);

        // Deep clone data, strip subsystemId so the duplicate is independent
        const clonedData = JSON.parse(JSON.stringify(oldNode.data));
        if (clonedData.kind === 'system') {
          delete clonedData.subsystemId;
        }

        // Re-generate port IDs for system nodes
        if (clonedData.kind === 'system') {
          clonedData.inputs = clonedData.inputs.map((p: any) => ({
            ...p,
            id: `in_${nanoid(6)}`,
          }));
          clonedData.outputs = clonedData.outputs.map((p: any) => ({
            ...p,
            id: `out_${nanoid(6)}`,
          }));
        }

        newNodes[newId] = {
          id: newId,
          position: { x: oldNode.position.x + 40, y: oldNode.position.y + 40 },
          data: clonedData,
        };
      }

      newIds.push(...addedIds);

      return {
        project: {
          ...state.project,
          nodes: newNodes,
          subsystems: {
            ...state.project.subsystems,
            [state.activeSubsystemId]: {
              ...subsystem,
              nodeIds: [...subsystem.nodeIds, ...addedIds],
            },
          },
          metadata: {
            ...state.project.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
    return newIds;
  },

  setProject: (project) => {
    set({
      project,
      activeSubsystemId: project.rootSubsystemId,
      navigationStack: [project.rootSubsystemId],
    });
  },

  setProjectName: (name) => {
    set((state) => ({
      project: { ...state.project, name },
    }));
  },
}));
