"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BookOpen,
  CircleStop,
  Database,
  Paperclip,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AttachmentCard } from "@/components/chat/attachment-card";
import { Markdown } from "@/components/chat/markdown";
import { MessageActions } from "@/components/chat/message-actions";
import { Avatar } from "@/components/ui/avatar";
import { USER } from "@/data/seed";
import { useAutoResize, useCopy } from "@/lib/hooks";
import type { Citation, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

const CITATION_ICON: Record<Citation["source"], React.ReactNode> = {
  "knowledge-base": <BookOpen className="h-3.5 w-3.5" />,
  "campaign-memory": <Database className="h-3.5 w-3.5" />,
  upload: <Paperclip className="h-3.5 w-3.5" />,
};

type MessageItemProps = {
  message: Message;
  saved: boolean;
  editing: boolean;
  isStreaming: boolean;
  showCitations: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (text: string) => void;
  onRegenerate: () => void;
  onRefine: () => void;
  onSave: () => void;
};

export function MessageItem({
  message,
  saved,
  editing,
  isStreaming,
  showCitations,
  onCopy,
  onEdit,
  onCancelEdit,
  onSubmitEdit,
  onRegenerate,
  onRefine,
  onSave,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const { copied, copy } = useCopy();
  const [hovered, setHovered] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyed on `editing` too: the textarea only mounts once editing starts, and
  // the draft is unchanged at that point.
  useAutoResize(textareaRef, editing ? draft : "", 320);

  useEffect(() => {
    if (editing) {
      setDraft(message.content);
      // Defer so the textarea exists before we move the caret to the end.
      requestAnimationFrame(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        element.setSelectionRange(element.value.length, element.value.length);
      });
    }
  }, [editing, message.content]);

  const handleCopy = () => {
    copy(message.content);
    onCopy();
  };

  const citations = showCitations ? (message.citations ?? []) : [];
  const empty = message.role === "assistant" && message.content.length === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      className={cn(
        "group/message relative border-b border-line px-6 py-7 last:border-b-0 sm:px-10 sm:py-8",
        isUser ? "bg-surface-muted" : "bg-white",
      )}
    >
      <header className="mb-3 flex items-center gap-3">
        {isUser ? (
          <Avatar name={USER.name} src={USER.avatar} size={36} />
        ) : (
          <Avatar name="polyaura" size={36} brand />
        )}
        <h3 className="text-[15px] font-semibold text-ink">
          {isUser ? USER.name : "polyaura"}
        </h3>
        {message.streaming && (
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-hover">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            {message.content ? "Writing" : "Thinking"}
          </span>
        )}
      </header>

      <div className="pl-[3rem]">
        {editing ? (
          <div className="rounded-2xl border border-brand-ring bg-white p-3 shadow-[0_0_0_4px_rgb(22_104_227/0.08)]">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSubmitEdit(draft);
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  onCancelEdit();
                }
              }}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none"
              rows={1}
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSubmitEdit(draft)}
                disabled={!draft.trim()}
                className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:bg-line-strong"
              >
                Send again
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft text-balance-pretty">
            {message.content}
          </p>
        ) : (
          <Markdown
            content={message.content}
            className={cn(message.streaming && !empty && "stream-caret")}
          />
        )}

        {empty && message.streaming && (
          <div className="flex items-center gap-1.5 py-1">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-2 w-2 rounded-full bg-line-strong"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                transition={{
                  duration: 1.05,
                  repeat: Infinity,
                  delay: index * 0.14,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {message.attachments.length > 0 && !editing && (
          <div className="mt-4 flex flex-wrap gap-3">
            {message.attachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                className="w-[13.5rem]"
              />
            ))}
          </div>
        )}

        {citations.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Sources
            </span>
            {citations.map((citation) => (
              <span
                key={citation.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-soft"
              >
                <span className="text-ink-faint">
                  {CITATION_ICON[citation.source]}
                </span>
                {citation.label}
              </span>
            ))}
          </div>
        )}

        {message.stopped && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-ink-muted">
            <CircleStop className="h-4 w-4" />
            Generation stopped.
            <button
              type="button"
              onClick={onRegenerate}
              className="font-semibold text-brand hover:underline"
            >
              Continue
            </button>
          </p>
        )}

        {message.error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2.5 text-[13px] text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{message.error}</span>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 font-semibold hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Full-height rail so the toolbar stays in view on long answers. */}
      <div className="pointer-events-none absolute inset-y-0 right-3 z-10 w-9">
        <AnimatePresence>
          {hovered && !editing && !message.streaming && (
            <MessageActions
              role={message.role}
              copied={copied}
              saved={saved}
              disabled={isStreaming}
              onCopy={handleCopy}
              onEdit={isUser ? onEdit : onRegenerate}
              onRefine={onRefine}
              onSave={onSave}
              className="pointer-events-auto sticky top-5"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
