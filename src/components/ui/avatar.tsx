"use client";

/**
 * Circular avatar: user photo, initial fallback, or the brand mark.
 */
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  /** Renders the brand mark instead of a photo (used for assistant turns). */
  brand?: boolean;
};

export function Avatar({
  name,
  src,
  size = 36,
  className,
  brand,
}: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (brand || !src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
          brand ? "bg-brand" : "bg-ink-muted",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-full object-cover ring-1 ring-line",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
