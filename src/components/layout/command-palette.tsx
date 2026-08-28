"use client";

/**
 * Search dialog over conversations and quick actions, opened with Cmd+K and
 * fully keyboard navigable.
 */
import { AnimatePresence, motion } from "motion/react";
import {
  CornerDownLeft,
  MessageSquare,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

type Result =
  | { kind: "action"; id: string; label: string; hint: string; run: () => void }
  | {
      kind: "conversation";
      id: string;
      label: string;
      hint: string;
      snippet: string;
      run: () => void;
    };

export function CommandPalette() {
  const open = useChatStore((state) => state.paletteOpen);
  const setPaletteOpen = useChatStore((state) => state.setPaletteOpen);
  const conversations = useChatStore((state) => state.conversations);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const newConversation = useChatStore((state) => state.newConversation);
  const setSettingsOpen = useChatStore((state) => state.setSettingsOpen);

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const needle = query.trim().toLowerCase();

    const actions = (
      [
        {
          kind: "action",
          id: "new",
          label: "Start a new chat",
          hint: "Action",
          run: () => {
            newConversation();
            setPaletteOpen(false);
          },
        },
        {
          kind: "action",
          id: "settings",
          label: "Open chat settings",
          hint: "Action",
          run: () => {
            setSettingsOpen(true);
            setPaletteOpen(false);
          },
        },
      ] satisfies Result[]
    ).filter(
      (action) => !needle || action.label.toLowerCase().includes(needle),
    );

    const matches: Result[] = conversations
      .map((conversation) => {
        const body = conversation.messages
          .map((message) => message.content)
          .join(" ");
        const haystack = `${conversation.title} ${body}`.toLowerCase();
        if (needle && !haystack.includes(needle)) return null;

        // Show the text around the first hit so the match is visible.
        let snippet = body.replace(/\s+/g, " ").slice(0, 90);
        if (needle) {
          const at = body.toLowerCase().indexOf(needle);
          if (at >= 0) {
            snippet = `…${body
              .replace(/\s+/g, " ")
              .slice(Math.max(0, at - 30), at + 70)
              .trim()}…`;
          }
        }

        return {
          kind: "conversation" as const,
          id: conversation.id,
          label: conversation.title,
          hint: formatTime(conversation.updatedAt),
          snippet,
          run: () => {
            selectConversation(conversation.id);
            setPaletteOpen(false);
          },
        };
      })
      .filter((item): item is Extract<Result, { kind: "conversation" }> =>
        Boolean(item),
      );

    return [...actions, ...matches];
  }, [
    query,
    conversations,
    newConversation,
    selectConversation,
    setPaletteOpen,
    setSettingsOpen,
  ]);

  useEffect(() => {
    setCursor((index) => Math.min(index, Math.max(0, results.length - 1)));
  }, [results.length]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((index) => (index + 1) % Math.max(1, results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(
        (index) => (index - 1 + results.length) % Math.max(1, results.length),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      results[cursor]?.run();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setPaletteOpen(false)}
            className="absolute inset-0 bg-ink/18 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search chats"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[64vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
            onKeyDown={onKeyDown}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chats and actions…"
                aria-label="Search chats and actions"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="shrink-0 rounded border border-line bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">
                Esc
              </kbd>
            </div>

            <ul className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-[13.5px] text-ink-muted">
                  No matches for “{query}”.
                </li>
              )}

              {results.map((result, index) => (
                <li key={`${result.kind}-${result.id}`}>
                  <button
                    type="button"
                    onPointerEnter={() => setCursor(index)}
                    onClick={result.run}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      index === cursor
                        ? "bg-brand-soft"
                        : "hover:bg-surface-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        index === cursor
                          ? "bg-white text-brand"
                          : "bg-surface-sunken text-ink-muted",
                      )}
                    >
                      {result.kind === "action" ? (
                        result.id === "new" ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <Settings2 className="h-4 w-4" />
                        )
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">
                        {result.label}
                      </span>
                      {result.kind === "conversation" && result.snippet && (
                        <span className="block truncate text-[12.5px] text-ink-muted">
                          {result.snippet}
                        </span>
                      )}
                    </span>

                    {index === cursor ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand" />
                    ) : (
                      <span className="shrink-0 text-[11.5px] text-ink-faint">
                        {result.hint}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
