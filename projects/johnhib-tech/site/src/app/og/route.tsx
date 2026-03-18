import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getInteractiveArticle, getArticle } from "@/lib/articles";

export const runtime = "edge";

const GOLD = "#C9A84C";
const BG = "#0a0a0a";

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
              color: "#555",
              fontSize: "17px",
              letterSpacing: "0.06em",
              fontFamily: "Inter",
              fontWeight: 400,
            }}
          >
            johnhib.tech
          </span>
          {tag && (
            <span
              style={{
                color: GOLD,
                border: `1px solid ${GOLD}`,
                borderRadius: "3px",
                padding: "3px 10px",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "Inter",
                fontWeight: 400,
              }}
            >
              {tag}
            </span>
          )}
        </div>

        {/* Center content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: isHome ? "96px" : "72px",
              color: "#ffffff",
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
                color: "#666",
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
          <div style={{ width: "100%", height: "1px", background: "#1c1c1c" }} />
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              color: "#444",
              fontSize: "15px",
              letterSpacing: "0.04em",
            }}
          >
            Building with AI, documented as it happens.
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
