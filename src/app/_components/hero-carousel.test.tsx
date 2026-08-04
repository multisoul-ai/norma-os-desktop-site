// @vitest-environment jsdom

import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { englishContent } from "../site-content";
import { HeroCarousel } from "./hero-carousel";

class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [];

  constructor(readonly callback: IntersectionObserverCallback) {}

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
    }),
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HeroCarousel", () => {
  /// Hero demonstration rotation: voice group control leads, Agent collaboration follows second, and the overview remains third without mounting multiple playing videos.
  ///
  /// Data construction (including derivation of key values):
  ///   carousel slides    = voice group control(1) + Agent collaboration(1) + Command Center overview(1) = 3 demonstrations
  ///   initial slide      = index 0 → public counter 01 / 03
  ///   next navigation    = (index 0 + offset 1) mod slideCount(3) = index 1
  ///   ended navigation   = (index 1 + offset 1) mod slideCount(3) = index 2
  ///   wrap navigation    = (index 2 + offset 1) mod slideCount(3) = index 0
  ///   mounted videos     = active slide(1) + inactive slides(0) = exactly 1 media element
  ///
  /// Execution:
  ///   1. Render the English hero carousel with inert viewport observation → voice group control is the initial active slide
  ///   2. Inspect its video source and slide controls → only the 2.5× voice demo is mounted and marked active
  ///   3. Select Next demonstration → Agent collaboration replaces voice in the same product shell
  ///   4. Dispatch the collaboration video ended event → the overview becomes the third active demonstration
  ///   5. Dispatch the overview video ended event → the carousel wraps from index 2 back to index 0
  ///
  /// Expected:
  ///   - Positive: voice starts first, collaboration is second, overview is third, and media completion wraps to voice
  ///   - Negative: the inactive video never remains mounted beside the selected slide
  it("places voice group control first and rotates one active hero video", () => {
    const { hero, mediaControls } = englishContent;
    const view = render(
      <HeroCarousel
        carouselLabel={hero.carouselLabel}
        controls={mediaControls}
        nextDemoLabel={hero.nextDemoLabel}
        previousDemoLabel={hero.previousDemoLabel}
        showDemoLabel={hero.showDemoLabel}
        slides={hero.slides}
      />,
    );
    const carousel = view.getByRole("region", {
      name: hero.carouselLabel,
    });
    const voiceControl = within(carousel).getByRole("button", {
      name: `${hero.showDemoLabel}: ${hero.slides[0].title}`,
    });
    const collaborationControl = within(carousel).getByRole("button", {
      name: `${hero.showDemoLabel}: ${hero.slides[1].title}`,
    });
    const overviewControl = within(carousel).getByRole("button", {
      name: `${hero.showDemoLabel}: ${hero.slides[2].title}`,
    });
    const initialVideo = within(carousel).getByLabelText(
      hero.slides[0].stage.videoLabel,
    );

    expect(
      initialVideo.getAttribute("src"),
      "the first hero slide must mount the edited 2.5× voice group-control recording",
    ).toBe("/media/demo-voice-command.mp4");
    expect(
      voiceControl.getAttribute("aria-pressed"),
      "the voice group-control selector must be active when the hero first renders",
    ).toBe("true");
    expect(
      within(carousel).queryByLabelText(hero.slides[1].stage.videoLabel),
      "the inactive collaboration video must not remain mounted behind the voice demonstration",
    ).toBeNull();

    fireEvent.click(
      within(carousel).getByRole("button", {
        name: hero.nextDemoLabel,
      }),
    );

    const collaborationVideo = within(carousel).getByLabelText(
      hero.slides[1].stage.videoLabel,
    );
    expect(
      collaborationVideo.getAttribute("src"),
      "Next demonstration must place the Agent collaboration recording directly after voice group control",
    ).toBe("/media/demo-agent-collaboration.mp4");
    expect(
      collaborationControl.getAttribute("aria-pressed"),
      "the collaboration selector must become active after the visitor advances from voice",
    ).toBe("true");
    expect(
      voiceControl.getAttribute("aria-pressed"),
      "the voice selector must relinquish active state while collaboration is selected",
    ).toBe("false");
    expect(
      within(carousel).queryByLabelText(hero.slides[0].stage.videoLabel),
      "the inactive voice video must be unmounted after collaboration replaces it",
    ).toBeNull();

    fireEvent.ended(collaborationVideo);

    const overviewVideo = within(carousel).getByLabelText(
      hero.slides[2].stage.videoLabel,
    );
    expect(
      overviewVideo.getAttribute("src"),
      "finishing collaboration must advance to the Command Center overview as demonstration three",
    ).toBe("/media/demo-hero-overview.mp4");
    expect(
      overviewControl.getAttribute("aria-pressed"),
      "the overview selector must become active only after the second collaboration demonstration",
    ).toBe("true");
    expect(
      within(carousel).queryByLabelText(hero.slides[1].stage.videoLabel),
      "the completed collaboration video must not remain mounted behind the overview",
    ).toBeNull();

    fireEvent.ended(overviewVideo);

    expect(
      within(carousel)
        .getByLabelText(hero.slides[0].stage.videoLabel)
        .getAttribute("src"),
      "finishing the last slide must wrap the carousel back to the voice group-control proof",
    ).toBe("/media/demo-voice-command.mp4");
    expect(
      within(carousel).queryByLabelText(hero.slides[2].stage.videoLabel),
      "the completed overview must not remain mounted after the carousel wraps to voice",
    ).toBeNull();
  });
});
