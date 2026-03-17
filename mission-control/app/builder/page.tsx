"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check, Download } from "lucide-react";

type ParamType = "string" | "number" | "boolean" | "array" | "object";

interface Param {
  id: string;
  name: string;
  type: ParamType;
  required: boolean;
  description: string;
}

function generateSkillMd(
  name: string,
  description: string,
  triggers: string,
  instructions: string,
  params: Param[],
  notes: string
): string {
  const lines: string[] = [];

  lines.push(`# ${name || "untitled-skill"}/SKILL.md`);
  lines.push("");
  lines.push(`## Description`);
  lines.push(description || "_No description provided._");
  lines.push("");

  if (triggers.trim()) {
    lines.push("## Triggers");
    triggers.split("\n").filter(Boolean).forEach(t => lines.push(`- ${t.trim()}`));
    lines.push("");
  }

  if (params.length > 0) {
    lines.push("## Parameters");
    lines.push("");
    lines.push("| Name | Type | Required | Description |");
    lines.push("|------|------|----------|-------------|");
    params.forEach(p => {
      lines.push(`| \`${p.name || "param"}\` | ${p.type} | ${p.required ? "✓" : "—"} | ${p.description || "—"} |`);
    });
    lines.push("");
  }

  if (instructions.trim()) {
    lines.push("## Instructions");
    lines.push("");
    lines.push(instructions.trim());
    lines.push("");
  }

  if (notes.trim()) {
    lines.push("## Notes");
    lines.push("");
    lines.push(notes.trim());
    lines.push("");
  }

  return lines.join("\n");
}

const INPUT_STYLE = {
  background: "#111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  padding: "8px 12px",
  width: "100%",
  fontFamily: "Inter, system-ui, sans-serif",
} as const;

const TEXTAREA_STYLE = {
  ...INPUT_STYLE,
  resize: "vertical" as const,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  lineHeight: "1.6",
};

const LABEL_STYLE = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#52525b",
  marginBottom: "6px",
};

export default function Builder() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggers, setTriggers] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [params, setParams] = useState<Param[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const preview = generateSkillMd(name, description, triggers, instructions, params, notes);

  const addParam = () => {
    setParams(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: "",
      type: "string",
      required: true,
      description: "",
    }]);
  };

  const removeParam = (id: string) => {
    setParams(prev => prev.filter(p => p.id !== id));
  };

  const updateParam = (id: string, field: keyof Param, value: string | boolean) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!name.trim()) { setSaveError("Skill name required"); return; }
    setSaveError("");
    try {
      const res = await fetch("/api/save-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: preview }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json();
        setSaveError(d.error || "Save failed");
      }
    } catch {
      setSaveError("Save failed — check console");
    }
  };

  return (
    <div className="px-10 py-10 h-screen flex flex-col">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Skill Creator</p>
          <h1 className="text-2xl font-semibold text-white">Builder</h1>
          <p className="text-sm text-zinc-500 mt-1">Define a new skill for María to load</p>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-xs text-red-400">{saveError}</span>}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg border"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0a0a0a" }}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy SKILL.md"}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-sm font-medium text-black bg-white rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors"
          >
            {saved ? <Check size={13} /> : <Download size={13} />}
            {saved ? "Saved!" : "Save to workspace"}
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">

        {/* Left: Form */}
        <div className="overflow-y-auto space-y-5 pr-2">

          {/* Name */}
          <div>
            <label style={LABEL_STYLE}>Skill Name</label>
            <input
              style={INPUT_STYLE}
              placeholder="e.g. github, spotify, notion"
              value={name}
              onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            />
            <p className="text-[10px] text-zinc-700 mt-1.5">Lowercase, hyphenated. This becomes the skill directory name.</p>
          </div>

          {/* Description */}
          <div>
            <label style={LABEL_STYLE}>Description</label>
            <textarea
              style={{ ...TEXTAREA_STYLE, minHeight: "72px" }}
              placeholder="What does this skill do? When should María use it?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Triggers */}
          <div>
            <label style={LABEL_STYLE}>Trigger Phrases (one per line)</label>
            <textarea
              style={{ ...TEXTAREA_STYLE, minHeight: "80px" }}
              placeholder={"search github\nopen a PR\ncheck my issues"}
              value={triggers}
              onChange={e => setTriggers(e.target.value)}
            />
            <p className="text-[10px] text-zinc-700 mt-1.5">Natural language phrases that should trigger this skill.</p>
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Parameters</label>
              <button
                onClick={addParam}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <Plus size={11} /> Add
              </button>
            </div>
            {params.length === 0 && (
              <p className="text-xs text-zinc-700 py-3 text-center rounded-lg border"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
                No parameters defined
              </p>
            )}
            <div className="space-y-2">
              {params.map((p) => (
                <div key={p.id} className="rounded-lg p-3 border space-y-2"
                  style={{ background: "#0f0f0f", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      style={{ ...INPUT_STYLE, padding: "6px 10px" }}
                      placeholder="name"
                      value={p.name}
                      onChange={e => updateParam(p.id, "name", e.target.value)}
                    />
                    <select
                      style={{ ...INPUT_STYLE, padding: "6px 10px" }}
                      value={p.type}
                      onChange={e => updateParam(p.id, "type", e.target.value)}
                    >
                      {["string", "number", "boolean", "array", "object"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.required}
                          onChange={e => updateParam(p.id, "required", e.target.checked)}
                          className="accent-white"
                        />
                        Required
                      </label>
                      <button onClick={() => removeParam(p.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <input
                    style={{ ...INPUT_STYLE, padding: "6px 10px" }}
                    placeholder="Description"
                    value={p.description}
                    onChange={e => updateParam(p.id, "description", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label style={LABEL_STYLE}>Instructions</label>
            <textarea
              style={{ ...TEXTAREA_STYLE, minHeight: "160px" }}
              placeholder={"Step-by-step instructions for María to follow.\n\n1. First, read the relevant file...\n2. Then call the API with...\n3. If the response is empty, fallback to..."}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={LABEL_STYLE}>Notes / Constraints (optional)</label>
            <textarea
              style={{ ...TEXTAREA_STYLE, minHeight: "80px" }}
              placeholder="Rate limits, auth requirements, edge cases, caveats..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="h-4" />
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col min-h-0 rounded-xl border overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
          <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600">
              SKILL.md Preview
            </span>
            <span className="text-[10px] font-mono text-zinc-700">
              {name ? `skills/${name}/SKILL.md` : "skills/untitled/SKILL.md"}
            </span>
          </div>
          <pre className="flex-1 overflow-y-auto p-5 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {preview || (
              <span className="text-zinc-700">Fill in the form to generate your SKILL.md...</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
