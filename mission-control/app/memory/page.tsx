import { FileText, Calendar, BookOpen } from "lucide-react";

const memoryFiles = [
  { name: "MEMORY.md", desc: "Long-term curated memory — decisions, lessons, preferences", type: "long-term", size: "4.2kb" },
  { name: "2026-03-12.md", desc: "Today — Gateway autostart fix, Ollama setup, hybrid search", type: "daily", size: "1.4kb" },
  { name: "2026-03-11.md", desc: "Heartbeat-only day, no direct sessions", type: "daily", size: "0.3kb" },
  { name: "2026-03-05.md", desc: "Context from Rodeo role copy and job search updates", type: "daily", size: "2.1kb" },
  { name: "2026-03-04.md", desc: "Resumed after gap — context re-established for portfolio build", type: "daily", size: "3.8kb" },
  { name: "2026-02-28.md", desc: "Security hardening session, iMessage config finalized", type: "daily", size: "2.6kb" },
  { name: "2026-02-26.md", desc: "LinkedIn profile session — working style observations", type: "daily", size: "1.9kb" },
  { name: "2026-02-25.md", desc: "Rodeo team introduced — Jason, Ry, Hannah, Ankur, James, Eric", type: "daily", size: "1.2kb" },
  { name: "2026-02-23.md", desc: "Identity finalized — María, understudy, IDENTITY.md written", type: "daily", size: "5.1kb" },
  { name: "freemind-context.md", desc: "ChatGPT handoff dossier for #freemind channel context", type: "context", size: "8.4kb" },
  { name: "jason-call-brief.md", desc: "Brief for Friday March 6 call with Jason re: Rodeo roles", type: "context", size: "1.1kb" },
  { name: "alert-state.json", desc: "Heartbeat state tracking — last check timestamps", type: "state", size: "0.2kb" },
];

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  "long-term": { label: "LONG-TERM", color: "#a78bfa", bg: "rgba(139, 92, 246, 0.12)" },
  "daily": { label: "DAILY", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.10)" },
  "context": { label: "CONTEXT", color: "#34d399", bg: "rgba(52, 211, 153, 0.10)" },
  "state": { label: "STATE", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.10)" },
};

const memoryStats = [
  { label: "Total Files", value: "12" },
  { label: "Daily Notes", value: "9" },
  { label: "Embedding Provider", value: "Ollama (local)" },
  { label: "Search Mode", value: "Hybrid 70/30" },
];

export default function Memory() {
  return (
    <div className="px-10 py-10 max-w-4xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Memory System</p>
        <h1 className="text-2xl font-semibold text-white">Memory</h1>
        <p className="text-sm text-zinc-500 mt-1">Indexed files powering María&apos;s recall</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {memoryStats.map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4 border"
            style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">{label}</div>
            <div className="text-sm font-medium text-white font-mono">{value}</div>
          </div>
        ))}
      </div>

      {/* Config callout */}
      <div className="rounded-xl border px-5 py-4 mb-8 flex items-start gap-4"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>
        <BookOpen size={15} className="text-zinc-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-zinc-300 mb-1">Hybrid BM25 + Vector Search (active)</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Memory is embedded locally via <span className="font-mono text-zinc-500">mxbai-embed-large</span> through Ollama.
            Searches blend 70% semantic vector similarity with 30% BM25 keyword matching.
            MMR re-ranking reduces duplicate results. Temporal decay prioritises recent files.
          </p>
        </div>
      </div>

      {/* File list */}
      <div>
        <div className="grid grid-cols-12 gap-4 px-4 mb-2">
          <div className="col-span-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">File</div>
          <div className="col-span-6 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Description</div>
          <div className="col-span-2 text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Type</div>
          <div className="col-span-1 text-right text-[10px] font-semibold tracking-widest uppercase text-zinc-700">Size</div>
        </div>

        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {memoryFiles.map((f, i) => {
            const tc = typeConfig[f.type];
            const isLongTerm = f.type === "long-term";
            return (
              <div key={f.name}
                className="grid grid-cols-12 gap-4 px-4 py-3.5 border-b last:border-b-0 items-center hover:bg-white/[0.02] transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.05)",
                  background: i % 2 === 0 ? "#0a0a0a" : "#000",
                }}>
                <div className="col-span-3 flex items-center gap-2">
                  {isLongTerm
                    ? <BookOpen size={12} className="text-violet-400 flex-shrink-0" />
                    : <FileText size={12} className="text-zinc-600 flex-shrink-0" />
                  }
                  <span className="text-xs font-mono text-zinc-300 truncate">{f.name}</span>
                </div>
                <div className="col-span-6">
                  <span className="text-xs text-zinc-500 leading-snug">{f.desc}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: tc.bg, color: tc.color }}>
                    {tc.label}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-[10px] font-mono text-zinc-700">{f.size}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap note */}
      <div className="mt-5 rounded-xl border px-5 py-4"
        style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar size={12} className="text-zinc-600" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">Coverage</span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Daily notes cover 2026-02-23 → present, with a gap Mar 6–11 (no direct sessions).
          Notes are written at the start of each session and appended throughout the day.
        </p>
      </div>
    </div>
  );
}
