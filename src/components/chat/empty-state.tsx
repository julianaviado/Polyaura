"use client";

/**
 * Greeting and prompt starters shown when a conversation has no messages.
 */
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PROMPT_SUGGESTIONS, USER } from "@/data/seed";

type EmptyStateProps = {
  onPick: (prompt: string) => void;
};

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-8 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-14 w-14 select-none items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-float"
        aria-hidden
      >
        P
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 text-2xl font-bold tracking-tight text-ink"
      >
        Good to see you, {USER.name}.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-muted text-balance-pretty"
      >
        Ask anything about your design system, or start from one of these.
        Attach a document and polyaura will read it before it answers.
      </motion.p>

      <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {PROMPT_SUGGESTIONS.slice(0, 4).map((prompt, index) => (
          <motion.button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: 0.14 + index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group flex items-start gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-left text-[13.5px] font-medium leading-snug text-ink-soft transition-all hover:border-brand-ring hover:text-ink hover:shadow-float"
          >
            <span className="flex-1">{prompt}</span>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
