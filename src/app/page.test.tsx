import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Norma OS 官网", () => {
  /// Liquid Glass 品牌升级：首屏与 Live Nodes 使用经过品牌约束的光学素材，并保持装饰层不干扰无障碍阅读。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   generated assets = liquid-glass-hero.png + liquid-glass-flow.png = 2 张生产素材
  ///   glass layers     = hero atmosphere + live atmosphere + floating soul fragments = 3 类视觉层
  ///   readable images  = product screenshots（保留描述性 alt）
  ///   decorative media = 2 张光学素材 + soul fragments（全部 aria-hidden）
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 服务端渲染 Home → 得到页面静态 HTML
  ///   2. 逐一检查暖白与深色光学素材 → 确认生成物真正接入生产页面
  ///   3. 检查 Liquid Glass 容器与 soul fragments → 确认材质层有可维护的结构钩子
  ///   4. 检查装饰媒体语义 → 确认视觉升级不会增加屏幕阅读器噪声
  ///   5. 排除把素材暴露为内容图片的 alt → 避免用户误以为装饰是产品截图
  ///
  /// 预期结果：
  ///   - 正断言：2 张生成素材、Liquid Glass 容器和 soul fragments 逐一存在
  ///   - 正断言：2 张生成素材都位于 aria-hidden 的装饰容器中
  ///   - 负断言：装饰素材不应拥有误导性的描述 alt
  it("接入品牌化 Liquid Glass 素材且保持装饰层语义安静", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html, "首屏必须接入暖白 Liquid Glass 生成素材").toContain(
      "liquid-glass-hero.png",
    );
    expect(html, "Live Nodes 必须接入深色 Liquid Glass 流带素材").toContain(
      "liquid-glass-flow.png",
    );
    expect(html, "页面必须提供统一的 Liquid Glass 材质容器").toContain(
      'data-material="liquid-glass"',
    );
    expect(html, "首屏必须提供可独立运动的 soul fragments 装饰层").toContain(
      'class="soul-fragments"',
    );
    expect(html, "首屏光学素材必须隐藏于无障碍树").toMatch(
      /class="hero__optical-material" aria-hidden="true"/,
    );
    expect(html, "Live Nodes 光学素材必须隐藏于无障碍树").toMatch(
      /class="live-section__material" aria-hidden="true"/,
    );
    expect(html, "装饰素材不应使用伪装成产品内容的 alt 文本").not.toContain(
      'alt="Liquid Glass',
    );
  });

  /// Norma 吉祥物展示：状态语言章节使用正式生成素材介绍 AI Soul，而不是把角色降格为无语义贴纸。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   mascot asset     = norma-ai-soul.png = 1 张角色生产素材
  ///   identity copy    = “Norma” + “THE AI SOUL” = 2 个固定识别信息
  ///   accessibility    = 1 个描述性 alt，向非视觉用户解释角色身份与外观
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 服务端渲染 Home → 得到默认英文 HTML
  ///   2. 检查角色生产素材与固定身份文案 → 确认吉祥物真正进入页面叙事
  ///   3. 检查描述性 alt → 确认角色不是被错误隐藏的纯装饰
  ///   4. 排除旧品牌名 → 确认参考图中的旧身份没有进入正式输出
  ///
  /// 预期结果：
  ///   - 正断言：角色素材、Norma 名称、AI Soul 角色和描述性 alt 逐一存在
  ///   - 负断言：角色区域不得重新引入旧品牌 MultiSoul
  it("把 Norma 吉祥物作为可理解的 AI Soul 品牌角色呈现", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html, "状态语言章节必须接入 Norma 吉祥物生产素材").toContain(
      "norma-ai-soul.png",
    );
    expect(html, "吉祥物卡片必须明确显示角色名 Norma").toContain(
      ">Norma<",
    );
    expect(html, "吉祥物卡片必须明确说明 THE AI SOUL 角色定位").toContain(
      "THE AI SOUL",
    );
    expect(html, "吉祥物图片必须提供描述角色固定识别特征的 alt").toContain(
      'alt="Norma, the AI soul, with lilac hair, a white X hair clip and a composed expression"',
    );
    expect(html, "吉祥物区域不得出现旧品牌 MultiSoul").not.toContain("MultiSoul");
  });

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
