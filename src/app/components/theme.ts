import type { CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────────
   theme.ts — the site's premium look, gathered in one place.

   Every page pulls its colors, fonts, and shared textures from here,
   so a single tweak retunes the whole scene: warm black grounds, a
   restrained sunlight-yellow accent, and warm grain — like a dusk
   photo left in the developer too long.
   ──────────────────────────────────────────────────────────────────── */

/** The three horizontally-snapped panels of the site. */
export type Panel = "about" | "welcome" | "works";

/** Core palette — warm-black grounds, a sunlight-yellow accent used
    sparingly. Named `C` (for Color) because it appears in nearly
    every style. */
export const C = {
  bg: "#080909", // page background — warm black
  panel: "#121313", // card / chip surface, one shade up from bg
  elevated: "#1A1B1B", // hover / elevated surface
  dark: "#FFF9E8", // primary heading text — warm off-white
  moss: "#B9B5A8", // body text — secondary warm grey
  leaf: "#FFD447", // primary accent — sunlight yellow (buttons, active nav, arrows, metrics, focus)
  sun: "#EAAA22", // secondary accent — golden yellow (tags, understated highlights)
  teal: "#8F8A78", // tertiary/muted accent — warm neutral, not a bright hue
  bark: "#FFF9E8", // chip text — pale, sits on a dark chip wash
  wood: "#A39C8C", // small label text — muted warm grey
  cream: "#FFF9E8", // light text on dark feature cards
  border: "#373221", // hairline border
  muted: "rgba(255, 249, 232, 0.55)", // quiet label text
} as const;

/** Body font: a rounded, friendly sans. */
export const FONT = "'Quicksand', ui-sans-serif, system-ui, sans-serif";

/** Display font: an organic serif for headings. */
export const SERIF = "'Fraunces', Georgia, serif";

/** Feature-card backdrop — a restrained golden glow fading into black. */
export const DARK_GRAD =
  "radial-gradient(125% 125% at 78% -12%, rgba(234,170,34,0.14), #080909)";

/** Faint grain-dot texture behind the About and Work pages. */
export const DOT_GRID: CSSProperties = {
  backgroundColor: "transparent",
  backgroundImage:
    "radial-gradient(rgba(234, 170, 34, 0.08) 1.4px, transparent 1.4px)",
  backgroundSize: "26px 26px",
};
