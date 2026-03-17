// ─── Public API for articles ──────────────────────────────────────────────────
// All imports from "@/lib/articles" continue to work unchanged.
// Add new exports here as the lib grows (e.g. tag helpers, sort utils).

export type { Article, InteractiveArticle, Artifact, Annotation, PromptCard } from './types';
export { articles, interactiveArticles } from './data';

import { articles, interactiveArticles } from './data';

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getInteractiveArticle(slug: string) {
  return interactiveArticles.find((a) => a.slug === slug);
}
