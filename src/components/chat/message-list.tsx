"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageItem } from "@/components/chat/message-item";
import type { Conversation } from "@/lib/types";
import { useChatStore } from "@/store/chat-store";

type MessageListProps = {
  conversation: Conversation;
  onPickPrompt: (prompt: string) => void;
};

/** Distance from the bottom, in pixels, that still counts as "pinned". */
const STICK_THRESHOLD = 96;

export function MessageList({ conversation, onPickPrompt }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const saved = useChatStore((state) => state.saved);
  const editingMessageId = useChatStore((state) => state.editingMessageId);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const references = useChatStore((state) => state.references);
  const setEditingMessage = useChatStore((state) => state.setEditingMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const regenerate = useChatStore((state) => state.regenerate);
  const toggleSaved = useChatStore((state) => state.toggleSaved);

  const showCitations = references.some(
    (reference) => reference.enabled && reference.visible,
  );

  const lastMessage = conversation.messages.at(-1);
  const streamingLength = lastMessage?.streaming
    ? lastMessage.content.length
    : 0;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    setPinned(distance < STICK_THRESHOLD);
  }, []);

  // Jump straight to the latest turn when the conversation changes.
  useLayoutEffect(() => {
    setPinned(true);
    scrollToBottom("auto");
  }, [conversation.id, scrollToBottom]);

  // Follow the stream only while the reader has not scrolled away.
  useEffect(() => {
    if (!pinned) return;
    scrollToBottom(streamingLength > 0 ? "auto" : "smooth");
  }, [conversation.messages.length, streamingLength, pinned, scrollToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-subtle h-full overflow-y-auto overscroll-contain"
      >
        {conversation.messages.length === 0 ? (
          <EmptyState onPick={onPickPrompt} />
        ) : (
          <div className="pb-40">
            {conversation.messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                saved={saved.some((item) => item.messageId === message.id)}
                editing={editingMessageId === message.id}
                isStreaming={isStreaming}
                showCitations={showCitations}
                onCopy={() => undefined}
                onEdit={() => setEditingMessage(message.id)}
                onCancelEdit={() => setEditingMessage(null)}
                onSubmitEdit={(text) => void editMessage(message.id, text)}
                onRegenerate={() => void regenerate(message.id)}
                onRefine={() =>
                  onPickPrompt(
                    message.role === "user"
                      ? `Rewrite this prompt so it is more specific:\n\n${message.content}`
                      : "Tighten that answer — keep the recommendation, drop the preamble.",
                  )
                }
                onSave={() => toggleSaved(conversation.id, message.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {!pinned && conversation.messages.length > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => scrollToBottom()}
            aria-label="Scroll to latest message"
            className="absolute bottom-6 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-white text-ink-soft shadow-pop transition-colors hover:text-ink"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
