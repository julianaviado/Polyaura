"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import type { Attachment } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

type AttachmentCardProps = {
  attachment: Attachment;
  onRemove?: (id: string) => void;
  className?: string;
};

/** Indeterminate ring shown while a file is still uploading. */
function UploadSpinner({ progress }: { progress: number }) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0.08, progress / 100) * circumference;

  return (
    <span className="relative flex h-9 w-9 items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 -rotate-90 animate-spin [animation-duration:1.1s]"
      >
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="2.5"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
    </span>
  );
}

export function AttachmentCard({
  attachment,
  onRemove,
  className,
}: AttachmentCardProps) {
  const uploading = attachment.status === "uploading";
  const failed = attachment.status === "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group/att flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white py-2.5 pl-2.5 pr-3.5 shadow-[0_1px_2px_rgb(23_38_56/0.04)]",
        failed && "border-danger/40",
        className,
      )}
    >
      {uploading ? (
        <UploadSpinner progress={attachment.progress} />
      ) : (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide",
            failed
              ? "bg-danger/10 text-danger"
              : "bg-surface-sunken text-ink-soft",
          )}
        >
          {attachment.kind}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-tight text-ink">
          {attachment.name}
        </span>
        <span className="mt-0.5 block text-xs leading-tight text-ink-muted">
          {failed ? "Upload failed" : formatBytes(attachment.size)}
        </span>
      </span>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          aria-label={`Remove ${attachment.name}`}
          className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </motion.div>
  );
}
