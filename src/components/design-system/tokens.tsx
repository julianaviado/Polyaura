/**
 * Static token specimens: colour, type and motion. Each row names the custom
 * property a component would actually reference.
 */

const INK = [
  ["--color-ink", "#1d2b3a", "Headings and primary text"],
  ["--color-ink-soft", "#45566a", "Body copy"],
  ["--color-ink-muted", "#596878", "Secondary and meta text"],
  ["--color-ink-faint", "#5f6e7e", "Labels and captions"],
  ["--color-ornament", "#b3bcc6", "Bullets and rules. Never text."],
];

const SURFACE = [
  ["--color-canvas", "#fafafa", "The warm ground"],
  ["--color-canvas-deep", "#f2f2f0", "Ground gradient end"],
  ["--color-surface", "#ffffff", "Cards and panels"],
  ["--color-surface-muted", "#f7f7f6", "User message rows"],
  ["--color-surface-sunken", "#f1f1f0", "Inline code, badges"],
];

const ACCENT = [
  ["--color-brand", "#1668e3", "Actions and links"],
  ["--color-brand-hover", "#1259c6", "Pressed and hovered"],
  ["--color-brand-soft", "#e8f1fe", "Selected rows"],
  ["--color-brand-ring", "#a9ccfb", "Focus rings"],
  ["--color-danger", "#bb3535", "Destructive actions"],
];

function SwatchGroup({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-1.5">
        {rows.map(([token, hex, use]) => (
          <li
            key={token}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2"
          >
            <span
              aria-hidden
              className="h-9 w-9 shrink-0 rounded-lg border border-line"
              style={{ background: hex }}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[12px] text-ink">
                {token}
              </span>
              <span className="block truncate text-[12.5px] text-ink-muted">
                {use}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[11.5px] uppercase text-ink-faint">
              {hex}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Swatches() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <SwatchGroup title="Ink" rows={INK} />
      <SwatchGroup title="Surface" rows={SURFACE} />
      <SwatchGroup title="Accent" rows={ACCENT} />
    </div>
  );
}

const TYPE = [
  ["2.25rem / 700", "Design system", "text-4xl font-bold tracking-tight"],
  ["1.1875rem / 700", "Which do I recommend?", "text-[1.1875rem] font-bold"],
  ["0.9375rem / 400", "Both units are excellent choices here.", "text-[15px]"],
  ["0.8125rem / 500", "PDF · 1.2 MB", "text-[13px] font-medium text-ink-muted"],
  [
    "0.6875rem / 600",
    "PREVIOUS 7 DAYS",
    "text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint",
  ],
];

export function TypeScale() {
  return (
    <ul className="flex flex-col gap-3">
      {TYPE.map(([spec, sample, cls]) => (
        <li
          key={spec}
          className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-xl border border-line bg-surface px-4 py-3"
        >
          <span className="w-32 shrink-0 font-mono text-[11.5px] text-ink-faint">
            {spec}
          </span>
          <span className={cls}>{sample}</span>
        </li>
      ))}
    </ul>
  );
}

const MOTION = [
  [
    "--ease-out-soft",
    "cubic-bezier(0.22, 1, 0.36, 1)",
    "Entrances. Quick away, gentle on arrival.",
  ],
  [
    "--ease-glass",
    "cubic-bezier(0.2, 0.8, 0.2, 1)",
    "Glass sheen and tint changes.",
  ],
  [
    "--ease-spring",
    "cubic-bezier(0.34, 1.36, 0.5, 1)",
    "Anything that should overshoot slightly.",
  ],
];

const DURATIONS = [
  ["80 to 120ms", "Hovers, toggle knobs, focus rings"],
  ["180 to 260ms", "Panels, popovers, drawers"],
  ["300ms and up", "Full-view transitions only"],
];

export function MotionScale() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ul className="flex flex-col gap-1.5">
        {MOTION.map(([token, curve, use]) => (
          <li
            key={token}
            className="rounded-xl border border-line bg-surface p-3"
          >
            <p className="font-mono text-[12px] text-ink">{token}</p>
            <p className="mt-0.5 font-mono text-[11.5px] text-ink-faint">
              {curve}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-muted">{use}</p>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-1.5">
        {DURATIONS.map(([range, use]) => (
          <li
            key={range}
            className="flex items-baseline gap-3 rounded-xl border border-line bg-surface p-3"
          >
            <span className="w-28 shrink-0 font-mono text-[12px] tabular-nums text-ink">
              {range}
            </span>
            <span className="text-[12.5px] text-ink-muted">{use}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
