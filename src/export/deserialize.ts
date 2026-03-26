import { nanoid } from 'nanoid';
import type { Project, AppNodeData, SystemNodeData, Subsystem } from '../types';
import { createEmptyDocs } from '../types';
import type { ExportSchema } from '../types/export';

export function deserializeProject(json: ExportSchema): Project {
  const nodes: Project['nodes'] = {};
  const edges: Project['edges'] = {};
  const subsystems: Record<string, Subsystem> = {};

  for (const [subsystemId, exportSub] of Object.entries(json.systems)) {
    const nodeIds: string[] = [];
    const edgeIds: string[] = [];
    const inputPortNodeIds: string[] = [];
    const outputPortNodeIds: string[] = [];

    // Create nodes
    let x = 200;
    for (const exportNode of exportSub.nodes) {
      const nodeId = exportNode.id || nanoid(10);
      const data: SystemNodeData = {
        kind: 'system',
        name: exportNode.name,
        inputs: exportNode.inputs.map((p, i) => ({ id: `in_${i}`, name: p.name })),
        outputs: exportNode.outputs.map((p, i) => ({ id: `out_${i}`, name: p.name })),
        subsystemId: exportNode.subsystem,
        docs: exportNode.docs || createEmptyDocs(),
      };
      nodes[nodeId] = { id: nodeId, position: { x, y: 200 }, data };
      nodeIds.push(nodeId);
      x += 280;
    }

    // Create IO port nodes
    if (exportSub.interface) {
      exportSub.interface.inputs.forEach((name, i) => {
        const ioId = nanoid(10);
        const data: AppNodeData = { kind: 'ioport', name, direction: 'input' };
        nodes[ioId] = { id: ioId, position: { x: 50, y: 100 + i * 120 }, data };
        nodeIds.push(ioId);
        inputPortNodeIds.push(ioId);
      });
      exportSub.interface.outputs.forEach((name, i) => {
        const ioId = nanoid(10);
        const data: AppNodeData = { kind: 'ioport', name, direction: 'output' };
        nodes[ioId] = { id: ioId, position: { x: 800, y: 100 + i * 120 }, data };
        nodeIds.push(ioId);
        outputPortNodeIds.push(ioId);
      });
    }

    // Create notes as note nodes
    let noteY = 50;
    for (const markdown of exportSub.notes) {
      const noteId = nanoid(10);
      const data: AppNodeData = { kind: 'note', markdown };
      nodes[noteId] = { id: noteId, position: { x: 50, y: noteY }, data };
      nodeIds.push(noteId);
      noteY += 150;
    }

    // Create edges (resolve by node name)
    for (const exportEdge of exportSub.edges) {
      const sourceNode = Object.values(nodes).find(
        (n) => n.data.kind === 'system' && (n.data as SystemNodeData).name === exportEdge.from.node && nodeIds.includes(n.id)
      );
      const targetNode = Object.values(nodes).find(
        (n) => n.data.kind === 'system' && (n.data as SystemNodeData).name === exportEdge.to.node && nodeIds.includes(n.id)
      );

      if (sourceNode && targetNode) {
        const edgeId = nanoid(10);
        const srcData = sourceNode.data as SystemNodeData;
        const tgtData = targetNode.data as SystemNodeData;
        const srcPort = srcData.outputs.find((p) => p.name === exportEdge.from.port);
        const tgtPort = tgtData.inputs.find((p) => p.name === exportEdge.to.port);

        if (srcPort && tgtPort) {
          edges[edgeId] = {
            id: edgeId,
            sourceNodeId: sourceNode.id,
            sourcePortId: srcPort.id,
            targetNodeId: targetNode.id,
            targetPortId: tgtPort.id,
          };
          edgeIds.push(edgeId);
        }
      }
    }

    subsystems[subsystemId] = {
      id: subsystemId,
      name: exportSub.name,
      nodeIds,
      edgeIds,
      inputPortNodeIds,
      outputPortNodeIds,
    };
  }

  return {
    name: json.project,
    rootSubsystemId: json.rootSubsystemId,
    nodes,
    edges,
    subsystems,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: json.version,
    },
  };
}
