import type { CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────────
   theme.ts — the site's lo-fi look, gathered in one place.

   Every page pulls its colors, fonts, and shared textures from here,
   so a single tweak retunes the whole scene: black tints, a hazy red
   glow, and warm grain — like a dusk photo left in the developer
   too long.
   ──────────────────────────────────────────────────────────────────── */

/** The three horizontally-snapped panels of the site. */
export type Panel = "about" | "welcome" | "works";

/** Core palette — near-black grounds, a crimson glow, warm ember accents.
    Named `C` (for Color) because it appears in nearly every style. */
export const C = {
  bg: "#050302", // page background — near-black, warm undertone
  panel: "#130c0b", // card / chip surface, one shade up from bg
  dark: "#f5e6df", // primary heading text — pale warm white
  moss: "#c7a49b", // body text — muted warm rose-grey
  leaf: "#e2483a", // primary accent — crimson
  sun: "#ff8a65", // secondary accent — warm ember
  teal: "#8a4a4a", // tertiary accent — muted maroon
  bark: "#f0dcd2", // chip text — pale, sits on a dark chip wash
  wood: "#b3766a", // small label text — dusty terracotta
  cream: "#f0dcd2", // light text on dark feature cards
  border: "rgba(226, 72, 58, 0.16)", // hairline border, red-tinted
  muted: "rgba(240, 220, 210, 0.42)", // quiet label text
} as const;

/** Body font: a rounded, friendly sans. */
export const FONT = "'Quicksand', ui-sans-serif, system-ui, sans-serif";

/** Display font: an organic serif for headings. */
export const SERIF = "'Fraunces', Georgia, serif";

/** Feature-card backdrop — a crimson glow fading into black. */
export const DARK_GRAD =
  "radial-gradient(125% 125% at 78% -12%, #3a1010, #050302)";

/** Faint grain-dot texture behind the About and Work pages. */
export const DOT_GRID: CSSProperties = {
  backgroundColor: "transparent",
  backgroundImage:
    "radial-gradient(rgba(226, 72, 58, 0.09) 1.4px, transparent 1.4px)",
  backgroundSize: "26px 26px",
};
