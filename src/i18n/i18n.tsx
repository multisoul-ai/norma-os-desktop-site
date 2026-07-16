"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeStorageKey = "norma-os-locale";

const english = {
  language: {
    label: "Language",
    english: "EN",
    chinese: "中文",
  },
  nav: {
    product: "Product",
    liveNodes: "Live Nodes",
    voice: "Voice",
    principles: "Principles",
    getBeta: "Get Beta",
    primaryLabel: "Primary navigation",
    mobileLabel: "Mobile navigation",
    openMenu: "Open navigation",
  },
  hero: {
    eyebrow: "SPATIAL WORKBENCH FOR macOS",
    titleOne: "Make space.",
    titleTwo: "Keep it running.",
    descriptionOne: "Norma OS is a spatial workbench for macOS.",
    descriptionTwo: "Bring terminals, AI agents, the web and files onto one infinite canvas.",
    primaryAction: "Explore Norma OS",
    secondaryAction: "See how it works",
    carouselLabel: "Norma OS product screenshots",
    nextScreenshot: "Next screenshot",
    previousScreenshot: "Previous screenshot",
    showScreenshot: "Show screenshot",
    slides: [
      {
        alt: "Norma OS spatial canvas ready for a new workspace",
      },
      {
        alt: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      },
      {
        alt: "Norma OS workspace with one focused Codex agent and supporting Agent and Terminal nodes",
      },
      {
        alt: "Norma OS workspace with an active Codex conversation and parallel Agent and Terminal nodes",
      },
    ],
    promise: "Your project, still running.",
  },
  product: {
    index: "01 / PRODUCT",
    titleOne: "A desktop",
    titleTwo: "that works.",
    intro: "Stop burying context beneath layers of windows. Open a project and step into an infinitely expandable space that stays alive.",
    cardsLabel: "Three Norma OS product principles",
    cards: [
      {
        title: "One canvas",
        body: "Terminal, Agent, Browser and Preview share the same desktop.",
      },
      {
        title: "Live by default",
        body: "Real processes keep running behind every card, even when your attention moves elsewhere.",
      },
      {
        title: "Quietly aware",
        body: "State, voice and edge light keep you informed without interrupting your focus.",
      },
    ],
  },
  live: {
    index: "02 / LIVE NODES",
    titleOne: "Tools aren't just open.",
    titleTwo: "They're running.",
    body: "Every card is connected to real capability. Run multiple agents at once, follow reasoning and tool calls, or return to a Shell that is still alive.",
    runtimesLabel: "Supported agent runtimes",
    stageLabel: "Four Live Node examples",
  },
  status: {
    index: "03 / STATE LANGUAGE",
    titleOne: "You always know",
    titleTwo: "what it's doing.",
    body: "Hooks translate reasoning, tool calls, permission prompts, completion and failure into quiet, legible feedback.",
    details: ["Reasoning", "Calling a tool", "Waiting for input", "Task complete", "Needs attention"],
    mascotAlt: "Norma, the AI soul, with lilac hair, a white X hair clip and a composed expression",
    mascotName: "Norma",
    mascotRole: "THE AI SOUL",
    mascotNote: "Intelligence with a point of view.",
  },
  capabilities: {
    index: "04 / CAPABILITIES",
    titleOne: "Complex capability.",
    titleTwo: "Clearly presented.",
    intro: "Less window management. More work actually happening.",
    items: [
      {
        title: "Position is context.",
        body: "Select, drag, pan and zoom. Auto-arrange the layout, or preserve the spatial relationships you created yourself.",
      },
      {
        title: "Not a terminal screenshot.",
        body: "Connect to a real Shell with ANSI rendering, input, selection, copy and paste, and link detection.",
      },
      {
        title: "One project. Many minds.",
        body: "Save agent names, runtimes and workflow descriptions by project, then run multiple agents at the same time.",
      },
      {
        title: "Workspace restore. Leave without starting over.",
        body: "Save canvas layout, project settings and Live Node sessions. Reopen the project and the working state returns in place.",
      },
      {
        title: "Research beside the work.",
        body: "Preview Markdown, text and images; browse, edit addresses, move through history, and open terminal links as Browser cards.",
      },
      {
        title: "Every project runs in peace.",
        body: "Open recent projects in separate windows, then tailor shortcuts, Agent Hooks, voice, wallpaper and dynamic backgrounds.",
      },
    ],
  },
  voice: {
    index: "05 / VOICE, LIGHT & STATE",
    titleOne: "Voice interaction.",
    titleTwo: "Say it. Keep working.",
    body: "Use one-shot voice commands or continuous listening. Manage speech recognition, conversation models and local TTS from Settings.",
    imageAlt: "Norma OS voice waveform and status edge-light concept",
    features: [
      "Install, select, remove and preview local ASR / TTS models",
      "Hear a spoken update when an agent finishes",
      "See unobtrusive feedback through the window edge light",
      "Connect local services or OpenAI-compatible services",
    ],
  },
  principles: {
    index: "06 / PRINCIPLES",
    title: "Designed for work that stays alive.",
    intro: "Norma OS is not another layer of window management. It redefines how tools exist inside a project.",
    items: [
      {
        title: "Space instead of tabs",
        body: "Place related tools together. The agent on the left, terminal on the right and document beside them become memorable working context.",
      },
      {
        title: "Keep tools alive",
        body: "Every card is a continuously running Live Node. Move away for a while and the process keeps its state.",
      },
      {
        title: "Bring every tool back to one desk",
        body: "Let an agent change code while the terminal runs a task and supporting documents remain visible alongside it.",
      },
      {
        title: "Local first. User controlled.",
        body: "Keep project data, canvas layouts and local voice models in your hands, with support for local or compatible agent and voice services.",
      },
    ],
  },
  beta: {
    eyebrow: "NORMA OS FOR macOS",
    titleOne: "Your project,",
    titleTwo: "still running.",
    body: "The current release is focused on the local macOS spatial workbench. Beta access is coming soon.",
    backToTop: "Back to top",
  },
  footer: {
    tagline: "A desktop that works.",
    platform: "Designed for macOS",
  },
} as const;

