import Link from "next/link";
import { AutoplayVideo } from "./autoplay-video";
import { Brand } from "./brand";
import { ProductStage } from "./product-stage";
import type { SiteContent } from "../site-content";
import { githubUrl, latestDownloadUrl } from "../site-constants";
import { MobileNavigation } from "./mobile-navigation";
import { ScrollStory } from "./scroll-story";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M3.5 10h12M11.5 6l4 4-4 4" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M15 21v-3.8c.04-1-.36-1.96-1.1-2.64 3.6-.4 7.38-1.77 7.38-8A6.24 6.24 0 0 0 19.62 2c.16-.45.7-2.08-.16-4.1 0 0-1.34-.43-4.4 1.64a15.2 15.2 0 0 0-8 0C4-2.53 2.66-2.1 2.66-2.1 1.8-.08 2.34 1.55 2.5 2A6.24 6.24 0 0 0 .84 6.56c0 6.22 3.78 7.6 7.38 8A3.7 3.7 0 0 0 7.1 17.4V21" />
      <path d="M7.1 18.2c-3.1.95-3.1-1.55-4.34-1.86" />
    </svg>
  );
}

function Header({ content }: { content: SiteContent }) {
  const isEnglish = content.locale === "en";

  return (
    <header className="site-header" data-material="liquid-glass">
      <a className="site-header__brand" href="#top">
        <Brand />
      </a>
      <nav className="desktop-nav" aria-label={content.nav.label}>
        <a href="#product">{content.nav.product}</a>
        <a href="#how-it-works">{content.nav.story}</a>
        <a href="#features">{content.nav.features}</a>
      </nav>
      <div className="header-actions">
        <div className="locale-links" aria-label="Language">
          <Link aria-current={isEnglish ? "page" : undefined} href="/" lang="en">
            EN
          </Link>
          <Link
            aria-current={isEnglish ? undefined : "page"}
            href="/zh-cn"
            lang="zh-CN"
          >
            中文
          </Link>
        </div>
        <a
          aria-label={content.nav.githubLabel}
          className="github-link"
          href={githubUrl}
        >
          <GitHubIcon />
        </a>
        <a className="glass-button glass-button--header" href={latestDownloadUrl}>
          {content.nav.download}
          <ArrowIcon />
        </a>
      </div>
      <MobileNavigation isEnglish={isEnglish} nav={content.nav} />
    </header>
  );
}

function Hero({ content }: { content: SiteContent }) {
  const { stage } = content.hero;

  return (
    <section
      aria-labelledby="hero-title"
      className="hero hero--split"
      id="top"
    >
      <div className="hero__copy">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {content.hero.eyebrow}
        </p>
        <h1 aria-label={content.hero.title} id="hero-title">
          <span>{content.hero.titleStart}</span>
          <em>{content.hero.titleEmphasis}</em>
          <span>{content.hero.titleEnd}</span>
        </h1>
        <p className="hero__description">{content.hero.description}</p>
        <div className="hero__actions">
          <a
            className="glass-button glass-button--primary"
            href={latestDownloadUrl}
          >
            {content.hero.download}
            <ArrowIcon />
          </a>
          <a className="text-button" href="#how-it-works">
            {content.hero.secondaryAction}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className="hero__download-note">
          {content.hero.platform}
          <span aria-hidden="true">·</span>
          {content.hero.security}
        </p>
      </div>

      <div className="hero__stage">
        <ProductStage label={stage.label}>
          <AutoplayVideo
            className="product-stage__video"
            label={stage.videoLabel}
            pauseLabel={content.mediaControls.pause}
            playLabel={content.mediaControls.play}
            poster={stage.poster}
            preload="metadata"
            src={stage.media}
          />
        </ProductStage>
      </div>
    </section>
  );
}

function Compatibility({ content }: { content: SiteContent }) {
  return (
    <section className="compatibility" id="product">
      <div className="compatibility__copy">
        <p className="section-kicker">{content.compatibility.eyebrow}</p>
        <h2>{content.compatibility.heading}</h2>
      </div>
      <div className="agent-list" aria-label={content.compatibility.eyebrow}>
        {content.compatibility.agents.map((agent, index) => (
          <span className="agent-pill" key={agent}>
            <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
            {agent}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features({ content }: { content: SiteContent }) {
  return (
    <section className="features-section" id="features">
      <div className="section-heading section-heading--split">
        <div>
          <p className="section-kicker">{content.features.eyebrow}</p>
          <h2>{content.features.heading}</h2>
        </div>
        <p>{content.features.introduction}</p>
      </div>
      <div className="feature-grid">
        {content.features.items.map((item, index) => (
          <article className="feature-card" key={item.title}>
            <div className="feature-card__top">
              <span aria-hidden="true" className="feature-card__mark">
                {item.mark}
              </span>
              <span className="feature-card__index">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Trust({ content }: { content: SiteContent }) {
  return (
    <section className="trust-section" id="trust">
      <div className="trust-section__intro">
        <p className="section-kicker section-kicker--inverse">
          {content.trust.eyebrow}
        </p>
        <h2>{content.trust.heading}</h2>
        <p>{content.trust.introduction}</p>
      </div>
      <div className="trust-grid">
        {content.trust.points.map((point, index) => (
          <article className="trust-card" key={point.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faq({ content }: { content: SiteContent }) {
  return (
    <section className="faq-section" id="faq">
      <div className="section-heading faq-section__heading">
        <p className="section-kicker">{content.faq.eyebrow}</p>
        <h2>{content.faq.heading}</h2>
      </div>
      <div className="faq-list">
        {content.faq.items.map((item, index) => (
          <details className="faq-item" key={item.question}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.question}</strong>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ content }: { content: SiteContent }) {
  return (
    <section className="final-cta" id="download">
      <div className="final-cta__glow" aria-hidden="true" />
      <p className="section-kicker">{content.finalCta.eyebrow}</p>
      <h2>{content.finalCta.heading}</h2>
      <p>{content.finalCta.body}</p>
      <a
        className="glass-button glass-button--primary final-cta__button"
        href={latestDownloadUrl}
      >
        {content.finalCta.download}
        <ArrowIcon />
      </a>
      <small>{content.finalCta.note}</small>
    </section>
  );
}

function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer">
      <div>
        <Brand />
        <p>{content.footer.tagline}</p>
      </div>
      <div className="site-footer__links">
        <a href={githubUrl}>GitHub</a>
        <Link href={content.locale === "en" ? "/zh-cn" : "/"}>
          {content.locale === "en" ? "中文" : "English"}
        </Link>
        <a href={latestDownloadUrl}>{content.nav.download}</a>
      </div>
      <p>
        © 2026 Multisoul
        <span aria-hidden="true">·</span>
        {content.footer.privacy}
      </p>
    </footer>
  );
}

export function MarketingPage({ content }: { content: SiteContent }) {
  return (
    <>
      <Header content={content} />
      <main lang={content.locale}>
        <Hero content={content} />
        <Compatibility content={content} />
        <ScrollStory
          controls={content.mediaControls}
          eyebrow={content.story.eyebrow}
          heading={content.story.heading}
          introduction={content.story.introduction}
          steps={content.story.steps}
        />
        <Features content={content} />
        <Trust content={content} />
        <Faq content={content} />
        <FinalCta content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
