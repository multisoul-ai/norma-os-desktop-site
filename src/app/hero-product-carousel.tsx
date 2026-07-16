"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

const AUTO_PLAY_DELAY_MS = 7_000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window.matchMedia !== "function") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function getReducedMotionServerSnapshot() {
  return false;
}

export type HeroProductSlide = {
  alt: string;
  src: string;
};

type HeroProductCarouselProps = {
  label: string;
  nextLabel: string;
  previousLabel: string;
  showLabel: string;
  slides: readonly HeroProductSlide[];
};

export function HeroProductCarousel({
  label,
  nextLabel,
  previousLabel,
  showLabel,
  slides,
}: HeroProductCarouselProps) {
  const [carouselState, setCarouselState] = useState(() => ({
    activeIndex: 0,
    slideCount: slides.length,
  }));
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const isPaused = isFocusWithin || isHovered;
  const maximumActiveIndex = Math.max(slides.length - 1, 0);
  const activeIndex = Math.min(carouselState.activeIndex, maximumActiveIndex);

  if (
    carouselState.slideCount !== slides.length ||
    carouselState.activeIndex !== activeIndex
  ) {
    setCarouselState({ activeIndex, slideCount: slides.length });
  }

  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion || isPaused) {
      return;
    }

    // 7,000 ms = one full reading interval before advancing exactly one slide.
    const timer = window.setTimeout(() => {
      setCarouselState((currentState) => ({
        activeIndex:
          (Math.min(currentState.activeIndex, maximumActiveIndex) + 1) %
          slides.length,
        slideCount: slides.length,
      }));
    }, AUTO_PLAY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    isPaused,
    maximumActiveIndex,
    prefersReducedMotion,
    slides.length,
  ]);

  if (slides.length === 0) {
    return null;
  }

  const hasNavigation = slides.length > 1;

  const showNextSlide = () => {
    setCarouselState((currentState) => ({
      activeIndex:
        (Math.min(currentState.activeIndex, maximumActiveIndex) + 1) %
        slides.length,
      slideCount: slides.length,
    }));
  };

  const showPreviousSlide = () => {
    setCarouselState((currentState) => ({
      activeIndex:
        (Math.min(currentState.activeIndex, maximumActiveIndex) - 1 +
          slides.length) %
        slides.length,
      slideCount: slides.length,
    }));
  };

  return (
    <div
      aria-label={label}
      className="hero-product-carousel"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusWithin(false);
        }
      }}
      onFocus={() => setIsFocusWithin(true)}
      onKeyDown={(event) => {
        if (!hasNavigation) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPreviousSlide();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNextSlide();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      tabIndex={0}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            aria-hidden={isActive ? undefined : true}
            className={`hero-product-carousel__slide${isActive ? " is-active" : ""}`}
            key={slide.src}
          >
            <Image
              alt={slide.alt}
              className="hero-product-carousel__image"
              fill
              priority={index === 0}
              sizes="(max-width: 760px) 95vw, 1180px"
              src={slide.src}
            />
          </div>
        );
      })}
      {hasNavigation ? (
        <>
          <button
            aria-label={previousLabel}
            className="hero-product-carousel__arrow hero-product-carousel__arrow--previous"
            onClick={showPreviousSlide}
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label={nextLabel}
            className="hero-product-carousel__arrow hero-product-carousel__arrow--next"
            onClick={showNextSlide}
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
          <div className="hero-product-carousel__pagination">
            {slides.map((slide, index) => (
              <button
                aria-label={`${showLabel} ${index + 1}`}
                aria-pressed={index === activeIndex}
                className={index === activeIndex ? "is-active" : undefined}
                key={slide.src}
                onClick={() =>
                  setCarouselState({
                    activeIndex: index,
                    slideCount: slides.length,
                  })
                }
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
