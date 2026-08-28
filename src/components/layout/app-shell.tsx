"use client";

/**
 * Top-level client shell: composes the sidebar, transcript, composer, panels,
 * and modals, and owns global keyboard shortcuts and file drag-and-drop.
 */
import { AnimatePresence, motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Composer, type ComposerHandle } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { BottomBar } from "@/components/layout/bottom-bar";
import { CommandPalette } from "@/components/layout/command-palette";
import { LegalModal } from "@/components/layout/legal-modal";
import { PagesModal } from "@/components/layout/pages-modal";
import { PromptsModal } from "@/components/layout/prompts-modal";
import { SavedModal } from "@/components/layout/saved-modal";
import { SettingsPanel } from "@/components/layout/settings-panel";
import { Sidebar, SidebarDrawer } from "@/components/layout/sidebar";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

export function AppShell() {
  const composerRef = useRef<ComposerHandle>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Below these widths the layout cannot host three columns, so the side
  // panels become overlays instead of squeezing the transcript.
  const floatingNav = useMediaQuery("(max-width: 1100px)");
  const floatingPanel = useMediaQuery("(max-width: 1180px)");

  const sidebarOpen = useChatStore((state) => state.sidebarOpen);
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen);
  const settingsOpen = useChatStore((state) => state.settingsOpen);
  const readerMode = useChatStore((state) => state.readerMode);
  const setPaletteOpen = useChatStore((state) => state.setPaletteOpen);
  const newConversation = useChatStore((state) => state.newConversation);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const conversation =
    conversations.find((item) => item.id === activeConversationId) ??
    conversations[0];

  const navCollapsed = !sidebarOpen || readerMode || floatingNav;

  const usePrompt = useCallback((prompt: string) => {
    composerRef.current?.setValue(prompt);
  }, []);

  // Two stacked drawers on a narrow screen leave nothing to read; yield to
  // whichever one was opened last.
  useEffect(() => {
    if (floatingNav && settingsOpen && sidebarOpen) setSidebarOpen(false);
    // Reacting to the settings panel opening only, not to the sidebar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floatingNav, settingsOpen]);

  // Rehydrate persisted state after mount so SSR and the first paint agree.
  useEffect(() => {
    void useChatStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (key === "b") {
        event.preventDefault();
        setSidebarOpen(!useChatStore.getState().sidebarOpen);
      } else if (key === "j") {
        event.preventDefault();
        newConversation();
        composerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [newConversation, setPaletteOpen, setSidebarOpen]);

  const onDragEnter = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      composerRef.current?.addFiles(event.dataTransfer.files);
      composerRef.current?.focus();
    }
  };

  return (
    <div
      className="relative flex h-dvh w-full overflow-hidden"
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <motion.aside
        initial={false}
        animate={{ width: navCollapsed ? "4.5rem" : "16rem" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-full shrink-0 overflow-hidden pb-[6.5rem]"
        aria-label="Chat history"
      >
        <Sidebar collapsed={navCollapsed} />
      </motion.aside>

      {floatingNav && !readerMode && <SidebarDrawer />}

      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 px-4 pb-[7.75rem] pt-6 sm:px-6">
          <div
            className={cn(
              "mx-auto flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-surface shadow-card transition-[max-width] duration-300",
              readerMode ? "max-w-[46rem] [&_.md]:text-base" : "max-w-[64rem]",
            )}
          >
            <MessageList conversation={conversation} onPickPrompt={usePrompt} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <Composer ref={composerRef} />
        </div>
      </main>

      <SettingsPanel floating={floatingPanel} />

      <BottomBar />

      <CommandPalette />
      <PagesModal />
      <SavedModal />
      <PromptsModal onUse={usePrompt} />
      <LegalModal />

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-brand/8 backdrop-blur-[1px]"
          >
            <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-brand-ring bg-white/95 px-10 py-8 shadow-pop">
              <UploadCloud className="h-8 w-8 text-brand" strokeWidth={1.7} />
              <p className="text-[15px] font-semibold text-ink">
                Drop files to attach
              </p>
              <p className="text-[13px] text-ink-muted">
                PDFs, images and specs, up to 25 MB each
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
