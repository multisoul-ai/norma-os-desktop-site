"use client";

import { useEffect, useState } from "react";

type LicenseKeyProps = {
  copiedLabel: string;
  copyLabel: string;
  label: string;
  licenseKey: string;
};

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Continue to the selection-based fallback for restricted browsers.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Clipboard copy was rejected");
}

function CopyIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3.5 8.2 2.8 2.8 6.2-6.2" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <rect height="8.5" rx="1.5" width="8.5" x="5" y="2.5" />
      <path d="M3 5.5H2.5v7a1 1 0 0 0 1 1h7V13" />
    </svg>
  );
}

export function LicenseKey({
  copiedLabel,
  copyLabel,
  label,
  licenseKey,
}: LicenseKeyProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    // feedback duration = 2 seconds × 1,000 milliseconds = 2,000 ms
    const feedbackDurationMs = 2 * 1_000;
    const timeout = window.setTimeout(() => setCopied(false), feedbackDurationMs);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLicense() {
    try {
      await writeToClipboard(licenseKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="hero__license">
      <span className="hero__license-label">{label}</span>
      <code>{licenseKey}</code>
      <button
        aria-label={copied ? copiedLabel : copyLabel}
        className="hero__license-copy"
        data-copied={copied}
        onClick={copyLicense}
        type="button"
      >
        <CopyIcon copied={copied} />
        <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
