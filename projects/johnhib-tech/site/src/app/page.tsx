import { articles, interactiveArticles } from "@/lib/articles";

const allArticles = [
  ...interactiveArticles.map(a => ({ slug: a.slug, title: a.title, date: a.date, excerpt: a.excerpt })),
  ...articles.map(a => ({ slug: a.slug, title: a.title, date: a.date, excerpt: a.excerpt })),
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-20">
      {/* Header */}
      <header className="mb-20">
        <h1
          className="text-5xl font-bold tracking-widest uppercase mb-3"
          style={{ color: "#111111" }}
        >
          JOHNHIB.TECH
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
            <article key={article.slug} className="relative">
              {/* Title — blurred, non-clickable */}
              <h3
                className="text-lg font-medium leading-snug mb-1 select-none"
                style={{ color: "#0066cc", filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}
              >
                {article.title}
              </h3>
              {/* Date — blurred */}
              <p
                className="text-sm mb-2 select-none"
                style={{ color: "#666666", filter: "blur(4px)", userSelect: "none" }}
              >
                {article.date}
              </p>
              {/* COMING SOON badge */}
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ color: "#999999", border: "1px solid #dddddd" }}
              >
                Coming Soon
              </span>
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
        <div>
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
            <p className="text-base leading-relaxed" style={{ color: "#111111" }}>
              A DaVinci Resolve OFX plugin for 360° video reframing. Built for
              creators who shoot with DJI Osmo 360 and edit in Resolve — filling
              a gap no plugin currently covers.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
