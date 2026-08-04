"use client";

import { useState } from "react";
import type { HeroSlide } from "../site-content";
import { DemoStage } from "./demo-stage";

type HeroCarouselProps = {
  carouselLabel: string;
  controls: {
    pause: string;
    play: string;
  };
  nextDemoLabel: string;
  previousDemoLabel: string;
  showDemoLabel: string;
  slides: HeroSlide[];
};

function CarouselArrow({ direction }: { direction: "next" | "previous" }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path
        d={direction === "next" ? "M4 10h12m-4-4 4 4-4 4" : "M16 10H4m4-4-4 4 4 4"}
      />
    </svg>
  );
}

export function HeroCarousel({
  carouselLabel,
  controls,
  nextDemoLabel,
  previousDemoLabel,
  showDemoLabel,
  slides,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];

  const move = (offset: number) => {
    setActiveIndex((currentIndex) => {
      return (currentIndex + offset + slides.length) % slides.length;
    });
  };

  return (
    <div
      aria-label={carouselLabel}
      aria-roledescription="carousel"
      className="hero-carousel"
      data-active-slide={activeSlide.id}
      role="region"
    >
      <DemoStage
        controls={controls}
        key={activeSlide.id}
        loop={false}
        onEnded={() => move(1)}
        preload="metadata"
        stage={activeSlide.stage}
      />
      <div className="hero-carousel__rail">
        <p aria-live="polite">
          <span>
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
          <strong>{activeSlide.title}</strong>
        </p>
        <div className="hero-carousel__controls">
          <button
            aria-label={previousDemoLabel}
            className="hero-carousel__arrow"
            onClick={() => move(-1)}
            type="button"
          >
            <CarouselArrow direction="previous" />
          </button>
          <div className="hero-carousel__slides" role="group">
            {slides.map((slide, index) => (
              <button
                aria-label={`${showDemoLabel}: ${slide.title}`}
                aria-pressed={activeIndex === index}
                data-active={activeIndex === index}
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <button
            aria-label={nextDemoLabel}
            className="hero-carousel__arrow"
            onClick={() => move(1)}
            type="button"
          >
            <CarouselArrow direction="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
