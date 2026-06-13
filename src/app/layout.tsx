import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Pandey — Portfolio",
  description:
    "Summer Pandey — CS & Data Science @ Augustana College. Software engineer, data scientist, ML/AI developer.",
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
