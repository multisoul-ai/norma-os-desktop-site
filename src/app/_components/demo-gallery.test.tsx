// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoGallery } from "./demo-gallery";
import { productDemos } from "../product-demos";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Product demo gallery", () => {
  it("replaces the current recording and description when each demo is selected", () => {
    const view = render(<DemoGallery locale="zh-CN" />);
    const tabs = view.getAllByRole("tab");
    let previousVideo = view.container.querySelector("video");
    for (let index = 0; index < productDemos.length; index++) {
      fireEvent.click(tabs[index]);
      const demo = productDemos[index];
      const video = view.container.querySelector("video")!;
      expect(video.getAttribute("poster")).toBe(demo.poster);
      expect(video.getAttribute("aria-label")).toBe(
        demo.copy["zh-CN"].videoLabel,
      );
      expect(video.querySelector(`source[src="${demo.media}"]`)).not.toBeNull();
      expect(view.container.querySelectorAll("video")).toHaveLength(1);
      expect(view.getByText(demo.copy["zh-CN"].body)).toBeTruthy();
      expect(
        tabs.filter((tab) => tab.getAttribute("aria-selected") === "true"),
      ).toHaveLength(1);
      if (index > 0) expect(video).not.toBe(previousVideo);
      previousVideo = video;
    }
  });

  it("supports keyboard selection, wraparound, and linked tab panel focus", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const view = render(<DemoGallery locale="en" />);
    const tabs = view.getAllByRole("tab");
    const panel = view.getByRole("tabpanel");
    const check = (index: number) => {
      expect(document.activeElement).toBe(tabs[index]);
      expect(tabs[index].tabIndex).toBe(0);
      expect(panel.getAttribute("aria-labelledby")).toBe(tabs[index].id);
      expect(tabs[index].getAttribute("aria-controls")).toBe(panel.id);
    };
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    check(4);
    fireEvent.keyDown(tabs[4], { key: "ArrowRight" });
    check(0);
    fireEvent.keyDown(tabs[0], { key: "End" });
    check(4);
    fireEvent.keyDown(tabs[4], { key: "Home" });
    check(0);
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    check(1);
    expect(view.getByText(productDemos[1].copy.en.body)).toBeTruthy();
  });

  it("starts with a poster and never autoplays or preloads inactive recordings", () => {
    const view = render(<DemoGallery locale="en" />);
    const video = view.container.querySelector("video")!;
    expect(video.preload).toBe("none");
    expect(video.autoplay).toBe(false);
    expect(video.controls).toBe(true);
    expect(
      video
        .querySelector('source[media="(max-width: 640px)"]')
        ?.getAttribute("src"),
    ).toBe(productDemos[0].mobileMedia);
    expect(
      view.container.querySelector(`source[src="${productDemos[1].media}"]`),
    ).toBeNull();
  });
});
