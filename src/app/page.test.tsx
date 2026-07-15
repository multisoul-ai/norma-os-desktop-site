import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Norma OS 官网", () => {
  /// 首页面向首次访问者：默认以英文说清产品定位、核心对象与当前范围。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   page markup      = Home 组件渲染出的静态 HTML
  ///   core promise     = “Make space. Keep it running.” + “Your project, still running.”
  ///   default locale   = en（用户明确要求默认英文）
  ///   live node types  = TERMINAL + AGENT + BROWSER + PREVIEW = 4 种核心卡片
  ///   supported agents = Claude + Codex + Cursor + OpenCode = 4 种运行时
  ///   negative brand   = MultiSoul（品牌规范明确禁止对外使用）
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 服务端渲染 Home → 得到访问者实际收到的 HTML
  ///   2. 检查英文首屏承诺与产品定义 → 确认首次访问默认呈现英文
  ///   3. 逐一检查 4 类 Live Node 和 4 个 Agent 运行时 → 确认主要能力没有被泛化
  ///   4. 检查本地优先、工作区恢复与语音 → 确认差异化能力进入叙事
  ///   5. 排除旧品牌名与未承诺的移动端主叙事 → 确认范围没有漂移
  ///
  /// 预期结果：
  ///   - 正断言：英文首屏、产品定义、4 类节点、4 个运行时与差异化能力逐一存在
  ///   - 负断言：默认 HTML 不应出现中文产品标题，也不应出现旧品牌名
  it("默认以英文完整呈现空间工作台的核心产品叙事", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html, "首屏必须出现品牌主标题 Make space. Keep it running.").toContain(
      "Make space.",
    );
    expect(html, "首屏必须出现持续运行的第二行标题").toContain("Keep it running.");
    expect(html, "页面必须出现品牌承诺 Your project, still running.").toContain(
      "Your project, still running.",
    );
    expect(html, "默认英文产品定义必须说明 Norma OS 是 macOS 空间工作台").toContain(
      "a spatial workbench for macOS",
    );
    expect(html, "Terminal Live Node 必须被明确展示").toContain("TERMINAL");
    expect(html, "Agent Live Node 必须被明确展示").toContain("AGENT");
    expect(html, "Browser Live Node 必须被明确展示").toContain("BROWSER");
    expect(html, "Preview Live Node 必须被明确展示").toContain("PREVIEW");
    expect(html, "Claude 运行时必须被明确列出").toContain("Claude");
    expect(html, "Codex 运行时必须被明确列出").toContain("Codex");
    expect(html, "Cursor 运行时必须被明确列出").toContain("Cursor");
    expect(html, "OpenCode 运行时必须被明确列出").toContain("OpenCode");
    expect(html, "官网必须用英文说明本地优先的产品原则").toContain("Local first");
    expect(html, "官网必须用英文说明可恢复工作区状态").toContain(
      "Workspace restore",
    );
    expect(html, "官网必须用英文说明语音交互能力").toContain("Voice interaction");
    expect(html, "默认英文 HTML 不应残留中文产品标题").not.toContain("一张会工作的");
    expect(html, "旧品牌 MultiSoul 不得出现在对外官网").not.toContain("MultiSoul");
    expect(html, "当前版本不应把移动端控制写成主要能力").not.toContain("移动端控制");
  });

  /// 单页导航面向浏览者：每个主要章节都应有可达锚点，并提供克制而真实的 Beta 行动入口。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   nav targets      = #product + #live-nodes + #voice + #principles = 4 个主要章节
  ///   primary action   = #get-beta（当前没有编造外部下载链接）
  ///   invalid action   = apps.apple.com（没有可核验的 Norma OS 商店地址）
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 服务端渲染 Home → 得到导航和各 section 的 HTML
  ///   2. 逐一检查导航 href 与对应 section id → 验证页内可达性
  ///   3. 检查 Beta CTA → 确认行动入口真实落到当前页面
  ///   4. 排除未提供的 App Store 地址 → 避免制造虚假下载承诺
  ///
  /// 预期结果：
  ///   - 正断言：4 个章节锚点与 Beta 锚点逐一存在
  ///   - 负断言：页面中不应出现无法核验的 App Store 外链
  it("提供完整且真实的单页导航和行动入口", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html, "产品导航必须指向 #product").toContain('href="#product"');
    expect(html, "Live Nodes 导航必须指向 #live-nodes").toContain(
      'href="#live-nodes"',
    );
    expect(html, "语音导航必须指向 #voice").toContain('href="#voice"');
    expect(html, "设计理念导航必须指向 #principles").toContain(
      'href="#principles"',
    );
    expect(html, "产品章节必须提供 id=product 的落点").toContain('id="product"');
    expect(html, "Live Nodes 章节必须提供 id=live-nodes 的落点").toContain(
      'id="live-nodes"',
    );
    expect(html, "语音章节必须提供 id=voice 的落点").toContain('id="voice"');
    expect(html, "设计理念章节必须提供 id=principles 的落点").toContain(
      'id="principles"',
    );
    expect(html, "首屏 CTA 必须指向站内 Beta 入口").toContain('href="#get-beta"');
    expect(html, "最终 Beta 区域必须提供对应的锚点落点").toContain('id="get-beta"');
    expect(html, "没有真实下载地址时不得伪造 App Store 外链").not.toContain(
      "apps.apple.com",
    );
  });
});
