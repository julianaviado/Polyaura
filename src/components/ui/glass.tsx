"use client";

/**
 * Glass surface primitive.
 *
 * The CSS in `globals.css` does the material; this supplies the pointer
 * tracking that moves the specular highlight, and a component wrapper for
 * the common case. Elements that are already something else (a button, an
 * aside) take the classes directly and use `useSheen` for the highlight.
 */

import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type GlassTier = "control" | "popover" | "panel";

const TIERS: Record<GlassTier, string> = {
  control: "glass glass-control",
  popover: "glass glass-popover",
  panel: "glass glass-panel",
};

/**
 * Writes the pointer's position on the element as `--glass-px` / `--glass-py`,
 * each -1 to 1. Values are written straight to the node on an animation frame
 * so moving the pointer never triggers a React render.
 */
export function useSheen<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const write = () => {
      frame = 0;
      el.style.setProperty("--glass-px", x.toFixed(3));
      el.style.setProperty("--glass-py", y.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      // Touch has no hover state, so there is nothing to track.
      if (event.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/** Combines the tier classes for an element that cannot be a `<Glass>`. */
export function glassClass(tier: GlassTier, sheen = false) {
  return cn(TIERS[tier], sheen && "glass-sheen");
}

export type GlassProps = HTMLAttributes<HTMLDivElement> & {
  tier?: GlassTier;
  /** Adds the pointer-tracked specular highlight. */
  sheen?: boolean;
};

export const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { tier = "popover", sheen = false, className, ...props },
  forwardedRef,
) {
  const sheenRef = useSheen<HTMLDivElement>();

  return (
    <div
      ref={(node) => {
        sheenRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn(glassClass(tier, sheen), className)}
      {...props}
    />
  );
});
