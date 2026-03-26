import { useCallback } from 'react';
import type { ModelConfig, LossFunction, LRScheduler } from '../../types';

const LOSS_OPTIONS: { value: LossFunction; label: string }[] = [
  { value: 'cross_entropy', label: 'CrossEntropyLoss' },
  { value: 'mse', label: 'MSELoss' },
  { value: 'bce', label: 'BCELoss' },
  { value: 'bce_with_logits', label: 'BCEWithLogitsLoss' },
  { value: 'l1', label: 'L1Loss' },
  { value: 'smooth_l1', label: 'SmoothL1Loss' },
  { value: 'nll', label: 'NLLLoss' },
];

const SCHEDULER_OPTIONS: { value: LRScheduler; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'step', label: 'StepLR' },
  { value: 'cosine', label: 'CosineAnnealingLR' },
  { value: 'exponential', label: 'ExponentialLR' },
  { value: 'reduce_on_plateau', label: 'ReduceOnPlateau' },
];

const OPTIMIZER_OPTIONS = [
  { value: 'adam', label: 'Adam' },
  { value: 'adamw', label: 'AdamW' },
  { value: 'sgd', label: 'SGD' },
  { value: 'rmsprop', label: 'RMSprop' },
];

interface Props {
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
}

export function ModelConfigEditor({ config, onChange }: Props) {
  const update = useCallback(
    (key: keyof ModelConfig, value: any) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange]
  );

  return (
    <div className="model-config">
      <div className="model-config-row">
        <label className="model-config-label">Optimizer</label>
        <select
          className="prop-input prop-select"
          value={config.optimizer}
          onChange={(e) => update('optimizer', e.target.value)}
        >
          {OPTIMIZER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="model-config-row">
        <label className="model-config-label">Learning Rate</label>
        <input
          className="prop-input"
          type="number"
          step="0.0001"
          min="0"
          value={config.lr}
          onChange={(e) => update('lr', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="model-config-row">
        <label className="model-config-label">Loss Function</label>
        <select
          className="prop-input prop-select"
          value={config.lossFunction}
          onChange={(e) => update('lossFunction', e.target.value)}
        >
          {LOSS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="model-config-row">
        <label className="model-config-label">LR Scheduler</label>
        <select
          className="prop-input prop-select"
          value={config.lrScheduler}
          onChange={(e) => update('lrScheduler', e.target.value)}
        >
          {SCHEDULER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="model-config-row">
        <label className="model-config-label">Batch Size</label>
        <input
          className="prop-input"
          type="number"
          min="1"
          value={config.batchSize}
          onChange={(e) => update('batchSize', parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="model-config-row">
        <label className="model-config-label">Epochs</label>
        <input
          className="prop-input"
          type="number"
          min="1"
          value={config.epochs}
          onChange={(e) => update('epochs', parseInt(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}
