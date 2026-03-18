import Link from "next/link";
import { fieldNotes } from "@/lib/field-notes";
import VersionBadge from "@/components/VersionBadge";

export const metadata = {
  title: "Field Notes — johnhib.tech",
  description: "Short observations documented in the field.",
};

export default function FieldNotesIndex() {
  return (
    <>
      <VersionBadge />
      <main className="mx-auto max-w-[680px] px-6 py-20">
        <header className="mb-16">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest"
            style={{ color: "#999999", textDecoration: "none" }}
          >
            ← johnhib.tech
          </Link>
          <h1
            className="mt-6"
            style={{
              fontFamily:    "var(--font-playfair), Georgia, serif",
              fontStyle:     "italic",
              fontWeight:    700,
              fontSize:      "clamp(2.2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.01em",
              lineHeight:    1.0,
              color:         "#111111",
            }}
          >
            Field Notes
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#666666" }}>
            Short observations documented in the field. No demo required.
          </p>
        </header>

        {fieldNotes.length === 0 ? (
          <p className="text-sm" style={{ color: "#999999" }}>
            First note incoming.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {fieldNotes.map((note) => (
              <article key={note.slug}>
                <Link
                  href={`/field-notes/${note.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#999999" }}>
                    {note.date}
                  </p>
                  <h2
                    className="text-lg font-medium leading-snug"
                    style={{ color: "#111111" }}
                  >
                    {note.title}
                  </h2>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
