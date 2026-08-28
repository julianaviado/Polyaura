"use client";

/**
 * Chat history column: grouped conversation list with rename, pin, and delete,
 * plus the overlay drawer variant used on narrow viewports.
 */
import { AnimatePresence, motion } from "motion/react";
import {
  MoreHorizontal,
  PanelLeft,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { useDismiss, useMounted } from "@/lib/hooks";
import type { Conversation } from "@/lib/types";
import { cn, relativeBucket } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

const BUCKET_ORDER = [
  "Pinned",
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Older",
];

function groupConversations(conversations: Conversation[]) {
  const groups = new Map<string, Conversation[]>();

  for (const conversation of conversations) {
    const bucket = conversation.pinned
      ? "Pinned"
      : relativeBucket(conversation.updatedAt);
    const existing = groups.get(bucket);
    if (existing) existing.push(conversation);
    else groups.set(bucket, [conversation]);
  }

  return BUCKET_ORDER.filter((bucket) => groups.has(bucket)).map((bucket) => ({
    bucket,
    items: groups
      .get(bucket)!
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt),
  }));
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  const activeId = useChatStore((state) => state.activeConversationId);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const renameConversation = useChatStore((state) => state.renameConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const togglePin = useChatStore((state) => state.togglePin);

  const menuRef = useDismiss<HTMLDivElement>(menuOpen, () =>
    setMenuOpen(false),
  );
  const active = conversation.id === activeId;

  const commit = () => {
    renameConversation(conversation.id, draft);
    setRenaming(false);
  };

  if (renaming) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(conversation.title);
            setRenaming(false);
          }
        }}
        className="w-full rounded-lg border border-brand-ring bg-white px-3 py-2 text-[13.5px] font-medium text-ink outline-none"
      />
    );
  }

  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={() => selectConversation(conversation.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-left text-[13.5px] font-medium transition-colors",
          active
            ? "bg-white text-ink shadow-[0_1px_2px_rgb(23_38_56/0.05)]"
            : "text-ink-soft hover:bg-white/70 hover:text-ink",
        )}
      >
        {conversation.pinned && (
          <Pin className="h-3 w-3 shrink-0 -rotate-45 text-ink-faint" />
        )}
        <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
      </button>

      <div ref={menuRef} className="absolute right-1 top-1.5">
        <button
          type="button"
          aria-label={`Options for ${conversation.title}`}
          onClick={() => setMenuOpen((open) => !open)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-all hover:bg-surface-sunken hover:text-ink",
            menuOpen
              ? "opacity-100"
              : "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100",
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-7 z-40 w-40 origin-top-right overflow-hidden rounded-xl border border-line bg-white p-1 shadow-pop"
            >
              <button
                type="button"
                onClick={() => {
                  setRenaming(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => {
                  togglePin(conversation.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                {conversation.pinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
                {conversation.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConversation(conversation.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger/8"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type SidebarProps = {
  /** True when the column is down to its icon rail; the history then lives in
   * `SidebarDrawer`, or nowhere at all in reading mode. */
  collapsed?: boolean;
};

function History() {
  const conversations = useChatStore((state) => state.conversations);
  const newConversation = useChatStore((state) => state.newConversation);
  const setPaletteOpen = useChatStore((state) => state.setPaletteOpen);

  // History buckets depend on the current date, so they are resolved on the
  // client only; the page itself is statically prerendered.
  const mounted = useMounted();
  const groups = useMemo(
    () => groupConversations(conversations),
    [conversations],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">
      <div className="flex flex-col gap-1.5 px-2 pb-3">
        <button
          type="button"
          onClick={() => newConversation()}
          className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] font-semibold text-ink shadow-[0_1px_2px_rgb(23_38_56/0.05)] transition-colors hover:border-line-strong"
        >
          <Plus className="h-4 w-4 text-brand" strokeWidth={2.2} />
          New chat
        </button>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] font-medium text-ink-muted transition-colors hover:bg-white/70 hover:text-ink"
        >
          <Search className="h-4 w-4" strokeWidth={1.9} />
          Search chats
          <kbd className="ml-auto rounded border border-line bg-white px-1.5 py-px text-[10px] font-semibold text-ink-faint">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav
        aria-label="Chat history"
        tabIndex={0}
        className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto px-1"
      >
        {!mounted && (
          <div aria-busy="true" className="flex flex-col gap-2 px-3 pt-1">
            <span className="sr-only">Loading chat history</span>
            {[92, 72, 84, 64].map((width, index) => (
              <span
                key={index}
                aria-hidden
                className="skeleton h-7"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        )}
        {mounted &&
          groups.map((group) => (
            <section key={group.bucket} className="mb-4">
              <h2 className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.bucket}
              </h2>
              <div className="flex flex-col gap-0.5">
                {group.items.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
              </div>
            </section>
          ))}
      </nav>
    </div>
  );
}

export function Sidebar({ collapsed }: SidebarProps) {
  const open = useChatStore((state) => state.sidebarOpen);
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[4.5rem] shrink-0 items-center gap-3 px-5">
        <Tooltip
          label={open ? "Collapse sidebar" : "Expand sidebar"}
          side="right"
        >
          <IconButton
            label={open ? "Collapse sidebar" : "Expand sidebar"}
            variant="raised"
            round
            onClick={() => setSidebarOpen(!open)}
            className="h-9 w-9"
          >
            <PanelLeft className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.9} />
          </IconButton>
        </Tooltip>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="text-[1.3rem] font-bold tracking-tight text-ink"
            >
              Polyaura
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <History />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The drawer variant used once the layout is too narrow for a fixed column. */
export function SidebarDrawer() {
  const open = useChatStore((state) => state.sidebarOpen);
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-40 bg-ink/15 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[7rem] left-3 top-[4.5rem] z-40 flex w-64 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-pop"
          >
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="text-[1.15rem] font-bold tracking-tight text-ink">
                Polyaura
              </span>
              <IconButton
                label="Close sidebar"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 flex-col">
              <History />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
