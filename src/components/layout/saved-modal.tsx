"use client";

import { BookmarkX } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useChatStore } from "@/store/chat-store";

export function SavedModal() {
  const open = useChatStore((state) => state.savedOpen);
  const setSavedOpen = useChatStore((state) => state.setSavedOpen);
  const saved = useChatStore((state) => state.saved);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const toggleSaved = useChatStore((state) => state.toggleSaved);

  return (
    <Modal
      open={open}
      onClose={() => setSavedOpen(false)}
      title="Memories"
      description="Answers you saved for later. They stay pinned to this workspace."
    >
      {saved.length === 0 ? (
        <p className="px-5 py-10 text-center text-[13.5px] leading-relaxed text-ink-muted">
          Nothing saved yet. Hover any reply and pick the bookmark to keep it
          here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 p-4">
          {saved.map((item) => (
            <li
              key={item.id}
              className="group flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-line-strong"
            >
              <button
                type="button"
                onClick={() => {
                  selectConversation(item.conversationId);
                  setSavedOpen(false);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-[13.5px] font-semibold text-ink">
                  {item.title}
                </span>
                <span className="mt-1 block line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                  {item.excerpt}
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleSaved(item.conversationId, item.messageId)}
                aria-label="Remove from memories"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint opacity-0 transition-all hover:bg-surface-muted hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              >
                <BookmarkX className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
