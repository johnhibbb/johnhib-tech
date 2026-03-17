import { Server, Cpu, HardDrive, Zap, RefreshCw, Shield } from "lucide-react";

const services = [
  { name: "OpenClaw Gateway", status: "online", detail: "pid 59314 · port 18789 · loopback", version: "2026.3.11" },
  { name: "Ollama", status: "online", detail: "http://127.0.0.1:11434 · mxbai-embed-large loaded", version: "0.17.7" },
  { name: "iMessage Bridge", status: "online", detail: "/opt/homebrew/bin/imsg · chat.db connected", version: "—" },
  { name: "LaunchAgent (autostart)", status: "online", detail: "ai.openclaw.gateway · KeepAlive: true", version: "—" },
  { name: "Discord Bot", status: "online", detail: "Message Content Intent enabled", version: "—" },
  { name: "Browser Control", status: "online", detail: "http://127.0.0.1:18791 · auth=password", version: "—" },
];

const config = [
  { key: "agents.defaults.model.primary", value: "anthropic/claude-sonnet-4-6" },
  { key: "agents.defaults.memorySearch.provider", value: "ollama" },
  { key: "agents.defaults.memorySearch.model", value: "mxbai-embed-large" },
  { key: "agents.defaults.memorySearch.query.hybrid.enabled", value: "true" },
  { key: "agents.defaults.memorySearch.query.hybrid.vectorWeight", value: "0.7" },
  { key: "agents.defaults.memorySearch.query.hybrid.textWeight", value: "0.3" },
  { key: "agents.defaults.memorySearch.query.hybrid.mmr.enabled", value: "true" },
  { key: "agents.defaults.memorySearch.query.hybrid.temporalDecay.enabled", value: "true" },
  { key: "agents.defaults.memorySearch.query.hybrid.temporalDecay.halfLifeDays", value: "30" },
  { key: "agents.defaults.heartbeat.every", value: "1h" },
  { key: "agents.defaults.heartbeat.model", value: "openrouter/minimax/minimax-m2.5" },
  { key: "agents.defaults.sandbox.mode", value: "off" },
  { key: "gateway.port", value: "18789" },
  { key: "gateway.bind", value: "loopback" },
  { key: "gateway.auth.mode", value: "password" },
  { key: "tools.elevated.enabled", value: "false" },
  { key: "tools.fs.workspaceOnly", value: "true" },
];

const security = [
  { label: "FileVault", status: "ON", ok: true },
  { label: "macOS Firewall", status: "ON", ok: true },
  { label: "Elevated Tools", status: "DISABLED", ok: true },
  { label: "Workspace-only FS", status: "ENABLED", ok: true },
  { label: "Auth Mode", status: "PASSWORD", ok: true },
  { label: "Sandbox Mode", status: "OFF (no Docker)", ok: true },
];

export default function System() {
  return (
    <div className="px-10 py-10 max-w-4xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Infrastructure</p>
        <h1 className="text-2xl font-semibold text-white">System</h1>
        <p className="text-sm text-zinc-500 mt-1">UTM macOS VM · Apple M1 Ultra · 8GB RAM · Darwin 25.3.0 arm64</p>
      </div>

      {/* Services */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Services</p>
        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {services.map((s, i) => (
            <div key={s.name}
              className="flex items-center justify-between px-5 py-3.5 border-b last:border-b-0"
              style={{
                borderColor: "rgba(255,255,255,0.05)",
                background: i % 2 === 0 ? "#0a0a0a" : "#000",
              }}>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  <div className="text-xs text-zinc-600 font-mono mt-0.5">{s.detail}</div>
                </div>
              </div>
              <div className="text-right">
                {s.version !== "—" && (
                  <span className="text-[10px] font-mono text-zinc-600">{s.version}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Config snapshot */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Active Config</p>
          <div className="rounded-xl border overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
            {config.map((c, i) => (
              <div key={c.key}
                className="px-4 py-2.5 border-b last:border-b-0 flex items-start justify-between gap-3"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span className="text-[10px] font-mono text-zinc-600 flex-1 truncate">{c.key}</span>
                <span className="text-[10px] font-mono text-zinc-300 flex-shrink-0">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security + Info */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Security Posture</p>
            <div className="rounded-xl border overflow-hidden"
              style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
              {security.map((s, i) => (
                <div key={s.label}
                  className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span className="text-xs text-zinc-500">{s.label}</span>
                  <span className="text-[10px] font-semibold font-mono"
                    style={{ color: s.ok ? "#4ade80" : "#f87171" }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace */}
          <div className="rounded-xl border px-5 py-4"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={12} className="text-zinc-600" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">Workspace</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 break-all leading-relaxed">
              /Users/maria/.openclaw/workspaceconfigured.
            </p>
          </div>

          {/* Update channel */}
          <div className="rounded-xl border px-5 py-4"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={12} className="text-zinc-600" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">Updates</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Channel: <span className="font-mono text-zinc-300">stable</span></span>
              <span className="text-xs text-emerald-400 font-mono">Up to date</span>
            </div>
            <p className="text-[10px] text-zinc-700 mt-1.5 font-mono">2026.3.11 (29dc654)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
