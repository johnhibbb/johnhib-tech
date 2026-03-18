export interface Version {
  version: string;
  date: string;
  title: string;
  notes: string[];
  screenshot?: string; // path relative to /public
}

export const versions: Version[] = [
  {
    version: "1.2",
    date: "2026-03-17",
    title: "Editorial voice + Signal project",
    notes: [],
  },
  {
    version: "1.1",
    date: "2026-03-17",
    title: "Security hardening + file structure",
    notes: [],
  },
  {
    version: "1.0",
    date: "2026-03-16",
    title: "Initial launch",
    notes: [
      "Interactive article format: \"Guided Artifact Exploration\"",
      "Expandable artifact cards with monospace content and line numbers",
      "Hover annotations with cursor-tracking tooltip and soft screen dim",
      "Two articles: OpenClaw security setup, Persona extraction from LLMs",
      "Title-only article list with In Progress tags",
      "Cormorant Garamond serif header, .Tech identity",
    ],
    screenshot: "/versions/v1.0.png",
  },
];
