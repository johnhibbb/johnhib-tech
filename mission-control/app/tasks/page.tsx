"use client";

import { useState } from "react";
import { Circle, CheckCircle2, Clock, AlertCircle, Plus, Tag } from "lucide-react";

type Status = "todo" | "in-progress" | "done" | "blocked";
type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  detail?: string;
  status: Status;
  priority: Priority;
  project: string;
  date?: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Portfolio site — full Next.js + Vercel build",
    detail: "Wireframes done. Claude Code session pending.",
    status: "in-progress",
    priority: "high",
    project: "Portfolio",
    date: "Mar 6",
  },
  {
    id: "2",
    title: "Rodeo role copy — finalize for LinkedIn + resume",
    detail: "Pending factual verification from Jason call.",
    status: "in-progress",
    priority: "high",
    project: "Rodeo",
    date: "Mar 6",
  },
  {
    id: "3",
    title: "Apply — Apple AI Ops Lead",
    status: "todo",
    priority: "high",
    project: "Job Search",
  },
  {
    id: "4",
    title: "Apply — ElevenLabs AI Creative Producer",
    status: "todo",
    priority: "high",
    project: "Job Search",
  },
  {
    id: "5",
    title: "Apply — Suno Sr Manager Biz Ops",
    status: "todo",
    priority: "medium",
    project: "Job Search",
  },
  {
    id: "6",
    title: "Apply — FLORA Forward Deployed Creative",
    status: "todo",
    priority: "medium",
    project: "Job Search",
  },
  {
    id: "7",
    title: "Apply — Midjourney",
    status: "todo",
    priority: "medium",
    project: "Job Search",
  },
  {
    id: "8",
    title: "UTM — disable Pause on host sleep",
    detail: "UTM Settings → System → uncheck Pause on host sleep",
    status: "todo",
    priority: "medium",
    project: "Setup",
  },
  {
    id: "9",
    title: "OpenClaw update 2026.3.8 → 2026.3.11",
    status: "done",
    priority: "medium",
    project: "Setup",
    date: "Mar 12",
  },
  {
    id: "10",
    title: "Gateway autostart via LaunchAgent",
    status: "done",
    priority: "high",
    project: "Setup",
    date: "Mar 12",
  },
  {
    id: "11",
    title: "Ollama + mxbai-embed-large local embeddings",
    status: "done",
    priority: "medium",
    project: "Setup",
    date: "Mar 12",
  },
  {
    id: "12",
    title: "Hybrid BM25 + vector memory search",
    status: "done",
    priority: "medium",
    project: "Setup",
    date: "Mar 12",
  },
];

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  "todo": { label: "To Do", icon: Circle, color: "#52525b", bg: "rgba(82,82,91,0.12)" },
  "in-progress": { label: "In Progress", icon: Clock, color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
  "done": { label: "Done", icon: CheckCircle2, color: "#4ade80", bg: "rgba(74,222,128,0.10)" },
  "blocked": { label: "Blocked", icon: AlertCircle, color: "#f87171", bg: "rgba(248,113,113,0.10)" },
};

const priorityDot: Record<Priority, string> = {
  high: "#f87171",
  medium: "#fbbf24",
  low: "#52525b",
};

const allProjects = [...new Set(initialTasks.map(t => t.project))];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = tasks.filter(t =>
    (filter === "all" || t.status === filter) &&
    (projectFilter === "all" || t.project === projectFilter)
  );

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Status = t.status === "todo" ? "in-progress"
        : t.status === "in-progress" ? "done"
        : "todo";
      return { ...t, status: next };
    }));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      title: newTitle.trim(),
      status: "todo",
      priority: "medium",
      project: "General",
    }]);
    setNewTitle("");
    setAdding(false);
  };

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
  };

  return (
    <div className="px-10 py-10 max-w-4xl">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Workspace</p>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">{tasks.filter(t => t.status !== "done").length} open · {counts.done} done</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm font-medium text-black bg-white rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors">
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-1">
          {(["all", "todo", "in-progress", "done", "blocked"] as const).map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                filter === s ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-300"
              }`}>
              {s === "all" ? `All (${counts.all})` : `${statusConfig[s]?.label} (${counts[s]})`}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-1">
          <Tag size={11} className="text-zinc-700" />
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="text-xs bg-transparent text-zinc-500 hover:text-zinc-300 border-none outline-none cursor-pointer">
            <option value="all">All projects</option>
            {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Add task inline */}
      {adding && (
        <div className="mb-3 rounded-xl border px-4 py-3 flex items-center gap-3"
          style={{ background: "#0f0f0f", borderColor: "rgba(255,255,255,0.12)" }}>
          <Circle size={15} className="text-zinc-600 flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 outline-none"
            placeholder="Task title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setAdding(false); }}
          />
          <span className="text-[10px] text-zinc-700">Enter to save · Esc to cancel</span>
        </div>
      )}

      {/* Task list */}
      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-zinc-700 text-sm">No tasks match this filter.</div>
        )}
        {filtered.map((task, i) => {
          const sc = statusConfig[task.status];
          const StatusIcon = sc.icon;
          return (
            <div key={task.id}
              className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0 group hover:bg-white/[0.02] transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.05)",
                background: i % 2 === 0 ? "#0a0a0a" : "#000",
                opacity: task.status === "done" ? 0.5 : 1,
              }}>

              {/* Status icon */}
              <button
                onClick={() => toggleStatus(task.id)}
                className="mt-0.5 flex-shrink-0 transition-opacity hover:opacity-70"
                title="Click to advance status">
                <StatusIcon size={16} style={{ color: sc.color }} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm ${task.status === "done" ? "line-through text-zinc-600" : "text-white"}`}>
                    {task.title}
                  </span>
                </div>
                {task.detail && (
                  <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{task.detail}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {task.date && (
                  <span className="text-[10px] font-mono text-zinc-700">{task.date}</span>
                )}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#52525b" }}>
                  {task.project}
                </span>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: priorityDot[task.priority] }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-zinc-800 mt-4">Click the status icon to cycle: To Do → In Progress → Done</p>
    </div>
  );
}
