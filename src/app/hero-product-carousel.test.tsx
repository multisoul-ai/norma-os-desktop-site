// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroProductCarousel } from "./hero-product-carousel";
import Home from "./page";

const carouselLabels = {
  label: "Norma OS product screenshots",
  nextLabel: "Next screenshot",
  previousLabel: "Previous screenshot",
  showLabel: "Show screenshot",
} as const;

const singleCanvasSlide = [
  {
    alt: "Norma OS spatial canvas ready for a new workspace",
    src: "/brand/norma-workspace-canvas.webp",
  },
] as const;

const twoProductSlides = [
  singleCanvasSlide[0],
  {
    alt: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
    src: "/brand/norma-workspace-live-nodes.webp",
  },
] as const;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("首屏产品截图轮播", () => {
  /// 轮播数据边界：没有截图时保持页面安静，只有一张时展示内容但不制造无效导航。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   empty slides       = 0 张 → 没有可展示内容，也没有合法索引
  ///   single slides      = 1 张 → 唯一合法索引为 0
  ///   navigation needed  = slides.length > 1 → 0 张和 1 张时均为 false
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 传入 0 张截图渲染组件 → 查询产品截图 region
  ///   2. 清理页面并传入 1 张空画布截图 → 查询唯一图片与 region
  ///   3. 查询上一张、下一张和页码控件 → 验证单张内容没有伪导航
  ///
  /// 预期结果：
  ///   - 正断言：单张模式仍显示空画布图片和带名称的产品区域
  ///   - 负断言：空数组不渲染区域，单张模式不渲染上一张、下一张或页码按钮
  it("安全处理空截图与单张截图", () => {
    const emptyView = render(
      <HeroProductCarousel {...carouselLabels} slides={[]} />,
    );

    expect(
      screen.queryByRole("region", { name: carouselLabels.label }),
      "没有截图时不应渲染空轮播区域，更不应留下可触发 NaN 索引的控件",
    ).toBeNull();

    emptyView.unmount();
    render(
      <HeroProductCarousel
        {...carouselLabels}
        slides={singleCanvasSlide}
      />,
    );

    const carousel = screen.getByRole("region", {
      name: carouselLabels.label,
    });
    expect(carousel, "单张截图仍必须位于带名称的产品截图区域中").toBeTruthy();
    expect(
      within(carousel).getByRole("img", { name: singleCanvasSlide[0].alt }),
      "单张模式必须显示唯一的空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("button", { name: carouselLabels.previousLabel }),
      "单张模式不应显示没有作用的上一张按钮",
    ).toBeNull();
    expect(
      within(carousel).queryByRole("button", { name: carouselLabels.nextLabel }),
      "单张模式不应显示没有作用的下一张按钮",
    ).toBeNull();
    expect(
      within(carousel).queryByRole("button", { name: "Show screenshot 1" }),
      "单张模式不应显示没有选择意义的页码按钮",
    ).toBeNull();
  });

  /// 动态调整素材：当前选中第二张时若配置缩为一张，轮播应校正索引并继续展示剩余内容。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   initial slides   = 2 张，选择 screenshot 2 → active index = 1
  ///   reduced slides   = 1 张，最大合法索引 = 1 - 1 = 0
  ///   corrected index  = min(1, 0) = 0
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 用两张产品截图渲染轮播 → 初始索引为 0
  ///   2. 点击第二页 → Live Nodes 工作区成为当前图片，索引为 1
  ///   3. 重新渲染为仅含空画布的一张配置 → 原索引 1 已越界
  ///   4. 查询当前图片与导航 → 验证索引被校正且单张规则生效
  ///
  /// 预期结果：
  ///   - 正断言：缩容前显示第二张工作区，缩容后显示唯一空画布
  ///   - 负断言：缩容后不再暴露已移除图片，也不保留下一张按钮
  it("素材列表缩容后校正越界的当前索引", () => {
    const view = render(
      <HeroProductCarousel
        {...carouselLabels}
        slides={twoProductSlides}
      />,
    );
    const carousel = screen.getByRole("region", {
      name: carouselLabels.label,
    });

    fireEvent.click(
      within(carousel).getByRole("button", { name: "Show screenshot 2" }),
    );
    expect(
      within(carousel).getByRole("img", { name: twoProductSlides[1].alt }),
      "缩容前必须确实选中第二张 Live Nodes 工作区截图",
    ).toBeTruthy();

    view.rerender(
      <HeroProductCarousel
        {...carouselLabels}
        slides={singleCanvasSlide}
      />,
    );

    const reducedCarousel = screen.getByRole("region", {
      name: carouselLabels.label,
    });
    expect(
      within(reducedCarousel).getByRole("img", { name: singleCanvasSlide[0].alt }),
      "素材缩为一张后必须把越界索引校正到唯一的空画布截图",
    ).toBeTruthy();
    expect(
      within(reducedCarousel).queryByRole("img", { name: twoProductSlides[1].alt }),
      "素材缩容后已移除的工作区截图不得继续作为当前图片暴露",
    ).toBeNull();
    expect(
      within(reducedCarousel).queryByRole("button", { name: carouselLabels.nextLabel }),
      "素材缩为一张后不应保留无意义的下一张按钮",
    ).toBeNull();
  });

  /// 动态减少动效偏好：用户在页面打开后开启该系统设置，轮播应立即取消自动切换并可在关闭后恢复。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   autoplay delay    = 7,000 ms
  ///   reduced elapsed   = 1 × 7,000 ms = 7,000 ms → 偏好开启，索引保持 0
  ///   resumed elapsed   = 1 × 7,000 ms = 7,000 ms → 偏好关闭，索引从 0 变为 1
  ///   slides            = 2 张，合法索引为 0 和 1
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 模拟系统初始允许动效并渲染两张轮播 → 自动播放计时开始
  ///   2. 派发 matchMedia change(matches=true) → 用户在运行时开启减少动效
  ///   3. 推进 7,000 ms → 已排定计时应被取消，空画布仍保持当前
  ///   4. 派发 change(matches=false) 并再推进 7,000 ms → 自动播放重新开始并切到工作区
  ///
  /// 预期结果：
  ///   - 正断言：开启减少动效后仍显示首张，关闭并等待完整周期后显示第二张
  ///   - 负断言：减少动效期间第二张不得自动出现，恢复后首张不得继续作为当前图片
  it("运行时响应系统的减少动态效果偏好", () => {
    vi.useFakeTimers();
    const motionListeners = new Set<(event: MediaQueryListEvent) => void>();
    let prefersReducedMotion = false;

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        addEventListener: (
          _type: string,
          listener: (event: MediaQueryListEvent) => void,
        ) => motionListeners.add(listener),
        dispatchEvent: () => true,
        matches: prefersReducedMotion,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: (
          _type: string,
          listener: (event: MediaQueryListEvent) => void,
        ) => motionListeners.delete(listener),
      })),
    );

    render(
      <HeroProductCarousel
        {...carouselLabels}
        slides={twoProductSlides}
      />,
    );
    const carousel = screen.getByRole("region", {
      name: carouselLabels.label,
    });

    act(() => {
      prefersReducedMotion = true;
      motionListeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent),
      );
    });
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", { name: singleCanvasSlide[0].alt }),
      "运行时开启减少动效后首张空画布必须继续保持为当前图片",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", { name: twoProductSlides[1].alt }),
      "减少动效开启期间第二张工作区截图不得被自动播放提前激活",
    ).toBeNull();

    act(() => {
      prefersReducedMotion = false;
      motionListeners.forEach((listener) =>
        listener({ matches: false } as MediaQueryListEvent),
      );
    });
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", { name: twoProductSlides[1].alt }),
      "关闭减少动效并等待完整七秒后必须恢复自动播放到第二张工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", { name: singleCanvasSlide[0].alt }),
      "恢复自动播放后首张空画布不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 键盘阅读暂停：焦点进入轮播或其控件时停止自动播放，焦点离开后重新开始完整周期。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   autoplay delay  = 7,000 ms
  ///   focused elapsed = 1 × 7,000 ms = 7,000 ms → 焦点仍在区域内，索引保持 0
  ///   blurred elapsed = 1 × 7,000 ms = 7,000 ms → 焦点离开，索引从 0 变为 1
  ///   total simulated = 7,000 + 7,000 = 14,000 ms
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 启用虚拟计时器并渲染完整 Home → 首张空画布激活
  ///   2. focus 产品截图 region 并推进 7,000 ms → 键盘用户仍在阅读
  ///   3. 检查空画布保持、工作区未出现 → 确认焦点暂停生效
  ///   4. blur 到轮播外并再推进 7,000 ms → 自动播放恢复完整周期
  ///
  /// 预期结果：
  ///   - 正断言：聚焦七秒仍显示首张，失焦再等待七秒显示第二张
  ///   - 负断言：聚焦期间第二张不得出现，恢复后首张不得继续作为当前图片
  it("焦点位于轮播内时暂停自动播放", () => {
    vi.useFakeTimers();
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: carouselLabels.label,
    });
    fireEvent.focus(carousel);

    // focused elapsed = 1 interval × 7,000 ms → active index remains 0
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", { name: singleCanvasSlide[0].alt }),
      "轮播获得焦点七秒后必须继续显示第一张空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", { name: twoProductSlides[1].alt }),
      "焦点位于轮播内时第二张工作区截图不得提前成为当前图片",
    ).toBeNull();

    fireEvent.blur(carousel, { relatedTarget: document.body });
    // blurred elapsed = 1 interval × 7,000 ms → active index: 0 → 1
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", { name: twoProductSlides[1].alt }),
      "焦点离开并重新等待七秒后必须自动显示第二张工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", { name: singleCanvasSlide[0].alt }),
      "恢复自动播放后第一张空画布不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 手动浏览产品截图：访问者点击下一张后，当前可理解的产品画面应从空画布切换到工作区。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   slides          = live nodes workspace + empty spatial canvas = 2 张真实截图
  ///   initial index   = 0（第一张空画布截图）
  ///   next index      = (0 + 1) mod 2 = 1（第二张工作区截图）
  ///   visible image   = 1 张；另一张保留在 DOM 中用于平滑过渡，但退出无障碍树
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 在 jsdom 中渲染完整 Home → 得到默认英文首屏
  ///   2. 查询产品截图 region → 确认测试通过用户可见边界观察行为
  ///   3. 检查初始可访问图片 → 空画布截图可见，工作区截图不可见
  ///   4. 点击 “Next screenshot” → active index 从 0 更新为 1
  ///   5. 再次查询可访问图片 → 工作区截图可见，空画布截图退出当前状态
  ///
  /// 预期结果：
  ///   - 正断言：轮播区域、初始空画布截图、下一张按钮与切换后的工作区截图逐一存在
  ///   - 负断言：切换前不暴露工作区截图，切换后不再暴露空画布截图
  it("允许访问者从第一张真实产品截图手动切换到第二张", () => {
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: "Norma OS product screenshots",
    });
    expect(carousel, "首屏必须提供可查询的产品截图轮播区域").toBeTruthy();
    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "初始状态必须显示第一张空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "初始状态不应把第二张 Live Nodes 工作区截图暴露为当前图片",
    ).toBeNull();

    const nextButton = within(carousel).getByRole("button", {
      name: "Next screenshot",
    });
    expect(nextButton, "轮播必须提供带可访问名称的下一张按钮").toBeTruthy();
    fireEvent.click(nextButton);

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "点击下一张后必须显示第二张 Live Nodes 工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "点击下一张后第一张空画布截图不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 自动展示产品状态：访问者不操作时，轮播应在足够阅读一张截图后自动前进一页。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   autoplay delay = 7,000 ms（为 16:9 产品截图保留约 7 秒观察时间）
  ///   elapsed time   = 1 × 7,000 ms = 7,000 ms（恰好完成一次自动前进）
  ///   slides         = 2 张；next index = (0 + 1) mod 2 = 1
  ///   visible image  = 1 张；非当前截图继续退出无障碍树
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 启用 Vitest 虚拟计时器并渲染 Home → 当前截图索引为 0
  ///   2. 确认第一张空画布截图可访问 → 建立计时前基线
  ///   3. 推进虚拟时间 7,000 ms → 触发一次自动轮播
  ///   4. 查询第二张工作区截图 → 确认 active index 已从 0 变为 1
  ///   5. 排除第一张空画布截图 → 确认页面没有同时暴露两个当前状态
  ///
  /// 预期结果：
  ///   - 正断言：计时前显示图一，7 秒后显示图二
  ///   - 负断言：7 秒后图一不再作为当前可访问图片存在
  it("在七秒无操作后自动轮播到下一张真实产品截图", () => {
    vi.useFakeTimers();
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: "Norma OS product screenshots",
    });
    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "自动轮播计时开始前必须显示第一张空画布截图",
    ).toBeTruthy();

    // elapsed = 1 interval × 7,000 ms = 7,000 ms → active index: 0 → 1
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "无操作七秒后必须自动显示第二张 Live Nodes 工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "自动切换后第一张空画布截图不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 可扩展轮播导航：访问者可用页码直接选择截图，并通过上一张按钮循环返回。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   slides          = 2 张，因此 page controls = 2 个独立按钮
  ///   direct target   = screenshot 2 → active index 从 0 直接变为 1
  ///   previous index  = (1 - 1 + 2) mod 2 = 0 → 回到第一张
  ///   pressed state   = 1 个 true + 1 个 false = 恰好标记一个当前页
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 渲染 Home 并查询 “Show screenshot 2” → 定位用户可见的直接选择控件
  ///   2. 点击第二页控件 → 第二张工作区截图成为当前图片
  ///   3. 检查两个页码的 aria-pressed → 第二页为 true，第一页为 false
  ///   4. 点击 “Previous screenshot” → active index 按循环公式从 1 回到 0
  ///   5. 检查第一张空画布截图与第二张退出状态 → 确认返回操作完整
  ///
  /// 预期结果：
  ///   - 正断言：两个页码、上一张按钮、第二张直达状态与第一张返回状态逐一存在
  ///   - 负断言：第二页激活时第一页不得仍被按下，返回后第二张不得继续作为当前图片
  it("支持页码直达截图并使用上一张按钮循环返回", () => {
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: "Norma OS product screenshots",
    });
    const firstPage = within(carousel).getByRole("button", {
      name: "Show screenshot 1",
    });
    const secondPage = within(carousel).getByRole("button", {
      name: "Show screenshot 2",
    });
    expect(firstPage, "轮播必须为第一张截图提供直接选择按钮").toBeTruthy();
    expect(secondPage, "轮播必须为第二张截图提供直接选择按钮").toBeTruthy();

    fireEvent.click(secondPage);

    expect(
      secondPage.getAttribute("aria-pressed"),
      "直接选择第二张后其页码必须标记为当前页",
    ).toBe("true");
    expect(
      firstPage.getAttribute("aria-pressed"),
      "第二张激活时第一页码不得继续标记为当前页",
    ).toBe("false");
    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "点击第二页码后必须直接显示 Live Nodes 工作区截图",
    ).toBeTruthy();

    const previousButton = within(carousel).getByRole("button", {
      name: "Previous screenshot",
    });
    expect(previousButton, "轮播必须提供带可访问名称的上一张按钮").toBeTruthy();
    fireEvent.click(previousButton);

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "点击上一张后必须循环返回第一张空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "返回第一张后第二张工作区截图不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 阅读暂停策略：访问者悬停查看细节时停止自动轮播，离开后重新获得完整阅读周期。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   autoplay delay  = 7,000 ms
  ///   paused elapsed  = 1 × 7,000 ms = 7,000 ms → 因悬停不切换
  ///   resumed elapsed = 1 × 7,000 ms = 7,000 ms → 移出后完成一次切换
  ///   total simulated = 7,000 + 7,000 = 14,000 ms
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 启用虚拟计时器并渲染 Home → 第一张截图激活
  ///   2. mouseEnter 轮播区域 → 标记用户正在阅读并暂停计时
  ///   3. 推进 7,000 ms → 第一张仍保持激活，第二张不得出现
  ///   4. mouseLeave 轮播区域 → 恢复自动播放并重新开始完整周期
  ///   5. 再推进 7,000 ms → 第二张截图激活，第一张退出当前状态
  ///
  /// 预期结果：
  ///   - 正断言：悬停七秒仍显示图一，移出再等待七秒后显示图二
  ///   - 负断言：悬停期间图二不得提前成为当前图片
  it("悬停时暂停自动播放并在移出后重新计时", () => {
    vi.useFakeTimers();
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: "Norma OS product screenshots",
    });
    fireEvent.mouseEnter(carousel);

    // paused elapsed = 1 interval × 7,000 ms → active index remains 0
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "悬停七秒后必须继续显示第一张空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "悬停期间第二张工作区截图不得提前成为当前图片",
    ).toBeNull();

    fireEvent.mouseLeave(carousel);
    // resumed elapsed = 1 interval × 7,000 ms → active index: 0 → 1
    act(() => {
      vi.advanceTimersByTime(7_000);
    });

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "移出后重新等待七秒必须自动显示第二张 Live Nodes 工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "恢复自动切换后第一张空画布截图不应继续作为当前图片暴露",
    ).toBeNull();
  });

  /// 键盘浏览产品截图：聚焦轮播后，左右方向键应按视觉方向切换当前截图。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   slides            = 2 张
  ///   ArrowRight index  = (0 + 1) mod 2 = 1
  ///   ArrowLeft index   = (1 - 1 + 2) mod 2 = 0
  ///   focus target      = carousel region，tabIndex = 0，可进入正常 Tab 顺序
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 渲染 Home 并查询轮播 region → 检查其可聚焦属性
  ///   2. 向 region 发送 ArrowRight → 第二张工作区截图激活
  ///   3. 排除第一张空画布截图 → 确认右方向键没有同时保留两个当前状态
  ///   4. 向 region 发送 ArrowLeft → 第一张空画布截图重新激活
  ///   5. 排除第二张工作区截图 → 确认左方向键完整返回
  ///
  /// 预期结果：
  ///   - 正断言：region 可聚焦，右键显示图二，左键返回图一
  ///   - 负断言：每次方向键切换后，上一张不得继续作为当前可访问图片
  it("支持聚焦轮播后使用左右方向键切换截图", () => {
    render(<Home />);

    const carousel = screen.getByRole("region", {
      name: "Norma OS product screenshots",
    });
    expect(
      carousel.getAttribute("tabindex"),
      "轮播区域必须进入正常 Tab 顺序以接收方向键操作",
    ).toBe("0");

    fireEvent.keyDown(carousel, { key: "ArrowRight" });

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "按下右方向键后必须显示第二张 Live Nodes 工作区截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "右方向键切换后第一张空画布截图不应继续作为当前图片暴露",
    ).toBeNull();

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });

    expect(
      within(carousel).getByRole("img", {
        name: "Norma OS spatial canvas ready for a new workspace",
      }),
      "按下左方向键后必须返回第一张空画布截图",
    ).toBeTruthy();
    expect(
      within(carousel).queryByRole("img", {
        name: "Norma OS workspace with multiple live Agent, Browser and Terminal nodes",
      }),
      "左方向键返回后第二张工作区截图不应继续作为当前图片暴露",
    ).toBeNull();
  });
});
