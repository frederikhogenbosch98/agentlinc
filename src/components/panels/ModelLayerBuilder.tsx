import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { ModelLayer, LayerType } from '../../types';
import { LAYER_TYPES } from '../../types';

interface Props {
  layers: ModelLayer[];
  onChange: (layers: ModelLayer[]) => void;
}

export function ModelLayerBuilder({ layers, onChange }: Props) {
  const addLayer = useCallback(
    (type: LayerType) => {
      const def = LAYER_TYPES.find((l) => l.value === type)!;
      const newLayer: ModelLayer = {
        id: nanoid(8),
        type,
        params: { ...def.defaultParams },
      };
      onChange([...layers, newLayer]);
    },
    [layers, onChange]
  );

  const removeLayer = useCallback(
    (id: string) => {
      onChange(layers.filter((l) => l.id !== id));
    },
    [layers, onChange]
  );

  const moveLayer = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= layers.length) return;
      const newLayers = [...layers];
      [newLayers[index], newLayers[newIdx]] = [newLayers[newIdx], newLayers[index]];
      onChange(newLayers);
    },
    [layers, onChange]
  );

  const updateLayerParam = useCallback(
    (id: string, key: string, value: any) => {
      onChange(
        layers.map((l) =>
          l.id === id ? { ...l, params: { ...l.params, [key]: value } } : l
        )
      );
    },
    [layers, onChange]
  );

  return (
    <div className="layer-builder">
      <div className="layer-builder-header">
        <span className="prop-label">Layers ({layers.length})</span>
        <div className="layer-add-dropdown">
          <select
            className="prop-input prop-select layer-add-select"
            value=""
            onChange={(e) => {
              if (e.target.value) addLayer(e.target.value as LayerType);
              e.target.value = '';
            }}
          >
            <option value="">+ Add layer...</option>
            <optgroup label="Linear">
              <option value="linear">Linear</option>
            </optgroup>
            <optgroup label="Convolution">
              <option value="conv2d">Conv2D</option>
            </optgroup>
            <optgroup label="Recurrent">
              <option value="lstm">LSTM</option>
              <option value="gru">GRU</option>
            </optgroup>
            <optgroup label="Pooling">
              <option value="maxpool2d">MaxPool2D</option>
              <option value="avgpool2d">AvgPool2D</option>
            </optgroup>
            <optgroup label="Normalization">
              <option value="batchnorm">BatchNorm</option>
              <option value="dropout">Dropout</option>
            </optgroup>
            <optgroup label="Activation">
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="softmax">Softmax</option>
            </optgroup>
            <optgroup label="Utility">
              <option value="flatten">Flatten</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="layer-list">
        {layers.length === 0 && (
          <div className="layer-empty">No layers yet. Add one above.</div>
        )}
        {layers.map((layer, i) => {
          const def = LAYER_TYPES.find((l) => l.value === layer.type);
          return (
            <div key={layer.id} className="layer-item">
              <div className="layer-item-header">
                <span className="layer-item-index">{i + 1}</span>
                <span className="layer-item-name">{def?.label || layer.type}</span>
                <div className="layer-item-actions">
                  <button
                    className="layer-btn"
                    onClick={() => moveLayer(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                  >
                    &#x25B2;
                  </button>
                  <button
                    className="layer-btn"
                    onClick={() => moveLayer(i, 1)}
                    disabled={i === layers.length - 1}
                    title="Move down"
                  >
                    &#x25BC;
                  </button>
                  <button
                    className="layer-btn layer-btn-remove"
                    onClick={() => removeLayer(layer.id)}
                    title="Remove"
                  >
                    &#x2715;
                  </button>
                </div>
              </div>
              {Object.keys(layer.params).length > 0 && (
                <div className="layer-item-params">
                  {Object.entries(layer.params).map(([key, value]) => (
                    <div key={key} className="layer-param">
                      <label className="layer-param-label">{key}</label>
                      {typeof value === 'boolean' ? (
                        <input
                          type="checkbox"
                          className="layer-param-checkbox"
                          checked={value}
                          onChange={(e) => updateLayerParam(layer.id, key, e.target.checked)}
                        />
                      ) : (
                        <input
                          className="prop-input layer-param-input"
                          type="number"
                          value={value}
                          onChange={(e) => {
                            const num = parseFloat(e.target.value);
                            updateLayerParam(layer.id, key, isNaN(num) ? e.target.value : num);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
