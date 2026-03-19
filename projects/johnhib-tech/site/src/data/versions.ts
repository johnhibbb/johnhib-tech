export interface Version {
  version: string;
  date: string;
  title: string;
  notes: string[];
  screenshot?: string; // path relative to /public
}

export const versions: Version[] = [
  {
    version: "1.1",
    date: "2026-03-17",
    title: "SEO, Social Cards, Field Notes",
    notes: [
      "Social cards built to brand — type, palette, and layout consistent across all content",
      "Full-width preview format across iMessage, Twitter, and Slack",
      "Per-article metadata: title, excerpt, and tag surface in every social preview",
      "Field Notes section added — short-form observations",
    ],
  },
  {
    version: "1.0",
    date: "2026-03-16",
    title: "Initial launch",
    notes: [
      "Interactive article format: \"Guided Artifact Exploration\"",
      "Hover annotations with cursor-tracking tooltip and soft screen dim",
      "Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy",
    ],
  },
];
