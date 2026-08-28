"use client";

/**
 * Bottom utility dock: pages, search, reading mode, settings, memories, prompt
 * library, and the account menu.
 */
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  BookMarked,
  BookOpen,
  Bookmark,
  LogOut,
  ScrollText,
  Search,
  ShieldCheck,
  Settings2,
  Trash2,
  Waypoints,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { PRESETS, USER } from "@/data/seed";
import { useDismiss } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  const activePresetId = useChatStore((state) => state.activePresetId);
  const saved = useChatStore((state) => state.saved);
  const readerMode = useChatStore((state) => state.readerMode);
  const setReaderMode = useChatStore((state) => state.setReaderMode);
  const setLegalOpen = useChatStore((state) => state.setLegalOpen);
  const clearAll = useChatStore((state) => state.clearAll);

  const preset =
    PRESETS.find((item) => item.id === activePresetId) ?? PRESETS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Account menu"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-shadow",
          open && "ring-2 ring-brand-ring",
        )}
      >
        <Avatar name={USER.name} src={USER.avatar} size={36} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-12 right-0 z-50 w-64 origin-bottom-right overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-pop"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={USER.name} src={USER.avatar} size={38} />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">
                  {USER.name}
                </p>
                <p className="truncate text-[12px] text-ink-muted">
                  {USER.handle}
                </p>
              </div>
            </div>

            <div className="my-1 h-px bg-line" />

            <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-[13px]">
              <span className="inline-flex items-center gap-2 text-ink-soft">
                <Waypoints className="h-3.5 w-3.5 text-brand" />
                Preset
              </span>
              <span className="truncate font-medium text-ink">
                {preset.name}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-[13px]">
              <span className="inline-flex items-center gap-2 text-ink-soft">
                <Bookmark className="h-3.5 w-3.5" />
                Memories
              </span>
              <span className="font-medium text-ink">{saved.length}</span>
            </div>

            <div className="my-1 h-px bg-line" />

            <button
              type="button"
              onClick={() => setReaderMode(!readerMode)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {readerMode ? "Exit reading mode" : "Reading mode"}
            </button>

            <button
              type="button"
              onClick={() => {
                clearAll();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger/8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all chats
            </button>

            <div className="my-1 h-px bg-line" />

            <button
              type="button"
              onClick={() => {
                setLegalOpen("terms");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ScrollText className="h-3.5 w-3.5" />
              Terms of Service
            </button>

            <button
              type="button"
              onClick={() => {
                setLegalOpen("privacy");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy Policy
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BottomBar() {
  const setPagesOpen = useChatStore((state) => state.setPagesOpen);
  const setPaletteOpen = useChatStore((state) => state.setPaletteOpen);
  const setSavedOpen = useChatStore((state) => state.setSavedOpen);
  const setPromptsOpen = useChatStore((state) => state.setPromptsOpen);
  const settingsOpen = useChatStore((state) => state.settingsOpen);
  const setSettingsOpen = useChatStore((state) => state.setSettingsOpen);
  const readerMode = useChatStore((state) => state.readerMode);
  const setReaderMode = useChatStore((state) => state.setReaderMode);
  const savedCount = useChatStore((state) => state.saved.length);

  return (
    <>
      <div className="pointer-events-none absolute bottom-5 left-0 z-40 flex items-center gap-2 px-6">
        <button
          type="button"
          onClick={() => setPagesOpen(true)}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink shadow-float transition-colors hover:border-line-strong"
        >
          <Archive className="h-4 w-4 text-ink-muted" strokeWidth={1.9} />
          View pages
        </button>

        <Tooltip label="Search" shortcut="⌘K" side="top">
          <IconButton
            label="Search chats"
            variant="raised"
            round
            className="pointer-events-auto h-10 w-10"
            onClick={() => setPaletteOpen(true)}
          >
            <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.9} />
          </IconButton>
        </Tooltip>

        <Tooltip
          label={readerMode ? "Exit reading mode" : "Reading mode"}
          side="top"
        >
          <IconButton
            label={readerMode ? "Exit reading mode" : "Reading mode"}
            variant="raised"
            round
            className={cn(
              "pointer-events-auto h-10 w-10",
              readerMode && "text-brand ring-brand-ring",
            )}
            onClick={() => setReaderMode(!readerMode)}
          >
            <BookOpen className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.9} />
          </IconButton>
        </Tooltip>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-0 z-40 flex items-center gap-2 px-6">
        <Tooltip label="Chat settings" side="top">
          <IconButton
            label="Chat settings"
            variant="raised"
            round
            className={cn(
              "pointer-events-auto h-10 w-10",
              settingsOpen && "text-brand ring-brand-ring",
            )}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings2 className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.9} />
          </IconButton>
        </Tooltip>

        <Tooltip label="Memories" side="top">
          <IconButton
            label="Memories"
            variant="raised"
            round
            className="pointer-events-auto relative h-10 w-10"
            onClick={() => setSavedOpen(true)}
          >
            <Bookmark className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.9} />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </IconButton>
        </Tooltip>

        <Tooltip label="Prompt library" side="top">
          <IconButton
            label="Prompt library"
            variant="raised"
            round
            className="pointer-events-auto h-10 w-10"
            onClick={() => setPromptsOpen(true)}
          >
            <BookMarked className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.9} />
          </IconButton>
        </Tooltip>

        <div className="pointer-events-auto">
          <AccountMenu />
        </div>
      </div>
    </>
  );
}
