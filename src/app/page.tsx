"use client";

import Image from "next/image";
import { I18nProvider, useI18n } from "../i18n/i18n";
import { LanguageSwitcher } from "../i18n/language-switcher";
import { HeroProductCarousel } from "./hero-product-carousel";

const capabilityMeta = [
  {
    index: "01",
    className: "capability capability--canvas",
    label: "SPATIAL CANVAS",
  },
  {
    index: "02",
    className: "capability capability--terminal",
    label: "REAL SHELL",
  },
  {
    index: "03",
    className: "capability capability--agents",
    label: "PROJECT AGENTS",
  },
  {
    index: "04",
    className: "capability capability--restore",
    label: "WORKSPACE RESTORE",
  },
  {
    index: "05",
    className: "capability capability--files",
    label: "FILES + WEB",
  },
  {
    index: "06",
    className: "capability capability--windows",
    label: "MULTI-WINDOW",
  },
];

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2.5c.8 5.2 3.2 7.7 8.5 8.5-5.3.8-7.7 3.3-8.5 8.5-.8-5.2-3.2-7.7-8.5-8.5 5.3-.8 7.7-3.3 8.5-8.5Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function Brand() {
  return (
    <span className="brand" aria-label="Norma OS">
      <Image
        alt=""
        aria-hidden="true"
        className="brand__icon"
        height={256}
        priority
        sizes="36px"
        src="/brand/app-icon.png"
        width={256}
      />
      <span>Norma OS</span>
    </span>
  );
}

function Header() {
  const { dictionary: t } = useI18n();
  const navItems = [
    { label: t.nav.product, href: "#product" },
    { label: t.nav.liveNodes, href: "#live-nodes" },
    { label: t.nav.voice, href: "#voice" },
    { label: t.nav.principles, href: "#principles" },
  ];

  return (
    <header className="site-header">
      <a className="site-header__brand" href="#top">
        <Brand />
      </a>

      <nav className="desktop-nav" aria-label={t.nav.primaryLabel}>
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <LanguageSwitcher />
        <a className="header-cta" href="#get-beta">
          {t.nav.getBeta}
          <ArrowIcon />
        </a>
      </div>

      <details className="mobile-nav">
        <summary aria-label={t.nav.openMenu}>
          <span />
          <span />
        </summary>
        <nav aria-label={t.nav.mobileLabel}>
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#get-beta">{t.nav.getBeta}</a>
          <LanguageSwitcher className="language-switcher--mobile" />
        </nav>
      </details>
    </header>
  );
}

function Hero() {
  const { dictionary: t } = useI18n();
  const productSlides = [
    {
      alt: t.hero.slides[0].alt,
      src: "/brand/norma-workspace-canvas.webp",
    },
    {
      alt: t.hero.slides[1].alt,
      src: "/brand/norma-workspace-live-nodes.webp",
    },
    {
      alt: t.hero.slides[2].alt,
      src: "/brand/norma-workspace-focused-agent.webp",
    },
    {
      alt: t.hero.slides[3].alt,
      src: "/brand/norma-workspace-agent-collaboration.webp",
    },
  ] as const;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__optical-material" aria-hidden="true">
        <Image
          alt=""
          className="hero__optical-image"
          height={941}
          priority
          sizes="100vw"
          src="/brand/liquid-glass-hero.png"
          width={1672}
        />
      </div>
      <div className="hero__ambient hero__ambient--one" aria-hidden="true" />
      <div className="hero__ambient hero__ambient--two" aria-hidden="true" />
      <div className="soul-fragments" aria-hidden="true" data-material="liquid-glass">
        <span className="soul-fragment soul-fragment--violet" />
        <span className="soul-fragment soul-fragment--mint" />
        <span className="soul-fragment soul-fragment--clear" />
      </div>

      <div className="hero__copy">
        <p className="eyebrow reveal reveal--one">
          <span className="status-dot status-dot--mint" />
          {t.hero.eyebrow}
        </p>
        <h1 id="hero-title" className="reveal reveal--two">
          <span>{t.hero.titleOne}</span>
          <span>{t.hero.titleTwo}</span>
        </h1>
        <p className="hero__description reveal reveal--three">
          {t.hero.descriptionOne}
          <br />{" "}
          {t.hero.descriptionTwo}
        </p>
        <div className="hero__actions reveal reveal--four">
          <a className="button button--primary" href="#product">
            {t.hero.primaryAction}
            <ArrowIcon />
          </a>
          <a className="button button--text" href="#live-nodes">
            {t.hero.secondaryAction}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="hero-device reveal reveal--five">
        <div className="hero-device__camera" aria-hidden="true" />
        <div className="hero-device__screen">
          <HeroProductCarousel
            label={t.hero.carouselLabel}
            nextLabel={t.hero.nextScreenshot}
            previousLabel={t.hero.previousScreenshot}
            showLabel={t.hero.showScreenshot}
            slides={productSlides}
          />
        </div>
        <div className="hero-device__chin" aria-hidden="true">
          <span />
        </div>
      </div>

      <p className="hero__promise">{t.hero.promise}</p>
    </section>
  );
}

