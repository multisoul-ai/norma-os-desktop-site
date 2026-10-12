import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EnglishRootLayout, { metadata as englishMetadata } from "./(en)/layout";
import ChineseRootLayout from "./(zh)/layout";
import Home from "./(en)/page";
import ChineseHome, { metadata as chineseMetadata } from "./(zh)/zh-cn/page";
import { betaLicenseKey, latestDownloadUrl } from "./site-constants";

describe("Approved A homepage", () => {
  it.each([
    {
      name: "English",
      page: <Home />,
      title: "More building.",
      license: "Beta license",
      otherLocale: "/zh-cn",
    },
    {
      name: "Chinese",
      page: <ChineseHome />,
      title: "多一点创造。",
      license: "内测 License",
      otherLocale: "/",
    },
  ])(
    "serves A directly on the $name route before hydration",
    ({ page, title, license, otherLocale }) => {
      const html = renderToStaticMarkup(page);
      expect(html).toContain(title);
      expect(html).toContain('data-tone="black"');
      expect(html).toContain("norma-cloud-poster.png");
      expect(html).toContain(`href="${otherLocale}"`);
      expect(html).toContain(`href="${latestDownloadUrl}"`);
      expect(html).toContain(license);
      expect(html.indexOf(betaLicenseKey)).toBeGreaterThan(
        html.indexOf('id="download"'),
      );
      expect(html).not.toContain(`href="${betaLicenseKey}"`);
      expect(html).not.toMatch(
        /variant=|DESIGN STUDY|PrototypeSwitcher|site-c-hero/,
      );
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    },
  );

  it("keeps the accepted narrative and real demos without the rejected feature grid", () => {
    const html = renderToStaticMarkup(<Home />);
    const sections = [
      "main",
      "how-it-works",
      "in-action",
      "local-first",
      "faq",
      "download",
    ];
    const offsets = sections.map((id) => html.indexOf(`id="${id}"`));
    expect(offsets.every((offset) => offset >= 0)).toBe(true);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    expect(html).not.toContain('id="features"');
    expect(html).toContain('href="#in-action"');
    expect(html.match(/role="tab"/g)).toHaveLength(5);
    expect(html.match(/<video[ >]/g)).toHaveLength(1);
    expect(html).toContain('src="/media/demo-voice-command.mp4"');
    expect(html).toContain('poster="/media/demo-voice-command.webp"');
    expect(html).toContain('preload="none"');
    expect(html).not.toContain('src="/media/demo-agent-collaboration.mp4"');
    expect(html).toContain("One spoken instruction controls six Agents.");
    expect(html.match(/<details>/g)).toHaveLength(5);
    expect(html.indexOf("<footer")).toBeGreaterThan(html.indexOf("</main>"));
  });

  it("preserves document languages and canonical locale URLs", () => {
    const en = renderToStaticMarkup(
      <EnglishRootLayout>
        <Home />
      </EnglishRootLayout>,
    );
    const zh = renderToStaticMarkup(
      <ChineseRootLayout>
        <ChineseHome />
      </ChineseRootLayout>,
    );
    expect(en).toContain('<html lang="en">');
    expect(zh).toContain('<html lang="zh-CN">');
    expect(zh).toContain('lang="zh-CN"');
    expect(zh).toContain("一句话群控");
    expect(zh).toContain("Agent 协作");
    expect(englishMetadata.alternates?.canonical).toBe("/");
    expect(chineseMetadata.alternates?.canonical).toBe("/zh-cn");
    expect(chineseMetadata.alternates?.languages).toEqual({
      en: "/",
      "zh-CN": "/zh-cn",
    });
  });
});
