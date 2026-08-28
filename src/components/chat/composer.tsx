"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AttachmentCard } from "@/components/chat/attachment-card";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { PROMPT_SUGGESTIONS } from "@/data/seed";
import { useAutoResize } from "@/lib/hooks";
import type { Attachment } from "@/lib/types";
import { attachmentFromFile, simulateUpload } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

export type ComposerHandle = {
  focus: () => void;
  setValue: (value: string) => void;
  addFiles: (files: FileList | File[]) => void;
};

export const Composer = forwardRef<ComposerHandle>(function Composer(_, ref) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [focused, setFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancellers = useRef(new Map<string, () => void>());

  const isStreaming = useChatStore((state) => state.isStreaming);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const stopGeneration = useChatStore((state) => state.stopGeneration);
  const references = useChatStore((state) => state.references);
  const toggleReference = useChatStore((state) => state.toggleReference);

  useAutoResize(textareaRef, value, 200);

  useEffect(() => {
    const cancels = cancellers.current;
    return () => {
      cancels.forEach((cancel) => cancel());
      cancels.clear();
    };
  }, []);

  // Rotate the ghost suggestion while the field is empty and unfocused.
  useEffect(() => {
    if (value || focused) return;
    const timer = setInterval(() => {
      setSuggestionIndex((index) => (index + 1) % PROMPT_SUGGESTIONS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [value, focused]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).map(attachmentFromFile);
    if (incoming.length === 0) return;

    setAttachments((current) => [...current, ...incoming]);

    for (const attachment of incoming) {
      const cancel = simulateUpload(
        attachment,
        (id, progress) =>
          setAttachments((current) =>
            current.map((item) =>
              item.id === id ? { ...item, progress } : item,
            ),
          ),
        (id) => {
          cancellers.current.delete(id);
          setAttachments((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, status: "ready", progress: 100 }
                : item,
            ),
          );
        },
      );
      cancellers.current.set(attachment.id, cancel);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setValue: (next: string) => {
      setValue(next);
      requestAnimationFrame(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        element.setSelectionRange(next.length, next.length);
      });
    },
    addFiles,
  }));

  const removeAttachment = (id: string) => {
    cancellers.current.get(id)?.();
    cancellers.current.delete(id);
    setAttachments((current) => current.filter((item) => item.id !== id));
  };

  const uploading = attachments.some((item) => item.status === "uploading");
  const canSend = value.trim().length > 0 && !uploading && !isStreaming;

  const submit = () => {
    if (!canSend) return;
    const ready = attachments.filter((item) => item.status === "ready");
    void sendMessage({ text: value, attachments: ready });
    setValue("");
    setAttachments([]);
    cancellers.current.forEach((cancel) => cancel());
    cancellers.current.clear();
  };

  const suggestion = PROMPT_SUGGESTIONS[suggestionIndex];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
      return;
    }
    if (event.key === "Tab" && !value) {
      event.preventDefault();
      setValue(suggestion);
      return;
    }
    if (event.key === "Escape") {
      if (isStreaming) {
        event.preventDefault();
        stopGeneration();
      } else if (value) {
        event.preventDefault();
        setValue("");
      }
    }
  };

  const knowledgeBase = references.find((item) => item.key === "knowledgeBase");
  const campaignMemory = references.find(
    (item) => item.key === "campaignMemory",
  );

  return (
    /* Two tiers: the input rides on a narrow rounded block whose shoulders
     * flare into the wider utility dock underneath it. */
    <div className="pointer-events-none relative z-30 flex flex-col items-center px-4 sm:px-6">
      <div className="pointer-events-auto composer-notch relative z-10 w-full max-w-[52rem] rounded-t-[1.75rem] bg-surface px-5 pt-4 pb-3">
        {/* Attachment chips float above the dock, over the transcript. */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-full left-5 right-5 mb-3 flex flex-wrap gap-3"
            >
              {attachments.map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={removeAttachment}
                  className="w-[13.5rem] shadow-float"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2.5">
          <div
            className={cn(
              "relative flex min-w-0 flex-1 items-end gap-2 rounded-[1.5rem] border bg-white px-5 py-3 transition-all duration-200",
              focused
                ? "border-brand-ring shadow-[0_0_0_4px_rgb(22_104_227/0.09)]"
                : "border-line-strong hover:border-[#c9d2dc]",
            )}
          >
            <div className="relative min-w-0 flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                rows={1}
                onChange={(event) => setValue(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                aria-label="Message polyaura"
                placeholder=""
                className="block max-h-[12.5rem] w-full resize-none bg-transparent text-[15px] leading-6 text-ink outline-none"
              />

              {!value && (
                <div className="pointer-events-none absolute inset-0 flex items-start gap-2 text-[15px] leading-6">
                  <span className="truncate text-ink-faint">{suggestion}</span>
                  <kbd className="mt-px shrink-0 rounded border border-line bg-surface-sunken px-1.5 py-px text-[11px] font-semibold text-ink-muted">
                    Tab
                  </kbd>
                </div>
              )}
            </div>

            <Tooltip label="Attach files" side="top">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files"
                className="-mr-1 mb-0.5 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <Paperclip
                  className="h-[1.15rem] w-[1.15rem]"
                  strokeWidth={1.9}
                />
              </button>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          <Tooltip
            label={isStreaming ? "Stop generating" : "Send"}
            shortcut={isStreaming ? "Esc" : "↵"}
            side="top"
          >
            <button
              type="button"
              onClick={isStreaming ? stopGeneration : submit}
              disabled={!isStreaming && !canSend}
              aria-label={isStreaming ? "Stop generating" : "Send message"}
              className={cn(
                "mb-0.5 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                isStreaming
                  ? "bg-ink text-white hover:bg-ink-soft"
                  : canSend
                    ? "bg-brand text-white shadow-float hover:bg-brand-hover"
                    : "cursor-not-allowed bg-surface-sunken text-ink-faint",
              )}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="pointer-events-auto w-full max-w-[58rem] rounded-t-[1.75rem] bg-surface px-8">
        <div className="flex h-[6.5rem] items-start justify-between gap-4 pt-4">
          <div className="flex items-center gap-4">
            {knowledgeBase && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                <span id="composer-kb">{knowledgeBase.label}</span>
                <Toggle
                  size="sm"
                  checked={knowledgeBase.enabled}
                  onChange={() => toggleReference("knowledgeBase")}
                  labelledBy="composer-kb"
                />
              </div>
            )}
            {campaignMemory && (
              <div className="hidden items-center gap-2 text-[13px] font-medium text-ink-soft sm:flex">
                <span id="composer-cm">{campaignMemory.label}</span>
                <Toggle
                  size="sm"
                  checked={campaignMemory.enabled}
                  onChange={() => toggleReference("campaignMemory")}
                  labelledBy="composer-cm"
                />
              </div>
            )}
          </div>

          <p className="hidden shrink-0 text-[13px] text-ink-muted sm:block">
            <kbd className="font-sans font-semibold text-ink-soft">esc</kbd> to{" "}
            <span className="font-semibold text-ink-soft">cancel</span> ·{" "}
            <kbd className="font-sans font-semibold text-ink-soft">enter</kbd>{" "}
            to <span className="font-semibold text-ink-soft">send</span>
          </p>
        </div>
      </div>
    </div>
  );
});
