import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Load Gambarino font for the OG image (Satori needs font binary, not CSS)
const gambarino = fetch(
  "https://api.fontshare.com/v2/css?f[]=gambarino@400&display=swap"
).then(async (res) => {
  // Fontshare returns CSS with @font-face url — extract the woff2 URL
  const css = await res.text();
  const match = css.match(/url\(([^)]+\.woff2)\)/);
  if (match) {
    const fontRes = await fetch(match[1]);
    return fontRes.arrayBuffer();
  }
  return null;
}).catch(() => null);

/**
 * Generates a beautiful OG image for a user's "Four Vouches" card.
 * Used for social sharing (WhatsApp, Instagram, Twitter) and the /welcome screen.
 *
 * GET /api/og/four-card/[handle]
 *
 * Query params:
 *   ?format=story   → 1080×1920 (Instagram story / WhatsApp status)
 *   ?format=square   → 1080×1080 (Instagram post)
 *   (default)        → 1200×630 (OG / Twitter)
 *   ?dl=1            → Forces Content-Disposition: attachment (download)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const format = request.nextUrl.searchParams.get("format") || "og";
  const download = request.nextUrl.searchParams.get("dl") === "1";

  // Determine dimensions
  const dims = {
    og: { width: 1200, height: 630 },
    story: { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 },
  }[format] || { width: 1200, height: 630 };

  // Load font
  const fontData = await gambarino;

  // Fetch profile + vouches from the app's data endpoint
  const baseUrl = request.nextUrl.origin;
  let displayName = handle;
  let tasteLine = "";
  let vouches: { placeName: string; area: string; take: string }[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/og/four-card/${handle}/data`, {
      headers: { "x-og-secret": process.env.OG_INTERNAL_SECRET || "og-internal" },
    });
    if (res.ok) {
      const data = await res.json();
      displayName = data.displayName || handle;
      tasteLine = data.tasteLine || "";
      vouches = data.vouches || [];
    }
  } catch {
    // Fall through with defaults
  }

  const isStory = format === "story";
  const isSquare = format === "square";

  return new ImageResponse(
    (
      <div
        style={{
          width: dims.width,
          height: dims.height,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#111110",
          color: "#EDEBE7",
          padding: isStory ? "80px 56px" : isSquare ? "64px 56px" : "48px 64px",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture — subtle grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(237,235,231,0.03) 1px, transparent 0)",
            backgroundSize: "32px 32px",
            display: "flex",
          }}
        />

        {/* Top: Logo + Handle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isStory ? 60 : 32,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Stamp V */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "#BF3A2B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              V
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "rgba(237,235,231,0.5)",
                fontFamily: "sans-serif",
              }}
            >
              vouch.app
            </span>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "rgba(237,235,231,0.4)",
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            @{handle}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: isStory ? 48 : 28,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "rgba(237,235,231,0.4)",
              fontFamily: "sans-serif",
            }}
          >
            THE CANON
          </span>
          <span
            style={{
              fontSize: isStory ? 44 : isSquare ? 40 : 36,
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "#EDEBE7",
            }}
          >
            {displayName}&rsquo;s Four Vouches
          </span>
          {tasteLine && (
            <span
              style={{
                fontSize: 16,
                fontStyle: "italic",
                color: "rgba(237,235,231,0.5)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              &ldquo;{tasteLine}&rdquo;
            </span>
          )}
        </div>

        {/* Four vouches grid */}
        <div
          style={{
            display: "flex",
            flexDirection: isStory ? "column" : "row",
            gap: isStory ? 16 : 14,
            flex: 1,
          }}
        >
          {vouches.slice(0, 4).map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: isStory ? "24px 20px" : "20px 16px",
                borderRadius: 12,
                backgroundColor: "rgba(237,235,231,0.06)",
                border: "1px solid rgba(237,235,231,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(237,235,231,0.3)",
                  letterSpacing: "0.04em",
                }}
              >
                {String(i + 1).padStart(2, "0")} / 04
              </span>

              {/* Place info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginTop: isStory ? 20 : 12,
                }}
              >
                <span
                  style={{
                    fontSize: isStory ? 22 : isSquare ? 20 : 18,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                    color: "#EDEBE7",
                  }}
                >
                  {v.placeName}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "rgba(237,235,231,0.35)",
                    fontFamily: "sans-serif",
                    marginTop: 2,
                  }}
                >
                  {v.area.split(",")[0]}
                </span>
                {v.take && (
                  <span
                    style={{
                      fontSize: isStory ? 14 : 12,
                      fontStyle: "italic",
                      color: "rgba(237,235,231,0.45)",
                      lineHeight: 1.4,
                      marginTop: 6,
                      display: "-webkit-box",
                      overflow: "hidden",
                    }}
                  >
                    &ldquo;{v.take}&rdquo;
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 4 - vouches.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: "rgba(237,235,231,0.03)",
                border: "1px dashed rgba(237,235,231,0.08)",
                color: "rgba(237,235,231,0.2)",
                fontSize: 13,
                fontFamily: "sans-serif",
              }}
            >
              —
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: isStory ? 48 : 24,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "rgba(237,235,231,0.3)",
              fontFamily: "sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            Built on trust, not strangers.
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#BF3A2B",
              fontWeight: 600,
              fontFamily: "sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            vouch.app/@{handle}
          </span>
        </div>
      </div>
    ),
    {
      ...dims,
      headers: download
        ? { "Content-Disposition": `attachment; filename="vouch-${handle}-${format}.png"` }
        : undefined,
      fonts: fontData
        ? [
            {
              name: "Gambarino",
              data: fontData,
              style: "normal" as const,
              weight: 400 as const,
            },
          ]
        : undefined,
    }
  );
}
