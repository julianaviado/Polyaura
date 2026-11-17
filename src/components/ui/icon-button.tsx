"use client";

/**
 * Square icon-only button; the label prop is its required accessible name.
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "ghost" | "raised" | "chrome";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  ghost: "text-ink-muted hover:bg-surface-sunken hover:text-ink active:bg-line",
  // Raised buttons float over the canvas on their own, which is where glass
  // earns its cost: they pick up whatever scrolls behind them.
  raised:
    "glass glass-control glass-sheen bevel-thin text-ink-soft hover:text-ink",
  // Chrome buttons sit inside a glass capsule that already supplies the
  // surface, so they carry only their own hover state.
  chrome: "text-ink-soft hover:bg-ink/[0.07] hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-11 w-11 rounded-full",
};

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Required: these buttons never carry visible text. */
  label: string;
  round?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "ghost", size = "md", label, round, className, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "hit-target inline-flex shrink-0 items-center justify-center transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          round && "rounded-full",
          className,
        )}
        {...props}
      />
    );
  },
);
