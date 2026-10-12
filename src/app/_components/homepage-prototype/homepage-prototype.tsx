"use client";

// THROWAWAY DESIGN STUDY: Which homepage best explains Norma?
// Three structurally different variants on / and /zh-cn via ?variant=A|B|C.
// Reference: https://bops.bot/ — bold type, paper + lime, concrete layered task scenes.
// Verdict pending: A is the recommended starting point; no direction has user validation yet.
// Development-only. Run: pnpm prototype:homepage, then /zh-cn?variant=A.
// Keep on codex/norma-homepage-prototype until a direction is chosen.
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { betaLicenseKey, githubUrl, latestDownloadUrl } from "../../site-constants";
import { productDemos } from "../../product-demos";
import type { SiteContent } from "../../site-content";
import { LicenseKey } from "../license-key";
import "./prototype.css";

const NormaMascot = dynamic(() => import("./norma-mascot"), { ssr: false });
const MascotStudio = dynamic(() => import("./norma-mascot").then(module => module.MascotStudio), { ssr: false });

type Props = { content: SiteContent };
type Variant = "A" | "B" | "C";
const variants: Variant[] = ["A", "B", "C"];
const names = { A: "工作现场", B: "指挥中心", C: "产品手记" };
const englishNames = { A: "In good company", B: "Mission control", C: "Field notes" };
const concepts = { A: "明亮 · 场景优先 · 轻松协作", B: "深色 · 产品优先 · 沉浸体验", C: "纸感 · 叙事优先 · 编辑排版" };
const enConcepts = { A: "Light · Scenario first · Playful", B: "Dark · Product first · Immersive", C: "Paper · Story first · Editorial" };
const choose = (content: SiteContent, en: string, zh: string) => content.locale === "en" ? en : zh;

