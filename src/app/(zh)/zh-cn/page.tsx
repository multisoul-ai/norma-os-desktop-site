import type { Metadata } from "next";
import { MarketingPage } from "../../_components/marketing-page";
import { chineseContent } from "../../site-content";

export const metadata: Metadata = {
  title: "Norma OS — 在一处指挥所有 Coding Agent",
  description:
    "把 Codex、Claude Code 和实时开发进程带到同一个持久工作区，在一处持续指挥。",
  alternates: {
    canonical: "/zh-cn",
    languages: {
      en: "/",
      "zh-CN": "/zh-cn",
    },
  },
  openGraph: {
    title: "Norma OS — 在一处指挥所有 Coding Agent",
    description: "面向每个 Coding Agent 与实时进程的统一指挥中心。",
    locale: "zh_CN",
    type: "website",
  },
};

export default function ChineseHome() {
  return <MarketingPage content={chineseContent} />;
}
