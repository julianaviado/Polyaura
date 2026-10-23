"use client";

/**
 * Live glass specimens.
 *
 * Each tier is shown over a deliberately busy backdrop, because glass over a
 * flat ground reads as nothing but a rim. The backdrop is drawn with CSS
 * gradients rather than an image so the page ships no assets.
 */

import { useState } from "react";
import { Glass, type GlassTier } from "@/components/ui/glass";

const TIERS: {
  tier: GlassTier;
  blur: string;
  tint: string;
  overBlack: string;
  use: string;
}[] = [
  {
    tier: "control",
    blur: "14px",
    tint: "90%",
    overBlack: "4.44",
    use: "Icon buttons and pills. Icons and short labels only, never body copy.",
  },
  {
    tier: "popover",
    blur: "24px",
    tint: "93%",
    overBlack: "4.76",
    use: "Menus, dropdowns, the command palette.",
  },
  {
    tier: "panel",
    blur: "28px",
    tint: "95%",
    overBlack: "4.98",
    use: "Modals and floating side panels.",
  },
];

/** A busy ground, so the frost has something to work on. */
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line p-8">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(118deg, #1d2b3a 0%, #1668e3 38%, #e8f1fe 62%, #1d2b3a 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(58deg, rgb(255 255 255 / 0.22) 0 2px, rgb(255 255 255 / 0) 2px 16px)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function GlassSpecimens() {
  const [sheen, setSheen] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <label className="flex w-fit cursor-pointer items-center gap-2 text-[13.5px] font-medium text-ink-soft">
        <input
          type="checkbox"
          checked={sheen}
          onChange={(event) => setSheen(event.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        Pointer-tracked sheen
      </label>

      <Backdrop>
        <div className="flex flex-wrap items-start gap-5">
          {TIERS.map((item) => (
            <Glass
              key={item.tier}
              tier={item.tier}
              sheen={sheen}
              className="w-[15.5rem] rounded-2xl p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                glass-{item.tier}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-ink">
                {item.blur} blur, {item.tint} tint
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {item.use}
              </p>
              <p className="mt-3 border-t border-line/70 pt-2.5 font-mono text-[11.5px] text-ink-muted">
                worst case {item.overBlack}:1
              </p>
            </Glass>
          ))}
        </div>
      </Backdrop>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse overflow-hidden rounded-xl border border-line text-[13.5px]">
          <thead className="bg-surface-muted">
            <tr>
              {[
                "Tier",
                "Blur",
                "Tint floor",
                "Text over black",
                "Over canvas",
              ].map((head) => (
                <th
                  key={head}
                  className="border border-line px-3 py-2 text-left font-semibold text-ink"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {TIERS.map((item) => (
              <tr key={item.tier}>
                <td className="border border-line px-3 py-2 font-mono text-[12.5px]">
                  glass-{item.tier}
                </td>
                <td className="border border-line px-3 py-2 tabular-nums">
                  {item.blur}
                </td>
                <td className="border border-line px-3 py-2 tabular-nums">
                  {item.tint}
                </td>
                <td className="border border-line px-3 py-2 tabular-nums">
                  {item.overBlack}:1
                </td>
                <td className="border border-line px-3 py-2 tabular-nums">
                  5.54:1
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
        Without <code className="font-mono text-[12.5px]">backdrop-filter</code>{" "}
        there is no frost to tint, so every tier falls back to a fully opaque
        surface rather than leaving text floating over raw content.
      </p>
    </div>
  );
}
