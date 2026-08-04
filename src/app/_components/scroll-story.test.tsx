// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { englishContent } from "../site-content";
import { ScrollStory } from "./scroll-story";

const voiceGroupControlTitle =
  /Voice group control: direct six Agents at once/;

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

function makeTitleRectangle(top: number): DOMRect {
  // A rendered story title is approximately 32px tall; bottom = top + height.
  const titleHeight = 32;

  return {
    bottom: top + titleHeight,
    height: titleHeight,
    left: 0,
    right: 300,
    toJSON: () => ({}),
    top,
    width: 300,
    x: 0,
    y: top,
  };
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
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Norma OS scroll story", () => {
  /// Direct chapter control: selecting the final real-demo chapter updates the one desktop product stage while preserving the complete five-step narrative.
  ///
  /// Data construction (including derivation of key values):
  ///   story chapters      = voice + collaboration + shortcut + layout + notification = 5 steps
  ///   initial active step = voice chapter → index 0 and public number 01
  ///   selected step       = notification chapter → index 4 and public number 05
  ///   desktop stages      = 1 sticky stage → exactly one active visual narrative
  ///
  /// Execution:
  ///   1. Render the English five-step story with inert viewport observation → voice chapter remains 01
  ///   2. Locate the first and fifth chapter controls → verify only the voice chapter is current
  ///   3. Select the Agent notification demo → React updates the active index from 0 to 4
  ///   4. Inspect the sticky stage → verify it now exposes the notification demo and chapter number 05
  ///   5. Reinspect the old chapter and old stage → verify neither remains current
  ///
  /// Expected:
  ///   - Positive: the fifth control becomes current and the sticky stage exposes the real Agent notification visual
  ///   - Negative: the first control and voice-group-control stage no longer remain active
  it("switches the single desktop stage to the selected chapter", () => {
    const view = render(
      <ScrollStory
        controls={englishContent.mediaControls}
        eyebrow={englishContent.story.eyebrow}
        heading={englishContent.story.heading}
        introduction={englishContent.story.introduction}
        steps={englishContent.story.steps}
      />,
    );
    const firstControl = screen.getByRole("button", {
      name: voiceGroupControlTitle,
    });
    const fifthControl = screen.getByRole("button", {
      name: /Know when an Agent needs you/,
    });

    expect(
      firstControl.getAttribute("aria-current"),
      "the voice-group-control chapter must be current before any visitor selection",
    ).toBe("step");
    expect(
      fifthControl.getAttribute("aria-current"),
      "the Agent notification chapter must not be current before it is selected",
    ).toBeNull();

    fireEvent.click(fifthControl);

    const activeStage = view.container.querySelector(
      '[data-active-story="05"]',
    );
    const desktopProductStages = view.container.querySelectorAll(
      ".story-stage .product-stage",
    );
    expect(
      fifthControl.getAttribute("aria-current"),
      "selecting the Agent notification chapter must mark its control as the current step",
    ).toBe("step");
    expect(
      firstControl.getAttribute("aria-current"),
      "selecting chapter five must remove current state from chapter one",
    ).toBeNull();
    expect(
      activeStage,
      "the desktop story stage must publish chapter number 05 after selection",
    ).not.toBeNull();
    expect(
      desktopProductStages.length,
      "the sticky desktop story must render exactly one product stage rather than duplicating active visuals",
    ).toBe(1);
    expect(
      within(activeStage as HTMLElement).getByRole("group", {
        name: englishContent.story.steps[4].stage.label,
      }),
      "the active desktop stage must expose the real Agent notification demonstration",
    ).toBeTruthy();
    expect(
      within(activeStage as HTMLElement).queryByRole("group", {
        name: englishContent.story.steps[0].stage.label,
      }),
      "the old voice-group-control visual must not remain mounted in the single desktop stage",
    ).toBeNull();
  });

  /// Responsive voice media: the desktop sticky shell keeps the 1080p master while the inline mobile chapter uses its dedicated 720p encode.
  ///
  /// Data construction (including derivation of key values):
  ///   desktop voice source = 1,920px × 1,080px = 2,073,600 source pixels
  ///   mobile voice source  = 1,280px ×   720px =   921,600 source pixels
  ///   pixel reduction      = 1 - 921,600 / 2,073,600 ≈ 55.6% fewer decoded pixels
  ///   story surfaces       = desktop sticky(1) + inline mobile chapters(5) = 6 rendered shells
  ///
  /// Execution:
  ///   1. Render the five-step English story → both responsive layouts are present for CSS to select
  ///   2. Resolve the single desktop-stage video → inspect the full-resolution voice source
  ///   3. Resolve chapter one's inline mobile video → inspect the mobile-specific source
  ///   4. Compare the two URLs → ensure the hidden desktop asset is not reused by the mobile chapter
  ///
  /// Expected:
  ///   - Positive: desktop uses demo-voice-command.mp4 and mobile uses demo-voice-command-mobile.mp4
  ///   - Negative: the inline mobile chapter cannot reference the 1080p desktop voice file
  it("serves the 720p voice encode to the inline mobile chapter", () => {
    const view = render(
      <ScrollStory
        controls={englishContent.mediaControls}
        eyebrow={englishContent.story.eyebrow}
        heading={englishContent.story.heading}
        introduction={englishContent.story.introduction}
        steps={englishContent.story.steps}
      />,
    );
    const desktopVideo = view.container.querySelector(
      ".story-stage video",
    );
    const mobileVoiceVideo = view.container.querySelector(
      '.story-step[data-story-index="0"] .story-step__mobile-stage video',
    );

    expect(
      desktopVideo,
      "the desktop story must expose one video for the active voice chapter",
    ).not.toBeNull();
    expect(
      mobileVoiceVideo,
      "the first inline mobile chapter must expose its own voice-command video",
    ).not.toBeNull();
    expect(
      desktopVideo?.getAttribute("src"),
      "the desktop sticky stage must retain the full-resolution voice-command source",
    ).toBe("/media/demo-voice-command.mp4");
    expect(
      mobileVoiceVideo?.getAttribute("src"),
      "the inline mobile stage must use the dedicated 720p voice-command source",
    ).toBe("/media/demo-voice-command-mobile.mp4");
    expect(
      mobileVoiceVideo?.getAttribute("src"),
      "the inline mobile stage must not decode the 1080p desktop voice-command source",
    ).not.toBe("/media/demo-voice-command.mp4");
  });

  /// Scroll activation timing: the next video waits until its own title crosses the viewport's central activation line.
  ///
  /// Data construction (including derivation of key values):
  ///   viewport height       = 800px
  ///   activation line       = 800px × 0.50 = 400px
  ///   premature title top   = 410px > 400px → chapter one remains active
  ///   eligible title top    = 390px ≤ 400px → chapter two becomes active
  ///   chapter-three top     = 1,030px > 400px → the shortcut demo may not activate
  ///   chapter-four top      = 1,670px > 400px → the layout demo may not activate
  ///   chapter-five top      = 2,310px > 400px → the notification demo may not activate
  ///
  /// Execution:
  ///   1. Render the five-step story and assign deterministic title positions
  ///   2. Place chapter two at 410px and dispatch scroll → its title has not crossed the 400px line
  ///   3. Inspect both controls → chapter one remains current and chapter two stays inactive
  ///   4. Move chapter two to 390px and dispatch scroll → its title has crossed the line
  ///   5. Reinspect both controls → chapter two becomes current and chapter one is released
  ///
  /// Expected:
  ///   - Positive: chapter two activates only after its title reaches the 400px line
  ///   - Negative: a title still 10px below that line cannot switch the video early
  it("waits for the next title before switching the active video", () => {
    // activationLine = viewportHeight(800) × 0.50 = 400px.
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    const view = render(
      <ScrollStory
        controls={englishContent.mediaControls}
        eyebrow={englishContent.story.eyebrow}
        heading={englishContent.story.heading}
        introduction={englishContent.story.introduction}
        steps={englishContent.story.steps}
      />,
    );
    const firstControl = screen.getByRole("button", {
      name: voiceGroupControlTitle,
    });
    const secondControl = screen.getByRole("button", {
      name: /Agents delegate tasks to each other/,
    });
    const firstTitle = view.container.querySelector(
      'strong[data-story-index="0"]',
    );
    const secondTitle = view.container.querySelector(
      'strong[data-story-index="1"]',
    );
    const thirdTitle = view.container.querySelector(
      'strong[data-story-index="2"]',
    );
    const fourthTitle = view.container.querySelector(
      'strong[data-story-index="3"]',
    );
    const fifthTitle = view.container.querySelector(
      'strong[data-story-index="4"]',
    );

    expect(
      firstTitle,
      "chapter one must expose its title anchor for activation-line measurement",
    ).not.toBeNull();
    expect(
      secondTitle,
      "chapter two must expose its title anchor for activation-line measurement",
    ).not.toBeNull();
    expect(
      thirdTitle,
      "chapter three must expose its title anchor for activation-line measurement",
    ).not.toBeNull();
    expect(
      fourthTitle,
      "chapter four must expose its title anchor for activation-line measurement",
    ).not.toBeNull();
    expect(
      fifthTitle,
      "chapter five must expose its title anchor for activation-line measurement",
    ).not.toBeNull();
    expect(
      view.container.querySelector('strong[data-story-index="5"]'),
      "a sixth placeholder chapter must not remain in the real five-demo sequence",
    ).toBeNull();

    let secondTitleTop = 410;
    vi.spyOn(firstTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(340),
    );
    vi.spyOn(secondTitle as HTMLElement, "getBoundingClientRect").mockImplementation(
      () => makeTitleRectangle(secondTitleTop),
    );
    vi.spyOn(thirdTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(1030),
    );
    vi.spyOn(fourthTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(1670),
    );
    vi.spyOn(fifthTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(2310),
    );

    fireEvent.scroll(window);

    expect(
      firstControl.getAttribute("aria-current"),
      "chapter one must remain current while chapter two is still below the 400px line",
    ).toBe("step");
    expect(
      secondControl.getAttribute("aria-current"),
      "chapter two must not activate while its title top remains at 410px",
    ).toBeNull();

    secondTitleTop = 390;
    fireEvent.scroll(window);

    expect(
      secondControl.getAttribute("aria-current"),
      "chapter two must activate after its title crosses above the 400px line",
    ).toBe("step");
    expect(
      firstControl.getAttribute("aria-current"),
      "chapter one must stop being current only after chapter two crosses the activation line",
    ).toBeNull();
  });

  /// Anchor-scroll reconciliation: a completed jump back to chapter one must replace a stale chapter-two video with the title currently at the activation line.
  ///
  /// Data construction (including derivation of key values):
  ///   viewport height       = 800px
  ///   activation line       = 800px × 0.50 = 400px
  ///   chapter-one title top = 340px ≤ 400px → chapter one is the latest reached title
  ///   chapter-two title top = 980px > 400px → chapter two has not reached the line
  ///   chapter-three top     = 1,620px > 400px → the shortcut demo may not activate
  ///   chapter-four top      = 2,260px > 400px → the layout demo may not activate
  ///   chapter-five top      = 2,900px > 400px → the notification demo may not activate
  ///
  /// Execution:
  ///   1. Render the five-step story and select collaboration chapter two → create the stale state seen after a long scroll
  ///   2. Place chapter one above the 400px activation line and every later title below it
  ///   3. Dispatch the scroll event emitted by a completed anchor jump
  ///   4. Inspect chapter controls and the desktop stage after position reconciliation
  ///
  /// Expected:
  ///   - Positive: chapter one becomes current and the sticky stage publishes number 01
  ///   - Negative: chapter two cannot remain current when its title is still 580px below the activation line
  it("reconciles the active video after an anchor scroll jump", () => {
    // activationLine = viewportHeight(800) × 0.50 = 400px.
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    const view = render(
      <ScrollStory
        controls={englishContent.mediaControls}
        eyebrow={englishContent.story.eyebrow}
        heading={englishContent.story.heading}
        introduction={englishContent.story.introduction}
        steps={englishContent.story.steps}
      />,
    );
    const firstControl = screen.getByRole("button", {
      name: voiceGroupControlTitle,
    });
    const secondControl = screen.getByRole("button", {
      name: /Agents delegate tasks to each other/,
    });
    const firstTitle = view.container.querySelector(
      'strong[data-story-index="0"]',
    );
    const secondTitle = view.container.querySelector(
      'strong[data-story-index="1"]',
    );
    const thirdTitle = view.container.querySelector(
      'strong[data-story-index="2"]',
    );
    const fourthTitle = view.container.querySelector(
      'strong[data-story-index="3"]',
    );
    const fifthTitle = view.container.querySelector(
      'strong[data-story-index="4"]',
    );

    expect(
      firstTitle,
      "chapter one must expose its measured title anchor for scroll reconciliation",
    ).not.toBeNull();
    expect(
      secondTitle,
      "chapter two must expose its measured title anchor for scroll reconciliation",
    ).not.toBeNull();
    expect(
      thirdTitle,
      "chapter three must expose its measured title anchor for scroll reconciliation",
    ).not.toBeNull();
    expect(
      fourthTitle,
      "chapter four must expose its measured title anchor for scroll reconciliation",
    ).not.toBeNull();
    expect(
      fifthTitle,
      "chapter five must expose its measured title anchor for scroll reconciliation",
    ).not.toBeNull();
    expect(
      view.container.querySelector('strong[data-story-index="5"]'),
      "the real-demo story must not expose a sixth placeholder title anchor",
    ).toBeNull();

    // titleBottom = titleTop + renderedTitleHeight(32px).
    vi.spyOn(firstTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(340),
    );
    vi.spyOn(secondTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(980),
    );
    vi.spyOn(thirdTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(1620),
    );
    vi.spyOn(fourthTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(2260),
    );
    vi.spyOn(fifthTitle as HTMLElement, "getBoundingClientRect").mockReturnValue(
      makeTitleRectangle(2900),
    );

    fireEvent.click(secondControl);
    expect(
      secondControl.getAttribute("aria-current"),
      "the setup must create a stale chapter-two active state before the scroll jump",
    ).toBe("step");
    expect(
      firstControl.getAttribute("aria-current"),
      "chapter one must not remain current after the setup selects chapter two",
    ).toBeNull();

    fireEvent.scroll(window);

    expect(
      firstControl.getAttribute("aria-current"),
      "chapter one must become current because its title is the latest one above 400px",
    ).toBe("step");
    expect(
      secondControl.getAttribute("aria-current"),
      "chapter two must be released because its title remains below the activation line",
    ).toBeNull();
    expect(
      view.container.querySelector('[data-active-story="01"]'),
      "the desktop stage must publish chapter number 01 after anchor-scroll reconciliation",
    ).not.toBeNull();
    expect(
      view.container.querySelector('[data-active-story="02"]'),
      "the stale chapter-two desktop stage must not remain mounted after reconciliation",
    ).toBeNull();
  });
});
