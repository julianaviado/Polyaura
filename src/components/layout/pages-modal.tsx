"use client";

/**
 * Grid overview of every conversation in the workspace.
 */
import { MessageSquareText, Paperclip } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useChatStore } from "@/store/chat-store";
import { relativeBucket } from "@/lib/utils";

export function PagesModal() {
  const open = useChatStore((state) => state.pagesOpen);
  const setPagesOpen = useChatStore((state) => state.setPagesOpen);
  const conversations = useChatStore((state) => state.conversations);
  const selectConversation = useChatStore((state) => state.selectConversation);

  return (
    <Modal
      open={open}
      onClose={() => setPagesOpen(false)}
      title="Pages"
      description={`${conversations.length} ${
        conversations.length === 1 ? "chat" : "chats"
      } in this workspace`}
      className="max-w-3xl"
    >
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {conversations.map((conversation) => {
          const attachmentCount = conversation.messages.reduce(
            (total, message) => total + message.attachments.length,
            0,
          );
          const preview =
            conversation.messages
              .find((message) => message.role === "assistant")
              ?.content.replace(/[#*`>|_]/g, "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 150) ??
            conversation.messages[0]?.content.slice(0, 150) ??
            "Empty chat. Nothing said yet.";

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => {
                selectConversation(conversation.id);
                setPagesOpen(false);
              }}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 text-left transition-all hover:border-brand-ring hover:shadow-float"
            >
              <h3 className="line-clamp-1 text-[14px] font-semibold text-ink">
                {conversation.title}
              </h3>
              <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink-muted">
                {preview}
              </p>
              <div className="mt-3 flex items-center gap-3 text-[11.5px] font-medium text-ink-faint">
                <span className="inline-flex items-center gap-1">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {conversation.messages.length}
                </span>
                {attachmentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    {attachmentCount}
                  </span>
                )}
                <span className="ml-auto">
                  {relativeBucket(conversation.updatedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
