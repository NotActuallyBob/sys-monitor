# Sys Monitor

A lightweight cross-platform system monitoring dashboard built with Tauri, React, and TypeScript.

Sys Monitor gives you a live view of your machine’s health with real-time CPU utilization, per-core charts, and memory usage trends. It is designed to run as a native desktop app while keeping the frontend easy to build and extend.

<img width="620" height="380" alt="image" src="https://github.com/user-attachments/assets/159e2168-2836-447b-a107-42e812c9bd35" />

## Features

- Live overall CPU usage tracking
- Per-core CPU performance graphs
- Memory usage and total memory overview
- Historical memory trend visualization
- Clean dashboard layout with tabbed views for General, CPU, and Memory
- Native desktop app experience via Tauri
- Built with React + Vite for a fast frontend workflow

## Tech Stack

- Frontend: React, TypeScript, Vite
- Desktop runtime: Tauri 2
- Native system metrics: Rust + sysinfo
- Charts: Recharts

## Project Structure

```text
sys-monitor/
├── src/                  # React frontend
├── src-tauri/            # Tauri/Rust backend
├── public/               # Static assets
├── index.html            # App entry
├── package.json          # Frontend scripts and dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── README.md             # Project documentation
└── src-tauri/Cargo.toml  # Rust project configuration
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ and npm
- Rust stable toolchain
- A working Tauri development environment for your platform

For Windows, this usually means the Visual Studio C++ build tools and the usual Rust toolchain setup. For Linux and macOS, follow the Tauri prerequisites for your OS.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the app in development mode:

```bash
npm run tauri dev
```

This will launch the Tauri app and begin the frontend hot-reload workflow alongside the Rust backend.

## Production Build

To build the app for distribution:

```bash
npm run tauri build
```

For a frontend-only build, you can also run:

```bash
npm run build
```

## How It Works

The Rust backend exposes a `get_system_stats` command via Tauri. It reads live system metrics using the `sysinfo` crate and sends them to the frontend for rendering.

The React UI polls these metrics once per second and renders:

- Overall CPU usage
- Per-core CPU load charts
- Memory usage over time

## Development Notes

- The frontend logic lives in `src/App.tsx`.
- The system metrics model is defined in `src/models/SystemData.ts`.
- The backend implementation is in `src-tauri/src/lib.rs`.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri VS Code extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

This project is provided for learning and personal use. Add your preferred license here if you plan to distribute it.

## Roadmap Ideas

- Add disk usage monitoring
- Add network throughput charts
- Include temperature and fan metrics where available
- Support configurable refresh intervals
- Add dark/light theme switching
