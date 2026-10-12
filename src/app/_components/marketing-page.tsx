import Image from "next/image";
import {
  betaLicenseKey,
  githubUrl,
  latestDownloadUrl,
} from "../site-constants";
import type { SiteContent } from "../site-content";
import { LicenseKey } from "./license-key";
import { DemoGallery } from "./demo-gallery";
import NormaCloud from "./norma-cloud/norma-cloud";

type Props = { content: SiteContent };
const choose = (content: SiteContent, en: string, zh: string) =>
  content.locale === "en" ? en : zh;

function Icon({
  name,
  size = 20,
}: {
  name: "arrow" | "apple" | "play" | "mic" | "plus" | "check";
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {name === "arrow" && (
        <path
          d="M5 12h14m-5-5 5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === "apple" && (
        <path
          d="M15.6 5.3c.8-1 1.3-2.2 1.2-3.3-1.2.1-2.5.8-3.2 1.6-.8.9-1.4 2.1-1.2 3.2 1.2.1 2.4-.5 3.2-1.5ZM19.6 13.4c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1-.9 0-2.2-1-3.6-.9-1.9 0-3.6 1.1-4.6 2.7-2 3.3-.5 8.3 1.4 11 .9 1.3 2 2.7 3.4 2.6 1.4 0 1.9-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.4-1.3 3.3-2.6 1-1.4 1.5-2.8 1.5-2.9-.1 0-2.7-1-2.7-4.6Z"
          fill="currentColor"
          transform="translate(-2 -1) scale(.95)"
        />
      )}
      {name === "play" && <path d="m9 5 11 7-11 7V5Z" fill="currentColor" />}
      {name === "mic" && (
        <>
          <rect
            x="9"
            y="3"
            width="6"
            height="12"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6 11a6 6 0 0 0 12 0m-6 6v4m-3 0h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
      {name === "plus" && (
        <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.6" />
      )}
      {name === "check" && (
        <path
          d="m5 12 4 4L19 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Logo() {
  return (
    <span className="site-logo">
      <Image src="/brand/app-icon.png" alt="" width={34} height={34} />
      <span>
        norma<span className="site-logo-os"> OS</span>
        <span className="site-logo-dot">.</span>
      </span>
    </span>
  );
}

function Download({ content, compact = false }: Props & { compact?: boolean }) {
  return (
    <a
      href={latestDownloadUrl}
      className={`site-button${compact ? " site-button-small" : ""}`}
    >
      <Icon name="apple" size={compact ? 15 : 18} />
      {choose(content, "Download for Mac", "下载 Mac 版")}
      <span className="site-button-arrow">
        <Icon name="arrow" size={17} />
      </span>
    </a>
  );
}

function Header({ content }: Props) {
  return (
    <header className="site-nav site-wrap">
      <a href="#top" aria-label="Norma OS">
        <Logo />
      </a>
      <nav aria-label={content.nav.label}>
        <a href="#how-it-works">{choose(content, "The idea", "工作方式")}</a>
        <a href="#in-action">{choose(content, "In action", "产品演示")}</a>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
      <div className="site-nav-actions">
        <a
          className="site-locale"
          href={content.locale === "en" ? "/zh-cn" : "/"}
          hrefLang={content.locale === "en" ? "zh-CN" : "en"}
          lang={content.locale === "en" ? "zh-CN" : "en"}
        >
          {choose(content, "中文", "EN")}
        </a>
        <Download content={content} compact />
      </div>
    </header>
  );
}

function Stack({ content }: Props) {
  return (
    <div className="site-stack site-wrap">
      <p className="site-mono">
        {choose(
          content,
          "YOUR TOOLS. ALL TOGETHER.",
          "带上你熟悉的工具，一起工作。",
        )}
      </p>
      <div>
        <span>
          <b className="site-agent-symbol">✳</b> Claude Code
        </span>
        <span>
          <b className="site-agent-symbol">⌘</b> Codex
        </span>
        <span>
          <b className="site-agent-symbol">◈</b> Cursor
        </span>
        <span>
          <b className="site-agent-symbol">▰</b> OpenCode
        </span>
        <span className="site-stack-terminal">
          <b className="site-agent-symbol">›_</b>{" "}
          {choose(content, "Your terminal", "你的终端")}
        </span>
      </div>
    </div>
  );
}

function Faq({ content }: Props) {
  return (
    <section className="site-faq site-wrap" id="faq">
      <div>
        <p className="site-mono">A FEW GOOD QUESTIONS</p>
        <h2>{choose(content, "Glad you asked.", "你可能想知道。")}</h2>
      </div>
      <div className="site-faq-list">
        {content.faq.items.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <Icon name="plus" size={20} />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Closing({ content }: Props) {
  return (
    <>
      <section className="site-closing" id="download">
        <div className="site-wrap">
          <span className="site-mono">LESS FRICTION. MORE FLOW.</span>
          <h2>
            {content.locale === "en" ? (
              <>
                Good work starts
                <br />
                with a little <span>norma.</span>
              </>
            ) : (
              <>
                下一件好作品，
                <br />从 <span>norma</span> 开始。
              </>
            )}
          </h2>
          <p>
            {choose(
              content,
              "Your agents are ready. Give them a place to work together.",
              "你的 Agent 已经就位。给它们一个一起工作的地方。",
            )}
          </p>
          <Download content={content} />
          <small>
            {choose(
              content,
              "Apple Silicon · Signed & notarized",
              "Apple 芯片 · 已签名并公证",
            )}
          </small>
          <LicenseKey
            label={content.license.label}
            licenseKey={betaLicenseKey}
            copyLabel={content.license.copy}
            copiedLabel={content.license.copied}
          />
        </div>
      </section>
    </>
  );
}

export function MarketingPage({ content }: Props) {
  return (
    <div className="site" lang={content.locale} id="top">
      <a className="skip-link" href="#main">
        {choose(content, "Skip to content", "跳至主要内容")}
      </a>
      <Header content={content} />
      <main id="main" lang={content.locale}>
        <section className="site-hero site-wrap">
          <div className="site-hero-copy">
            <p className="site-kicker">
              <span className="site-tag">MEET NORMA</span>
              <span>YOUR AGENTS. IN GOOD COMPANY.</span>
            </p>
            <h1>
              {choose(content, "Less", "少一点")}
              <br />
              {choose(content, "juggling.", "来回切换。")}
              <br />
              <span className="site-highlight">
                {choose(content, "More building.", "多一点创造。")}
              </span>
            </h1>
            <p className="site-lede">
              {choose(
                content,
                "A home for your coding agents. Bring Codex, Claude Code, and every live task into one workspace. You set the direction. They work together.",
                "让 Codex、Claude Code 和每个正在运行的任务，在同一个工作区相遇。你把握方向，Agent 一起推进。",
              )}
            </p>
            <div className="site-hero-actions">
              <Download content={content} />
              <a className="site-watch" href="#in-action">
                <span>
                  <Icon name="play" size={15} />
                </span>
                {choose(content, "See it in action", "看看怎么工作")}
              </a>
            </div>
            <p className="site-platform">
              {choose(
                content,
                "For Apple Silicon Macs",
                "适用于 Apple 芯片 Mac",
              )}
              <span>·</span>
              {choose(content, "Local-first, always.", "本地优先，始终如此。")}
            </p>
          </div>
          <NormaCloud chinese={content.locale === "zh-CN"} />
        </section>
        <Stack content={content} />
        <section className="site-idea" id="how-it-works">
          <div className="site-wrap site-idea-inner">
            <div>
              <p className="site-mono">01 / A LITTLE LESS CHAOS</p>
              <h2>
                {choose(content, "Many agents.", "多个 Agent。")}
                <br />
                {choose(content, "One train", "同一个")}
                <br />
                <span className="site-underline">
                  {choose(content, "of thought.", "思路。")}
                </span>
              </h2>
              <p className="site-section-copy">
                {choose(
                  content,
                  "Great ideas don’t happen in a single tab. Give the whole process a place to live — from the first prompt to the final preview.",
                  "好想法不会只发生在一个标签页里。从第一条指令，到最后一次预览，让整个过程都在眼前。",
                )}
              </p>
            </div>
            <div className="site-idea-list">
              {[
                [
                  "01",
                  "One brief. A whole team.",
                  "一句话，调动整个团队。",
                  "Give several agents a direction with one spoken instruction.",
                  "用一条语音指令创建多个 Agent，并分别下发任务。",
                ],
                [
                  "02",
                  "Keep the work alive.",
                  "切换视线，工作继续。",
                  "Terminals, agents, and previews keep running as your attention moves.",
                  "Agent、终端和预览保持运行，不因你的注意力转移而中断。",
                ],
                [
                  "03",
                  "Step in at the right moment.",
                  "需要你时，再及时介入。",
                  "See when an agent finishes or needs your attention. Pick up right there.",
                  "直接看到哪个 Agent 完成了工作、哪个需要你，随时接上思路。",
                ],
              ].map(([num, title, zhTitle, body, zhBody]) => (
                <article key={num}>
                  <span className="site-mono">{num}</span>
                  <div>
                    <h3>{choose(content, title, zhTitle)}</h3>
                    <p>{choose(content, body, zhBody)}</p>
                  </div>
                  <Icon name="arrow" />
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="site-demo site-wrap" id="in-action">
          <div className="site-section-head">
            <div>
              <p className="site-mono">02 / LESS TALK. REAL WORK.</p>
              <h2>
                {choose(
                  content,
                  "Here’s the whole picture.",
                  "工作全貌，尽在眼前。",
                )}
              </h2>
            </div>
            <p>
              {choose(
                content,
                "Real agents. Real processes.\nActually running on your Mac.",
                "真实的 Agent，真实的进程。\n就在你的 Mac 上运行。",
              )}
            </p>
          </div>
          <DemoGallery locale={content.locale} />
        </section>
        <section className="site-local site-wrap" id="local-first">
          <span className="site-local-mark" aria-hidden="true">
            ⌘
          </span>
          <div>
            <p className="site-mono">ON YOUR MAC. ON YOUR TERMS.</p>
            <h2>
              {choose(
                content,
                "Your tools. Your rules.",
                "你的工具。你的主场。",
              )}
            </h2>
            <p>
              {choose(
                content,
                "Keep your projects on your Mac and bring the agents you already use. Norma brings it together. You stay in charge.",
                "项目文件留在你的 Mac，Agent 由你选择。Norma 让一切协同起来，决定权始终在你。",
              )}
            </p>
          </div>
          <span className="site-local-stamp">
            LOCAL
            <br />
            FIRST <span>↙</span>
          </span>
        </section>
        <Faq content={content} />
        <Closing content={content} />
      </main>
      <Footer content={content} />
    </div>
  );
}

function Footer({ content }: Props) {
  return (
    <footer className="site-footer site-wrap">
      <Logo />
      <span>© 2026 Multisoul</span>
      <p>
        {choose(content, "Made for the way you think.", "为你的工作方式而造。")}
      </p>
      <a href={githubUrl} target="_blank" rel="noreferrer">
        GitHub ↗
      </a>
      <a href="#top">{choose(content, "Back to top ↑", "回到顶部 ↑")}</a>
    </footer>
  );
}
