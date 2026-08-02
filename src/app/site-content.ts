import { getHeroDemo, getStoryDemos } from "./product-demos";

export type SiteLocale = "en" | "zh-CN";

export type StageContent = {
  hasAudio?: boolean;
  label: string;
  media: string;
  mobileMedia?: string;
  poster: string;
  videoLabel: string;
};

export type StoryStep = {
  body: string;
  number: string;
  stage: StageContent;
  title: string;
};

type Capability = {
  body: string;
  mark: string;
  title: string;
};

type TrustPoint = {
  body: string;
  title: string;
};

type FaqItem = {
  answer: string;
  question: string;
};

export type SiteContent = {
  locale: SiteLocale;
  mediaControls: {
    mute: string;
    pause: string;
    play: string;
    unmute: string;
  };
  nav: {
    label: string;
    product: string;
    story: string;
    features: string;
    download: string;
    githubLabel: string;
    mobileLabel: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleStart: string;
    titleEmphasis: string;
    titleEnd: string;
    description: string;
    download: string;
    secondaryAction: string;
    platform: string;
    security: string;
    stage: StageContent;
  };
  compatibility: {
    eyebrow: string;
    heading: string;
    agents: string[];
  };
  story: {
    eyebrow: string;
    heading: string;
    introduction: string;
    steps: StoryStep[];
  };
  features: {
    eyebrow: string;
    heading: string;
    introduction: string;
    items: Capability[];
  };
  trust: {
    eyebrow: string;
    heading: string;
    introduction: string;
    points: TrustPoint[];
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: FaqItem[];
  };
  finalCta: {
    eyebrow: string;
    heading: string;
    body: string;
    download: string;
    note: string;
  };
  footer: {
    tagline: string;
    privacy: string;
  };
};

