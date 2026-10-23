"use client";

/**
 * Single-select listbox styled as a bordered field, used for the preset picker.
 */
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { glassClass } from "@/components/ui/glass";
import { useDismiss } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  id: string;
  label: string;
  description?: string;
};

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (id: string) => void;
  label: string;
  className?: string;
  /** Slot rendered just before the chevron, e.g. a preset glyph. */
  adornment?: React.ReactNode;
};

export function Dropdown({
  value,
  options,
  onChange,
  label,
  className,
  adornment,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const selected = options.find((option) => option.id === value) ?? options[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm font-medium text-ink transition-colors",
          open ? "border-brand-ring" : "border-line hover:border-line-strong",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        {adornment}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              glassClass("popover"),
              "absolute left-0 right-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-xl p-1",
            )}
          >
            {options.map((option) => {
              const active = option.id === value;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active ? "bg-brand-soft" : "hover:bg-surface-muted",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          active ? "text-brand-hover" : "text-ink",
                        )}
                      >
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {active && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
