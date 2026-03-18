import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldNotes } from "@/lib/field-notes";
import VersionBadge from "@/components/VersionBadge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return fieldNotes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const note = fieldNotes.find((n) => n.slug === slug);
  if (!note) return {};
  const url = `https://johnhib.tech/field-notes/${slug}`;
  const ogImage = `/og/${slug}.png`;
  const description = note.body.slice(0, 160);
  return {
    title: `${note.title} — Field Notes`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: note.title,
      description,
      url,
      type: "article",
      siteName: "johnhib.tech",
      images: [{ url: ogImage, width: 1200, height: 630, alt: note.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description,
      creator: "@johnhib_",
      images: [ogImage],
    },
  };
}

export default async function FieldNotePage({ params }: Props) {
  const { slug } = await params;
  const note = fieldNotes.find((n) => n.slug === slug);
  if (!note) notFound();

  return (
    <>
      <VersionBadge />
      <main className="mx-auto max-w-[680px] px-6 pt-20 pb-32">
        <nav className="mb-12">
          <Link
            href="/field-notes"
            className="text-xs uppercase tracking-widest"
            style={{ color: "#999999", textDecoration: "none" }}
          >
            ← Field Notes
          </Link>
        </nav>

        <article>
          <header className="mb-10">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999" }}>
              {note.date}
            </p>
            <h1
              style={{
                fontFamily:    "var(--font-playfair), Georgia, serif",
                fontStyle:     "italic",
                fontWeight:    700,
                fontSize:      "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "-0.01em",
                lineHeight:    1.1,
                color:         "#111111",
              }}
            >
              {note.title}
            </h1>
          </header>

          <div
            className="text-base leading-relaxed"
            style={{ color: "#333333", whiteSpace: "pre-wrap" }}
          >
            {note.body}
          </div>
        </article>
      </main>
    </>
  );
}
