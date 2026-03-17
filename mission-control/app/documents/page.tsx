import { FileText, Shield, User, Brain, Heart, Wrench, Info, BookOpen, Calendar } from "lucide-react";

type DocType = "identity" | "memory" | "config" | "context" | "daily";

interface Doc {
  name: string;
  path: string;
  desc: string;
  type: DocType;
  size: string;
  updated: string;
}

const docs: Doc[] = [
  {
    name: "SOUL.md",
    path: "SOUL.md",
    desc: "Who María is — core truths, tone, values, speed vs. depth",
    type: "identity",
    size: "2.1kb",
    updated: "Feb 23",
  },
  {
    name: "IDENTITY.md",
    path: "IDENTITY.md",
    desc: "Name, creature type, emoji, relationship context, what she's not",
    type: "identity",
    size: "1.4kb",
    updated: "Feb 23",
  },
  {
    name: "USER.md",
    path: "USER.md",
    desc: "John's full profile — career, tools, projects, working style, personal context",
    type: "identity",
    size: "8.2kb",
    updated: "Feb 24",
  },
  {
    name: "AGENTS.md",
    path: "AGENTS.md",
    desc: "Workspace rules — session protocol, memory system, heartbeats, safety",
    type: "config",
    size: "5.6kb",
    updated: "Mar 12",
  },
  {
    name: "MEMORY.md",
    path: "MEMORY.md",
    desc: "Long-term curated memory — people, events, lessons, preferences, active work",
    type: "memory",
    size: "4.2kb",
    updated: "Mar 12",
  },
  {
    name: "HEARTBEAT.md",
    path: "HEARTBEAT.md",
    desc: "Heartbeat task checklist — runs every hour via minimax-m2.5",
    type: "config",
    size: "0.2kb",
    updated: "Mar 12",
  },
  {
    name: "TOOLS.md",
    path: "TOOLS.md",
    desc: "Setup notes — voice config, search providers, iMessage workarounds",
    type: "config",
    size: "1.8kb",
    updated: "Feb 26",
  },
  {
    name: "CATCHES.md",
    path: "CATCHES.md",
    desc: "Running log of notable catches — CVEs, sandbox blocks, bugs caught before damage",
    type: "config",
    size: "1.0kb",
    updated: "Mar 12",
  },
  {
    name: "2026-03-12.md",
    path: "memory/2026-03-12.md",
    desc: "Today — gateway fix, Ollama install, hybrid search, Mission Control build",
    type: "daily",
    size: "1.6kb",
    updated: "Mar 12 (today)",
  },
  {
    name: "2026-03-05.md",
    path: "memory/2026-03-05.md",
    desc: "Rodeo role copy, job search applications, portfolio context",
    type: "daily",
    size: "2.1kb",
    updated: "Mar 5",
  },
  {
    name: "2026-03-04.md",
    path: "memory/2026-03-04.md",
    desc: "Session after gap — context re-established for portfolio build",
    type: "daily",
    size: "3.8kb",
    updated: "Mar 4",
  },
  {
    name: "freemind-context.md",
    path: "memory/freemind-context.md",
    desc: "ChatGPT handoff dossier — #freemind channel context and background",
    type: "context",
    size: "8.4kb",
    updated: "Mar 12",
  },
  {
    name: "jason-call-brief.md",
    path: "memory/jason-call-brief.md",
    desc: "Brief for Mar 6 call with Jason — Rodeo role factual verification",
    type: "context",
    size: "1.1kb",
    updated: "Mar 5",
  },
];

const typeConfig: Record<DocType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  identity:  { label: "IDENTITY",  color: "#a78bfa", bg: "rgba(167,139,250,0.10)", icon: User },
  memory:    { label: "MEMORY",    color: "#60a5fa", bg: "rgba(96,165,250,0.10)",  icon: Brain },
  config:    { label: "CONFIG",    color: "#4ade80", bg: "rgba(74,222,128,0.08)",  icon: Wrench },
  context:   { label: "CONTEXT",  color: "#f9a8d4", bg: "rgba(249,168,212,0.08)", icon: Info },
  daily:     { label: "DAILY",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  icon: Calendar },
};

export default function Documents() {
  const grouped = (["identity", "config", "memory", "daily", "context"] as DocType[]).map(type => ({
    type,
    items: docs.filter(d => d.type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div className="px-10 py-10 max-w-4xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Workspace</p>
        <h1 className="text-2xl font-semibold text-white">Documents</h1>
        <p className="text-sm text-zinc-500 mt-1">{docs.length} files in María's workspace</p>
      </div>

      {/* Type legend */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {Object.entries(typeConfig).map(([key, tc]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {grouped.map(({ type, items }) => {
          const tc = typeConfig[type];
          const HeaderIcon = tc.icon;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <HeaderIcon size={12} style={{ color: tc.color }} />
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: tc.color }}>
                  {tc.label}
                </p>
                <span className="text-[10px] font-mono text-zinc-700">({items.length})</span>
              </div>

              <div className="rounded-xl border overflow-hidden"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {items.map((doc, i) => (
                  <div key={doc.name}
                    className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors group"
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                      background: i % 2 === 0 ? "#0a0a0a" : "#000",
                    }}>

                    <FileText size={12} className="text-zinc-700 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-zinc-200 font-mono">{doc.name}</span>
                        <span className="text-[10px] text-zinc-700 font-mono truncate">{doc.path}</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{doc.desc}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-[10px] font-mono text-zinc-700">{doc.updated}</span>
                      <span className="text-[10px] font-mono text-zinc-800">{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
