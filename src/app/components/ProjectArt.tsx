import type { ReactNode } from "react";
import { C } from "./theme";

/* ────────────────────────────────────────────────────────────────────
   ProjectArt — banner drawings for the projects without a photo.

   One grammar for all of them, so nine drawings read as one family:
   - viewBox 160×100, live area x 14–146 / y 12–92
   - 1.5px hairline (non-scaling, see `svg.art` in globals.css),
     round caps & joins, no fills, no text, no gradients
   - three inks: F (structure), L (subject), S (the accent)
   - exactly ONE sunlight-yellow "sun" per piece, sitting where the
     project's transformation happens — the site's motif on every card
   The only fill allowed is the pixel duck, because he's the mascot.
   ──────────────────────────────────────────────────────────────────── */

const F = "rgba(255,249,232,0.24)"; // structure / context
const L = "rgba(255,249,232,0.80)"; // the subject
const S = C.leaf; // the one sun
const H = "rgba(255,212,71,0.16)"; // halo behind the sun

/** Shared backdrop for art banners: the dot grid and dusk glow from the
    rest of the site, over a panel → background fade. */
export const ART_FIELD = [
  "radial-gradient(rgba(234,170,34,0.10) 1px, transparent 1.3px) 0 0 / 14px 14px",
  "radial-gradient(120% 90% at 50% 0%, rgba(234,170,34,0.14), rgba(234,170,34,0) 60%)",
  `linear-gradient(180deg, ${C.panel}, ${C.bg})`,
].join(", ");

/** Light top/bottom shade over project photos — just enough to seat the
    badges, without the old brown wash muddying the picture. */
export const PHOTO_SCRIM =
  "linear-gradient(180deg, rgba(8,9,9,0.40) 0%, rgba(8,9,9,0) 28%, rgba(8,9,9,0) 62%, rgba(8,9,9,0.50) 100%)";

function ArtFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      className="art"
      viewBox="0 0 160 100"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "min(84%, 248px)", height: "auto", display: "block" }}
    >
      {children}
    </svg>
  );
}

function Sun({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={7} fill={H} />
      <circle cx={x} cy={y} r={2.8} fill={S} />
    </>
  );
}

/** VentureGain — a pulse resolves into ledger rows; the sun is where signal becomes record. */
export const VentureGainArt = () => (
  <ArtFrame>
    <path stroke={L} d="M14 52 H32 L38 40 L45 66 L52 32 L58 60 L63 52 H71" />
    <Sun x={78} y={52} />
    <path stroke={F} d="M88 30 V74" />
    <path stroke={L} d="M96 34 H140 M86 52 H128 M96 70 H146" />
  </ArtFrame>
);

/** Crypto Sentiment — a bearish-to-bullish gauge; the sun is the needle tip. */
export const CryptoArt = () => (
  <ArtFrame>
    <path stroke={F} d="M40 70 A40 40 0 0 1 120 70" />
    <path stroke={F} d="M45.4 50 L49.7 52.5 M60 35.4 L62.5 39.7 M80 30 V35 M100 35.4 L97.5 39.7 M114.6 50 L110.3 52.5" />
    <path stroke={L} d="M80 70 L97.2 45.4" />
    <circle stroke={L} cx={80} cy={70} r={2.6} />
    <Sun x={97.2} y={45.4} />
    <path stroke={F} d="M28 76 H36 M124 76 H132 M128 72 V80" />
  </ArtFrame>
);

/** Pi Car — a lane converging on the horizon, framed by detection corners; the sun sets at the vanishing point. */
export const PiCarArt = () => (
  <ArtFrame>
    <path stroke={F} d="M8 56 H152" />
    <path stroke={S} fill={H} d="M70 56 A10 10 0 0 1 90 56" />
    <path stroke={L} d="M76 59 L30 96 M84 59 L130 96" />
    <path stroke={L} d="M80 64 V67 M80 73 V78 M80 85 V93" />
    <path stroke={F} d="M50 70 V64 H56 M104 64 H110 V70 M110 88 V94 H104 M56 94 H50 V88" />
  </ArtFrame>
);

/** Wlog — a plain-language line becomes logged rows; the sun marks the moment it's logged. */
export const WlogArt = () => (
  <ArtFrame>
    <rect stroke={L} x={26} y={16} width={108} height={68} rx={7} />
    <path stroke={F} d="M26 28 H134" />
    <circle stroke={F} cx={34} cy={22} r={1.4} />
    <circle stroke={F} cx={40} cy={22} r={1.4} />
    <circle stroke={F} cx={46} cy={22} r={1.4} />
    <path stroke={L} d="M38 42 H92" />
    <Sun x={100} y={42} />
    <path stroke={L} d="M38 60 H46 M38 57 V63 M46 57 V63 M38 74 H46 M38 71 V77 M46 71 V77" />
    <path stroke={F} d="M54 60 H100 M54 74 H92" />
    <rect stroke={L} x={106} y={56} width={18} height={8} rx={4} />
    <rect stroke={L} x={106} y={70} width={18} height={8} rx={4} />
  </ArtFrame>
);

