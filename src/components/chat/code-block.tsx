"use client";

import { Check, Copy } from "lucide-react";
import { useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import { useCopy } from "@/lib/hooks";

const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  html: "markup",
  xml: "markup",
  yml: "yaml",
};

type CodeBlockProps = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const resolved = language ? (ALIASES[language] ?? language) : "";

  const html = useMemo(() => {
    const grammar = resolved ? Prism.languages[resolved] : undefined;
    if (!grammar) return null;
    try {
      return Prism.highlight(code, grammar, resolved);
    } catch {
      return null;
    }
  }, [code, resolved]);

  return (
    <div className="code-block group/code overflow-hidden rounded-xl border border-line bg-surface-muted">
      <div className="flex items-center justify-between border-b border-line bg-white/60 px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          {resolved || "code"}
        </span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-brand" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="scrollbar-subtle overflow-x-auto px-3.5 py-3">
        <pre className="min-w-0">
          {html ? (
            <code
              className={resolved ? `language-${resolved}` : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
