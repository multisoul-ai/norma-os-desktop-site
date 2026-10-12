"use client";

import { useId, useRef, useState } from "react";
import type { SiteLocale } from "../site-content";
import { productDemos } from "../product-demos";

const labels = {
  en: [
    "Say it once",
    "Work together",
    "Find your focus",
    "Make room",
    "Stay in the loop",
  ],
  "zh-CN": ["一句话群控", "Agent 协作", "快速聚焦", "重排布局", "及时响应"],
};

export function DemoGallery({ locale }: { locale: SiteLocale }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = productDemos[active];
  const copy = demo.copy[locale];
  const chinese = locale === "zh-CN";

  return (
    <div className="site-demo-gallery">
      <div
        className="site-demo-tabs"
        role="tablist"
        aria-label={chinese ? "产品演示" : "Product demonstrations"}
      >
        {labels[locale].map((label, index) => (
          <button
            key={productDemos[index].id}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            type="button"
            id={`${id}-tab-${index}`}
            role="tab"
            tabIndex={active === index ? 0 : -1}
            aria-selected={active === index}
            aria-controls={`${id}-panel`}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? productDemos.length - 1
                    : (index +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        productDemos.length) %
                      productDemos.length;
              setActive(next);
              tabs.current[next]?.focus({ preventScroll: true });
              tabs.current[next]?.scrollIntoView({
                block: "nearest",
                inline: "nearest",
              });
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="site-demo-panel"
        tabIndex={0}
      >
        <div className="site-demo-chrome">
          <span className="site-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            Norma OS <span className="site-demo-slash">/</span>{" "}
            {chinese ? "真实工作区" : "a real workspace"}
          </span>
          <span className="site-mono">
            {chinese ? "NORMA 实机录制" : "RECORDED IN NORMA"}
          </span>
        </div>
        <video
          key={demo.id}
          controls
          playsInline
          preload="none"
          poster={demo.poster}
          aria-label={copy.videoLabel}
        >
          {demo.mobileMedia && (
            <source
              src={demo.mobileMedia}
              media="(max-width: 640px)"
              type="video/mp4"
            />
          )}
          <source src={demo.media} type="video/mp4" />
          {copy.videoLabel}
        </video>
      </div>
      <div className="site-demo-caption" aria-live="polite">
        <span className="site-mono">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(productDemos.length).padStart(2, "0")}
        </span>
        <p>{copy.body}</p>
      </div>
    </div>
  );
}