function ProductIntro() {
  const { dictionary: t } = useI18n();

  return (
    <section className="product-intro section" id="product" aria-labelledby="product-title">
      <div className="section-heading product-intro__heading">
        <p className="section-index">{t.product.index}</p>
        <h2 id="product-title">
          {t.product.titleOne}
          <br />
          <span>{t.product.titleTwo}</span>
        </h2>
        <p>{t.product.intro}</p>
      </div>

      <div className="principle-cards" aria-label={t.product.cardsLabel}>
        <article className="principle-card principle-card--canvas">
          <div className="principle-card__topline">
            <span className="mini-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>01</span>
          </div>
          <div className="canvas-mini" aria-hidden="true">
            <span className="canvas-mini__node canvas-mini__node--one" />
            <span className="canvas-mini__node canvas-mini__node--two" />
            <span className="canvas-mini__node canvas-mini__node--three" />
            <svg fill="none" viewBox="0 0 260 130">
              <path d="M53 44h49c27 0 14 42 39 42h66" />
              <path d="M98 44v65h56" />
            </svg>
          </div>
          <h3>{t.product.cards[0].title}</h3>
          <p>{t.product.cards[0].body}</p>
        </article>

        <article className="principle-card principle-card--live">
          <div className="principle-card__topline">
            <span className="wave-icon" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <i key={index} />
              ))}
            </span>
            <span>02</span>
          </div>
          <div className="live-mini" aria-hidden="true">
            <div>
              <span />
              <span />
              <span />
            </div>
            <i />
            <strong>72%</strong>
          </div>
          <h3>{t.product.cards[1].title}</h3>
          <p>{t.product.cards[1].body}</p>
        </article>

        <article className="principle-card principle-card--aware">
          <div className="principle-card__topline">
            <SparkIcon className="spark-icon" />
            <span>03</span>
          </div>
          <div className="aware-mini" aria-hidden="true">
            <span className="aware-mini__card">
              <i />
              <i />
              <i />
            </span>
            <span className="aware-mini__state">
              <b />
            </span>
          </div>
          <h3>{t.product.cards[2].title}</h3>
          <p>{t.product.cards[2].body}</p>
        </article>
      </div>
    </section>
  );
}

