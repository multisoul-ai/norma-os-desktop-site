import type {
  SiteLocale,
  StageContent,
  StoryStep,
} from "./site-content";

type DemoCopy = {
  body: string;
  label: string;
  title: string;
  videoLabel: string;
};

type DemoMedia = {
  media: string;
  mobileMedia?: string;
  poster: string;
};

type ProductDemo = DemoMedia & {
  copy: Record<SiteLocale, DemoCopy>;
  hasAudio?: boolean;
  id: string;
};

type HeroOverview = DemoMedia & {
  copy: Record<SiteLocale, Pick<DemoCopy, "label" | "videoLabel">>;
};

const heroOverview: HeroOverview = {
  media: "/media/demo-hero-overview.mp4",
  poster: "/media/demo-hero-overview.webp",
  copy: {
    en: {
      label:
        "Real Norma OS overview with Live Node shortcuts, workspace layouts, and Agent notifications",
      videoLabel:
        "Real Norma OS demo showing Live Node shortcuts, workspace layout changes, and Agent notifications",
    },
    "zh-CN": {
      label:
        "展示 Live Node 快捷操作、工作区布局和 Agent 通知的 Norma OS 真实产品总览",
      videoLabel:
        "Norma OS 真实演示：一键唤起 Live Node、切换工作区布局并接收 Agent 通知",
    },
  },
};

export const productDemos: ProductDemo[] = [
  {
    id: "voice-command",
    hasAudio: true,
    media: "/media/demo-voice-command.mp4",
    mobileMedia: "/media/demo-voice-command-mobile.mp4",
    poster: "/media/demo-voice-command.webp",
    copy: {
      en: {
        title: "Direct an Agent with your voice",
        body:
          "Speak the outcome once. Norma creates six Agent Live Nodes, gives each one a task, and keeps every run visible in the same workspace.",
        label: "Norma OS creating and directing six Agent Live Nodes with one voice command",
        videoLabel:
          "Real Norma OS demo using one voice instruction to create six Agent Live Nodes and assign their tasks",
      },
      "zh-CN": {
        title: "开口，直接指挥 Agent",
        body:
          "说出目标，Norma 会创建六个 Agent Live Node，并为每个 Agent 分配任务。无需逐个输入，也能在同一工作区看见所有执行状态。",
        label: "使用一条语音指令创建并指挥六个 Agent Live Node 的 Norma OS",
        videoLabel:
          "Norma OS 真实演示：通过一条语音指令创建六个 Agent Live Node 并分配任务",
      },
    },
  },
  {
    id: "live-node-shortcuts",
    media: "/media/demo-live-node-shortcuts.mp4",
    poster: "/media/demo-live-node-shortcuts.webp",
    copy: {
      en: {
        title: "Bring any Live Node forward",
        body:
          "Press ⌘ + 1–6 to call a specific Live Node into focus. Move between agents, terminals, and previews without searching through tabs.",
        label: "Norma OS focusing Live Nodes with Command plus number shortcuts",
        videoLabel:
          "Real Norma OS demo using Command plus 1 through 6 to focus Live Nodes",
      },
      "zh-CN": {
        title: "一键唤起 Live Node",
        body:
          "按下 ⌘ + 1–6，直接把指定 Live Node 带到眼前。在 Agent、终端与预览之间切换，不再翻找标签页。",
        label: "使用 Command 加数字快捷键唤起 Live Node 的 Norma OS",
        videoLabel:
          "Norma OS 真实演示：使用 Command 加 1 到 6 唤起 Live Node",
      },
    },
  },
  {
    id: "workspace-layouts",
    media: "/media/demo-layout-command-m.mp4",
    poster: "/media/demo-layout-command-m.webp",
    copy: {
      en: {
        title: "Reshape the workspace instantly",
        body:
          "Press ⌘ + M to move between focused and overview layouts. Every running Live Node stays visible, active, and connected to its task.",
        label: "Norma OS switching spatial workspace layouts with Command M",
        videoLabel:
          "Real Norma OS demo using Command M to reshape a workspace of running Live Nodes",
      },
      "zh-CN": {
        title: "一个指令，重排工作区",
        body:
          "按下 ⌘ + M，在聚焦与全局布局之间切换。每个运行中的 Live Node 仍然可见、活跃，并与任务保持连接。",
        label: "使用 Command M 切换空间工作区布局的 Norma OS",
        videoLabel:
          "Norma OS 真实演示：使用 Command M 重排运行中的 Live Node",
      },
    },
  },
  {
    id: "agent-notifications",
    media: "/media/demo-agent-notifications.mp4",
    poster: "/media/demo-agent-notifications.webp",
    copy: {
      en: {
        title: "Know when an Agent needs you",
        body:
          "Completion and attention signals appear on the Live Node itself. See which Agent changed state and step in without polling every terminal.",
        label: "Norma OS surfacing completion and attention signals from Coding Agents",
        videoLabel:
          "Real Norma OS demo showing Agent completion and attention notifications across Live Nodes",
      },
      "zh-CN": {
        title: "Agent 需要你时，立即知道",
        body:
          "完成与注意力提示会直接出现在对应 Live Node 上。无需逐个检查终端，也能看清哪个 Agent 状态发生了变化。",
        label: "显示 Coding Agent 完成与注意力提示的 Norma OS",
        videoLabel:
          "Norma OS 真实演示：在多个 Live Node 上显示 Agent 完成与注意力通知",
      },
    },
  },
];

export function getHeroDemo(locale: SiteLocale): StageContent {
  const copy = heroOverview.copy[locale];

  return {
    label: copy.label,
    media: heroOverview.media,
    poster: heroOverview.poster,
    videoLabel: copy.videoLabel,
  };
}

export function getStoryDemos(locale: SiteLocale): StoryStep[] {
  return productDemos.map((demo, index) => {
    const copy = demo.copy[locale];

    return {
      body: copy.body,
      number: String(index + 1).padStart(2, "0"),
      stage: {
        hasAudio: demo.hasAudio,
        label: copy.label,
        media: demo.media,
        mobileMedia: demo.mobileMedia,
        poster: demo.poster,
        videoLabel: copy.videoLabel,
      },
      title: copy.title,
    };
  });
}
