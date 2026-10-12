"use client";

// THROWAWAY: concrete product capabilities for the A homepage study.
import type { SiteContent } from "../../site-content";
import { productDemos } from "../../product-demos";
import "./product-features.css";

function FeatureArrow() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ProductFeatures({ content, onSelectDemo }: {
  content: SiteContent;
  onSelectDemo: (index: number) => void;
}) {
  const chinese = content.locale === "zh-CN";
  const leadFeatures = [
    {
      label: chinese ? "语音群控" : "VOICE COMMAND",
      title: chinese ? "说一次，六个 Agent 一起行动。" : "Say it once. Put six agents to work.",
      body: chinese ? "说出你的安排，Norma 创建多个 Agent、分别分配任务。每个任务的执行状态，都在同一个工作区里。" : "Speak your plan. Norma creates multiple agents, assigns each a task, and keeps every run visible in one workspace.",
      action: chinese ? "看语音群控演示" : "Watch voice group control",
    },
    {
      label: chinese ? "AGENT 协作" : "AGENT COLLABORATION",
      title: chinese ? "把任务交出去，把结果接回来。" : "Hand off a task. Bring the result back.",
      body: chinese ? "Agent 可以把子任务交给另一个 Agent，并接收执行结果。你把握方向，它们接力推进。" : "An agent can delegate a focused task to another agent and receive the result. You set the direction; they carry the work forward.",
      action: chinese ? "看 Agent 协作演示" : "Watch agent collaboration",
    },
  ];
  const details = content.features.items.slice(0, 4);
  const demoIndices = [2, 3, 4, 3];
  const demoLabels = chinese
    ? ["看聚焦演示", "看布局演示", "看状态提醒", "看持续运行的工作区"]
    : ["See focus shortcuts", "See layout switching", "See attention signals", "See the live workspace"];

  return <section className="np-features np-wrap" id="features" aria-labelledby="np-features-title">
    <div className="np-features-heading">
      <div><p className="np-mono">01 / {chinese ? "产品功能" : "WHAT NORMA DOES"}</p><h2 id="np-features-title">{chinese ? <>从一句指令，<br />到一整支团队。</> : <>From one instruction.<br />To a team in motion.</>}</h2></div>
      <p>{chinese ? "派发任务、跟进进度、切换焦点。让 Agent 各司其职，让你始终看得清、接得住。" : "Assign the work. Follow its progress. Find your focus. Give every agent a place to work, and yourself a clear view of it all."}</p>
    </div>

    <div className="np-feature-spotlights">
      {leadFeatures.map((feature, index) => <article className="np-feature-spotlight" id={index === 0 ? "voice-command" : "agent-collaboration"} key={feature.label}>
        <div className="np-feature-copy">
          <p className="np-feature-label"><span className="np-mono">0{index + 1}</span>{feature.label}</p>
          <h3>{feature.title}</h3><p>{feature.body}</p>
          <a className="np-feature-link" href="#in-action" onClick={() => onSelectDemo(index)}>{feature.action}<FeatureArrow /></a>
        </div>
        <a className="np-feature-preview" href="#in-action" onClick={() => onSelectDemo(index)} aria-label={feature.action}>
          <div className="np-feature-preview-bar"><span className="np-window-dots"><i /><i /><i /></span><span>Norma OS</span><span>{chinese ? "实机画面" : "IN THE APP"}</span></div>
          <img src={productDemos[index].poster} alt={productDemos[index].copy[content.locale].label} width="1920" height="1080" loading="lazy" />
          <span className="np-feature-play" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m7 4 9 6-9 6Z" fill="currentColor" /></svg></span>
        </a>
      </article>)}
    </div>

    <div className="np-feature-details" id="live-workspace">
      {details.map((feature, index) => <article className="np-feature-detail" key={feature.title}>
        <div className={`np-feature-symbol np-feature-symbol-${index}`} aria-hidden="true">
          {index === 0 && <><kbd>⌘</kbd><span>+</span><kbd>1–6</kbd></>}
          {index === 1 && <><span className="np-layout-glyph"><i /><i /><i /><i /></span><span>↔</span><kbd>⌘ M</kbd></>}
          {index === 2 && <><span className="np-signal np-signal-done"><i />{chinese ? "已完成" : "Done"}</span><span className="np-signal np-signal-attention"><i />{chinese ? "需要你" : "Needs you"}</span></>}
          {index === 3 && <><span className="np-running-orbit"><i /><i /><i /></span><span>LIVE NODES</span></>}
        </div>
        <p className="np-feature-detail-number np-mono">0{index + 3}</p>
        <h3>{feature.title}</h3><p>{feature.body}</p>
        <a className="np-feature-link" href="#in-action" onClick={() => onSelectDemo(demoIndices[index])}>{demoLabels[index]}<FeatureArrow /></a>
      </article>)}
    </div>
    <p className="np-features-footnote"><span aria-hidden="true">↳</span>{chinese ? "Agent、终端、浏览器、预览。在同一个工作区里，保持各自的工作。" : "Agents, terminals, browsers, previews. One workspace. Each with its own work in progress."}</p>
  </section>;
}
