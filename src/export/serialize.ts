import type { Project, SystemNodeData, FunctionNodeData } from '../types';
import type { ExportSchema, ExportSubsystem, ExportNode, ExportEdge } from '../types/export';

export function serializeProject(project: Project): ExportSchema {
  const systems: Record<string, ExportSubsystem> = {};

  for (const [subsystemId, subsystem] of Object.entries(project.subsystems)) {
    const nodes: ExportNode[] = [];
    const notes: string[] = [];
    const inputNames: string[] = [];
    const outputNames: string[] = [];

    for (const nodeId of subsystem.nodeIds) {
      const node = project.nodes[nodeId];
      if (!node) continue;

      if (node.data.kind === 'system') {
        const data = node.data as SystemNodeData;
        nodes.push({
          id: node.id,
          name: data.name,
          inputs: data.inputs.map((p) => ({ name: p.name })),
          outputs: data.outputs.map((p) => ({ name: p.name })),
          subsystem: data.subsystemId,
          docs: { ...data.docs },
        });
      } else if (node.data.kind === 'function') {
        const data = node.data as FunctionNodeData;
        if (data.description) {
          notes.push(data.description);
        }
      } else if (node.data.kind === 'ioport') {
        if (node.data.direction === 'input') {
          inputNames.push(node.data.name);
        } else {
          outputNames.push(node.data.name);
        }
      }
    }

    const edges: ExportEdge[] = [];
    for (const edgeId of subsystem.edgeIds) {
      const edge = project.edges[edgeId];
      if (!edge) continue;

      // Resolve port names
      const sourceNode = project.nodes[edge.sourceNodeId];
      const targetNode = project.nodes[edge.targetNodeId];
      if (!sourceNode || !targetNode) continue;

      const sourcePortName = edge.sourcePortId;
      const targetPortName = edge.targetPortId;

      // Use node name for readability
      const sourceNodeName = sourceNode.data.kind === 'system'
        ? (sourceNode.data as SystemNodeData).name
        : sourceNode.id;
      const targetNodeName = targetNode.data.kind === 'system'
        ? (targetNode.data as SystemNodeData).name
        : targetNode.id;

      edges.push({
        from: { node: sourceNodeName, port: sourcePortName },
        to: { node: targetNodeName, port: targetPortName },
      });
    }

    const exportSub: ExportSubsystem = {
      id: subsystemId,
      name: subsystem.name,
      nodes,
      edges,
      notes,
    };

    // Add interface for non-root subsystems
    if (inputNames.length > 0 || outputNames.length > 0) {
      exportSub.interface = { inputs: inputNames, outputs: outputNames };
    }

    systems[subsystemId] = exportSub;
  }

  return {
    version: '1.0',
    project: project.name,
    rootSubsystemId: project.rootSubsystemId,
    systems,
  };
}
