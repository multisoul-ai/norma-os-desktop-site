"use client";

import { useEffect, useRef, useState } from "react";
import type { StoryStep } from "../site-content";
import { DemoStage } from "./demo-stage";

type ScrollStoryProps = {
  controls: {
    pause: string;
    play: string;
  };
  eyebrow: string;
  heading: string;
  introduction: string;
  steps: StoryStep[];
};

const storyActivationLineRatio = 0.5;

export function ScrollStory({
  controls,
  eyebrow,
  heading,
  introduction,
  steps,
}: ScrollStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const syncActiveStep = () => {
      const measuredTitles = stepRefs.current
        .map((title, index) => {
          if (!title) {
            return null;
          }

          const bounds = title.getBoundingClientRect();

          return {
            bottom: bounds.bottom,
            index,
            top: bounds.top,
          };
        })
        .filter(
          (
            title,
          ): title is {
            bottom: number;
            index: number;
            top: number;
          } => title !== null,
        );

      if (
        measuredTitles.length === 0 ||
        measuredTitles.every(
          (title) => title.top === 0 && title.bottom === 0,
        )
      ) {
        return;
      }

      const activationLine =
        window.innerHeight * storyActivationLineRatio;
      let nextIndex = 0;

      for (const title of measuredTitles) {
        if (title.top > activationLine) {
          break;
        }

        nextIndex = title.index;
      }

      setActiveIndex((currentIndex) => {
        if (currentIndex === nextIndex) {
          return currentIndex;
        }

        return nextIndex;
      });
    };

    syncActiveStep();
    window.addEventListener("resize", syncActiveStep);
    window.addEventListener("scroll", syncActiveStep, { passive: true });

    return () => {
      window.removeEventListener("resize", syncActiveStep);
      window.removeEventListener("scroll", syncActiveStep);
    };
  }, []);

  const activeStep = steps[activeIndex] ?? steps[0];

  return (
    <section className="story-section">
      <div className="story-layout">
        <div className="story-steps">
          <div
            className="section-heading story-section__heading"
            id="how-it-works"
          >
            <p className="section-kicker">{eyebrow}</p>
            <h2>{heading}</h2>
            <p>{introduction}</p>
          </div>

          {steps.map((step, index) => (
            <article
              className="story-step"
              data-active={activeIndex === index}
              data-story-index={index}
              key={step.number}
            >
              <button
                aria-current={activeIndex === index ? "step" : undefined}
                className="story-step__button"
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span className="story-step__number">{step.number}</span>
                <span className="story-step__copy">
                  <strong
                    data-story-index={index}
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                  >
                    {step.title}
                  </strong>
                  <span>{step.body}</span>
                </span>
              </button>
              <div className="story-step__mobile-stage">
                <DemoStage
                  active={activeIndex === index}
                  controls={controls}
                  stage={step.stage}
                  useMobileMedia
                />
              </div>
            </article>
          ))}
        </div>

        <div
          aria-live="polite"
          className="story-stage"
          data-active-story={activeStep.number}
        >
          <div className="story-stage__sticky">
            <DemoStage
              active
              controls={controls}
              key={activeStep.number}
              stage={activeStep.stage}
            />
            <p className="story-stage__caption">
              <span>{activeStep.number}</span>
              {activeStep.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
