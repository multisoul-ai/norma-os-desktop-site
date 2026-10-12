export type SiteLocale = "en" | "zh-CN";

export type SiteContent = {
  locale: SiteLocale;
  nav: { label: string };
  license: { label: string; copy: string; copied: string };
  faq: { items: { question: string; answer: string }[] };
};

export const englishContent: SiteContent = {
  locale: "en",
  nav: {
    label: "Primary navigation",
  },
  license: {
    label: "Beta license",
    copy: "Copy",
    copied: "Copied",
  },
  faq: {
    items: [
      {
        question: "What is Norma OS?",
        answer:
          "Norma OS is a macOS command center for directing multiple Coding Agents and the live development processes around them from one persistent workspace.",
      },
      {
        question: "Which Coding Agents can I use?",
        answer:
          "Norma OS is designed around agent-driven terminal workflows, including Codex and Claude Code, while keeping adjacent tools such as Cursor and OpenCode within the same working context.",
      },
      {
        question: "Does work stop when I switch projects?",
        answer:
          "Live Nodes represent real processes. They are designed to stay active when you move your attention elsewhere, so long-running work does not depend on the visible tab.",
      },
      {
        question: "Is Norma another Coding Agent?",
        answer:
          "No. Norma is the coordination interface that helps you delegate, redirect, and monitor work across the Coding Agents you choose.",
      },
      {
        question: "What Mac is supported?",
        answer:
          "The current download is built for Apple Silicon Macs and is distributed as a signed and notarized DMG.",
      },
    ],
  },
};

export const chineseContent: SiteContent = {
  locale: "zh-CN",
  nav: {
    label: "主导航",
  },
  license: {
    label: "内测 License",
    copy: "复制",
    copied: "已复制",
  },
  faq: {
    items: [
      {
        question: "Norma OS 是什么？",
        answer:
          "Norma OS 是 macOS 上的 Coding Agent 指挥中心，让你在一个持久工作区中指挥多个 Agent 及其周围的实时开发进程。",
      },
      {
        question: "可以使用哪些 Coding Agent？",
        answer:
          "Norma OS 围绕 Agent 驱动的终端工作流设计，包括 Codex 与 Claude Code，也把 Cursor、OpenCode 等相邻工具放在同一工作上下文中。",
      },
      {
        question: "切换项目后，工作会停止吗？",
        answer:
          "Live Node 对应真实进程。它们可以在你转移注意力后继续运行，长期任务不再依赖当前可见的标签页。",
      },
      {
        question: "Norma 是另一个 Coding Agent 吗？",
        answer:
          "不是。Norma 是协调界面，帮助你在自己选择的 Coding Agent 之间分配任务、调整方向并监控进度。",
      },
      {
        question: "支持哪些 Mac？",
        answer:
          "当前版本面向 Apple 芯片 Mac，以已签名并经过公证的 DMG 形式发布。",
      },
    ],
  },
};
