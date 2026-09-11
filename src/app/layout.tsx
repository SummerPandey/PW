import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Pandey | Software Engineer & AI/ML Builder",
  description:
    "Summer Pandey builds reliable, human-centered software and AI products across edge computer vision, voice automation, and personal health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
