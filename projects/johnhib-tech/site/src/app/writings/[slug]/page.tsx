import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import {
  getArticle,
  getInteractiveArticle,
  articles,
  interactiveArticles,
} from "@/lib/articles";
import InteractiveArticlePage from "@/components/InteractiveArticlePage";

export function generateStaticParams() {
  const prose = articles.map((a) => ({ slug: a.slug }));
  const interactive = interactiveArticles.map((a) => ({ slug: a.slug }));
  return [...prose, ...interactive];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const interactive = getInteractiveArticle(slug);
  if (interactive) {
    const url = `https://johnhib.tech/writings/${slug}`;
    const ogImage = `/og/${slug}.png`;
    return {
      title: interactive.title,
      description: interactive.excerpt,
      alternates: { canonical: url },
      openGraph: {
        title: interactive.title,
        description: interactive.excerpt,
        url,
        type: "article",
        siteName: "johnhib.tech",
        images: [{ url: ogImage, width: 1200, height: 630, alt: interactive.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: interactive.title,
        description: interactive.excerpt,
        creator: "@johnhib_",
        images: [ogImage],
      },
    };
  }
  const article = getArticle(slug);
  if (!article) return {};
  const url = `https://johnhib.tech/writings/${slug}`;
  const ogImage = `/og/${slug}.png`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      siteName: "johnhib.tech",
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      creator: "@johnhib_",
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check interactive articles first
  const interactive = getInteractiveArticle(slug);
  if (interactive) {
    return <InteractiveArticlePage article={interactive} />;
  }

  // Fall back to prose articles
  const article = getArticle(slug);
  if (!article) notFound();

  const html = await marked(article.content);

  return (
    <main className="mx-auto max-w-[680px] px-6 pt-20 pb-32">
      <nav className="mb-12">
        <Link href="/" className="text-sm" style={{ color: "#0066cc" }}>
          ← johnhib.tech
        </Link>
      </nav>

      <header className="mb-12">
        <h1
          className="text-3xl font-bold leading-tight mb-4"
          style={{ color: "#111111" }}
        >
          {article.title}
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          {article.date}
        </p>
      </header>

      <article
        className="prose-article"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
