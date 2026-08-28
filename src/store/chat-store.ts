"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  PRESETS,
  REFERENCE_DEFAULTS,
  SEED_CONVERSATIONS,
  SEED_UPLOADS,
} from "@/data/seed";
import type {
  Attachment,
  Citation,
  Conversation,
  Message,
  ReferenceKey,
  ReferenceToggle,
  SavedItem,
  UploadedDoc,
} from "@/lib/types";
import { titleFromText, uid } from "@/lib/utils";

/** Lives outside the store so it is never serialised into localStorage. */
let activeStream: AbortController | null = null;

type SendOptions = {
  text: string;
  attachments?: Attachment[];
};

type ChatState = {
  conversations: Conversation[];
  activeConversationId: string;
  references: ReferenceToggle[];
  activePresetId: string;
  uploads: UploadedDoc[];
  saved: SavedItem[];

  // Transient UI
  sidebarOpen: boolean;
  settingsOpen: boolean;
  paletteOpen: boolean;
  pagesOpen: boolean;
  savedOpen: boolean;
  promptsOpen: boolean;
  readerMode: boolean;
  editingMessageId: string | null;
  isStreaming: boolean;

  // Derived helpers
  activeConversation: () => Conversation;

  // Conversation actions
  newConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  clearAll: () => void;

  // Message actions
  sendMessage: (options: SendOptions) => Promise<void>;
  stopGeneration: () => void;
  regenerate: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, text: string) => Promise<void>;
  setEditingMessage: (id: string | null) => void;
  toggleSaved: (conversationId: string, messageId: string) => void;

  // Reference + preset actions
  toggleReference: (key: ReferenceKey) => void;
  toggleReferenceVisibility: (key: ReferenceKey) => void;
  setPreset: (id: string) => void;

  // Uploads
  addUploads: (docs: UploadedDoc[]) => void;
  removeUpload: (id: string) => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setPagesOpen: (open: boolean) => void;
  setSavedOpen: (open: boolean) => void;
  setPromptsOpen: (open: boolean) => void;
  setReaderMode: (on: boolean) => void;
};

