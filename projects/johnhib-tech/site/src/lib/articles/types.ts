// ─── Core Article Types ───────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

// ─── Interactive Article Types ────────────────────────────────────────────────

export interface Annotation {
  id: string;
  anchor: string; // exact substring in content to highlight
  note: string;   // prose annotation shown in panel
}

export interface Artifact {
  id: string;
  filename: string;
  type: 'config' | 'shell' | 'file' | 'incident' | 'cron' | 'report';
  description: string;
  language: string;
  content: string;
  annotations: Annotation[];
}

export interface PromptCard {
  label?: string; // defaults to "Try"
  prompt: string;
}

export interface InteractiveArticle {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tag?: string;      // e.g. "Live", "In progress", "New"
  intro: string;
  artifacts: Artifact[];
  promptCard?: PromptCard;
}
