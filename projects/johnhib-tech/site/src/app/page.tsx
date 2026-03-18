import Link from "next/link";
import { articles, interactiveArticles } from "@/lib/articles";
import { fieldNotes } from "@/lib/field-notes";
import VersionBadge from "@/components/VersionBadge";
import CyclingSubhead from "@/components/CyclingSubhead";

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
    <main className="mx-auto max-w-[680px] px-6 pt-20 pb-16">
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
        <CyclingSubhead />
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

      {/* Field Notes */}
      <section className="mb-20">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "#666666" }}
        >
          <Link href="/field-notes" style={{ color: "inherit", textDecoration: "none" }}>
            Field Notes
          </Link>
        </h2>
        {fieldNotes.length === 0 ? (
          <p className="text-sm" style={{ color: "#999999" }}>First note incoming.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {fieldNotes.slice(0, 3).map((note) => (
              <article key={note.slug}>
                <Link href={`/field-notes/${note.slug}`} style={{ textDecoration: "none" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#999999" }}>
                    {note.date}
                  </p>
                  <h3 className="text-lg font-medium leading-snug" style={{ color: "#111111" }}>
                    {note.title}
                  </h3>
                </Link>
              </article>
            ))}
            {fieldNotes.length > 3 && (
              <Link
                href="/field-notes"
                className="text-xs uppercase tracking-widest"
                style={{ color: "#999999", textDecoration: "none" }}
              >
                All notes →
              </Link>
            )}
          </div>
        )}
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
                style={{ color: "#666666", background: "#ebebeb", borderRadius: "3px", padding: "1px 6px", letterSpacing: "0.07em", verticalAlign: "middle", display: "inline-block", lineHeight: 1.6 }}
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
                style={{ color: "#666666", background: "#ebebeb", borderRadius: "3px", padding: "1px 6px", letterSpacing: "0.07em", verticalAlign: "middle", display: "inline-block", lineHeight: 1.6 }}
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
