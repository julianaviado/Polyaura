import type { Metadata } from "next";
import Link from "next/link";
import { GlassSpecimens } from "@/components/design-system/glass-specimens";
import {
  Swatches,
  TypeScale,
  MotionScale,
} from "@/components/design-system/tokens";

export const metadata: Metadata = {
  title: "Polyaura design system",
  description:
    "The tokens behind the Polyaura interface: colour, type, motion, and the glass surface scale.",
};

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-12 border-t border-line pt-10">
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        {lede}
      </p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-14 sm:px-10">
      <header className="pb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
          Polyaura
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          Design system
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Every value here is a CSS custom property declared in{" "}
          <code className="rounded border border-line bg-surface-sunken px-1 py-0.5 font-mono text-[13px] text-ink">
            globals.css
          </code>
          . Components read the tokens and never hard-code a colour, so the
          palette is one file rather than a scavenger hunt.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
        >
          Back to the app
        </Link>
      </header>

      <div className="flex flex-col gap-12">
        <Section
          id="glass"
          title="Glass"
          lede="Four frosted tiers for surfaces that float above content. The tint opacity on each tier is not a taste decision: glass can sit over any backdrop, so each floor is the lowest value whose text still clears 4.5:1 over pure black. That makes this glass restrained by construction. It reads at the rim, in the blur of whatever passes behind it, and in the sheen, never as a see-through sheet."
        >
          <GlassSpecimens />
        </Section>

        <Section
          id="colour"
          title="Colour"
          lede="A warm off-white ground with a near-navy ink scale. Every text tone clears 4.5:1 on every surface it is allowed to sit on; the ornament token is the one grey that never carries text."
        >
          <Swatches />
        </Section>

        <Section
          id="type"
          title="Type"
          lede="Figtree throughout, with a system monospace stack for code and figures. Sizes are set in rem so the whole interface rescales with the reader's browser setting."
        >
          <TypeScale />
        </Section>

        <Section
          id="motion"
          title="Motion"
          lede="Three easing curves cover everything. Duration carries the meaning: the shorter the change, the less it should announce itself. All of it collapses under prefers-reduced-motion."
        >
          <MotionScale />
        </Section>
      </div>
    </main>
  );
}
