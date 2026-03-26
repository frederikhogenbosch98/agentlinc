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

export type NodeKind = 'system' | 'function' | 'ioport' | 'layer';

export type SystemType = 'default' | 'model' | 'ml-model' | 'dataloader' | 'database' | 'remote-server' | 'custom-code';

export const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'model', label: 'Model' },
  { value: 'ml-model', label: 'ML Model' },
  { value: 'dataloader', label: 'Dataloader' },
  { value: 'database', label: 'Database' },
  { value: 'remote-server', label: 'Remote Server' },
  { value: 'custom-code', label: 'Custom Code' },
];

// === Model types ===

export type LayerType = 'linear' | 'conv2d' | 'lstm' | 'gru' | 'maxpool2d' | 'avgpool2d' | 'dropout' | 'batchnorm' | 'relu' | 'sigmoid' | 'softmax' | 'flatten';

export const LAYER_TYPES: { value: LayerType; label: string; defaultParams: Record<string, any> }[] = [
  { value: 'linear', label: 'Linear', defaultParams: { in_features: 128, out_features: 64 } },
  { value: 'conv2d', label: 'Conv2D', defaultParams: { in_channels: 3, out_channels: 16, kernel_size: 3, stride: 1, padding: 1 } },
  { value: 'lstm', label: 'LSTM', defaultParams: { input_size: 128, hidden_size: 64, num_layers: 1, bidirectional: false } },
  { value: 'gru', label: 'GRU', defaultParams: { input_size: 128, hidden_size: 64, num_layers: 1, bidirectional: false } },
  { value: 'maxpool2d', label: 'MaxPool2D', defaultParams: { kernel_size: 2, stride: 2 } },
  { value: 'avgpool2d', label: 'AvgPool2D', defaultParams: { kernel_size: 2, stride: 2 } },
  { value: 'dropout', label: 'Dropout', defaultParams: { p: 0.5 } },
  { value: 'batchnorm', label: 'BatchNorm', defaultParams: { num_features: 64 } },
  { value: 'relu', label: 'ReLU', defaultParams: {} },
  { value: 'sigmoid', label: 'Sigmoid', defaultParams: {} },
  { value: 'softmax', label: 'Softmax', defaultParams: { dim: 1 } },
  { value: 'flatten', label: 'Flatten', defaultParams: {} },
];

export interface ModelLayer {
  id: string;
  type: LayerType;
  params: Record<string, any>;
}

export type LossFunction = 'cross_entropy' | 'mse' | 'bce' | 'bce_with_logits' | 'l1' | 'smooth_l1' | 'nll';
export type LRScheduler = 'none' | 'step' | 'cosine' | 'exponential' | 'reduce_on_plateau';

export interface ModelConfig {
  lr: number;
  lossFunction: LossFunction;
  lrScheduler: LRScheduler;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'adamw' | 'rmsprop';
}

export function createDefaultModelConfig(): ModelConfig {
  return {
    lr: 0.001,
    lossFunction: 'cross_entropy',
    lrScheduler: 'none',
    batchSize: 32,
    epochs: 10,
    optimizer: 'adam',
  };
}

export interface SystemNodeData {
  kind: 'system';
  name: string;
  systemType: SystemType;
  inputs: Port[];
  outputs: Port[];
  subsystemId?: string;
  docs: Docs;
  // Model-specific (only when systemType === 'model')
  modelConfig?: ModelConfig;
  modelLayers?: ModelLayer[];
}

export interface FunctionNodeData {
  kind: 'function';
  description: string;
}

export interface IOPortNodeData {
  kind: 'ioport';
  name: string;
  direction: 'input' | 'output';
}

export interface LayerNodeData {
  kind: 'layer';
  layerType: LayerType;
  params: Record<string, any>;
}

export type AppNodeData = SystemNodeData | FunctionNodeData | IOPortNodeData | LayerNodeData;

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
