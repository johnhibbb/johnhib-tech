import Link from "next/link";
import { articles, interactiveArticles } from "@/lib/articles";
import VersionBadge from "@/components/VersionBadge";

const TAG_COLORS: Record<string, { color: string; background: string }> = {
  Automation: { color: "#1a6b3a", background: "#e6f4ec" },
  Technique:  { color: "#1a4a8a", background: "#e6eef9" },
  Setup:      { color: "#7a4a00", background: "#fef3e2" },
};

const allArticles = [
  ...interactiveArticles.map(a => ({ slug: a.slug, title: a.title, date: a.date, excerpt: a.excerpt, tag: a.tag })),
  ...articles.map(a => ({ slug: a.slug, title: a.title, date: a.date, excerpt: a.excerpt, tag: undefined as string | undefined })),
];

export default function Home() {
  return (
    <>
    <VersionBadge />
    <main className="mx-auto max-w-[680px] px-6 py-20">
      {/* Header */}
      <header className="mb-20">
        <h1
          className="mb-3"
          style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontStyle:     "italic",
            fontWeight:    700,
            fontSize:      "clamp(2.8rem, 6vw, 4.5rem)",
            letterSpacing: "-0.01em",
            lineHeight:    1.0,
            color:         "#111111",
          }}
        >
          .Tech
        </h1>
        <p style={{ color: "#666666" }} className="text-base">
          Notes on building with AI.
        </p>
      </header>

      {/* Writings */}
      <section className="mb-20">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "#666666" }}
        >
          Writings
        </h2>
        <div className="flex flex-col gap-10">
          {allArticles.map((article) => (
            <article key={article.slug}>
              <Link
                href={`/writings/${article.slug}`}
                style={{ textDecoration: "none" }}
              >
                <h3
                  className="text-lg font-medium leading-snug mb-1"
                  style={{ color: "#111111" }}
                >
                  {article.title}
                  {article.tag && (() => {
                    const tc = TAG_COLORS[article.tag] ?? { color: "#555", background: "#eee" };
                    return (
                      <span
                        className="text-xs font-normal uppercase tracking-wide ml-2"
                        style={{
                          color:        tc.color,
                          background:   tc.background,
                          borderRadius: "3px",
                          padding:      "1px 6px",
                          letterSpacing: "0.07em",
                          verticalAlign: "middle",
                          display:      "inline-block",
                          lineHeight:   1.6,
                        }}
                      >
                        {article.tag}
                      </span>
                    );
                  })()}
                </h3>
                {article.excerpt && (
                  <p className="text-sm" style={{ color: "#666666", marginTop: "4px" }}>
                    {article.excerpt}
                  </p>
                )}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "#666666" }}
        >
          Projects
        </h2>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-medium mb-1" style={{ color: "#111111" }}>
              Sphere{" "}
              <span
                className="text-xs font-normal uppercase tracking-wide ml-2"
                style={{ color: "#666666" }}
              >
                In progress
              </span>
            </h3>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1" style={{ color: "#111111" }}>
              Signal{" "}
              <span
                className="text-xs font-normal uppercase tracking-wide ml-2"
                style={{ color: "#666666" }}
              >
                In progress
              </span>
            </h3>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
