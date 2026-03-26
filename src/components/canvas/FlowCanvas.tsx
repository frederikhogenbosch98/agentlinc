import { useCallback, useMemo, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from '../../store/useGraphStore';
import { useUIStore } from '../../store/useUIStore';
import { SystemNodeType } from '../nodes/SystemNode';
import { NoteNodeType } from '../nodes/NoteNode';
import { IOPortNodeType } from '../nodes/IOPortNode';
import { LayerNodeType } from '../nodes/LayerNode';
import { BidiEdge } from '../edges/BidiEdge';

const nodeTypes = {
  system: SystemNodeType,
  note: NoteNodeType,
  ioport: IOPortNodeType,
  layer: LayerNodeType,
} as const;

const edgeTypes = {
  bidi: BidiEdge,
} as const;

const BIDI_TYPES = new Set(['database', 'remote-server']);

export function FlowCanvas() {
  const { screenToFlowPosition } = useReactFlow();

  // Derive active nodes/edges directly from project + activeSubsystemId
  const project = useGraphStore((s) => s.project);
  const activeSubsystemId = useGraphStore((s) => s.activeSubsystemId);
  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);
  const addNodeAction = useGraphStore((s) => s.addNode);
  const addEdgeAction = useGraphStore((s) => s.addEdge);
  const removeNodes = useGraphStore((s) => s.removeNodes);
  const removeEdges = useGraphStore((s) => s.removeEdges);
  const selectNodes = useUIStore((s) => s.selectNodes);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const subsystem = project.subsystems[activeSubsystemId];

  const rfNodes: Node[] = useMemo(() => {
    if (!subsystem) return [];
    return subsystem.nodeIds
      .map((id) => project.nodes[id])
      .filter(Boolean)
      .map((node) => ({
        id: node.id,
        type: node.data.kind,
        position: node.position,
        data: node.data,
        selected: false,
      }));
  }, [subsystem, project.nodes]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!subsystem) return [];
    return subsystem.edgeIds
      .map((id) => project.edges[id])
      .filter(Boolean)
      .map((edge) => {
        const srcNode = project.nodes[edge.sourceNodeId];
        const tgtNode = project.nodes[edge.targetNodeId];
        const srcIsBidi = srcNode?.data?.kind === 'system' && BIDI_TYPES.has((srcNode.data as any).systemType);
        const tgtIsBidi = tgtNode?.data?.kind === 'system' && BIDI_TYPES.has((tgtNode.data as any).systemType);
        return {
          id: edge.id,
          source: edge.sourceNodeId,
          sourceHandle: edge.sourcePortId,
          target: edge.targetNodeId,
          targetHandle: edge.targetPortId,
          label: edge.label,
          type: (srcIsBidi || tgtIsBidi) ? 'bidi' : 'default',
        };
      });
  }, [subsystem, project.edges, project.nodes]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position);
        }
        if (change.type === 'remove') {
          removeNodes([change.id]);
        }
      }
    },
    [updateNodePosition, removeNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          removeEdges([change.id]);
        }
      }
    },
    [removeEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
        addEdgeAction({
          sourceNodeId: connection.source,
          sourcePortId: connection.sourceHandle,
          targetNodeId: connection.target,
          targetPortId: connection.targetHandle,
        });
      }
    },
    [addEdgeAction]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNodes([node.id]);
    },
    [selectNodes]
  );

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      if (nodes.length > 0) {
        selectNodes(nodes.map((n) => n.id));
      }
      // Don't clear selection here — it fires spuriously when nodes re-render.
      // Selection is cleared via onPaneClick instead.
    },
    [selectNodes, clearSelection]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/agentlinc-block');
      if (!raw) return;

      try {
        const data = JSON.parse(raw);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const nodeId = addNodeAction(data, position);
        selectNodes([nodeId]);
      } catch (err) {
        console.error('Drop failed:', err);
      }
    },
    [screenToFlowPosition, addNodeAction, selectNodes]
  );

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes as any}
        edgeTypes={edgeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={null}
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={1}
        multiSelectionKeyCode="Shift"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="flow-bg-dots" />
        <MiniMap
          nodeColor={(node: any) => {
            const data = node.data;
            if (data?.kind === 'system') return '#3B82F6';
            if (data?.kind === 'note') return '#F59E0B';
            if (data?.kind === 'ioport') return '#10B981';
            if (data?.kind === 'layer') return '#F472B6';
            return '#6B7280';
          }}
          className="flow-minimap"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