/** Portfolio — this site's three panels; the sun rises over the middle one, the real pixel duck on the water below. */
export const PortfolioArt = () => (
  <ArtFrame>
    <rect stroke={F} x={18} y={28} width={36} height={48} rx={5} />
    <rect stroke={L} x={62} y={18} width={36} height={66} rx={5} />
    <rect stroke={F} x={106} y={28} width={36} height={48} rx={5} />
    <path stroke={S} fill={H} d="M73 52 A7 7 0 0 1 87 52 M80 40.5 V37.5 M71.5 44 L69.5 42 M88.5 44 L90.5 42" />
    <path stroke={L} d="M67 52 H93" />
    <image href="/images/duck-pixel.png" x={73.5} y={61} width={13} height={13.6} style={{ imageRendering: "pixelated" }} />
    <path stroke={F} d="M68 77 H74 M86 78 H92" />
  </ArtFrame>
);

/** Data Project — noisy tweets, a cleaning pass, then a fitted distribution; the sun sits at its peak. */
export const DataArt = () => (
  <ArtFrame>
    <path stroke={F} d="M18 82 H142" />
    <g stroke={L}>
      {[
        [24, 44], [30, 64], [35, 50], [40, 72], [45, 36], [50, 58], [55, 46], [60, 68], [64, 54],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={1.6} />
      ))}
    </g>
    <path stroke={F} strokeDasharray="2 4" d="M76 26 V82" />
    <path stroke={F} d="M88 82 V72 H95 V82 M99 82 V60 H106 V82 M110 82 V44 H117 V82 M121 82 V54 H128 V82 M132 82 V70 H139 V82" />
    <path stroke={L} d="M86 78 C100 74 104 40 113.5 40 C123 40 128 74 142 78" />
    <Sun x={113.5} y={33} />
  </ArtFrame>
);

/** AuraTV — a screen inside its aura, over a channel strip; the sun is the play button. */
export const AuraTVArt = () => (
  <ArtFrame>
    <rect stroke="rgba(255,249,232,0.12)" x={40} y={12} width={80} height={60} rx={14} />
    <rect stroke={F} x={46} y={18} width={68} height={48} rx={10} />
    <rect stroke={L} x={52} y={24} width={56} height={36} rx={6} />
    <path stroke={S} fill={H} d="M75.5 35 L86.5 42 L75.5 49 Z" />
    <g stroke={F}>
      <rect x={43.5} y={80} width={16} height={9} rx={2} />
      <rect x={62.5} y={80} width={16} height={9} rx={2} />
      <rect x={100.5} y={80} width={16} height={9} rx={2} />
    </g>
    <rect stroke={L} x={81.5} y={80} width={16} height={9} rx={2} />
  </ArtFrame>
);

/** Volleyball Organizer — a bracket resolves to a champion; the sun is the ball itself. */
export const VolleyballArt = () => (
  <ArtFrame>
    <path stroke={F} d="M18 22 H46 V40 H18 M18 60 H46 V78 H18 M46 31 H70 M46 69 H70" />
    <path stroke={L} d="M70 31 V69 M70 50 H96" />
    <circle stroke={S} fill={H} cx={114} cy={50} r={14} />
    <path stroke={S} d="M114 50 C114 42 110 38 106 38.5 M114 50 C121 46 127 47 128 50.5 M114 50 C110 57 111 62 114 64" />
  </ArtFrame>
);

/** MMM — three channels merge into one outcome over ROI bars; the sun is the outcome. */
export const MMMArt = () => (
  <ArtFrame>
    <circle stroke={L} cx={16} cy={28} r={2.4} />
    <circle stroke={L} cx={16} cy={50} r={2.4} />
    <circle stroke={L} cx={16} cy={72} r={2.4} />
    <path stroke={F} d="M19 28 C52 28 62 50 94 50 M19 72 C52 72 62 50 94 50" />
    <path stroke={L} d="M19 50 H94 C112 50 118 30 138 28" />
    <Sun x={140} y={28} />
    <path stroke={F} d="M100 84 H146 M108 84 V76 M120 84 V68 M132 84 V60" />
  </ArtFrame>
);
