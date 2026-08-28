"use client";

import {
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  RefreshCw,
  SquarePen,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Action = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

type MessageActionsProps = {
  role: "user" | "assistant";
  copied: boolean;
  saved: boolean;
  disabled?: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onRefine: () => void;
  onSave: () => void;
  className?: string;
};

export function MessageActions({
  role,
  copied,
  saved,
  disabled,
  onCopy,
  onEdit,
  onRefine,
  onSave,
  className,
}: MessageActionsProps) {
  const isUser = role === "user";

  const actions: Action[] = [
    {
      key: "copy",
      label: copied ? "Copied" : "Copy",
      icon: copied ? (
        <Check className="h-4 w-4 text-brand" />
      ) : (
        <Copy className="h-4 w-4" />
      ),
      onClick: onCopy,
    },
    isUser
      ? {
          key: "edit",
          label: "Edit prompt",
          icon: <SquarePen className="h-4 w-4" />,
          onClick: onEdit,
          disabled,
        }
      : {
          key: "retry",
          label: "Regenerate",
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: onEdit,
          disabled,
        },
    {
      key: "refine",
      label: isUser ? "Improve prompt" : "Refine answer",
      icon: <Wand2 className="h-4 w-4" />,
      onClick: onRefine,
      disabled,
    },
    {
      key: "save",
      label: saved ? "Saved to memory" : "Save to memory",
      icon: saved ? (
        <BookmarkCheck className="h-4 w-4 text-brand" />
      ) : (
        <Bookmark className="h-4 w-4" />
      ),
      onClick: onSave,
      active: saved,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-0.5 rounded-2xl border border-line bg-white p-1 shadow-float",
        className,
      )}
    >
      {actions.map((action) => (
        <Tooltip key={action.key} label={action.label} side="left" delay={140}>
          <button
            type="button"
            aria-label={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-40",
              action.active && "text-brand",
            )}
          >
            {action.icon}
          </button>
        </Tooltip>
      ))}
    </motion.div>
  );
}
