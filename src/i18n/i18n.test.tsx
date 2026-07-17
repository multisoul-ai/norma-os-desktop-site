// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageSwitcher } from "./language-switcher";
import {
  I18nProvider,
  localeStorageKey,
  useI18n,
} from "./i18n";

function LanguageHarness() {
  const { dictionary, locale } = useI18n();

  return (
    <>
      <LanguageSwitcher />
      <output aria-label="current locale">{locale}</output>
      <output aria-label="translated product label">{dictionary.nav.product}</output>
      <output aria-label="translated download action">
        {dictionary.hero.primaryAction}
      </output>
    </>
  );
}

describe("Norma OS 国际化", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "en";
  });

  afterEach(() => {
    cleanup();
  });

  /// 语言切换面向官网访问者：从默认英文切到中文时，文案、选中状态、本地偏好与文档语言应同步更新。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   supported locales = en + zh = 2 种语言
  ///   default locale     = en（用户明确指定）
  ///   selected locale    = zh（模拟访问者点击“中文”）
  ///   storage key        = norma-os-locale（国际化层公开常量）
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 清空 localStorage 并渲染 Provider → 初始 locale 为 en，产品导航显示 Product，CTA 显示 Download Norma OS
  ///   2. 点击唯一的“中文”按钮 → Provider 发布语言变更
  ///   3. 读取公开界面、aria-pressed、本地存储与 html lang → 检查所有语言状态保持一致
  ///
  /// 预期结果：
  ///   - 正断言：英文 CTA 显示 Download Norma OS；切换后中文 CTA 显示“下载 Norma OS”
  ///   - 正断言：中文按钮被选中，产品文案变为“产品”，locale/存储/html lang 都变为中文
  ///   - 负断言：旧 CTA 文案不再显示，英文按钮不再选中，英文产品标签不再显示
  it("切换到中文并同步持久化与文档语言", () => {
    render(
      <I18nProvider>
        <LanguageHarness />
      </I18nProvider>,
    );

    const englishButton = screen.getByRole("button", { name: "EN" });
    const chineseButton = screen.getByRole("button", { name: "中文" });

    expect(
      screen.getByLabelText("current locale").textContent,
      "没有本地偏好时 locale 必须默认为 en",
    ).toBe("en");
    expect(
      screen.getByLabelText("translated product label").textContent,
      "默认英文词典必须把产品导航显示为 Product",
    ).toBe("Product");
    expect(
      screen.getByLabelText("translated download action").textContent,
      "默认英文 CTA 必须显示 Download Norma OS",
    ).toBe("Download Norma OS");
    expect(
      screen.getByLabelText("translated download action").textContent,
      "默认英文 CTA 不应继续显示旧文案 Explore Norma OS",
    ).not.toBe("Explore Norma OS");
    expect(
      englishButton.getAttribute("aria-pressed"),
      "默认英文按钮必须处于选中状态",
    ).toBe("true");
    expect(
      chineseButton.getAttribute("aria-pressed"),
      "首次渲染时中文按钮不应处于选中状态",
    ).toBe("false");

    fireEvent.click(chineseButton);

    expect(
      screen.getByLabelText("current locale").textContent,
      "点击中文后公开 locale 必须更新为 zh",
    ).toBe("zh");
    expect(
      screen.getByLabelText("translated product label").textContent,
      "点击中文后产品导航必须更新为中文",
    ).toBe("产品");
    expect(
      screen.getByLabelText("translated download action").textContent,
      "切换到中文后 CTA 必须显示“下载 Norma OS”",
    ).toBe("下载 Norma OS");
    expect(
      screen.getByLabelText("translated download action").textContent,
      "切换到中文后 CTA 不应继续显示旧文案“探索 Norma OS”",
    ).not.toBe("探索 Norma OS");
    expect(
      screen.getByLabelText("translated product label").textContent,
      "切换到中文后英文产品标签不应继续显示",
    ).not.toBe("Product");
    expect(
      chineseButton.getAttribute("aria-pressed"),
      "切换后中文按钮必须处于选中状态",
    ).toBe("true");
    expect(
      englishButton.getAttribute("aria-pressed"),
      "切换后英文按钮必须退出选中状态",
    ).toBe("false");
    expect(
      window.localStorage.getItem(localeStorageKey),
      "切换后的中文偏好必须写入本地存储",
    ).toBe("zh");
    expect(
      document.documentElement.lang,
      "切换到中文后 html lang 必须同步为 zh-CN",
    ).toBe("zh-CN");
  });
});
