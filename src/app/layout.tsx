import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Norma OS — Make space. Keep it running.",
  description:
    "Norma OS is a spatial workbench for macOS, bringing terminals, AI agents, browsers and file previews onto one infinite canvas.",
  applicationName: "Norma OS",
  keywords: [
    "Norma OS",
    "macOS",
    "AI Agent",
    "infinite canvas",
    "spatial workbench",
  ],
  openGraph: {
    title: "Norma OS — Your project, still running.",
    description:
      "One infinite canvas for terminals, AI agents, browsers and files.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
