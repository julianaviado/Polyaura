"use client";

/**
 * Markdown renderer for assistant replies, delegating fenced code to CodeBlock.
 */
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/chat/code-block";
import { cn } from "@/lib/utils";

/** Pulls the plain string content out of a react-markdown code node. */
function toText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(toText).join("");
  return "";
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const text = toText(children);

    // Fenced blocks arrive with a language class or a trailing newline;
    // everything else is inline code.
    if (!match && !text.includes("\n")) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    return <CodeBlock code={text.replace(/\n$/, "")} language={match?.[1]} />;
  },
  pre({ children }) {
    // CodeBlock renders its own <pre>; drop the wrapper markdown adds.
    return <>{children}</>;
  },
  a({ children, href, ...props }) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="scrollbar-subtle -mx-0.5 overflow-x-auto px-0.5">
        <table {...props}>{children}</table>
      </div>
    );
  },
};

type MarkdownProps = {
  content: string;
  className?: string;
};

export const Markdown = memo(function Markdown({
  content,
  className,
}: MarkdownProps) {
  return (
    <div className={cn("md", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
