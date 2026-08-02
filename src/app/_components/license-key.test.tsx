// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LicenseKey } from "./license-key";

afterEach(() => {
  cleanup();
  delete (document as unknown as { execCommand?: Document["execCommand"] })
    .execCommand;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LicenseKey", () => {
  /// License copy feedback: a visitor copies the exact shared beta credential and receives a temporary confirmation.
  ///
  /// Data construction (including derivation of key values):
  ///   license segments   = KG + 4 credential blocks = 5 hyphen-separated segments
  ///   visitor actions    = copy click(1) = 1 explicit clipboard request
  ///   feedback duration  = 2 seconds × 1,000 milliseconds = 2,000 ms
  ///   expected writes    = successful click(1) × exact key(1) = 1 clipboard write
  ///
  /// Execution:
  ///   1. Render the English license control with a mocked Clipboard API → Copy is the available action
  ///   2. Click Copy → the component writes the exact five-segment key once
  ///   3. Resolve the clipboard promise → the action changes to Copied
  ///   4. Advance the full 2,000 ms feedback window → the action returns to Copy
  ///   5. Inspect both states → stale success feedback does not remain after the window closes
  ///
  /// Expected:
  ///   - Positive: the exact key is written once, Copied appears, and Copy returns after 2,000 ms
  ///   - Negative: the initial Copy action disappears during success and Copied disappears after reset
  it("copies the exact license and resets its success feedback", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const view = render(
      <LicenseKey
        copiedLabel="Copied"
        copyLabel="Copy"
        label="Beta license"
        licenseKey="KG-WACEHBCB-2ZL4AM23-JBJQJZBG-YVT55VDN"
      />,
    );
    const copyButton = view.getByRole("button", { name: "Copy" });

    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve();
    });

    expect(
      writeText,
      "one copy click must write the exact shared beta license to the clipboard",
    ).toHaveBeenCalledExactlyOnceWith(
      "KG-WACEHBCB-2ZL4AM23-JBJQJZBG-YVT55VDN",
    );
    expect(
      view.getByRole("button", { name: "Copied" }),
      "a successful clipboard write must expose the Copied confirmation",
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Copy" }),
      "the Copy action must not remain while success feedback is active",
    ).toBeNull();

    act(() => {
      // elapsed = 2 seconds × 1,000 milliseconds = 2,000 ms → feedback window closes
      vi.advanceTimersByTime(2 * 1_000);
    });

    expect(
      view.getByRole("button", { name: "Copy" }),
      "the Copy action must return after the 2,000 ms feedback window",
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Copied" }),
      "the Copied confirmation must not remain after the feedback window closes",
    ).toBeNull();
  });

  /// Restricted-browser fallback: a visitor can still copy the credential when the asynchronous Clipboard API is unavailable.
  ///
  /// Data construction (including derivation of key values):
  ///   Clipboard APIs     = modern API(0) + selection fallback(1) = 1 available copy path
  ///   temporary fields  = textarea created(1) - textarea removed(1) = 0 leaked DOM fields
  ///   fallback requests = copy command(1) × exact key selection(1) = 1 legacy clipboard write
  ///
  /// Execution:
  ///   1. Render the license control without navigator.clipboard → modern copy is unavailable
  ///   2. Click Copy → the component creates and selects one temporary readonly textarea
  ///   3. Accept the browser copy command → the action changes to Copied
  ///   4. Inspect the document → the temporary textarea has already been removed
  ///   5. Inspect the control → the failed modern path does not prevent success feedback
  ///
  /// Expected:
  ///   - Positive: the fallback copy command runs exactly once and Copied is announced
  ///   - Negative: no temporary textarea remains in the document after copying
  it("falls back to selection-based copy in restricted browsers", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", {});
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });
    const view = render(
      <LicenseKey
        copiedLabel="Copied"
        copyLabel="Copy"
        label="Beta license"
        licenseKey="KG-WACEHBCB-2ZL4AM23-JBJQJZBG-YVT55VDN"
      />,
    );

    await act(async () => {
      fireEvent.click(view.getByRole("button", { name: "Copy" }));
      await Promise.resolve();
    });

    expect(
      execCommand,
      "a restricted browser must receive exactly one selection-based copy command",
    ).toHaveBeenCalledExactlyOnceWith("copy");
    expect(
      view.getByRole("button", { name: "Copied" }),
      "a successful fallback copy must expose the same Copied confirmation",
    ).toBeTruthy();
    expect(
      document.querySelector("textarea"),
      "the temporary fallback textarea must be removed immediately after copying",
    ).toBeNull();
  });
});
