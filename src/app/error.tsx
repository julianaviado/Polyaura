"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Catches render and lifecycle errors anywhere in
 * the app tree and offers a reset instead of a blank screen.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for debugging; a production build would report it
    // to an error tracking service here.
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-dvh items-center justify-center px-6">
      <div
        role="alert"
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card"
      >
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          An unexpected error interrupted the app. Your conversations are saved
          locally and will still be here after a reload.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-brand px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-xl border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-line-strong"
          >
            Reload the app
          </a>
        </div>
      </div>
    </main>
  );
}
