import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

const tools = [
  {
    name: "discord",
    description: "Discord ops via the message tool. Channel management, reactions, threads, polls, and direct messaging.",
    triggers: ["discord", "send to discord", "post in channel"],
    status: "active",
    path: "/opt/homebrew/lib/node_modules/openclaw/skills/discord",
  },
  {
    name: "healthcheck",
    description: "Host security hardening and risk-tolerance configuration. Firewall, SSH, macOS hardening, periodic checks.",
    triggers: ["security audit", "healthcheck", "firewall", "hardening"],
    status: "active",
    path: "/opt/homebrew/lib/node_modules/openclaw/skills/healthcheck",
  },
  {
    name: "imsg",
    description: "iMessage/SMS CLI for listing chats, history, and sending messages via Messages.app.",
    triggers: ["imessage", "sms", "text message", "iMessage history"],
    status: "active",
    path: "/opt/homebrew/lib/node_modules/openclaw/skills/imsg",
  },
  {
    name: "skill-creator",
    description: "Create, edit, improve, or audit AgentSkills. Author new skills or refactor existing ones.",
    triggers: ["create a skill", "author a skill", "improve this skill", "audit the skill"],
    status: "active",
    path: "/opt/homebrew/lib/node_modules/openclaw/skills/skill-creator",
  },
  {
    name: "weather",
    description: "Get current weather and forecasts via wttr.in or Open-Meteo. No API key needed.",
    triggers: ["weather", "temperature", "forecast"],
    status: "active",
    path: "/opt/homebrew/lib/node_modules/openclaw/skills/weather",
  },
];

export default function Tools() {
  return (
    <div className="px-10 py-10 max-w-5xl">

      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Loaded Skills</p>
          <h1 className="text-2xl font-semibold text-white">Tools</h1>
          <p className="text-sm text-zinc-500 mt-1">{tools.length} skills available</p>
        </div>
        <Link href="/builder">
          <button className="flex items-center gap-2 text-sm font-medium text-black bg-white rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors">
            <Plus size={14} />
            New Tool
          </button>
        </Link>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-4 px-4 mb-2">
        <div className="col-span-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Name</div>
        <div className="col-span-6 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Description</div>
        <div className="col-span-2 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Status</div>
        <div className="col-span-1" />
      </div>

      {/* Tools list */}
      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {tools.map((tool, i) => (
          <div
            key={tool.name}
            className="grid grid-cols-12 gap-4 px-4 py-4 border-b last:border-b-0 items-start group hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: i % 2 === 0 ? "#0a0a0a" : "#000" }}
          >
            {/* Name */}
            <div className="col-span-3">
              <div className="text-sm font-medium text-white font-mono">{tool.name}</div>
              <div className="text-[10px] text-zinc-700 mt-1 truncate">{tool.path.split("/").slice(-3).join("/")}</div>
            </div>

            {/* Description + triggers */}
            <div className="col-span-6">
              <p className="text-sm text-zinc-400 leading-snug">{tool.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tool.triggers.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md text-zinc-500 font-mono"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">active</span>
            </div>

            {/* Action */}
            <div className="col-span-1 flex justify-end">
              <button className="text-zinc-700 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100">
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info callout */}
      <div className="mt-6 rounded-xl border px-5 py-4"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Skills are loaded from <span className="font-mono text-zinc-500">/opt/homebrew/lib/node_modules/openclaw/skills/</span>.
          Custom tools you build are saved to the workspace and loaded automatically on next gateway restart.
        </p>
      </div>
    </div>
  );
}
