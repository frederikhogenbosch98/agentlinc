export interface ExportSchema {
  version: '1.0';
  project: string;
  systems: Record<string, ExportSubsystem>;
  rootSubsystemId: string;
}

export interface ExportSubsystem {
  id: string;
  name: string;
  docs?: ExportDocs;
  interface?: {
    inputs: string[];
    outputs: string[];
  };
  nodes: ExportNode[];
  edges: ExportEdge[];
  notes: string[];
}

export interface ExportNode {
  id: string;
  name: string;
  inputs: { name: string }[];
  outputs: { name: string }[];
  subsystem?: string;
  docs: ExportDocs;
}

export interface ExportEdge {
  from: { node: string; port: string };
  to: { node: string; port: string };
}

export interface ExportDocs {
  description: string;
  tests: string;
  logging: string;
  debug: string;
}
