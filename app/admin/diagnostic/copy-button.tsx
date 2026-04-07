"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`}
    >
      {copied ? "Copié !" : label}
    </button>
  );
}

// Backward compat alias
export function CopyHtmlButton({ html }: { html: string }) {
  return <CopyButton text={html} label="Copier le HTML" />;
}