function emptyConversation(): Conversation {
  const now = Date.now();
  return {
    id: uid("conv"),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      /** Applies `updater` to one conversation and bumps its `updatedAt`. */
      function patchConversation(
        id: string,
        updater: (conversation: Conversation) => Conversation,
      ) {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === id
              ? { ...updater(conversation), updatedAt: Date.now() }
              : conversation,
          ),
        }));
      }

      function patchMessage(
        conversationId: string,
        messageId: string,
        updater: (message: Message) => Message,
      ) {
        patchConversation(conversationId, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? updater(message) : message,
          ),
        }));
      }

      /**
       * Streams a reply for the trailing user turn of `conversationId` into a
       * freshly appended assistant message.
       */
      async function streamReply(conversationId: string, prompt: string) {
        const state = get();
        const preset =
          PRESETS.find((item) => item.id === state.activePresetId) ??
          PRESETS[0];
        const references = state.references
          .filter((reference) => reference.enabled)
          .map((reference) => reference.key);
        const conversation = state.conversations.find(
          (item) => item.id === conversationId,
        );
        const attachmentNames =
          conversation?.messages
            .filter((message) => message.role === "user")
            .at(-1)
            ?.attachments.map((attachment) => attachment.name) ?? [];

        const assistantId = uid("msg");
        patchConversation(conversationId, (current) => ({
          ...current,
          messages: [
            ...current.messages,
            {
              id: assistantId,
              role: "assistant",
              content: "",
              createdAt: Date.now(),
              attachments: [],
              streaming: true,
            },
          ],
        }));

        activeStream?.abort();
        const controller = new AbortController();
        activeStream = controller;
        set({ isStreaming: true });

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              presetVoice: preset.voice,
              references,
              attachments: attachmentNames,
            }),
            signal: controller.signal,
          });

          if (!response.ok || !response.body) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let content = "";
          let citations: Citation[] | undefined;

          // Batch deltas into one state write per frame so long streams stay
          // smooth instead of queuing a render per token.
          let pending = "";
          let flushHandle: number | null = null;

          const flush = () => {
            flushHandle = null;
            if (!pending) return;
            content += pending;
            pending = "";
            const next = content;
            patchMessage(conversationId, assistantId, (message) => ({
              ...message,
              content: next,
            }));
          };

          const scheduleFlush = () => {
            if (flushHandle !== null) return;
            flushHandle = requestAnimationFrame(flush);
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.trim()) continue;
              const event = JSON.parse(line) as
                | { type: "delta"; text: string }
                | { type: "citations"; citations: Citation[] }
                | { type: "done" }
                | { type: "error"; message: string };

              if (event.type === "delta") {
                pending += event.text;
                scheduleFlush();
              } else if (event.type === "citations") {
                citations = event.citations;
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            }
          }

          if (flushHandle !== null) cancelAnimationFrame(flushHandle);
          flush();

          patchMessage(conversationId, assistantId, (message) => ({
            ...message,
            streaming: false,
            citations,
          }));
        } catch (error) {
          const aborted =
            controller.signal.aborted ||
            (error instanceof DOMException && error.name === "AbortError");

          patchMessage(conversationId, assistantId, (message) => ({
            ...message,
            streaming: false,
            stopped: aborted || undefined,
            error: aborted
              ? undefined
              : error instanceof Error
                ? error.message
                : "Something went wrong.",
          }));
        } finally {
          if (activeStream === controller) activeStream = null;
          set({ isStreaming: false });
        }
      }

      return {
        conversations: SEED_CONVERSATIONS,
        activeConversationId: SEED_CONVERSATIONS[0].id,
        references: REFERENCE_DEFAULTS,
        activePresetId: PRESETS[0].id,
        uploads: SEED_UPLOADS,
        saved: [],

        sidebarOpen: true,
        settingsOpen: false,
        paletteOpen: false,
        pagesOpen: false,
        savedOpen: false,
        promptsOpen: false,
        readerMode: false,
        editingMessageId: null,
        isStreaming: false,

        activeConversation: () => {
          const { conversations, activeConversationId } = get();
          return (
            conversations.find(
              (conversation) => conversation.id === activeConversationId,
            ) ?? conversations[0]
          );
        },

        newConversation: () => {
          activeStream?.abort();
          const conversation = emptyConversation();
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            activeConversationId: conversation.id,
            editingMessageId: null,
          }));
          return conversation.id;
        },

        selectConversation: (id) => {
          activeStream?.abort();
          set({ activeConversationId: id, editingMessageId: null });
        },

        deleteConversation: (id) => {
          set((state) => {
            const conversations = state.conversations.filter(
              (conversation) => conversation.id !== id,
            );
            if (conversations.length === 0) {
              const fresh = emptyConversation();
              return {
                conversations: [fresh],
                activeConversationId: fresh.id,
                saved: state.saved.filter((item) => item.conversationId !== id),
              };
            }
            return {
              conversations,
              activeConversationId:
                state.activeConversationId === id
                  ? conversations[0].id
                  : state.activeConversationId,
              saved: state.saved.filter((item) => item.conversationId !== id),
            };
          });
        },

        renameConversation: (id, title) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          patchConversation(id, (conversation) => ({
            ...conversation,
            title: trimmed,
          }));
        },

        togglePin: (id) => {
          patchConversation(id, (conversation) => ({
            ...conversation,
            pinned: !conversation.pinned,
          }));
        },

        clearAll: () => {
          activeStream?.abort();
          const fresh = emptyConversation();
          set({
            conversations: [fresh],
            activeConversationId: fresh.id,
            saved: [],
          });
        },

        sendMessage: async ({ text, attachments = [] }) => {
          const trimmed = text.trim();
          if (!trimmed || get().isStreaming) return;

          const conversationId = get().activeConversationId;
          const conversation = get().conversations.find(
            (item) => item.id === conversationId,
          );
          const isFirstTurn = (conversation?.messages.length ?? 0) === 0;

          patchConversation(conversationId, (current) => ({
            ...current,
            title: isFirstTurn ? titleFromText(trimmed) : current.title,
            messages: [
              ...current.messages,
              {
                id: uid("msg"),
                role: "user",
                content: trimmed,
                createdAt: Date.now(),
                attachments,
              },
            ],
          }));

          await streamReply(conversationId, trimmed);
        },

        stopGeneration: () => {
          activeStream?.abort();
          activeStream = null;
          set({ isStreaming: false });
        },

        regenerate: async (messageId) => {
          const conversationId = get().activeConversationId;
          const conversation = get().conversations.find(
            (item) => item.id === conversationId,
          );
          if (!conversation) return;

          const index = conversation.messages.findIndex(
            (message) => message.id === messageId,
          );
          if (index < 0) return;

          const prompt = [...conversation.messages]
            .slice(0, index)
            .reverse()
            .find((message) => message.role === "user")?.content;
          if (!prompt) return;

          patchConversation(conversationId, (current) => ({
            ...current,
            messages: current.messages.slice(0, index),
          }));

          await streamReply(conversationId, prompt);
        },

        editMessage: async (messageId, text) => {
          const trimmed = text.trim();
          if (!trimmed) return;

          const conversationId = get().activeConversationId;
          const conversation = get().conversations.find(
            (item) => item.id === conversationId,
          );
          if (!conversation) return;

          const index = conversation.messages.findIndex(
            (message) => message.id === messageId,
          );
          if (index < 0) return;

          // Editing a turn discards everything that followed from it.
          patchConversation(conversationId, (current) => ({
            ...current,
            messages: [
              ...current.messages.slice(0, index),
              { ...current.messages[index], content: trimmed },
            ],
          }));
          set({ editingMessageId: null });

          await streamReply(conversationId, trimmed);
        },

        setEditingMessage: (id) => set({ editingMessageId: id }),

        toggleSaved: (conversationId, messageId) => {
          set((state) => {
            const existing = state.saved.find(
              (item) => item.messageId === messageId,
            );
            if (existing) {
              return {
                saved: state.saved.filter(
                  (item) => item.messageId !== messageId,
                ),
              };
            }

            const conversation = state.conversations.find(
              (item) => item.id === conversationId,
            );
            const message = conversation?.messages.find(
              (item) => item.id === messageId,
            );
            if (!conversation || !message) return {};

            const excerpt = message.content
              .replace(/[#*`>|_-]/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 140);

            return {
              saved: [
                {
                  id: uid("save"),
                  conversationId,
                  messageId,
                  title: conversation.title,
                  excerpt,
                  savedAt: Date.now(),
                },
                ...state.saved,
              ],
            };
          });
        },

        toggleReference: (key) => {
          set((state) => ({
            references: state.references.map((reference) =>
              reference.key === key
                ? {
                    ...reference,
                    enabled: !reference.enabled,
                    // Turning a source off hides its matches too.
                    visible: !reference.enabled ? reference.visible : false,
                  }
                : reference,
            ),
          }));
        },

        toggleReferenceVisibility: (key) => {
          set((state) => ({
            references: state.references.map((reference) =>
              reference.key === key && reference.enabled
                ? { ...reference, visible: !reference.visible }
                : reference,
            ),
          }));
        },

        setPreset: (id) => set({ activePresetId: id }),

        addUploads: (docs) =>
          set((state) => ({ uploads: [...docs, ...state.uploads] })),

        removeUpload: (id) =>
          set((state) => ({
            uploads: state.uploads.filter((doc) => doc.id !== id),
          })),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setSettingsOpen: (open) => set({ settingsOpen: open }),
        setPaletteOpen: (open) => set({ paletteOpen: open }),
        setPagesOpen: (open) => set({ pagesOpen: open }),
        setSavedOpen: (open) => set({ savedOpen: open }),
        setPromptsOpen: (open) => set({ promptsOpen: open }),
        setReaderMode: (on) =>
          set(
            on
              ? { readerMode: true, settingsOpen: false }
              : { readerMode: false },
          ),
      };
    },
    {
      name: "polyaura:chat",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        references: state.references,
        activePresetId: state.activePresetId,
        uploads: state.uploads,
        saved: state.saved,
        sidebarOpen: state.sidebarOpen,
        readerMode: state.readerMode,
      }),
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<ChatState>;
        const conversations = (
          incoming.conversations ?? current.conversations
        ).map((conversation) => ({
          ...conversation,
          // A stream can never survive a reload; drop the flag on the way in.
          messages: conversation.messages.map((message) =>
            message.streaming ? { ...message, streaming: false } : message,
          ),
        }));

        return {
          ...current,
          ...incoming,
          conversations,
          isStreaming: false,
          editingMessageId: null,
        };
      },
    },
  ),
);
