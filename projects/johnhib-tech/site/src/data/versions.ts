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
    notes: [
      "Rewrote article intros across all three pieces — shared-experience voice, no expert framing",
      "Persona extraction prompt condensed to compact retrieval brief",
      "Security protocol prompt updated — daily cadence, CVE web search, preferred-channel alert",
      "Signal added to projects stack with In progress tag",
      "Version history preview tab removed",
    ],
  },
  {
    version: "1.1",
    date: "2026-03-17",
    title: "Security hardening + file structure",
    notes: [
      "Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy",
      "articles.ts split into lib/articles/ — types, data, and index as separate files",
      "middleware.ts stub added — documented extension points for rate limiting, auth, AI input validation",
      "hooks/ directory established for interactive component state",
      "Ticket Watch article added (Live tag) — AI-run resale price monitor for Ye at SoFi",
    ],
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
