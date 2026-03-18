"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, GitBranch, FolderKanban, Brain, FileText, Terminal, DollarSign } from "lucide-react";

const nav = [
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/org", label: "Org", icon: GitBranch },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/spend", label: "Spend", icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r z-50"
      style={{ background: "#000", borderColor: "rgba(255,255,255,0.07)" }}>

      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Terminal size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-zinc-200">Mission</div>
            <div className="text-xs font-semibold tracking-widest uppercase text-zinc-200 -mt-0.5">Control</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 px-2 pb-2 pt-1">Workspace</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150 ${
                active ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}>
              <Icon size={15} className={active ? "text-white" : "text-zinc-600"} />
              <span className={active ? "font-medium" : "font-normal"}>{label}</span>
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-white opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-600">María online</span>
        </div>
        <p className="text-[10px] text-zinc-700 mt-1 font-mono">OpenClaw 2026.3.11</p>
      </div>
    </aside>
  );
}