function NodeCard({ type }: { type: "terminal" | "agent" | "browser" | "preview" }) {
  if (type === "terminal") {
    return (
      <article className="node-card node-card--terminal">
        <header>
          <span><i className="node-dot node-dot--violet" />TERMINAL</span>
          <em>RUNNING</em>
        </header>
        <div className="terminal-body">
          <p><b>~</b> pnpm build</p>
          <p className="terminal-muted">Creating an optimized build…</p>
          <p className="terminal-success">✓ Compiled successfully</p>
          <p><b>~</b> <span className="terminal-caret" /></p>
        </div>
      </article>
    );
  }

  if (type === "agent") {
    return (
      <article className="node-card node-card--agent">
        <header>
          <span><i className="node-dot node-dot--violet" />AGENT</span>
          <em>CODING</em>
        </header>
        <div className="agent-body">
          <div className="agent-identity">
            <span><SparkIcon /></span>
            <div>
              <strong>Norma</strong>
              <small>Implementing canvas controls</small>
            </div>
          </div>
          <div className="agent-progress"><i /></div>
          <ul>
            <li className="done">Read project context <span>✓</span></li>
            <li className="done">Update node layout <span>✓</span></li>
            <li className="active">Verify interactions <span /></li>
          </ul>
        </div>
      </article>
    );
  }

  if (type === "browser") {
    return (
      <article className="node-card node-card--browser">
        <header>
          <span><i className="node-dot node-dot--cobalt" />BROWSER</span>
          <em>ONLINE</em>
        </header>
        <div className="browser-bar"><span>‹</span><span>›</span><i>norma-os.dev</i></div>
        <div className="browser-body">
          <small>DOCUMENTATION</small>
          <strong>Canvas API</strong>
          <p>Compose tools in one persistent space.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="node-card node-card--preview">
      <header>
        <span><i className="node-dot node-dot--mint" />PREVIEW</span>
        <em>SYNCED</em>
      </header>
      <div className="preview-body">
        <small>README.md</small>
        <h4># Norma OS</h4>
        <span className="text-line text-line--wide" />
        <span className="text-line" />
        <h5>## Working state</h5>
        <span className="text-line text-line--medium" />
      </div>
    </article>
  );
}

function LiveNodes() {
  const { dictionary: t } = useI18n();

  return (
    <section className="live-section" id="live-nodes" aria-labelledby="live-title">
      <div className="live-section__material" aria-hidden="true">
        <Image
          alt=""
          className="live-section__material-image"
          height={941}
          sizes="100vw"
          src="/brand/liquid-glass-flow.png"
          width={1672}
        />
      </div>
      <div className="live-section__glow" aria-hidden="true" />
      <div className="live-section__copy">
        <p className="section-index section-index--light">{t.live.index}</p>
        <h2 id="live-title">
          {t.live.titleOne}
          <br />
          <span>{t.live.titleTwo}</span>
        </h2>
        <p>{t.live.body}</p>
        <div className="runtime-chips" aria-label={t.live.runtimesLabel}>
          <span>Claude</span>
          <span>Codex</span>
          <span>Cursor</span>
          <span>OpenCode</span>
        </div>
      </div>

      <div className="node-stage" aria-label={t.live.stageLabel}>
        <svg className="node-stage__paths" fill="none" viewBox="0 0 760 650" aria-hidden="true">
          <path d="M330 151h62c31 0 15 48 48 48h38" />
          <path d="M201 268v79c0 30 22 35 49 35h102" />
          <path d="M483 310v70c0 31-24 38-53 38h-36" />
        </svg>
        <NodeCard type="terminal" />
        <NodeCard type="agent" />
        <NodeCard type="browser" />
        <NodeCard type="preview" />
        <div className="stage-label stage-label--one">REAL PROCESS</div>
        <div className="stage-label stage-label--two">PERSISTENT STATE</div>
      </div>
    </section>
  );
}

function StatusLanguage() {
  const { dictionary: t } = useI18n();
  const statuses = [
    { name: "THINKING", detail: t.status.details[0], className: "thinking" },
    { name: "TOOL CALL", detail: t.status.details[1], className: "tool" },
    { name: "WAITING", detail: t.status.details[2], className: "waiting" },
    { name: "COMPLETE", detail: t.status.details[3], className: "complete" },
    { name: "ERROR", detail: t.status.details[4], className: "error" },
  ];

  return (
    <section className="status-section" aria-labelledby="status-title">
      <div className="status-section__heading">
        <p className="section-index">{t.status.index}</p>
        <h2 id="status-title">
          {t.status.titleOne}
          <br />
          <span>{t.status.titleTwo}</span>
        </h2>
        <p>{t.status.body}</p>
        <figure className="norma-presence" data-material="liquid-glass">
          <div className="norma-presence__portrait">
            <Image
              alt={t.status.mascotAlt}
              className="norma-presence__image"
              height={1402}
              sizes="(max-width: 680px) 120px, 160px"
              src="/brand/norma-ai-soul.png"
              width={1122}
            />
          </div>
          <figcaption>
            <span>{t.status.mascotRole}</span>
            <strong>{t.status.mascotName}</strong>
            <small>{t.status.mascotNote}</small>
          </figcaption>
        </figure>
      </div>

      <div className="status-console">
        <div className="status-console__topbar">
          <Brand />
          <span>LIVE STATUS</span>
        </div>
        <div className="status-list">
          {statuses.map((status) => (
            <div className={`status-row status-row--${status.className}`} key={status.name}>
              <span className="status-row__icon"><i /></span>
              <strong>{status.name}</strong>
              <span className="status-row__signal"><i /></span>
              <small>{status.detail}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const { dictionary: t } = useI18n();

  return (
    <section className="capabilities-section section" aria-labelledby="capabilities-title">
      <div className="capabilities-section__heading">
        <p className="section-index">{t.capabilities.index}</p>
        <h2 id="capabilities-title">{t.capabilities.titleOne}<br /><span>{t.capabilities.titleTwo}</span></h2>
        <p>{t.capabilities.intro}</p>
      </div>

      <div className="capabilities-grid">
        {capabilityMeta.map((capability, itemIndex) => (
          <article className={capability.className} key={capability.index}>
            <div className="capability__meta">
              <span>{capability.index}</span>
              <span>{capability.label}</span>
            </div>
            <div className="capability__art" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <h3>{t.capabilities.items[itemIndex].title}</h3>
            <p>{t.capabilities.items[itemIndex].body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Voice() {
  const { dictionary: t } = useI18n();

  return (
    <section className="voice-section" id="voice" aria-labelledby="voice-title">
      <div className="voice-section__visual">
        <Image
          alt={t.voice.imageAlt}
          className="voice-section__image"
          height={941}
          sizes="(max-width: 900px) 100vw, 62vw"
          src="/brand/voice-light-state.png"
          width={1672}
        />
        <div className="voice-section__edge" aria-hidden="true" />
      </div>

      <div className="voice-section__copy">
        <p className="section-index section-index--light">{t.voice.index}</p>
        <h2 id="voice-title">{t.voice.titleOne}<br /><span>{t.voice.titleTwo}</span></h2>
        <p>{t.voice.body}</p>
        <ul>
          {t.voice.features.map((feature) => (
            <li key={feature}><span className="voice-check" />{feature}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Principles() {
  const { dictionary: t } = useI18n();

  return (
    <section className="philosophy section" id="principles" aria-labelledby="principles-title">
      <div className="philosophy__intro">
        <p className="section-index">{t.principles.index}</p>
        <h2 id="principles-title">{t.principles.title}</h2>
        <p>{t.principles.intro}</p>
      </div>

      <div className="philosophy__list">
        {t.principles.items.map((principle, itemIndex) => (
          <article key={principle.title}>
            <span>{String(itemIndex + 1).padStart(2, "0")}</span>
            <h3>{principle.title}</h3>
            <p>{principle.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Beta() {
  const { dictionary: t } = useI18n();

  return (
    <section className="beta-section" id="get-beta" aria-labelledby="beta-title">
      <div className="beta-section__orbit beta-section__orbit--one" aria-hidden="true" />
      <div className="beta-section__orbit beta-section__orbit--two" aria-hidden="true" />
      <div className="beta-section__mark" aria-hidden="true">×</div>
      <div className="beta-section__copy">
        <p className="eyebrow"><span className="status-dot status-dot--acid" />{t.beta.eyebrow}</p>
        <h2 id="beta-title">{t.beta.titleOne}<br /><span>{t.beta.titleTwo}</span></h2>
        <p>{t.beta.body}</p>
        <a className="button button--light" href="#top">
          {t.beta.backToTop}
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const { dictionary: t } = useI18n();

  return (
    <footer className="site-footer">
      <Brand />
      <p>{t.footer.tagline}</p>
      <div>
        <span>© 2026 Norma OS</span>
        <span>{t.footer.platform}</span>
      </div>
    </footer>
  );
}

function LocalizedHome() {
  return (
    <main>
      <Header />
      <Hero />
      <ProductIntro />
      <LiveNodes />
      <StatusLanguage />
      <Capabilities />
      <Voice />
      <Principles />
      <Beta />
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <LocalizedHome />
    </I18nProvider>
  );
}
