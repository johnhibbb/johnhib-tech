import { Terminal, User, Bot, Wrench, Cpu, MessageSquare } from "lucide-react";

const skills = [
  { name: "discord", desc: "Discord messaging & ops" },
  { name: "healthcheck", desc: "Security audits & hardening" },
  { name: "imsg", desc: "iMessage / SMS via CLI" },
  { name: "skill-creator", desc: "Build & audit agent skills" },
  { name: "weather", desc: "Forecasts via wttr.in" },
];

const subagents = [
  { name: "Heartbeat Agent", model: "minimax-m2.5", desc: "Periodic system checks, update monitor", active: true },
  { name: "SWE Agent", model: "claude-opus-4-6", desc: "Senior engineer. Sphere Stage 1. Personality TBD.", active: true },
  { name: "Claude Code (ACP)", model: "claude-sonnet-4-6", desc: "Dedicated coding agent. Persistent sessions via ACP harness.", active: true },
  { name: "Research Agent", model: "sonar-pro", desc: "Deep web search & analysis tasks", active: false },
];

const channels = [
  { name: "iMessage", detail: "+19175355701", active: true },
  { name: "Discord", detail: "guild 763460551073857586", active: true },
];

function NodeCard({
  icon: Icon,
  title,
  sub,
  detail,
  accent = false,
  human = false,
  status,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  detail?: string;
  accent?: boolean;
  human?: boolean;
  status?: "online" | "idle" | "off";
}) {
  return (
    <div className="rounded-xl border px-5 py-4 min-w-[200px] max-w-[240px]"
      style={{
        background: human ? "#0f0f0f" : "#0a0a0a",
        borderColor: accent ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: accent ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)" }}>
          <Icon size={15} className="text-zinc-300" />
        </div>
        {status && (
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
            status === "online" ? "bg-emerald-500" : status === "idle" ? "bg-amber-500" : "bg-zinc-700"
          }`} />
        )}
      </div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-[10px] font-mono text-zinc-600 mt-0.5">{sub}</div>
      {detail && <div className="text-[11px] text-zinc-500 mt-1.5 leading-snug">{detail}</div>}
    </div>
  );
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${vertical ? "h-8" : "w-8"}`}>
      <div className={`${vertical ? "w-px h-full" : "h-px w-full"} bg-zinc-800`} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-6">
      {children}
    </p>
  );
}

export default function Org() {
  return (
    <div className="px-10 py-10 overflow-auto">

      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Team Structure</p>
        <h1 className="text-2xl font-semibold text-white">Org Chart</h1>
        <p className="text-sm text-zinc-500 mt-1">John → María → subagents</p>
      </div>

      {/* Tree: John → María → Subagents */}
      <div className="flex flex-col items-center gap-0 mb-20">

        {/* L1: John */}
        <NodeCard
          icon={User}
          title="John"
          sub="@johnhib_ · +19175355701"
          detail="Creative director. Leads strategy, sets direction, holds context."
          human
          accent
          status="online"
        />

        <Connector vertical />

        {/* L2: María */}
        <NodeCard
          icon={Bot}
          title="María"
          sub="claude-sonnet-4-6 · main agent"
          detail="Understudy. Executes, recalls, pushes back, builds."
          accent
          status="online"
        />

        <Connector vertical />

        {/* L3: Subagents */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-700 mb-4 text-center">Subagents</div>
          <div className="flex gap-3">
            {subagents.map(a => (
              <div key={a.name} className="rounded-xl border px-4 py-3 w-[200px]"
                style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Cpu size={11} className="text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-300">{a.name}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${a.active ? "bg-emerald-500" : "bg-zinc-700"}`} />
                </div>
                <p className="text-[10px] font-mono text-zinc-700 mb-1">{a.model}</p>
                <p className="text-[10px] text-zinc-600 leading-snug">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800/60 mb-16" />

      {/* Skills */}
      <div className="mb-16">
        <SectionLabel>Skills</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {skills.map(s => (
            <div key={s.name} className="rounded-xl border px-4 py-3 flex items-center gap-3"
              style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)", minWidth: "200px" }}>
              <Wrench size={11} className="text-zinc-600 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-zinc-300 font-mono">{s.name}</div>
                <div className="text-[10px] text-zinc-600">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="mb-16">
        <SectionLabel>Channels</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {channels.map(c => (
            <div key={c.name} className="rounded-xl border px-4 py-3 flex items-center gap-3"
              style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)", minWidth: "200px" }}>
              <MessageSquare size={11} className="text-zinc-600 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-300">{c.name}</span>
                  {c.active && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                </div>
                <div className="text-[10px] font-mono text-zinc-600">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        {[
          { color: "#22c55e", label: "Online" },
          { color: "#f59e0b", label: "Idle" },
          { color: "#3f3f46", label: "Offline" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-zinc-700">{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
