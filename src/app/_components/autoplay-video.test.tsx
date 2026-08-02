// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoplayVideo } from "./autoplay-video";

const observerCallbacks: IntersectionObserverCallback[] = [];
let prefersReducedMotion = false;

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0, 0.4, 0.8];

  constructor(callback: IntersectionObserverCallback) {
    observerCallbacks.push(callback);
  }

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

function makeVisibleEntry(target: Element): IntersectionObserverEntry {
  // origin(0, 0) + width/height(100) = right/bottom(100); geometry only completes the DOM entry contract.
  const rectangle = {
    bottom: 100,
    height: 100,
    left: 0,
    right: 100,
    toJSON: () => ({}),
    top: 0,
    width: 100,
    x: 0,
    y: 0,
  };

  return {
    boundingClientRect: rectangle,
    intersectionRatio: 0.8,
    intersectionRect: rectangle,
    isIntersecting: true,
    rootBounds: null,
    target,
    time: 0,
  };
}

function playWithMediaEvent(this: HTMLMediaElement): Promise<void> {
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
}

function pauseWithMediaEvent(this: HTMLMediaElement) {
  this.dispatchEvent(new Event("pause"));
}

beforeEach(() => {
  observerCallbacks.length = 0;
  prefersReducedMotion = false;
  vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: prefersReducedMotion,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("AutoplayVideo", () => {
  /// Active visibility: a visible chapter plays once, then becoming inactive pauses it and cannot start another playback.
  ///
  /// Data construction (including derivation of key values):
  ///   visibility threshold = 0.4
  ///   visible ratio        = 0.8 = 2 × 0.4 → visibly above the playback threshold
  ///   active transitions   = true → false = 1 chapter deactivation
  ///   inactive clicks      = 1 attempted play on a disabled control
  ///   allowed play calls   = 1 visible activation + 0 inactive activations = 1
  ///
  /// Execution:
  ///   1. Render an active video with motion allowed → observer is installed but playback has not begun
  ///   2. Publish an intersecting ratio of 0.8 → active and visible conditions both become true
  ///   3. Rerender the same video as inactive → the active effect cleans up and a new observer is installed
  ///   4. Publish the same visible ratio to the inactive observer → pause remains the only valid action
  ///   5. Attempt the disabled Play action → inactive media still cannot bypass the shared guard
  ///
  /// Expected:
  ///   - Positive: visible active media plays exactly once and inactive media is paused
  ///   - Negative: the inactive visibility event does not create a second play call
  it("plays only while the video is both visible and active", () => {
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(playWithMediaEvent);
    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(pauseWithMediaEvent);
    const view = render(
      <AutoplayVideo
        active
        label="Active story media"
        pauseLabel="Pause active story media"
        playLabel="Play active story media"
        poster="/media/story.webp"
        src="/media/story.mp4"
      />,
    );
    const video = view.getByLabelText("Active story media");

    act(() => {
      observerCallbacks[0](
        [makeVisibleEntry(video)],
        {} as IntersectionObserver,
      );
    });

    expect(
      playSpy,
      "an active video above the 0.4 visibility threshold must begin playback",
    ).toHaveBeenCalledTimes(1);

    view.rerender(
      <AutoplayVideo
        active={false}
        label="Active story media"
        pauseLabel="Pause active story media"
        playLabel="Play active story media"
        poster="/media/story.webp"
        src="/media/story.mp4"
      />,
    );

    act(() => {
      observerCallbacks[1](
        [makeVisibleEntry(video)],
        {} as IntersectionObserver,
      );
    });

    expect(
      pauseSpy,
      "deactivating a story video must pause the underlying media element",
    ).toHaveBeenCalled();
    const inactiveControl = view.getByRole("button", {
      name: "Play active story media",
    }) as HTMLButtonElement;
    expect(
      inactiveControl.disabled,
      "an inactive chapter must disable its manual play control",
    ).toBe(true);
    fireEvent.click(inactiveControl);
    expect(
      playSpy,
      "a visible but inactive story video must not start a second playback, even after a click",
    ).toHaveBeenCalledTimes(1);
  });

  /// Manual pause: a visitor can stop a qualifying autoplay loop and receives a named way to start it again.
  ///
  /// Data construction (including derivation of key values):
  ///   visibility threshold = 0.4
  ///   visible ratio        = 0.8 = 2 × 0.4 → autoplay starts
  ///   manual actions       = 1 pause click → playing state changes true → false
  ///   resulting controls   = pause control(0) + play control(1) = 1 available action
  ///
  /// Execution:
  ///   1. Render active media and publish ratio 0.8 → autoplay resolves and exposes Pause demonstration
  ///   2. Click the named pause control → the underlying video receives pause
  ///   3. Inspect the updated control name → the visitor can explicitly resume playback
  ///   4. Exclude the old pause state → the control cannot claim the stopped video is still playing
  ///
  /// Expected:
  ///   - Positive: pause is called and Play demonstration becomes available
  ///   - Negative: Pause demonstration no longer remains after the media is stopped
  it("provides a named control that pauses continuous motion", async () => {
    vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(playWithMediaEvent);
    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(pauseWithMediaEvent);
    const view = render(
      <AutoplayVideo
        active
        label="Controllable story media"
        pauseLabel="Pause demonstration"
        playLabel="Play demonstration"
        poster="/media/story.webp"
        src="/media/story.mp4"
      />,
    );
    const video = view.getByLabelText("Controllable story media");

    await act(async () => {
      observerCallbacks[0](
        [makeVisibleEntry(video)],
        {} as IntersectionObserver,
      );
      await Promise.resolve();
    });

    const pauseButton = view.getByRole("button", {
      name: "Pause demonstration",
    });
    fireEvent.click(pauseButton);

    expect(
      pauseSpy,
      "clicking the pause control must stop the continuous video loop",
    ).toHaveBeenCalled();
    expect(
      view.getByRole("button", { name: "Play demonstration" }),
      "after pausing, the same control must provide an explicit way to resume",
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Pause demonstration" }),
      "a stopped video must not keep exposing a misleading pause action",
    ).toBeNull();
  });

  /// Voice-demo sound: audible media still autoplays muted and only exposes sound after an explicit visitor action.
  ///
  /// Data construction (including derivation of key values):
  ///   visibility threshold = 0.4
  ///   visible ratio        = 0.8 = 2 × 0.4 → autoplay is eligible
  ///   initial sound state  = muted(true) → unsolicited audible starts = 0
  ///   visitor sound clicks = enable(1) + disable(1) = 2 explicit state changes
  ///
  /// Execution:
  ///   1. Render an active voice demo with localized sound labels → video begins in the muted state
  ///   2. Publish visibility ratio 0.8 → muted autoplay begins without transmitting sound
  ///   3. Click Hear voice command → the existing video becomes audible and exposes Mute voice command
  ///   4. Click Mute voice command → the video returns to muted playback
  ///   5. Inspect both action labels → only the action matching the current sound state remains available
  ///
  /// Expected:
  ///   - Positive: explicit sound clicks toggle the media between audible and muted states
  ///   - Negative: the voice demo never starts audible and never exposes both sound actions simultaneously
  it("keeps voice audio muted until the visitor enables it", async () => {
    vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(playWithMediaEvent);
    vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(pauseWithMediaEvent);
    const view = render(
      <AutoplayVideo
        active
        label="Voice command demonstration"
        pauseLabel="Pause voice command demonstration"
        playLabel="Play voice command demonstration"
        poster="/media/voice-command.webp"
        sound={{
          muteLabel: "Mute voice command",
          unmuteLabel: "Hear voice command",
        }}
        src="/media/voice-command.mp4"
      />,
    );
    const video = view.getByLabelText(
      "Voice command demonstration",
    ) as HTMLVideoElement;

    expect(
      video.muted,
      "voice media must be muted before visibility can trigger autoplay",
    ).toBe(true);

    await act(async () => {
      observerCallbacks[0](
        [makeVisibleEntry(video)],
        {} as IntersectionObserver,
      );
      await Promise.resolve();
    });

    expect(
      video.muted,
      "visible autoplay must remain muted until the visitor requests sound",
    ).toBe(true);
    const enableSound = view.getByRole("button", {
      name: "Hear voice command",
    });
    expect(
      view.queryByRole("button", { name: "Mute voice command" }),
      "the mute action must not appear before sound has been enabled",
    ).toBeNull();

    fireEvent.click(enableSound);

    expect(
      video.muted,
      "clicking Hear voice command must unmute the active visible video",
    ).toBe(false);
    const disableSound = view.getByRole("button", {
      name: "Mute voice command",
    });
    expect(
      view.queryByRole("button", { name: "Hear voice command" }),
      "the enable-sound action must disappear while the media is audible",
    ).toBeNull();

    fireEvent.click(disableSound);

    expect(
      video.muted,
      "clicking Mute voice command must restore silent playback",
    ).toBe(true);
    expect(
      view.getByRole("button", { name: "Hear voice command" }),
      "muted voice media must once again expose the explicit enable-sound action",
    ).toBeTruthy();
  });

  /// Reduced motion: system preference overrides an otherwise active and visible autoplay request.
  ///
  /// Data construction (including derivation of key values):
  ///   visibility threshold = 0.4
  ///   visible ratio        = 0.8 = 2 × 0.4 → normally eligible for playback
  ///   reduced motion       = true → allowed autoplay calls = 0
  ///
  /// Execution:
  ///   1. Enable the simulated reduced-motion system preference
  ///   2. Render an active video → the component reads the preference in its effect
  ///   3. Publish an intersecting ratio of 0.8 → visibility and active state are both eligible
  ///   4. Attempt the disabled Play action → explicit interaction still respects the static-media preference
  ///   5. Inspect playback calls → reduced motion must override visibility, activity, and click conditions
  ///
  /// Expected:
  ///   - Positive: the visible media is paused as a static poster
  ///   - Negative: play is never called while reduced motion is enabled
  it("keeps the poster static when reduced motion is enabled", () => {
    prefersReducedMotion = true;
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(playWithMediaEvent);
    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(pauseWithMediaEvent);
    const view = render(
      <AutoplayVideo
        active
        label="Reduced-motion story media"
        pauseLabel="Pause reduced-motion story media"
        playLabel="Play reduced-motion story media"
        poster="/media/story.webp"
        src="/media/story.mp4"
      />,
    );
    const video = view.getByLabelText("Reduced-motion story media");

    act(() => {
      observerCallbacks[0](
        [makeVisibleEntry(video)],
        {} as IntersectionObserver,
      );
    });

    expect(
      pauseSpy,
      "reduced-motion media must remain paused so its poster stays static",
    ).toHaveBeenCalled();
    const reducedMotionControl = view.getByRole("button", {
      name: "Play reduced-motion story media",
    }) as HTMLButtonElement;
    expect(
      reducedMotionControl.disabled,
      "reduced motion must disable the control that would start continuous movement",
    ).toBe(true);
    fireEvent.click(reducedMotionControl);
    expect(
      playSpy,
      "reduced motion must prevent playback even when active, visible, and clicked",
    ).not.toHaveBeenCalled();
  });
});
