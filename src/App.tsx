import { useEffect, useRef, useState, type CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SystemData, SystemDataRecord } from "./models/SystemData";
import "./App.css";

function App() {
  const [activeView, setActiveView] = useState<"General" | "CPU" | "Memory">("General");
  const [stats, setStats] = useState<SystemDataRecord[]>([]);
  const skippedInitialSamples = useRef(0);

  useEffect(() => {
    async function updateStats() {
      try {
        const stats = await invoke<SystemData>("get_system_stats");

        setStats(prevStats => {
          if (skippedInitialSamples.current < 2) {
            skippedInitialSamples.current += 1;
            return prevStats;
          }

          return [
            ...prevStats.slice(-59),
            { timestamp: new Date(), stats },
          ];
        });
      } catch (err) {
        console.error(err);
      }
    }

    updateStats();
    const intervalId = setInterval(updateStats, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const latestStats = stats[stats.length - 1]?.stats;
  const cpu = latestStats?.cpu_usage.toFixed(2) ?? "N/A";
  const memoryUsed = latestStats ? `${latestStats.memory_used.toFixed(0)} MB` : "N/A";
  const maximumMemory = latestStats ? `${latestStats.memory_total.toFixed(0)} MB` : "N/A";
  const coreHistories = latestStats?.cores.map((core, coreIndex) => ({
    name: core.name || `Core ${coreIndex + 1}`,
    data: stats.map(({ timestamp, stats: sample }) => ({
      time: timestamp.toLocaleTimeString(),
      cpu: Number(sample.cores[coreIndex]?.cpu_usage.toFixed(2) ?? 0),
    })),
  })) ?? [];
  const coreColumns = Math.min(
    coreHistories.length,
    Math.max(1, Math.ceil(Math.sqrt(coreHistories.length * 2))),
  );
  const coreRows = Math.max(1, Math.ceil(coreHistories.length / coreColumns));
  const gridStyle = {
    "--core-columns": coreColumns,
    "--core-rows": coreRows,
  } as CSSProperties;
  const memoryHistory = stats.map(({ timestamp, stats: sample }) => ({
    time: timestamp.toLocaleTimeString(),
    memory: sample.memory_used,
    maximum: sample.memory_total,
  }));
  const views = ["General", "CPU", "Memory"] as const;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">System Monitor</div>
        <nav className="sidebar-nav" aria-label="Dashboard views">
          {views.map((view) => (
            <button
              className={activeView === view ? "nav-item active" : "nav-item"}
              key={view}
              onClick={() => setActiveView(view)}
              type="button"
            >
              {view}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content-panel">
        <header className="page-header">
          <p className="eyebrow">Live telemetry</p>
          <h1>{activeView}</h1>
        </header>

        {activeView === "General" && (
          <div className="summary-grid">
            <section className="card summary-card">
              <span>Overall CPU</span>
              <strong>{cpu}%</strong>
            </section>
            <section className="card summary-card">
              <span>Memory used</span>
              <strong>{memoryUsed}</strong>
            </section>
            <section className="card summary-card">
              <span>Maximum memory</span>
              <strong>{maximumMemory}</strong>
            </section>
            <section className="card summary-card">
              <span>Logical processors</span>
              <strong>{latestStats?.cores.length ?? "N/A"}</strong>
            </section>
          </div>
        )}

        {activeView === "CPU" && (
          <div className="core-charts-grid" style={gridStyle}>
            {coreHistories.map((core) => (
              <section className="card core-chart-card" key={core.name}>
                <h2>{core.name}</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={core.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} unit="%" width={34} tickCount={3} />
                      <Tooltip formatter={(value) => [`${value}%`, "CPU"]} />
                      <Line type="monotone" dataKey="cpu" stroke="#24c8db" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            ))}
          </div>
        )}

        {activeView === "Memory" && (
          <section className="card memory-card">
            <h2>Memory Usage History</h2>
            <div className="memory-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoryHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit=" MB" />
                  <Tooltip formatter={(value, name) => [`${value} MB`, name === "maximum" ? "Maximum" : "Used"]} />
                  <Line type="monotone" dataKey="memory" stroke="#f29f58" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="maximum" stroke="#607d98" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

      </section>
    </main>
  );
}

export default App;
