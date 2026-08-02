import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(
  new URL("./globals.css", import.meta.url),
  "utf8",
);

function readRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = globalStyles.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`),
  );

  return match?.[1] ?? "";
}

describe("Norma OS global layout styles", () => {
  /// Sticky story shell: horizontal overhang clipping must not create a body scroll container that disables the desktop video shell's sticky positioning.
  ///
  /// Data construction (including derivation of key values):
  ///   clipping declarations    = html clip(1) + body clip(1) = 2 non-scrolling paint boundaries
  ///   sticky scroll containers = html viewport(1) + body hidden/auto/scroll(0) = 1 real scrolling ancestor
  ///   story video shell        = .story-stage__sticky = 1 element that must remain pinned while 4 titles pass
  ///
  /// Execution:
  ///   1. Read the shipped global stylesheet → inspect the actual browser layout contract
  ///   2. Extract the html rule → verify the viewport clips horizontal overhang without becoming a scroll container
  ///   3. Extract the body rule → verify its overhang is also clipped with the non-scrolling clip value
  ///   4. Reject hidden, auto, or scroll on body → prevent it from becoming the sticky containing block again
  ///
  /// Expected:
  ///   - Positive: html and body both use overflow-x: clip so no horizontal page movement is exposed
  ///   - Negative: body cannot use hidden, auto, or scroll and detach the sticky video shell from the viewport
  it("keeps the sticky story stage attached to the viewport scroll container", () => {
    const htmlRule = readRule("html");
    const bodyRule = readRule("body");

    expect(
      htmlRule,
      "the html rule must exist so viewport overhang is intentionally clipped",
    ).not.toBe("");
    expect(
      bodyRule,
      "the body rule must exist so wide product shells are clipped without creating horizontal page movement",
    ).not.toBe("");
    expect(
      htmlRule,
      "html must clip the viewport overhang without establishing an overflow scrolling box",
    ).toMatch(/overflow-x:\s*clip\s*;/);
    expect(
      bodyRule,
      "body must use non-scrolling clip so the desktop story stage can remain sticky",
    ).toMatch(/overflow-x:\s*clip\s*;/);
    expect(
      bodyRule,
      "body must not become a hidden, auto, or scroll overflow container that traps sticky positioning",
    ).not.toMatch(/overflow-x:\s*(?:hidden|auto|scroll)\s*;/);
  });

  /// Final story hold: the fourth demo must receive a dedicated desktop tail without moving its title below the shared activation line.
  ///
  /// Data construction (including derivation of key values):
  ///   captured viewport height = 1,078px
  ///   preferred tail           = 1,078px × 0.42 = 452.76px
  ///   clamp bounds             = min(320px) < 452.76px < max(520px) → effective tail ≈ 453px
  ///   measured release deficit = expected sticky top(112px) - actual top(30.98px) ≈ 81px
  ///   usable final hold        = effective tail(453px) - deficit(81px) ≈ 372px
  ///
  /// Execution:
  ///   1. Read the story-steps tail rule → locate the desktop-only scroll runway after chapter four
  ///   2. Verify its responsive clamp → preserve enough runway at both compact and large desktop heights
  ///   3. Read the final story-step rule → ensure the fix does not enlarge and recenter the chapter itself
  ///   4. Reject a final-step min-height override → keep the title's existing 50% activation timing unchanged
  ///
  /// Expected:
  ///   - Positive: a 320px / 42dvh / 520px tail keeps demo 04 pinned for a meaningful reading interval
  ///   - Negative: the final story card cannot gain its own min-height and delay the title activation point
  it("holds the final desktop demo after its title activates", () => {
    const storyTailRule = readRule(".story-steps::after");
    const finalStepRule = readRule(".story-step:last-child");

    expect(
      storyTailRule,
      "the desktop story must expose a dedicated tail after chapter four",
    ).not.toBe("");
    expect(
      storyTailRule,
      "the final demo tail must provide the measured responsive hold distance",
    ).toMatch(/height:\s*clamp\(320px,\s*42dvh,\s*520px\)\s*;/);
    expect(
      storyTailRule,
      "the final hold must be generated without adding an extra interactive story card",
    ).toMatch(/content:\s*""\s*;/);
    expect(
      finalStepRule,
      "the last chapter must not be enlarged because recentering it would move the title activation point",
    ).not.toMatch(/min-height\s*:/);
  });
});
