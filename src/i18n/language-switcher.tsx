"use client";

import { useI18n, type Locale } from "./i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { dictionary: t, locale, setLocale } = useI18n();
  const options: Array<{ label: string; locale: Locale }> = [
    { label: t.language.english, locale: "en" },
    { label: t.language.chinese, locale: "zh" },
  ];

  return (
    <div
      aria-label={t.language.label}
      className={`language-switcher ${className}`.trim()}
      role="group"
    >
      {options.map((option) => (
        <button
          aria-pressed={locale === option.locale}
          className={locale === option.locale ? "is-active" : ""}
          key={option.locale}
          lang={option.locale === "zh" ? "zh-CN" : "en"}
          onClick={(event) => {
            setLocale(option.locale);
            event.currentTarget.closest("details")?.removeAttribute("open");
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
