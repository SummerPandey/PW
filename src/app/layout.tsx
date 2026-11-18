import type { Metadata, Viewport } from "next";
import { Fraunces, Quicksand } from "next/font/google";
import { GITHUB, LINKEDIN } from "./components/theme";
import "./globals.css";

/* Self-hosted by next/font: no third-party stylesheet in front of the
   boot screen. Fraunces is the variable font (400-700 + optical size). */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});
const quicksand = Quicksand({ subsets: ["latin"], display: "swap", variable: "--font-quicksand" });

const TITLE = "Summer Pandey | Software Engineer & AI/ML Builder";
const DESCRIPTION =
  "Summer Pandey builds reliable, human-centered software and AI products across edge computer vision, voice automation, and personal health.";

/* A small solid-yellow dot, inlined so the tab has a real icon
   without a request. */
const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD447"/><circle cx="12" cy="12" r="10" fill="none" stroke="#EAAA22" stroke-width="1.5"/></svg>`
  );

export const metadata: Metadata = {
  metadataBase: new URL("https://summerpandey.com"),
  alternates: { canonical: "/" },
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: [{ url: ICON, type: "image/svg+xml" }] },
  openGraph: { type: "website", url: "/", title: TITLE, description: DESCRIPTION, siteName: "Summer Pandey" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/* Browser chrome (mobile address bar, overscroll bounce) paints the same
   warm black as the page from the first frame. Pinch-zoom stays on. */
export const viewport: Viewport = {
  themeColor: "#080909",
  colorScheme: "dark",
};

/* Runs before first paint:
   - data-js: lets CSS hide reveal-on-scroll content only when JS will
     actually reveal it (no-JS / pre-hydration HTML stays readable).
   - data-boot="skip": a visitor who already saw the boot screen this
     session never gets a flash of it on reload. */
const PRE_PAINT = `(function(){var d=document.documentElement;d.setAttribute("data-js","");try{if(sessionStorage.getItem("booted")==="1")d.setAttribute("data-boot","skip")}catch(e){}})();`;

/* Structured identity for search engines. No email on purpose. */
const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Summer Pandey",
  url: "https://summerpandey.com",
  jobTitle: "Software Engineer & AI/ML Builder",
  image: "https://summerpandey.com/images/headshot.jpg",
  alumniOf: { "@type": "CollegeOrUniversity", name: "Augustana College" },
  sameAs: [LINKEDIN, GITHUB],
  knowsAbout: ["Python", "TypeScript", "React", "Computer Vision", "Machine Learning", "NVIDIA Jetson", "PostgreSQL"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // the pre-paint script adds attributes React didn't render
    <html lang="en" className={`${fraunces.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </head>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }} />
        {children}
      </body>
    </html>
  );
}
