"use client";

/**
 * Accessible switch control used for the reference toggles.
 */
import { cn } from "@/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. Omit when `labelledBy` points at visible text instead. */
  label?: string;
  /** Id of the visible text that names this switch. */
  labelledBy?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  labelledBy,
  size = "md",
  disabled,
  className,
}: ToggleProps) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  const travel = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "hit-target relative inline-flex shrink-0 items-center rounded-full p-0.75 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        track,
        checked ? "bg-brand" : "bg-[#d9dfe6]",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-[0_1px_2px_rgb(23_38_56/0.25)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          knob,
          checked ? travel : "translate-x-0",
        )}
      />
    </button>
  );
}
