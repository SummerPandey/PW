import Link from "next/link";
import { C, FONT, SERIF } from "./components/theme";

/* A quiet, motionless 404 in the site's own palette: the duck, a line,
   and one gold way home. */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "48px 16px",
        textAlign: "center",
        background: C.bg,
        fontFamily: FONT,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/duck-pixel.png" alt="" width={120} height={126} style={{ imageRendering: "pixelated" }} />
      <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2rem, 6vw, 3rem)", color: C.dark }}>
        This pond is empty
      </h1>
      <p style={{ margin: 0, fontSize: "1.05rem", color: C.moss }}>The page you were looking for paddled off.</p>
      <Link
        href="/"
        className="btn-quiet btn-gold"
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          padding: "12px 24px",
          borderRadius: 999,
          fontWeight: 700,
          color: C.bg,
          textDecoration: "none",
        }}
      >
        Back to the water
      </Link>
    </main>
  );
}
