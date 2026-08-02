"use client";

import Link from "next/link";
import { useRef } from "react";
import type { SiteContent } from "../site-content";
import { latestDownloadUrl } from "../site-constants";

type MobileNavigationProps = {
  isEnglish: boolean;
  nav: SiteContent["nav"];
};

export function MobileNavigation({
  isEnglish,
  nav,
}: MobileNavigationProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    detailsRef.current?.removeAttribute("open");
  };

  return (
    <details className="mobile-nav" ref={detailsRef}>
      <summary aria-label={nav.mobileLabel}>
        <span />
        <span />
      </summary>
      <nav aria-label={nav.label}>
        <a href="#product" onClick={closeMenu}>
          {nav.product}
        </a>
        <a href="#how-it-works" onClick={closeMenu}>
          {nav.story}
        </a>
        <a href="#features" onClick={closeMenu}>
          {nav.features}
        </a>
        {isEnglish ? (
          <Link href="/zh-cn" lang="zh-CN" onClick={closeMenu}>
            中文
          </Link>
        ) : (
          <Link href="/" lang="en" onClick={closeMenu}>
            English
          </Link>
        )}
        <a href={latestDownloadUrl} onClick={closeMenu}>
          {nav.download}
        </a>
      </nav>
    </details>
  );
}
