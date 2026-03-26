# AgentLinc

A visual design tool for sketching algorithmic pipelines. Draw systems, connect them, drill into subsystems, and annotate everything — then export as JSON for AI-powered code generation.

## Getting Started

```bash
npm install
npm run dev
```

## Features

### Block Types

- **System** — A functional block with input/output. Double-click to open properties, click the down arrow to create/enter a subsystem.
  - **Default** — General-purpose system block
  - **Model** — ML model with training config (optimizer, lr, loss, scheduler, batch size, epochs) and a drag-and-drop layer builder
- **Function** — A connectable block with an `f(x)` badge for describing standalone functions
- **Database** — Bidirectional block (bottom handle) for database connections
- **Remote Server** — Bidirectional block (bottom handle) for API/server connections
- **Custom Code** — Block for custom code descriptions

### Model Builder

When inside a Model subsystem:
- The palette switches to **layer types**: Linear, Conv2D, LSTM, GRU, MaxPool2D, AvgPool2D, BatchNorm, Dropout, ReLU, Sigmoid, Softmax, Flatten
- Layers snap to a **horizontal rail** and auto-connect in sequence
- Drag layers to **reorder** — they redistribute evenly on drop
- Double-click a layer to **edit its parameters** (in_features, kernel_size, etc.)
- **Training config** panel shows when no layer is selected (optimizer, lr, loss function, scheduler, batch size, epochs)

### General

- **Subsystems** — Hierarchical navigation. Click the down arrow on any system to drill in, breadcrumbs to go back, browser back button also works.
- **Properties Panel** — Edit block name, type, and documentation (Description, Tests, Logging, Debug tabs with markdown)
- **Undo/Redo** — Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z
- **Duplicate** — Ctrl/Cmd+D
- **Delete** — Backspace or Delete key
- **Selection** — Left-click drag on canvas for selection box
- **Pan** — Middle mouse button (scroll wheel) drag
- **Light/Dark mode** — Toggle in the toolbar
- **Persistence** — Auto-saves to localStorage
- **Export/Import** — Download as `.agentlinc.json`, import to restore

## Tech Stack

- React + TypeScript
- [React Flow](https://reactflow.dev) — Node editor
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Vite](https://vitejs.dev) — Build tool

## Export Format

The exported JSON is designed to be read by an LLM (like Claude) and translated into Python code. Each system includes its documentation tabs (description, tests, logging, debug notes), giving the LLM enough context to generate production-quality code with proper tests and observability.
