"use client";

/**
 * Reusable prompt starters; picking one drops it into the composer.
 */
import { ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PROMPT_LIBRARY } from "@/data/seed";
import { useChatStore } from "@/store/chat-store";

type PromptsModalProps = {
  onUse: (body: string) => void;
};

export function PromptsModal({ onUse }: PromptsModalProps) {
  const open = useChatStore((state) => state.promptsOpen);
  const setPromptsOpen = useChatStore((state) => state.setPromptsOpen);

  return (
    <Modal
      open={open}
      onClose={() => setPromptsOpen(false)}
      title="Prompt library"
      description="Starting points the team reuses. Picking one drops it into the composer."
      className="max-w-2xl"
    >
      <ul className="flex flex-col gap-2 p-4">
        {PROMPT_LIBRARY.map((prompt) => (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => {
                onUse(prompt.body);
                setPromptsOpen(false);
              }}
              className="group flex w-full items-start gap-3 rounded-xl border border-line bg-white p-3.5 text-left transition-all hover:border-brand-ring hover:shadow-float"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
                    {prompt.category}
                  </span>
                  <span className="text-[13.5px] font-semibold text-ink">
                    {prompt.title}
                  </span>
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-ink-muted">
                  {prompt.body}
                </span>
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
