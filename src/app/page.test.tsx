import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ChineseRootLayout from "./(zh)/layout";
import Home from "./(en)/page";
import ChineseHome from "./(zh)/zh-cn/page";

describe("Norma OS English homepage", () => {
  /// Split hero: a first-time visitor sees the Command Center positioning, direct download, and product demonstration in one viewport.
  ///
  /// Data construction (including derivation of key values):
  ///   primary positioning = "Command Center" + "coding agents" = 2 concrete product concepts
  ///   primary actions     = latest DMG download + story anchor = 2 user-visible paths
  ///   hero media          = 1 real-demo montage + 1 matching poster inside 1 product shell
  ///   removed concepts    = placeholder montage + Get Beta + purple optical artwork = 3 legacy signals
  ///
  /// Execution:
  ///   1. Server-render the English Home route → receive the HTML sent before hydration
  ///   2. Locate the hero positioning → confirm it names the Command Center and Coding Agents
  ///   3. Locate both actions → confirm download is primary and the story remains reachable
  ///   4. Locate the product demonstration → confirm the real overview video and poster exist inside the hero
  ///   5. Exclude the placeholder montage, legacy Beta, and purple optical signals → confirm the old hero is replaced rather than wrapped
  ///
  /// Expected:
  ///   - Positive: Command Center copy, latest DMG link, story link, real overview video, and poster all exist
  ///   - Negative: the placeholder montage, Get Beta, and liquid-glass-hero.png do not exist in the rendered homepage
  it("renders the agreed split hero as a direct product-and-download experience", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(
      html,
      "the hero must identify Norma OS as a Command Center",
    ).toContain("COMMAND CENTER");
    expect(
      html,
      "the hero must explicitly name the Coding Agents the user directs",
    ).toContain("coding agents");
    expect(
      html,
      "the primary action must link directly to the stable latest Apple Silicon DMG",
    ).toContain(
      'href="https://github.com/multisoul-ai/norma-os-releases/releases/latest/download/Norma-OS_aarch64.dmg"',
    );
    expect(
      html,
      "the secondary action must lead to the product story",
    ).toContain('href="#how-it-works"');
    expect(
      html,
      "the hero product shell must contain video media",
    ).toContain("<video");
    expect(
      html,
      "the hero must use the real product overview montage",
    ).toContain('src="/media/demo-hero-overview.mp4"');
    expect(
      html,
      "the real product overview must expose a matching poster before playback",
    ).toContain('poster="/media/demo-hero-overview.webp"');
    expect(
      html,
      "the placeholder hero montage must not remain after real demos are integrated",
    ).not.toContain("hero-agent-orchestra");
    expect(
      html,
      "the old Beta conversion must not survive the direct-download refactor",
    ).not.toContain("Get Beta");
    expect(
      html,
      "the old purple optical hero image must not survive the neutral-glass refactor",
    ).not.toContain("liquid-glass-hero.png");
  });

  /// URL localization: the Chinese homepage is complete server-rendered content at /zh-cn rather than a client-storage variant of /.
  ///
  /// Data construction (including derivation of key values):
  ///   localized routes  = / (English) + /zh-cn (Simplified Chinese) = 2 canonical URLs
  ///   page language     = zh-CN = 1 explicit language boundary
  ///   shared conversion = latest Apple Silicon DMG = 1 identical product action
  ///   removed state     = localStorage locale = 0 required client persistence
  ///
  /// Execution:
  ///   1. Server-render the Chinese route directly → receive Chinese HTML without client hydration
  ///   2. Inspect its language boundary and hero → confirm assistive technology and visitors receive Chinese immediately
  ///   3. Inspect both locale links → confirm either canonical URL remains reachable
  ///   4. Inspect the download link → confirm localization does not fork the product artifact
  ///   5. Exclude browser-storage localization → confirm URL state is the only language source
  ///
  /// Expected:
  ///   - Positive: zh-CN document and content boundaries, Chinese positioning, both locale URLs, and latest DMG link exist
  ///   - Negative: localStorage and the old client locale key do not exist in the Chinese HTML
  it("serves independently authored Chinese content from the zh-cn route", () => {
    const html = renderToStaticMarkup(
      <ChineseRootLayout>
        <ChineseHome />
      </ChineseRootLayout>,
    );

    expect(
      html,
      "the Chinese route must declare zh-CN on the server-rendered document root",
    ).toContain('<html lang="zh-CN">');
    expect(
      html,
      "the Chinese route must preserve its language at the localized content boundary",
    ).toContain('<main lang="zh-CN">');
    expect(
      html,
      "the Chinese hero must express the agreed all-agents command-center positioning",
    ).toContain("在一处，指挥所有 Coding Agent。");
    expect(
      html,
      "the Chinese route must link back to the canonical English homepage",
    ).toContain('href="/"');
    expect(
      html,
      "the Chinese route must expose its own canonical language URL",
    ).toContain('href="/zh-cn"');
    expect(
      html,
      "the Chinese primary action must download the same latest Apple Silicon DMG",
    ).toContain(
      'href="https://github.com/multisoul-ai/norma-os-releases/releases/latest/download/Norma-OS_aarch64.dmg"',
    );
    expect(
      html,
      "URL localization must not require browser localStorage",
    ).not.toContain("localStorage");
    expect(
      html,
      "the retired client locale persistence key must not leak into the localized route",
    ).not.toContain("norma-os-locale");
  });

  /// Homepage narrative: the product story progresses from proof of compatibility to operation, capability, trust, and conversion.
  ///
  /// Data construction (including derivation of key values):
  ///   top-level sequence = product + how-it-works + features + trust + FAQ + download = 6 ordered destinations
  ///   operating story    = voice command + Live Node shortcut + layout command + Agent notification = 4 real-demo chapters
  ///   real demo media    = 4 chapter MP4 files + 4 matching WebP posters = 8 production assets
  ///   removed narratives = placeholder chapter media + unsupported restore chapter + standalone AI Soul + generic Beta conversion = 4 retired ideas
  ///
  /// Execution:
  ///   1. Server-render the English route → receive one deterministic document
  ///   2. Resolve every top-level destination by its unique id → confirm all six sections exist
  ///   3. Compare destination offsets → confirm the page follows the agreed conversion narrative
  ///   4. Resolve every story title and media path → confirm all four chapters are backed by real product recordings
  ///   5. Exclude placeholder chapter paths, the unsupported restore chapter, AI Soul, and Beta language → confirm the narrative only claims demonstrated behavior
  ///
  /// Expected:
  ///   - Positive: all six sections and all four real-demo chapters exist in the agreed order
  ///   - Negative: placeholder story media, the restore chapter, THE AI SOUL, and Get Beta do not appear in the homepage
  it("renders the complete agreed homepage narrative in order", () => {
    const html = renderToStaticMarkup(<Home />);
    const productIndex = html.indexOf('id="product"');
    const storyIndex = html.indexOf('id="how-it-works"');
    const featuresIndex = html.indexOf('id="features"');
    const trustIndex = html.indexOf('id="trust"');
    const faqIndex = html.indexOf('id="faq"');
    const downloadIndex = html.indexOf('id="download"');

    expect(
      productIndex,
      "the compatible-agents product proof must exist",
    ).toBeGreaterThan(-1);
    expect(
      storyIndex,
      "the four-part real-demo operating story must exist",
    ).toBeGreaterThan(-1);
    expect(
      featuresIndex,
      "the capability grid must exist",
    ).toBeGreaterThan(-1);
    expect(trustIndex, "the trust section must exist").toBeGreaterThan(-1);
    expect(faqIndex, "the FAQ section must exist").toBeGreaterThan(-1);
    expect(
      downloadIndex,
      "the final direct-download conversion must exist",
    ).toBeGreaterThan(-1);
    expect(
      storyIndex,
      "the operating story must follow compatible-agent proof",
    ).toBeGreaterThan(productIndex);
    expect(
      featuresIndex,
      "capabilities must follow the operating story",
    ).toBeGreaterThan(storyIndex);
    expect(
      trustIndex,
      "trust evidence must follow the capability explanation",
    ).toBeGreaterThan(featuresIndex);
    expect(
      faqIndex,
      "FAQ must resolve objections after trust evidence",
    ).toBeGreaterThan(trustIndex);
    expect(
      downloadIndex,
      "the final download must close the narrative after FAQ",
    ).toBeGreaterThan(faqIndex);
    expect(
      html,
      "chapter one must demonstrate direct voice command of an Agent",
    ).toContain("Direct an Agent with your voice");
    expect(
      html,
      "chapter two must demonstrate direct keyboard focus for any Live Node",
    ).toContain("Bring any Live Node forward");
    expect(
      html,
      "chapter three must demonstrate instant workspace reshaping",
    ).toContain("Reshape the workspace instantly");
    expect(
      html,
      "chapter four must demonstrate actionable Agent attention signals",
    ).toContain("Know when an Agent needs you");
    expect(
      html,
      "chapter one must load the optimized voice-command recording",
    ).toContain('src="/media/demo-voice-command.mp4"');
    expect(
      html,
      "chapter one must expose the matching voice-command poster before playback",
    ).toContain('poster="/media/demo-voice-command.webp"');
    expect(
      html,
      "chapter two must load the optimized shortcut recording",
    ).toContain('src="/media/demo-live-node-shortcuts.mp4"');
    expect(
      html,
      "chapter two must expose the matching Live Node shortcut poster before playback",
    ).toContain('poster="/media/demo-live-node-shortcuts.webp"');
    expect(
      html,
      "chapter three must load the optimized layout recording",
    ).toContain('src="/media/demo-layout-command-m.mp4"');
    expect(
      html,
      "chapter three must expose the matching layout poster before playback",
    ).toContain('poster="/media/demo-layout-command-m.webp"');
    expect(
      html,
      "chapter four must load the optimized Agent notification recording",
    ).toContain('src="/media/demo-agent-notifications.mp4"');
    expect(
      html,
      "chapter four must expose the matching Agent notification poster before playback",
    ).toContain('poster="/media/demo-agent-notifications.webp"');
    expect(
      html,
      "the unsupported restore chapter must not remain without a corresponding real demo",
    ).not.toContain("Leave. Return. Continue.");
    expect(
      html,
      "the old spatial-canvas placeholder must not remain after real demos are integrated",
    ).not.toContain("story-one-canvas");
    expect(
      html,
      "the old live-work placeholder must not remain after real demos are integrated",
    ).not.toContain("story-work-alive");
    expect(
      html,
      "the old Norma-steering placeholder must not remain after real demos are integrated",
    ).not.toContain("story-steer-norma");
    expect(
      html,
      "the old restore-space placeholder must not remain after real demos are integrated",
    ).not.toContain("story-restore-space");
    expect(
      html,
      "Norma must not be separated into the retired AI Soul narrative",
    ).not.toContain("THE AI SOUL");
    expect(
      html,
      "the final conversion must remain a direct download rather than Beta capture",
    ).not.toContain("Get Beta");
  });
});
