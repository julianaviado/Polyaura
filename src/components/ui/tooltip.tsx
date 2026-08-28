"use client";

/**
 * Hover and focus tooltip with optional keyboard shortcut hint.
 */
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
  side?: Side;
  /** Extra keycap-style hint rendered after the label, e.g. "⌘K". */
  shortcut?: string;
  className?: string;
  delay?: number;
};

/** Outer wrapper handles placement; the inner element handles motion. */
const PLACEMENT: Record<Side, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 pb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 pt-2",
  left: "right-full top-1/2 -translate-y-1/2 pr-2",
  right: "left-full top-1/2 -translate-y-1/2 pl-2",
};

const ENTER_FROM: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

export function Tooltip({
  label,
  children,
  side = "top",
  shortcut,
  className,
  delay = 240,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <span
            className={cn(
              "pointer-events-none absolute z-50 block",
              PLACEMENT[side],
            )}
          >
            <motion.span
              id={id}
              role="tooltip"
              initial={{ opacity: 0, scale: 0.94, ...ENTER_FROM[side] }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, ...ENTER_FROM[side] }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-ink shadow-float ring-1 ring-line"
            >
              {label}
              {shortcut && (
                <kbd className="rounded border border-line bg-surface-sunken px-1 py-px font-sans text-[10px] font-semibold text-ink-muted">
                  {shortcut}
                </kbd>
              )}
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
