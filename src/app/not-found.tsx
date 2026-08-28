import Link from "next/link";

/** Shown for any route that does not exist. The app itself lives at "/". */
export default function NotFound() {
  return (
    <main className="flex h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
          404
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Back to the app
        </Link>
      </div>
    </main>
  );
}
