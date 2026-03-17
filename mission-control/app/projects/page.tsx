import { ExternalLink, Calendar, Zap } from "lucide-react";

type ProjectStatus = "active" | "paused" | "concept";

interface Project {
  name: string;
  desc: string;
  detail: string;
  status: ProjectStatus;
  tags: string[];
  lastTouch?: string;
}

const projects: Project[] = [
  {
    name: "Portfolio — johnhib.com",
    desc: "Personal site and creative portfolio",
    detail: "Next.js + Vercel + Claude Code. Wireframes done. Proper build pending.",
    status: "active",
    tags: ["Next.js", "Vercel", "Design"],
    lastTouch: "Mar 4",
  },
  {
    name: "Rodeo",
    desc: "Video creation app concept",
    detail: "Fan Line + Producer Mode features. Team's last day was Feb 25. Role copy for LinkedIn pending Jason call.",
    status: "active",
    tags: ["Product", "YouTube", "AI Video"],
    lastTouch: "Feb 25",
  },
  {
    name: "Job Search",
    desc: "AI-focused roles in product, ops, and creative",
    detail: "Active applications: Apple (AI Ops Lead), Suno (Sr Mgr Biz Ops), FLORA, ElevenLabs, Midjourney.",
    status: "active",
    tags: ["Career", "AI", "Product"],
    lastTouch: "Mar 4",
  },
  {
    name: "Mission Control",
    desc: "Personal OS dashboard — this app",
    detail: "Next.js, dark mode, localhost. Tasks, Org, Projects, Memory, Documents.",
    status: "active",
    tags: ["Next.js", "OpenClaw", "Tools"],
    lastTouch: "Mar 12",
  },
  {
    name: "AI Workstation Build",
    desc: "Local inference rig for on-device generative AI",
    detail: "CPU/GPU/case/PSU/cooling comparisons. Planning phase — no hardware ordered yet.",
    status: "concept",
    tags: ["Hardware", "Local AI", "Research"],
    lastTouch: "Feb 26",
  },
  {
    name: "Compose My Soundtrack",
    desc: "AI music generation agent",
    detail: "Automated music gen pipeline. Concept and spec in early stages.",
    status: "concept",
    tags: ["Music", "AI Agent", "Audio"],
  },
  {
    name: "Lore Dropper",
    desc: "AI narrative and world-building agent",
    detail: "Generates lore, backstory, world canon from minimal input.",
    status: "concept",
    tags: ["Narrative", "AI Agent", "Creative"],
  },
  {
    name: "Gnome Man's Land",
    desc: "Short film script + AI tool onboarding demo",
    detail: "Doubles as sample project for showcasing AI tools to new users.",
    status: "paused",
    tags: ["Film", "Script", "AI Demo"],
  },
  {
    name: "Crash Out / Redemption Series",
    desc: "Docu-series concept (MTV True Life style)",
    detail: "Participant Bill of Rights built. Format and arc defined.",
    status: "paused",
    tags: ["Documentary", "Series", "Production"],
  },
  {
    name: "Backyard Cinematic Universe",
    desc: "Suburban episodic world",
    detail: "THE SHED DIVE · THE SQUIRREL DERBY · THE GREAT LEAP",
    status: "concept",
    tags: ["Film", "Episodic", "Creative"],
  },
];

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Active", color: "#4ade80", bg: "rgba(74,222,128,0.10)", dot: "#22c55e" },
  paused: { label: "Paused", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", dot: "#f59e0b" },
  concept: { label: "Concept", color: "#818cf8", bg: "rgba(129,140,248,0.10)", dot: "#6366f1" },
};

export default function Projects() {
  const active = projects.filter(p => p.status === "active");
  const paused = projects.filter(p => p.status === "paused");
  const concept = projects.filter(p => p.status === "concept");

  const Section = ({ title, items, count }: { title: string; items: Project[]; count: number }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">{title}</p>
        <span className="text-[10px] font-mono text-zinc-700">({count})</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map(p => {
          const sc = statusConfig[p.status];
          return (
            <div key={p.name}
              className="rounded-xl border px-5 py-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors"
              style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white leading-snug">{p.name}</h3>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5"
                  style={{ background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">{p.detail}</p>

              <div className="flex items-center justify-between mt-auto pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-mono text-zinc-600"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                {p.lastTouch && (
                  <div className="flex items-center gap-1 text-zinc-700 flex-shrink-0 ml-2">
                    <Calendar size={9} />
                    <span className="text-[9px] font-mono">{p.lastTouch}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="px-10 py-10 max-w-5xl">

      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Work</p>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">{projects.length} total · {active.length} active</p>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(statusConfig).map(([key, sc]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
              <span className="text-[10px] text-zinc-600">{sc.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Section title="Active" items={active} count={active.length} />
      <Section title="Paused" items={paused} count={paused.length} />
      <Section title="Concept" items={concept} count={concept.length} />
    </div>
  );
}
