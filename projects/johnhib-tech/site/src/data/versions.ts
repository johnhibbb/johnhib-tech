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
    title: "Field Notes + OG typography",
    notes: [
      "Field Notes section added — short-form observations, distinct from interactive articles",
      "OG image typography bump: domain label 24→25px, footer tagline 23→24px",
    ],
  },
  {
    version: "1.1",
    date: "2026-03-17",
    title: "SEO + social card",
    notes: [
      "Dynamic OG image route — custom 1200×630 card rendered server-side per page",
      "Cormorant Garamond italic title, gold tag, dark background — card matches site identity",
      "Upgraded to summary_large_image — full-width banner preview in iMessage, Twitter, Slack",
      "Per-article metadata: title, excerpt, and tag surface in every social preview",
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
      "Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy",
      "Cormorant Garamond serif header, .Tech identity",
    ],
  },
];
