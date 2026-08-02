import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Norma OS — Direct every coding agent",
  description:
    "The command center for directing Codex, Claude Code, and every coding agent from one persistent workspace.",
  applicationName: "Norma OS",
  keywords: [
    "Norma OS",
    "macOS",
    "coding agents",
    "Codex",
    "Claude Code",
    "vibe coding",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "zh-CN": "/zh-cn",
    },
  },
  openGraph: {
    title: "Norma OS — Direct every coding agent",
    description:
      "One command center for every coding agent and every live process.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f3ef",
};

export default function EnglishRootLayout({
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
