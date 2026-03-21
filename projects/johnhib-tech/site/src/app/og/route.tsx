import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getInteractiveArticle, getArticle } from "@/lib/articles";

export const runtime = "edge";

const ACCENT = "#1a1a1a";
const BG = "#ffffff";

const TAG_COLORS: Record<string, { color: string; background: string }> = {
  Automation: { color: "#1a7a4a", background: "#e8faf0" },
  Technique:  { color: "#6b3fa0", background: "#f5f0ff" },
  Setup:      { color: "#1a56db", background: "#e8f0fe" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");

  let title = "johnhib.tech";
  let excerpt = "Building with AI, documented as it happens.";
  let tag: string | undefined;
  const isHome = !slug;

  if (slug) {
    const interactive = getInteractiveArticle(slug);
    const prose = getArticle(slug);
    const article = interactive ?? prose;
    if (article) {
      title = article.title;
      excerpt = article.excerpt;
      if ("tag" in article && article.tag) tag = article.tag as string;
    }
  }

  // Fetch fonts from /public — same Vercel deployment, no external dependency, no timeout risk
  const baseUrl = req.nextUrl.origin;
  const [cormorantData, interData] = await Promise.all([
    fetch(`${baseUrl}/fonts/CormorantGaramond-Italic-700.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${baseUrl}/fonts/Inter-Regular.woff2`).then((r) => r.arrayBuffer()),
  ]);

  const truncatedExcerpt =
    excerpt.length > 140 ? excerpt.slice(0, 140) + "…" : excerpt;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "#999",
              fontSize: "17px",
              letterSpacing: "0.06em",
              fontFamily: "Inter",
              fontWeight: 400,
            }}
          >
            johnhib.tech
          </span>
          {tag && (() => {
            const tc = TAG_COLORS[tag] ?? { color: "#555", background: "#eee" };
            return (
            <span
              style={{
                color: tc.color,
                background: tc.background,
                borderRadius: "3px",
                padding: "3px 10px",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "Inter",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
            );
          })()}
        </div>

        {/* Center content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: isHome ? "96px" : "72px",
              color: ACCENT,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
          {!isHome && (
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                color: "#888",
                fontSize: "20px",
                lineHeight: 1.5,
                maxWidth: "860px",
              }}
            >
              {truncatedExcerpt}
            </span>
          )}
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ width: "100%", height: "1px", background: "#e5e5e5" }} />
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              color: "#aaa",
              fontSize: "15px",
              letterSpacing: "0.04em",
            }}
          >
            Somewhere between a lab notebook and a diary.
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorantData,
          style: "italic",
          weight: 600,
        },
        {
          name: "Inter",
          data: interData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