function Icon({ name, size = 20 }: { name: "arrow" | "apple" | "play" | "mic" | "plus" | "check"; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {name === "arrow" && <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    {name === "apple" && <path d="M15.6 5.3c.8-1 1.3-2.2 1.2-3.3-1.2.1-2.5.8-3.2 1.6-.8.9-1.4 2.1-1.2 3.2 1.2.1 2.4-.5 3.2-1.5ZM19.6 13.4c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1-.9 0-2.2-1-3.6-.9-1.9 0-3.6 1.1-4.6 2.7-2 3.3-.5 8.3 1.4 11 .9 1.3 2 2.7 3.4 2.6 1.4 0 1.9-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.4-1.3 3.3-2.6 1-1.4 1.5-2.8 1.5-2.9-.1 0-2.7-1-2.7-4.6Z" fill="currentColor" transform="translate(-2 -1) scale(.95)" />}
    {name === "play" && <path d="m9 5 11 7-11 7V5Z" fill="currentColor" />}
    {name === "mic" && <><rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M6 11a6 6 0 0 0 12 0m-6 6v4m-3 0h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>}
    {name === "plus" && <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.6" />}
    {name === "check" && <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
}

function Logo() {
  return <span className="np-logo"><img src="/brand/app-icon.png" alt="" width="34" height="34" /><span>norma<span className="np-logo-os"> OS</span><span className="np-logo-dot">.</span></span></span>;
}

function Download({ content, compact = false }: Props & { compact?: boolean }) {
  return <a href={latestDownloadUrl} className={`np-button${compact ? " np-button-small" : ""}`}><Icon name="apple" size={compact ? 15 : 18} />{choose(content, "Download for Mac", "下载 Mac 版")}<span className="np-button-arrow"><Icon name="arrow" size={17} /></span></a>;
}

function Header({ content, variant }: Props & { variant: Variant }) {
  return <header className="np-nav np-wrap">
    <a href="#top" aria-label="Norma OS"><Logo /></a>
    <nav aria-label={content.nav.label}>
      <a href="#how-it-works">{choose(content, "The idea", "工作方式")}</a>
      <a href="#in-action">{choose(content, "In action", "产品演示")}</a>
      <a href={githubUrl} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </nav>
    <div className="np-nav-actions"><a className="np-locale" href={`${content.locale === "en" ? "/zh-cn" : "/"}?variant=${variant}`}>{choose(content, "中文", "EN")}</a><Download content={content} compact /></div>
  </header>;
}

function Stack({ content }: Props) {
  return <div className="np-stack np-wrap"><p className="np-mono">{choose(content, "YOUR TOOLS. ALL TOGETHER.", "带上你熟悉的工具，一起工作。")}</p><div><span><b className="np-agent-symbol">✳</b> Claude Code</span><span><b className="np-agent-symbol">⌘</b> Codex</span><span><b className="np-agent-symbol">◈</b> Cursor</span><span><b className="np-agent-symbol">▰</b> OpenCode</span><span className="np-stack-terminal"><b className="np-agent-symbol">›_</b> {choose(content, "Your terminal", "你的终端")}</span></div></div>;
}

function DemoGallery({ content, compact = false }: Props & { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const demo = productDemos[active];
  const copy = demo.copy[content.locale];
  const tabs = content.locale === "en" ? ["Say it once", "Work together", "Find your focus", "Make room", "Stay in the loop"] : ["一句话群控", "Agent 协作", "快速聚焦", "重排布局", "及时响应"];
  return <div className={`np-demo-gallery${compact ? " np-demo-compact" : ""}`}>
    <div className="np-demo-tabs" role="tablist" aria-label={choose(content, "Product demonstrations", "产品演示")}>
      {tabs.map((tab, i) => <button id={`demo-tab-${i}`} role="tab" tabIndex={active === i ? 0 : -1} aria-selected={active === i} aria-controls="demo-panel" key={tab} onClick={() => setActive(i)} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        setActive(next);
        document.getElementById(`demo-tab-${next}`)?.focus({ preventScroll: true });
      }}><span>{String(i + 1).padStart(2, "0")}</span>{tab}</button>)}
    </div>
    <div role="tabpanel" id="demo-panel" aria-labelledby={`demo-tab-${active}`} className="np-demo-panel">
      <div className="np-demo-chrome"><span className="np-window-dots"><i /><i /><i /></span><span>Norma OS <span className="np-demo-slash">/</span> {choose(content, "a real workspace", "真实工作区")}</span><span className="np-mono">{choose(content, "RECORDED IN NORMA", "NORMA 实机录制")}</span></div>
      <video key={demo.id} controls playsInline preload="none" poster={demo.poster} aria-label={copy.videoLabel}><source src={demo.media} type="video/mp4" />{copy.videoLabel}</video>
    </div>
    <div className="np-demo-caption" aria-live="polite"><span className="np-mono">{String(active + 1).padStart(2, "0")} / 05</span><p>{copy.body}</p></div>
  </div>;
}

function Faq({ content }: Props) {
  return <section className="np-faq np-wrap"><div><p className="np-mono">A FEW GOOD QUESTIONS</p><h2>{choose(content, "Glad you asked.", "你可能想知道。")}</h2></div><div className="np-faq-list">{content.faq.items.map((item) => <details key={item.question}><summary>{item.question}<Icon name="plus" size={20} /></summary><p>{item.answer}</p></details>)}</div></section>;
}

function Closing({ content }: Props) {
  return <><section className="np-closing" id="download"><div className="np-wrap"><span className="np-mono">LESS FRICTION. MORE FLOW.</span><h2>{content.locale === "en" ? <>Good work starts<br />with a little <span>norma.</span></> : <>下一件好作品，<br />从 <span>norma</span> 开始。</>}</h2><p>{choose(content, "Your agents are ready. Give them a place to work together.", "你的 Agent 已经就位。给它们一个一起工作的地方。")}</p><Download content={content} /><small>{choose(content, "Apple Silicon · Signed & notarized", "Apple 芯片 · 已签名并公证")}</small><LicenseKey label={content.hero.licenseLabel} licenseKey={betaLicenseKey} copyLabel={content.hero.licenseCopyLabel} copiedLabel={content.hero.licenseCopiedLabel} /></div></section><footer className="np-footer np-wrap"><Logo /><span>© 2026 Multisoul</span><p>{choose(content, "Made for the way you think.", "为你的工作方式而造。")}</p><a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a><a href="#top">{choose(content, "Back to top ↑", "回到顶部 ↑")}</a></footer></>;
}

export function VariantA({ content }: Props) {
  return <div className="np np-a" lang={content.locale} id="top"><Header content={content} variant="A" /><main>
    <section className="np-a-hero np-wrap"><div className="np-a-hero-copy"><p className="np-kicker"><span className="np-tag">MEET NORMA</span><span>YOUR AGENTS. IN GOOD COMPANY.</span></p><h1>{choose(content, "Less", "少一点")}<br />{choose(content, "juggling.", "来回切换。")}<br /><span className="np-highlight">{choose(content, "More building.", "多一点创造。")}</span></h1><p className="np-lede">{choose(content, "A home for your coding agents. Bring Codex, Claude Code, and every live task into one workspace. You set the direction. They work together.", "让 Codex、Claude Code 和每个正在运行的任务，在同一个工作区相遇。你把握方向，Agent 一起推进。")}</p><div className="np-hero-actions"><Download content={content} /><a className="np-watch" href="#in-action"><span><Icon name="play" size={15} /></span>{choose(content, "See it in action", "看看怎么工作")}</a></div><p className="np-platform">{choose(content, "For Apple Silicon Macs", "适用于 Apple 芯片 Mac")}<span>·</span>{choose(content, "Local-first, always.", "本地优先，始终如此。")}</p></div><NormaMascot chinese={content.locale === "zh-CN"} /></section>
    <Stack content={content} />
    <section className="np-a-idea" id="how-it-works"><div className="np-wrap np-idea-inner"><div><p className="np-mono">01 / A LITTLE LESS CHAOS</p><h2>{choose(content, "Many agents.", "多个 Agent。")}<br />{choose(content, "One train", "同一个")}<br /><span className="np-underline">{choose(content, "of thought.", "思路。")}</span></h2><p className="np-section-copy">{choose(content, "Great ideas don’t happen in a single tab. Give the whole process a place to live — from the first prompt to the final preview.", "好想法不会只发生在一个标签页里。从第一条指令，到最后一次预览，让整个过程都在眼前。")}</p></div><div className="np-idea-list">{[["01", "One brief. A whole team.", "一句话，调动整个团队。", "Give several agents a direction with one spoken instruction.", "用一条语音指令创建多个 Agent，并分别下发任务。"], ["02", "Keep the work alive.", "切换视线，工作继续。", "Terminals, agents, and previews keep running as your attention moves.", "Agent、终端和预览保持运行，不因你的注意力转移而中断。"], ["03", "Step in at the right moment.", "需要你时，再及时介入。", "See when an agent finishes or needs your attention. Pick up right there.", "直接看到哪个 Agent 完成了工作、哪个需要你，随时接上思路。"]].map(([num, title, zhTitle, body, zhBody]) => <article key={num}><span className="np-mono">{num}</span><div><h3>{choose(content, title, zhTitle)}</h3><p>{choose(content, body, zhBody)}</p></div><Icon name="arrow" /></article>)}</div></div></section>
    <section className="np-a-demo np-wrap" id="in-action"><div className="np-section-head"><div><p className="np-mono">02 / LESS TALK. REAL WORK.</p><h2>{choose(content, "Here’s the whole picture.", "工作全貌，尽在眼前。")}</h2></div><p>{choose(content, "Real agents. Real processes.\nActually running on your Mac.", "真实的 Agent，真实的进程。\n就在你的 Mac 上运行。")}</p></div><DemoGallery content={content} /></section>
    <section className="np-local np-wrap"><span className="np-local-mark" aria-hidden="true">⌘</span><div><p className="np-mono">ON YOUR MAC. ON YOUR TERMS.</p><h2>{choose(content, "Your tools. Your rules.", "你的工具。你的主场。")}</h2><p>{choose(content, "Keep your projects on your Mac and bring the agents you already use. Norma brings it together. You stay in charge.", "项目文件留在你的 Mac，Agent 由你选择。Norma 让一切协同起来，决定权始终在你。")}</p></div><span className="np-local-stamp">LOCAL<br />FIRST <span>↙</span></span></section>
    <Faq content={content} /><Closing content={content} /></main></div>;
}

export function VariantB({ content }: Props) {
  return <div className="np np-b" lang={content.locale} id="top"><Header content={content} variant="B" /><main><section className="np-b-hero np-wrap"><div className="np-b-status np-mono"><span className="np-status-dot" />NORMA OS <span>/</span> {choose(content, "YOUR COMMAND CENTER", "你的 AGENT 指挥中心")}</div><h1>{choose(content, "Different minds.", "各有所长。")}<br /><span>{choose(content, "One direction.", "一起向前。")}</span></h1><p className="np-lede">{choose(content, "Direct every coding agent from one persistent workspace.\nFrom a single thought to a team in motion.", "在一个持久工作区，指挥所有 Coding Agent。\n从你的一个想法，到整个团队的行动。")}</p><div className="np-hero-actions"><Download content={content} /><a className="np-watch" href="#how-it-works">{choose(content, "Explore the workflow", "探索工作方式")}<Icon name="arrow" /></a></div></section>
    <section className="np-b-console np-wrap" id="in-action"><div className="np-console-rail"><span className="np-mono">MISSION CONTROL</span><div><span className="np-status-dot" />{choose(content, "ALL IN VIEW", "一切尽在眼前")}</div><span className="np-mono">⌘ 1—6</span></div><DemoGallery content={content} compact /></section>
    <Stack content={content} />
    <section className="np-b-workflow np-wrap" id="how-it-works"><p className="np-mono">THE LOOP / FROM INTENT TO OUTPUT</p><h2>{choose(content, "You lead. Work follows.", "你定方向，工作向前。")}</h2><div className="np-b-steps">{[["01", "Direct.", "下达指令。", "One voice instruction. Multiple agents, each with a clear task.", "一句语音指令，让多个 Agent 各自带着明确任务开始工作。"], ["02", "Orchestrate.", "协同推进。", "Let agents delegate, then follow every thread in one live canvas.", "让 Agent 互相派发任务，在同一张实时画布里看清每条工作线。"], ["03", "Stay in flow.", "保持专注。", "Jump to the right node. Respond when needed. Keep everything running.", "一键聚焦需要的节点，在合适的时刻介入，让一切持续运行。"]].map(([num, en, zh, body, zhBody]) => <article key={num}><span className="np-b-step-number">{num}</span><h3>{choose(content, en, zh)}</h3><p>{choose(content, body, zhBody)}</p></article>)}</div><div className="np-b-shortcuts"><span className="np-mono">LESS REACH. MORE CONTROL.</span><div><kbd>⌘ 1–6</kbd>{choose(content, "Focus any node", "聚焦任意节点")}</div><div><kbd>⌘ M</kbd>{choose(content, "Reshape your workspace", "重排工作区")}</div><div><Icon name="mic" />{choose(content, "Speak your next move", "说出下一步")}</div></div></section>
    <Faq content={content} /><Closing content={content} /></main></div>;
}

export function VariantC({ content }: Props) {
  return <div className="np np-c" lang={content.locale} id="top"><Header content={content} variant="C" /><main><section className="np-c-hero np-wrap"><div className="np-c-margin"><span className="np-mono">FIELD NOTES<br />VOL. 001 — NORMA OS</span><span className="np-c-side-label">A NEW WAY TO WORK</span></div><div className="np-c-hero-main"><p className="np-mono">{choose(content, "FOR THE PEOPLE BEHIND THE PROMPTS", "写给每个想法背后的你")}</p><h1>{choose(content, "Make room", "为好想法，")}<br />{choose(content, "for ", "留一点")}<em>{choose(content, "good work.", "空间。")}</em></h1><div className="np-c-intro"><p>{choose(content, "Your mind connects things. Your workspace should, too. Norma brings your agents, terminals, and ideas together on one living canvas.", "你的思路彼此连接，工作区也该如此。Norma 把 Agent、终端与灵感，带进同一张持续运行的画布。")}</p><div><Download content={content} /><a href="#in-action">{choose(content, "Take a closer look", "近一点，看清全貌")} ↓</a></div></div></div></section>
    <section className="np-c-spread np-wrap" id="in-action"><div className="np-c-caption"><span className="np-mono">FIG. 01 / THE LIVING CANVAS</span><span>{choose(content, "A place for every part of the process.", "让工作里的每一部分，都各得其所。")}</span></div><DemoGallery content={content} /></section>
    <section className="np-c-essay np-wrap" id="how-it-works"><aside><span className="np-mono">THE IDEA</span><span className="np-c-asterisk" aria-hidden="true">✳</span><p>{choose(content, "Less managing.\nMore making.", "少一点管理，\n多一点创造。")}</p></aside><div><h2>{choose(content, "A workspace that", "让工作区，")}<br /><em>{choose(content, "thinks in connections.", "接得住你的思路。")}</em></h2><p className="np-c-editorial-copy">{choose(content, "A great workflow is a conversation: between you and your agents, between one task and the next, between an idea and the thing it becomes.", "好的工作流是一场对话：你与 Agent 之间，一个任务与下一个任务之间，一个想法与它最终成为的作品之间。")}</p><div className="np-c-notes">{[["I", "Bring everyone to the table.", "让每个搭档，都在场。", "Codex, Claude Code, terminals, previews. Each with its own place, all within reach.", "Codex、Claude Code、终端、预览。各有位置，也触手可及。"], ["II", "Let the threads keep running.", "让每条思路，都继续。", "A Live Node stays alive when you look elsewhere. Changing focus doesn’t have to mean losing context.", "Live Node 在你看向别处时继续运行。换个焦点，无需重新开始。"], ["III", "Leave room for your judgment.", "把决定，留给你。", "Notice when an agent needs you. Step in, adjust the direction, and carry on.", "Agent 需要你时及时知道。介入、调整方向，然后继续向前。"]].map(([n, en, zh, body, zhBody]) => <article key={n}><span>{n}</span><div><h3>{choose(content, en, zh)}</h3><p>{choose(content, body, zhBody)}</p></div></article>)}</div></div></section>
    <Stack content={content} /><Faq content={content} /><Closing content={content} /></main></div>;
}

function PrototypeSwitcher({ content, variant }: Props & { variant: Variant }) {
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const change = useCallback((next: Variant) => {
    const params = new URLSearchParams(search.toString());
    params.set("variant", next);
    router.replace(`${path}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [router, path, search]);
  const cycle = useCallback((direction: number) => change(variants[(variants.indexOf(variant) + direction + variants.length) % variants.length]), [variant, change]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.closest("input, textarea, select, video, [contenteditable]:not([contenteditable='false']), [role='slider'], [role='tablist']")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); cycle(event.key === "ArrowRight" ? 1 : -1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cycle]);
  if (process.env.NODE_ENV === "production") return null;
  return <aside className="np-switcher" aria-label="Homepage design prototype controls"><div className="np-switcher-main"><span className="np-switcher-tag">{choose(content, "DESIGN STUDY", "视觉原型")}</span><button aria-label={choose(content, "Previous design", "上一个方案")} onClick={() => cycle(-1)}>←</button><div className="np-switcher-label" aria-live="polite"><b>{variant} · {content.locale === "en" ? englishNames[variant] : names[variant]}</b><small>{content.locale === "en" ? enConcepts[variant] : concepts[variant]}</small></div><button aria-label={choose(content, "Next design", "下一个方案")} onClick={() => cycle(1)}>→</button><div className="np-switcher-dots">{variants.map(item => <button aria-label={`${choose(content, "Design", "方案")} ${item}`} aria-pressed={item === variant} key={item} onClick={() => change(item)}>{item}</button>)}</div><a href={path} title={choose(content, "View current website", "查看当前官网")}>↗</a></div></aside>;
}

export function HomepagePrototypeHost({ content, children }: Props & { children: ReactNode }) {
  const search = useSearchParams();
  const variant = search.get("variant") as Variant | null;
  if (process.env.NODE_ENV !== "development" || !variant || !variants.includes(variant)) return children;
  if (search.get("view") === "mascots") return <MascotStudio chinese={content.locale === "zh-CN"} />;
  return <><div key={`${content.locale}-${variant}`}>{variant === "A" ? <VariantA content={content} /> : variant === "B" ? <VariantB content={content} /> : <VariantC content={content} />}</div><PrototypeSwitcher content={content} variant={variant} /></>;
}