type TranslationShape<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [Key in keyof T]: TranslationShape<T[Key]> }
    : T extends object
      ? { readonly [Key in keyof T]: TranslationShape<T[Key]> }
      : T;

export type Dictionary = TranslationShape<typeof english>;

const chinese: Dictionary = {
  language: {
    label: "语言",
    english: "EN",
    chinese: "中文",
  },
  nav: {
    product: "产品",
    liveNodes: "Live Nodes",
    voice: "语音",
    principles: "设计理念",
    getBeta: "获取 Beta",
    primaryLabel: "主要导航",
    mobileLabel: "移动端导航",
    openMenu: "打开导航",
  },
  hero: {
    eyebrow: "macOS 空间工作台",
    titleOne: "腾出空间。",
    titleTwo: "持续运行。",
    descriptionOne: "Norma OS 是一个面向 macOS 的空间工作台。",
    descriptionTwo: "把终端、AI Agent、网页和文件放进同一张无限画布。",
    primaryAction: "探索 Norma OS",
    secondaryAction: "看看它如何工作",
    carouselLabel: "Norma OS 产品截图",
    nextScreenshot: "下一张截图",
    previousScreenshot: "上一张截图",
    showScreenshot: "显示截图",
    slides: [
      { alt: "等待创建新工作区的 Norma OS 空间画布" },
      { alt: "Norma OS 工作区中同时运行多个 Agent、Browser 与 Terminal 节点" },
      { alt: "Norma OS 工作区中一个聚焦的 Codex Agent 与辅助 Agent、Terminal 节点" },
      { alt: "Norma OS 工作区中活跃的 Codex 对话与并行 Agent、Terminal 节点" },
    ],
    promise: "你的项目，仍在运行。",
  },
  product: {
    index: "01 / 产品",
    titleOne: "一张会工作的",
    titleTwo: "桌面。",
    intro: "不再把上下文塞进层层窗口。打开项目，你看到的是一个可以无限扩展、持续运行的空间。",
    cardsLabel: "Norma OS 三个产品特征",
    cards: [
      { title: "一张画布", body: "Terminal、Agent、Browser 与 Preview，共享一张桌面。" },
      { title: "默认持续运行", body: "真实进程在背后继续运行。离开卡片，不会让任务静止。" },
      { title: "安静感知", body: "状态、语音与边缘光提供反馈，不用弹窗打断你的注意力。" },
    ],
  },
  live: {
    index: "02 / LIVE NODES",
    titleOne: "工具不只是打开。",
    titleTwo: "它们在运行。",
    body: "每张卡片背后都连接真实能力。你可以同时运行多个 Agent，观察思考与工具调用，也可以随时回到仍然活着的 Shell。",
    runtimesLabel: "支持的 Agent 运行时",
    stageLabel: "四种 Live Node 示例",
  },
  status: {
    index: "03 / 状态语言",
    titleOne: "你始终知道，",
    titleTwo: "它在做什么。",
    body: "Hooks 将思考、工具调用、权限确认、完成与失败翻译成轻量而明确的反馈。",
    details: ["持续推理", "调用工具", "等待确认", "任务完成", "需要注意"],
    mascotAlt: "Norma——拥有浅紫色长发、白色 X 发夹与从容神情的 AI 灵魂",
    mascotName: "Norma",
    mascotRole: "AI 灵魂",
    mascotNote: "有观点，也有温度的智能伙伴。",
  },
  capabilities: {
    index: "04 / 核心能力",
    titleOne: "复杂能力。",
    titleTwo: "简单呈现。",
    intro: "少一点窗口管理，多一点真正发生的工作。",
    items: [
      { title: "位置，就是上下文。", body: "选择、拖拽、平移与缩放。自动整理布局，也保留你亲手建立的空间关系。" },
      { title: "不是终端的截图。", body: "连接真实 Shell 进程，支持 ANSI 显示、输入、选择、复制粘贴与链接识别。" },
      { title: "一个项目，多种智能。", body: "为不同项目保存 Agent 名称、运行时与工作流描述。多个 Agent 可以同时工作。" },
      { title: "工作区恢复。离开，不等于重来。", body: "保存画布布局、项目设置与 Live Node 会话。再次打开，工作状态仍在原位。" },
      { title: "资料就在工作旁边。", body: "预览 Markdown、文本和图片；浏览网页、编辑地址、前进后退，并把终端链接直接打开成浏览器卡片。" },
      { title: "每个项目，各自安静运行。", body: "从启动页打开最近项目，让项目进入独立窗口；快捷键、Agent Hooks、壁纸与动态背景也都可以按习惯配置。" },
    ],
  },
  voice: {
    index: "05 / 语音、光与状态",
    titleOne: "语音交互。",
    titleTwo: "说完，继续工作。",
    body: "支持单次语音指令与持续聆听。语音识别、对话模型与本地 TTS 都可以在设置中管理。",
    imageAlt: "Norma OS 语音波形与状态边缘光概念",
    features: [
      "本地 ASR / TTS 模型安装、选择、删除与试听",
      "Agent 完成后语音播报",
      "窗口内缘光提供无打扰视觉反馈",
      "支持本地服务与 OpenAI 兼容服务",
    ],
  },
  principles: {
    index: "06 / 设计理念",
    title: "为持续工作的状态而设计。",
    intro: "Norma OS 不是另一层窗口管理。它重新定义了工具如何存在于你的项目里。",
    items: [
      { title: "用空间代替标签页", body: "把相关的工具放在一起。左边的 Agent、右边的终端、旁边的文档——位置本身会成为可记忆的工作上下文。" },
      { title: "让工具保持“活着”", body: "每张卡片都是持续运行的 Live Node。你可以暂时离开，进程不会因此失去状态。" },
      { title: "把不同工具放回同一张桌面", body: "让 Agent 改代码，让终端跑任务，同时在旁边预览文档与资料。工具不再彼此割裂。" },
      { title: "本地优先，用户可控", body: "项目数据、画布布局和本地语音模型尽量由你掌控；Agent 与语音也支持本地或兼容服务。" },
    ],
  },
  beta: {
    eyebrow: "NORMA OS FOR macOS",
    titleOne: "你的项目，",
    titleTwo: "仍在运行。",
    body: "当前版本专注本地 macOS 空间工作台体验。Beta 下载入口即将开放。",
    backToTop: "回到顶部",
  },
  footer: {
    tagline: "一张会工作的桌面。",
    platform: "为 macOS 而设计",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: english,
  zh: chinese,
};

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "zh";
}

type I18nContextValue = {
  dictionary: Dictionary;
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("norma-os-locale-change", onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("norma-os-locale-change", onStoreChange);
      };
    },
    () => {
      const storedLocale = window.localStorage.getItem(localeStorageKey);
      return isLocale(storedLocale) ? storedLocale : defaultLocale;
    },
    () => defaultLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const setLocale = (nextLocale: Locale) => {
      window.localStorage.setItem(localeStorageKey, nextLocale);
      window.dispatchEvent(new Event("norma-os-locale-change"));
    };

    return {
      dictionary: dictionaries[locale],
      locale,
      setLocale,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
