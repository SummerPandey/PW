import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Summer Pandey — Software Engineer & AI/ML Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The share card: the Welcome scene in one frame — warm black, a low
   gold sun, the pixel duck on striped water. Uses next/og's bundled font
   so the build never fetches Google Fonts. */
export default async function OpengraphImage() {
  const duck = await readFile(join(process.cwd(), "public/images/duck-pixel.png"));
  const duckSrc = `data:image/png;base64,${duck.toString("base64")}`;

  const bars = [
    { w: 420, c: "#1A1B1B" },
    { w: 340, c: "rgba(234,170,34,0.25)" },
    { w: 460, c: "#1A1B1B" },
    { w: 280, c: "rgba(234,170,34,0.25)" },
    { w: 380, c: "#1A1B1B" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#080909",
          backgroundImage: "radial-gradient(circle at 91% 14%, rgba(234,170,34,0.35), rgba(8,9,9,0) 55%)",
        }}
      >
        {/* sun disc */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 56,
            width: 104,
            height: 104,
            borderRadius: 999,
            backgroundImage: "linear-gradient(180deg, #FFD447, #EAAA22)",
          }}
        />

        {/* words */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 88,
            width: 680,
            height: "100%",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, color: "#FFF9E8", lineHeight: 1.05 }}>Summer Pandey</div>
          <div style={{ fontSize: 34, color: "#EAAA22", marginTop: 20 }}>Software Engineer &amp; AI/ML Builder</div>
          <div style={{ fontSize: 24, color: "rgba(255,249,232,0.55)", marginTop: 36 }}>summerpandey.com</div>
        </div>

        {/* duck on pixel water */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            width: 520,
            height: "100%",
            paddingBottom: 90,
          }}
        >
          <img src={duckSrc} alt="" width={300} height={313} style={{ imageRendering: "pixelated" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -24 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ width: b.w, height: 12, marginTop: 8, background: b.c }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