export const englishContent: SiteContent = {
  locale: "en",
  mediaControls: {
    mute: "Mute demonstration sound",
    pause: "Pause demonstration",
    play: "Play demonstration",
    unmute: "Hear demonstration sound",
  },
  nav: {
    label: "Primary navigation",
    product: "Product",
    story: "How it works",
    features: "Features",
    download: "Download",
    githubLabel: "Norma OS on GitHub",
    mobileLabel: "Open navigation",
  },
  hero: {
    eyebrow: "VIBE CODING COMMAND CENTER",
    title: "Direct every coding agent. From one place.",
    titleStart: "Direct every",
    titleEmphasis: "coding agent.",
    titleEnd: "From one place.",
    description:
      "Keep your coding agents—Codex and Claude Code—alongside terminals, previews, and every live task in one workspace. Jump to the right Live Node, reshape the canvas, and notice when an Agent needs you.",
    download: "Download for Mac",
    secondaryAction: "See it in action",
    platform: "Apple Silicon",
    security: "Signed & notarized",
    stage: getHeroDemo("en"),
  },
  compatibility: {
    eyebrow: "BRING YOUR OWN AGENTS",
    heading: "One command center, above your coding stack.",
    agents: ["Codex", "Claude Code", "Cursor", "OpenCode"],
  },
  story: {
    eyebrow: "01 / HOW IT WORKS",
    heading: "Four real interactions. One clear flow.",
    introduction:
      "Every chapter below comes from Norma OS itself: speak, focus, reshape, and respond without leaving the workspace.",
    steps: getStoryDemos("en"),
  },
  features: {
    eyebrow: "02 / CAPABILITIES",
    heading: "Less tab management. More direction.",
    introduction:
      "The parts of a serious coding workflow stay distinct, while the work itself finally feels connected.",
    items: [
      {
        mark: "⌘",
        title: "Keyboard-first focus",
        body:
          "Press ⌘ + 1–6 to bring the exact Agent, terminal, browser, or preview you need into focus.",
      },
      {
        mark: "M",
        title: "Adaptive layouts",
        body:
          "Use ⌘ + M to reshape the canvas while every running Live Node keeps its task and state.",
      },
      {
        mark: "◎",
        title: "Agent attention signals",
        body:
          "See completion and attention states on the Live Node that produced them, without polling every terminal.",
      },
      {
        mark: "◫",
        title: "Persistent Live Nodes",
        body:
          "Agents, terminals, browsers, and previews remain live as your attention moves elsewhere.",
      },
      {
        mark: "N",
        title: "Multi-Agent command",
        body:
          "Keep separate Coding Agents and their surrounding tools inside one operational field of view.",
      },
      {
        mark: "↗",
        title: "Real desktop processes",
        body:
          "Work runs in the actual shells and tools on your Mac, not in a decorative dashboard.",
      },
    ],
  },
  trust: {
    eyebrow: "03 / BUILT FOR REAL WORK",
    heading: "Your work stays yours.",
    introduction:
      "Norma OS coordinates the tools on your Mac without turning your development environment into a remote black box.",
    points: [
      {
        title: "Local first",
        body: "Project files and workspace context remain on the Mac where you work.",
      },
      {
        title: "Real processes",
        body: "Live Nodes are backed by real shells, agents, browsers, and previews.",
      },
      {
        title: "Visible Agent state",
        body:
          "Live Node signals show which Agent changed state and when your attention is needed.",
      },
      {
        title: "User-controlled agents",
        body: "You choose the agents, direct the work, and decide when to intervene.",
      },
    ],
  },
  faq: {
    eyebrow: "04 / QUESTIONS",
    heading: "Before you open the command center.",
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
  finalCta: {
    eyebrow: "READY WHEN YOU ARE",
    heading: "Put every agent on the same page.",
    body:
      "Download Norma OS and turn a scattered coding workflow into one place you can direct.",
    download: "Download for Mac",
    note: "Apple Silicon · Latest release",
  },
  footer: {
    tagline: "The command center for Coding Agents.",
    privacy: "Local-first by design.",
  },
};

export const chineseContent: SiteContent = {
  locale: "zh-CN",
  mediaControls: {
    mute: "关闭演示声音",
    pause: "暂停演示",
    play: "播放演示",
    unmute: "播放演示声音",
  },
  nav: {
    label: "主导航",
    product: "产品",
    story: "工作方式",
    features: "功能",
    download: "下载",
    githubLabel: "在 GitHub 上查看 Norma OS",
    mobileLabel: "打开导航",
  },
  hero: {
    eyebrow: "VIBE CODING 指挥中心",
    title: "在一处，指挥所有 Coding Agent。",
    titleStart: "在一处，",
    titleEmphasis: "指挥所有",
    titleEnd: "Coding Agent。",
    description:
      "把 Codex、Claude Code、终端、预览和所有实时任务放进同一个工作区。快速唤起 Live Node、重排画布，并在 Agent 需要你时立即介入。",
    download: "下载 Mac 版",
    secondaryAction: "查看实际运行",
    platform: "Apple 芯片",
    security: "已签名并公证",
    stage: getHeroDemo("zh-CN"),
  },
  compatibility: {
    eyebrow: "带上你正在使用的 AGENT",
    heading: "在现有 Coding 工具之上，建立一个指挥中心。",
    agents: ["Codex", "Claude Code", "Cursor", "OpenCode"],
  },
  story: {
    eyebrow: "01 / 工作方式",
    heading: "四个真实操作，一套连续工作流。",
    introduction:
      "以下演示直接来自 Norma OS：语音指挥、唤起 Live Node、调整布局、响应 Agent 状态，都不必离开工作区。",
    steps: getStoryDemos("zh-CN"),
  },
  features: {
    eyebrow: "02 / 核心能力",
    heading: "少管理标签页，多指挥工作。",
    introduction:
      "严肃开发流程里的每个部分仍然各司其职，但它们终于在同一套工作上下文中连接起来。",
    items: [
      {
        mark: "⌘",
        title: "键盘快速聚焦",
        body: "按下 ⌘ + 1–6，直接聚焦需要的 Agent、终端、浏览器或预览。",
      },
      {
        mark: "M",
        title: "自适应布局",
        body: "使用 ⌘ + M 重排画布，同时保留每个 Live Node 的任务与运行状态。",
      },
      {
        mark: "◎",
        title: "Agent 注意力提示",
        body: "在产生状态的 Live Node 上直接看见完成与注意力提示，不必逐个检查终端。",
      },
      {
        mark: "◫",
        title: "持久 Live Node",
        body: "转移注意力后，Agent、终端、浏览器和预览仍然保持实时运行。",
      },
      {
        mark: "N",
        title: "多 Agent 指挥",
        body: "把不同 Coding Agent 及其周围工具放进同一个可操作的全局视野。",
      },
      {
        mark: "↗",
        title: "真实桌面进程",
        body: "工作运行在 Mac 上真实的 Shell 与工具中，而不是装饰性的仪表盘里。",
      },
    ],
  },
  trust: {
    eyebrow: "03 / 为真实工作而造",
    heading: "你的工作，仍然属于你。",
    introduction:
      "Norma OS 协调你 Mac 上已有的工具，不会把开发环境变成远端、不可见的黑盒。",
    points: [
      {
        title: "本地优先",
        body: "项目文件与工作区上下文留在你工作的这台 Mac 上。",
      },
      {
        title: "真实进程",
        body: "Live Node 背后是真实的 Shell、Agent、浏览器与预览。",
      },
      {
        title: "Agent 状态清晰可见",
        body: "Live Node 会显示哪个 Agent 状态发生变化，以及何时需要你介入。",
      },
      {
        title: "Agent 由你控制",
        body: "你选择 Agent、指挥工作，并决定何时介入。",
      },
    ],
  },
  faq: {
    eyebrow: "04 / 常见问题",
    heading: "打开指挥中心之前。",
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
  finalCta: {
    eyebrow: "准备好了，就开始",
    heading: "让所有 Agent 看向同一页。",
    body: "下载 Norma OS，把分散的 Coding 工作流变成一个真正可以指挥的地方。",
    download: "下载 Mac 版",
    note: "Apple 芯片 · 最新版本",
  },
  footer: {
    tagline: "Coding Agent 的统一指挥中心。",
    privacy: "坚持本地优先。",
  },
};
