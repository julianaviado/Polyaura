"use client";

/**
 * Shared client hooks: outside-dismiss, mount detection, clipboard copy,
 * textarea auto-resize, and media query tracking.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** Fires when a pointer press lands outside every referenced element. */
export function useDismiss<T extends HTMLElement>(
  active: boolean,
  onDismiss: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      onDismiss();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onDismiss]);

  return ref;
}

/** True once the component has mounted on the client. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Copies text and reports a short-lived success flag for button feedback. */
export function useCopy(resetAfter = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Clipboard access can be blocked; fall back to a hidden textarea.
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
    },
    [resetAfter],
  );

  return { copied, copy };
}

/** Grows a textarea to fit its content, up to `maxHeight` pixels. */
export function useAutoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 220,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    const next = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${next}px`;
    element.style.overflowY =
      element.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [ref, value, maxHeight]);
}

/** Tracks a CSS media query, defaulting to `false` before mount. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}
