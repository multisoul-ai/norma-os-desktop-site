import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ChineseRootLayout from "./(zh)/layout";
import Home from "./(en)/page";
import ChineseHome from "./(zh)/zh-cn/page";

describe("Norma OS English homepage", () => {
  /// Beta license handoff: a visitor can download the app and immediately find the exact shared beta credential below the primary action.
  ///
  /// Data construction (including derivation of key values):
  ///   localized pages = English homepage + Chinese homepage = 2 rendered entry points
  ///   onboarding data = localized license label + exact beta key = 2 visible credential parts per page
  ///   key structure   = KG + 4 credential blocks = 5 hyphen-separated segments
  ///
  /// Execution:
  ///   1. Server-render both localized homepages → receive the HTML shown before hydration
  ///   2. Locate each primary download label → establish the visual action that precedes the credential
  ///   3. Locate the localized license labels and exact key → confirm both audiences receive the same credential
  ///   4. Compare source order → confirm the credential is rendered after, and therefore below, the download action
  ///   5. Exclude a credential hyperlink → confirm the key is selectable display text rather than misleading navigation
  ///
  /// Expected:
  ///   - Positive: both localized labels and the exact five-segment key exist after their download actions
  ///   - Negative: the license key is not emitted as an href destination
  it("shows the shared beta license below the primary download action", () => {
    const englishHtml = renderToStaticMarkup(<Home />);
    const chineseHtml = renderToStaticMarkup(<ChineseHome />);
    const betaLicenseKey = "KG-WACEHBCB-2ZL4AM23-JBJQJZBG-YVT55VDN";
    const englishDownloadIndex = englishHtml.indexOf("Download for Mac");
    const englishLicenseIndex = englishHtml.indexOf(betaLicenseKey);
    const chineseDownloadIndex = chineseHtml.indexOf("下载 Mac 版");
    const chineseLicenseIndex = chineseHtml.indexOf(betaLicenseKey);

    expect(
      englishHtml,
      "the English hero must identify the credential as a Beta license",
    ).toContain("Beta license");
    expect(
      chineseHtml,
      "the Chinese hero must identify the credential as an 内测 License",
    ).toContain("内测 License");
    expect(
      englishLicenseIndex,
      "the exact beta license must appear after the English download action",
    ).toBeGreaterThan(englishDownloadIndex);
    expect(
      chineseLicenseIndex,
      "the exact beta license must appear after the Chinese download action",
    ).toBeGreaterThan(chineseDownloadIndex);
    expect(
      englishHtml,
      "the beta license must remain selectable text instead of becoming a navigation target",
    ).not.toContain(`href="${betaLicenseKey}"`);
    expect(
      chineseHtml,
      "the Chinese page must not turn the beta license into a navigation target",
    ).not.toContain(`href="${betaLicenseKey}"`);
  });

  /// Split hero: a first-time visitor sees the Command Center positioning, direct download, and product demonstration in one viewport.
  ///
  /// Data construction (including derivation of key values):
  ///   primary positioning = "Command Center" + "coding agents" = 2 concrete product concepts
  ///   primary actions     = latest DMG download + story anchor = 2 user-visible paths
  ///   hero carousel       = voice group control(1) + Agent collaboration(1) + real overview(1) = 3 selectable demonstrations
  ///   initial hero media  = 1 voice video + 1 matching poster inside 1 product shell
  ///   removed concepts    = placeholder montage + Get Beta + purple optical artwork = 3 legacy signals
  ///
  /// Execution:
  ///   1. Server-render the English Home route → receive the HTML sent before hydration
  ///   2. Locate the hero positioning → confirm it names the Command Center and Coding Agents
  ///   3. Locate both actions → confirm download is primary and the story remains reachable
  ///   4. Locate the product demonstration → confirm voice group control is the initial carousel video beside the positioning
  ///   5. Locate all selectors → confirm Agent collaboration is second and the overview remains third
  ///   6. Exclude the placeholder montage, legacy Beta, and purple optical signals → confirm the old hero is replaced rather than wrapped
  ///
  /// Expected:
  ///   - Positive: Command Center copy, latest DMG link, story link, voice video, and all three carousel choices exist
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
      "the hero carousel must lead with the edited voice group-control recording",
    ).toContain('src="/media/demo-voice-command.mp4"');
    expect(
      html,
      "the initial voice group-control slide must expose its matching poster before playback",
    ).toContain('poster="/media/demo-voice-command.webp"');
    expect(
      html,
      "the hero carousel must expose a selector for the initial voice group-control demonstration",
    ).toContain("Show demonstration: Voice group control");
    expect(
      html,
      "Agent collaboration must be the second carousel demonstration after voice group control",
    ).toContain("Show demonstration: Agents delegate tasks to each other");
    expect(
      html,
      "the existing Command Center overview must remain available as the third carousel demonstration",
    ).toContain("Show demonstration: Command Center overview");
    expect(
      html,
      "the inactive overview video must not be mounted behind the initial voice demonstration",
    ).not.toContain('src="/media/demo-hero-overview.mp4"');
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
  ///   voice positioning = 语音群控 + 六个 Agent = 2 explicit proof points
  ///   removed state     = localStorage locale = 0 required client persistence
  ///
  /// Execution:
  ///   1. Server-render the Chinese route directly → receive Chinese HTML without client hydration
  ///   2. Inspect its language boundary and hero → confirm assistive technology and visitors receive Chinese immediately
  ///   3. Inspect the first story chapter → confirm Chinese copy explicitly presents voice group control of six Agents
  ///   4. Inspect both locale links → confirm either canonical URL remains reachable
  ///   5. Inspect the download link → confirm localization does not fork the product artifact
  ///   6. Exclude the old single-Agent title and browser-storage localization → confirm the new positioning and URL state are authoritative
  ///
  /// Expected:
  ///   - Positive: zh-CN boundaries, Chinese voice-group positioning, both locale URLs, and latest DMG link exist
  ///   - Negative: the old single-Agent voice title, localStorage, and the old client locale key do not exist
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
      "the Chinese voice chapter must explicitly name voice group control of six Agents",
    ).toContain("语音群控：一句话指挥六个 Agent");
    expect(
      html,
      "the previous single-Agent Chinese title must not weaken the voice group-control message",
    ).not.toContain("开口，直接指挥 Agent");
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

  /// Agent-to-Agent delegation sequence: the supplied collaboration recording is chapter 02 inside the existing demo story and never becomes a standalone page module.
  ///
  /// Data construction (including derivation of key values):
  ///   localized pages       = English homepage + Chinese homepage = 2 rendered entry points
  ///   story chapters        = voice(1) + collaboration(1) + shortcut(1) + layout(1) + notification(1) = 5 demos
  ///   collaboration index   = public chapter 02 - zero-based offset 1 = data-story-index 1
  ///   collaboration assets  = MP4(1) + WebP poster(1) + specific audio action(1) = 3 proof artifacts per locale
  ///   standalone modules    = id="agent-collaboration" occurrences = 0
  ///
  /// Execution:
  ///   1. Server-render both localized homepages → receive the complete English and Chinese narratives
  ///   2. Isolate each five-step story → compare title offsets for voice, collaboration, and shortcut
  ///   3. Inspect chapter index 1 → confirm collaboration occupies public position 02
  ///   4. Resolve the collaboration MP4, poster, and sound action → confirm the chapter uses the supplied real recording
  ///   5. Inspect the hero selectors → confirm the same voice-then-collaboration order is preserved above the fold
  ///   6. Exclude the former standalone section id and a sixth story index → confirm there is one shared demo system
  ///
  /// Expected:
  ///   - Positive: both locales place collaboration second, expose its media, and preserve five chapter indices
  ///   - Negative: no standalone collaboration module or sixth placeholder chapter remains
  it("places Agent collaboration second inside the existing demo sequence", () => {
    const englishHtml = renderToStaticMarkup(<Home />);
    const chineseHtml = renderToStaticMarkup(<ChineseHome />);
    const storyIndex = englishHtml.indexOf('id="how-it-works"');
    const featuresIndex = englishHtml.indexOf('id="features"');
    const storyHtml = englishHtml.slice(storyIndex, featuresIndex);
    const voiceTitleIndex = storyHtml.indexOf(
      "Voice group control: direct six Agents at once",
    );
    const collaborationTitleIndex = storyHtml.indexOf(
      "Agents delegate tasks to each other",
    );
    const shortcutTitleIndex = storyHtml.indexOf("Bring any Live Node forward");

    expect(
      englishHtml,
      "the English story must explicitly state that Agents delegate tasks to each other",
    ).toContain("Agents delegate tasks to each other");
    expect(
      chineseHtml,
      "the Chinese story must explicitly state that Agents can assign tasks to each other",
    ).toContain("Agent 之间，可以互相派发任务");
    expect(
      englishHtml,
      "the English chapter must explain that collaboration branches without manual instruction relaying",
    ).toContain("Work branches without making you relay every instruction yourself.");
    expect(
      chineseHtml,
      "the Chinese chapter must explain that work can branch without the user relaying every message",
    ).toContain("工作能够自行分支，不再需要你充当每一次协作的传话人。");
    expect(
      englishHtml,
      "the integrated collaboration chapter must load the optimized real delegation recording",
    ).toContain('src="/media/demo-agent-collaboration.mp4"');
    expect(
      englishHtml,
      "the integrated collaboration chapter must expose a matching poster before playback",
    ).toContain('poster="/media/demo-agent-collaboration.webp"');
    expect(
      chineseHtml,
      "the Chinese collaboration chapter must load the same optimized delegation recording",
    ).toContain('src="/media/demo-agent-collaboration.mp4"');
    expect(
      chineseHtml,
      "the Chinese collaboration chapter must expose the same matching poster before playback",
    ).toContain('poster="/media/demo-agent-collaboration.webp"');
    expect(
      englishHtml,
      "the existing voice demo must preserve its explicit voice-group-control sound action",
    ).toContain('aria-label="Hear voice group control"');
    expect(
      chineseHtml,
      "the Chinese voice demo must preserve its explicit voice-group-control sound action",
    ).toContain('aria-label="播放语音群控声音"');
    expect(
      englishHtml,
      "the new collaboration demo must expose its own specific sound action",
    ).toContain('aria-label="Hear Agent collaboration"');
    expect(
      chineseHtml,
      "the Chinese collaboration demo must expose its own specific sound action",
    ).toContain('aria-label="播放 Agent 协作演示声音"');
    expect(
      englishHtml,
      "a generic sound action must not replace the explicit English voice-group label",
    ).not.toContain('aria-label="Hear demonstration sound"');
    expect(
      chineseHtml,
      "a generic sound action must not replace the explicit Chinese voice-group label",
    ).not.toContain('aria-label="播放演示声音"');
    expect(
      voiceTitleIndex,
      "voice group control must exist before Agent collaboration inside the story",
    ).toBeGreaterThan(-1);
    expect(
      collaborationTitleIndex,
      "Agent collaboration must follow voice group control inside the same story",
    ).toBeGreaterThan(voiceTitleIndex);
    expect(
      shortcutTitleIndex,
      "the Live Node shortcut demo must follow Agent collaboration as chapter 03",
    ).toBeGreaterThan(collaborationTitleIndex);
    expect(
      storyHtml,
      "the collaboration demo must occupy the second zero-based story index",
    ).toContain('data-story-index="1"');
    expect(
      englishHtml,
      "the English five-demo story must expose the final zero-based chapter index 4",
    ).toContain('data-story-index="4"');
    expect(
      chineseHtml,
      "the Chinese five-demo story must expose the final zero-based chapter index 4",
    ).toContain('data-story-index="4"');
    expect(
      englishHtml,
      "the hero carousel must preserve Agent collaboration as demonstration 02",
    ).toContain("Show demonstration: Agents delegate tasks to each other");
    expect(
      englishHtml,
      "the former standalone Agent collaboration section must be removed",
    ).not.toContain('id="agent-collaboration"');
    expect(
      chineseHtml,
      "the former standalone Chinese collaboration section must also be removed",
    ).not.toContain('id="agent-collaboration"');
    expect(
      englishHtml,
      "the five-demo story must not expose a sixth placeholder index",
    ).not.toContain('data-story-index="5"');
    expect(
      chineseHtml,
      "the Chinese five-demo story must not expose a sixth placeholder index",
    ).not.toContain('data-story-index="5"');
  });

  /// Homepage narrative: the product story progresses from proof of compatibility to operation, capability, trust, and conversion.
  ///
  /// Data construction (including derivation of key values):
  ///   top-level sequence = product + how-it-works + features + trust + FAQ + download = 6 ordered destinations
  ///   operating story    = voice + collaboration + shortcut + layout + notification = 5 real-demo chapters
  ///   real demo media    = 5 chapter MP4 files + 5 matching WebP posters = 10 production assets
  ///   removed narratives = placeholder chapter media + unsupported restore chapter + standalone AI Soul + generic Beta conversion = 4 retired ideas
  ///
  /// Execution:
  ///   1. Server-render the English route → receive one deterministic document
  ///   2. Resolve every top-level destination by its unique id → confirm all six sections exist
  ///   3. Compare destination offsets → confirm the page follows the agreed conversion narrative
  ///   4. Resolve the first story copy → confirm it explicitly names voice group control and directing six Agents at once
  ///   5. Resolve every story media path → confirm all five chapters are backed by real product recordings
  ///   6. Exclude the old single-Agent title, placeholder chapter paths, the unsupported restore chapter, AI Soul, and Beta language → confirm the narrative only claims demonstrated behavior
  ///
  /// Expected:
  ///   - Positive: all six sections and all five real-demo chapters exist in order, with collaboration fixed at chapter 02
  ///   - Negative: the standalone collaboration module, old single-Agent title, placeholders, and Get Beta do not appear
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
      "the five-part real-demo operating story must exist",
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
      "capabilities must follow the complete five-demo operating story",
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
      "chapter one must name voice group control as the primary interaction",
    ).toContain("Voice group control: direct six Agents at once");
    expect(
      html,
      "the voice chapter must explain that one spoken instruction controls six Agents",
    ).toContain("One spoken instruction controls six Agents");
    expect(
      html,
      "the old single-Agent voice title must not dilute the group-control positioning",
    ).not.toContain("Direct an Agent with your voice");
    expect(
      html,
      "chapter two must demonstrate Agent-to-Agent task delegation",
    ).toContain("Agents delegate tasks to each other");
    expect(
      html,
      "chapter three must demonstrate direct keyboard focus for any Live Node",
    ).toContain("Bring any Live Node forward");
    expect(
      html,
      "chapter four must demonstrate instant workspace reshaping",
    ).toContain("Reshape the workspace instantly");
    expect(
      html,
      "chapter five must demonstrate actionable Agent attention signals",
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
      "chapter two must load the optimized Agent collaboration recording",
    ).toContain('src="/media/demo-agent-collaboration.mp4"');
    expect(
      html,
      "chapter two must expose the matching Agent collaboration poster",
    ).toContain('poster="/media/demo-agent-collaboration.webp"');
    expect(
      html,
      "chapter three must load the optimized shortcut recording",
    ).toContain('src="/media/demo-live-node-shortcuts.mp4"');
    expect(
      html,
      "chapter three must expose the matching Live Node shortcut poster before playback",
    ).toContain('poster="/media/demo-live-node-shortcuts.webp"');
    expect(
      html,
      "chapter four must load the optimized layout recording",
    ).toContain('src="/media/demo-layout-command-m.mp4"');
    expect(
      html,
      "chapter four must expose the matching layout poster before playback",
    ).toContain('poster="/media/demo-layout-command-m.webp"');
    expect(
      html,
      "chapter five must load the optimized Agent notification recording",
    ).toContain('src="/media/demo-agent-notifications.mp4"');
    expect(
      html,
      "chapter five must expose the matching Agent notification poster before playback",
    ).toContain('poster="/media/demo-agent-notifications.webp"');
    expect(
      html,
      "Agent collaboration must not survive as a separate section outside the demo story",
    ).not.toContain('id="agent-collaboration"');
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
