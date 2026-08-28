/**
 * The demo runs without a model behind it. Replies are picked by keyword and
 * then streamed back a few characters at a time so the interface exercises the
 * same states a live endpoint would produce.
 */

export type CannedReply = {
  id: string;
  /** Lowercase keywords; the reply with the most hits wins. */
  match: string[];
  body: string;
};

/** The trimmed reply the seeded conversation opens with. */
export const EM_REM_SEED_REPLY = `Great question! Both \`em\` and \`rem\` units are excellent choices for building a thoughtful, flexible web interface—especially for something like polyaura, where clarity and accessibility matter.

## Which do I recommend for polyaura web?

- \`rem\` is generally best for most layout, component sizing, and typography. It ensures site-wide consistency, especially if users adjust their base font-size for accessibility.
- You might use \`em\` in specific cases, like icons or buttons that need to align with a parent's font-size, but those are the exception.

## Bottom line:

For polyaura's web app, use \`rem\` as your default for sizing, spacing, and typography. This will help your UI scale cleanly and be more accessible—both important for turning insights into action!

Are you working on any specific part of polyaura's design right now? Maybe we can turn this into your first Memory to keep your design system principles clear and actionable!`;

export const EM_REM_REPLY = `Great question! Both \`em\` and \`rem\` units are excellent choices for building a thoughtful, flexible web interface—especially for something like polyaura, where clarity and accessibility matter.

## Which do I recommend for polyaura web?

- \`rem\` is generally best for most layout, component sizing, and typography. It ensures site-wide consistency, especially if users adjust their base font-size for accessibility.
- You might use \`em\` in specific cases, like icons or buttons that need to align with a parent's font-size, but those are the exception.

## Bottom line:

For polyaura's web app, use \`rem\` as your default for sizing, spacing, and typography. This will help your UI scale cleanly and be more accessible—both important for turning insights into action!

Are you working on any specific part of polyaura's design right now? Maybe we can turn this into your first Memory to keep your design system principles clear and actionable!

## Here's a quick rundown:

| Unit | Relative to | Best for |
| --- | --- | --- |
| \`em\` | The font-size of the **parent** element | Padding and icon sizing that should track a component's own type |
| \`rem\` | The font-size of the **root** element | Type scales, spacing scales, layout — anything that must stay consistent |

The catch with \`em\` is compounding. Nest three elements that each set \`font-size: 0.9em\` and the innermost one lands at \`0.729em\` of the root — rarely what anyone intended.

\`\`\`css
:root {
  font-size: 100%; /* respects the reader's browser setting */
}

.card {
  padding: 1.5rem;        /* fixed against the root, predictable */
  border-radius: 0.75rem;
}

.card__icon {
  width: 1.25em;          /* scales with whatever text sits beside it */
  height: 1.25em;
}
\`\`\`

For responsiveness specifically: because \`rem\` tracks the root, a single media query on \`html\` rescales your entire layout at once. That is the lever \`em\` cannot give you.`;

export const CANNED_REPLIES: CannedReply[] = [
  {
    id: "em-rem",
    match: ["em", "rem", "unit", "units", "responsive", "responsiveness"],
    body: EM_REM_REPLY,
  },
  {
    id: "design-tokens",
    match: ["token", "tokens", "design system", "variable", "theming", "theme"],
    body: `Design tokens are the contract between your Figma file and your codebase. When they line up, a colour change is one commit instead of a scavenger hunt.

## A three-tier structure that holds up

1. **Primitives** — the raw values. \`blue-600\`, \`space-4\`, \`radius-lg\`. No meaning attached, no decisions encoded.
2. **Semantic** — the decisions. \`surface-raised\`, \`text-muted\`, \`border-focus\`. This is the only tier product code should touch.
3. **Component** — the exceptions. \`button-primary-bg\`. Reach for this tier sparingly; every entry is a small tax on the system.

\`\`\`json
{
  "color": {
    "blue": { "600": { "value": "#1668e3" } },
    "surface": { "raised": { "value": "{color.blue.600}" } }
  }
}
\`\`\`

## Why the middle tier earns its keep

Ship dark mode without semantic tokens and you end up rewriting every component. With them, you swap one map and the components never learn anything changed.

Want me to sketch the naming taxonomy for polyaura's palette next?`,
  },
  {
    id: "accessibility",
    match: [
      "accessible",
      "accessibility",
      "a11y",
      "contrast",
      "screen reader",
      "wcag",
      "keyboard",
    ],
    body: `Accessibility work goes fastest when you treat it as a checklist of decisions rather than a final audit pass.

## The four that catch most issues

- **Contrast.** 4.5:1 for body text, 3:1 for large text and meaningful UI boundaries. Interactive states need to pass too — a hover colour that only you can see is still a failure.
- **Focus.** Every interactive element needs a visible focus ring. \`:focus-visible\` gives you keyboard-only rings without the mouse-click halo people used to strip out.
- **Names.** An icon-only button is invisible to a screen reader without an \`aria-label\`. Read your interface aloud with the visuals off and note where you run out of words.
- **Motion.** Honour \`prefers-reduced-motion\`. Cut transforms, keep opacity — the interface stays legible and stops making people queasy.

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

The order matters: contrast and focus catch the majority of real complaints, so do those before anything more elaborate.`,
  },
  {
    id: "layout",
    match: ["grid", "flexbox", "flex", "layout", "column", "gap", "container"],
    body: `The short version: **grid for the page, flex for the pieces inside it.**

## Choosing between them

- Reach for \`grid\` when you know the shape of the arrangement in advance — a sidebar and a canvas, a card of fixed regions, a form of label/field pairs.
- Reach for \`flex\` when the content decides the shape — a toolbar of buttons, a row of chips, anything that should wrap when it runs out of room.

\`\`\`css
.app {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  min-height: 100dvh;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
\`\`\`

## Two things worth knowing

\`minmax(0, 1fr)\` instead of plain \`1fr\` stops a long unbreakable string from blowing your column past its track. And container queries now mean a card can respond to *its own* width rather than the viewport's — which is usually the question you actually wanted answered.

Which part of the layout are you wrestling with?`,
  },
  {
    id: "motion",
    match: ["animation", "animate", "motion", "transition", "spring", "easing"],
    body: `Interface motion has one job: explain what just changed. If a viewer can't say what an animation told them, it's decoration.

## Durations that feel right

- **80–120ms** — hovers, toggle knobs, focus rings. Fast enough to read as immediate.
- **180–260ms** — panels, popovers, drawers. Long enough to follow the movement.
- **300ms+** — reserved for a full page or route transition. Anything routine at this length starts to feel sluggish.

## Easing

Use \`cubic-bezier(0.22, 1, 0.36, 1)\` for entrances — quick out of the gate, gentle on arrival. Save symmetrical \`ease-in-out\` for loops. Linear is for progress bars and nothing else.

Animate \`transform\` and \`opacity\` wherever you can; they run on the compositor. Animating \`height\` or \`top\` forces layout on every frame and shows up as jank on cheaper hardware.`,
  },
  {
    id: "greeting",
    match: ["hi", "hello", "hey", "yo", "sup"],
    body: `Hey! I'm polyaura — ready when you are.

I can dig into design system questions, review a layout decision, or work through whatever is in the docs you've attached. A few things people usually start with:

- **Sizing and typography** — \`em\` vs \`rem\`, type scales, spacing rhythm
- **Design tokens** — naming, tiering, keeping Figma and code in sync
- **Accessibility** — contrast, focus order, reduced motion

Flip on **Knowledge base** in the panel and I'll pull from your uploaded docs as I answer. What are you working on?`,
  },
];

export const FALLBACK_REPLY = `Here's how I'd approach that.

## Framing the problem

The useful move is usually to separate the decision from the implementation. Name what has to stay true — the constraint — and the options narrow on their own.

- **What is fixed?** Deadlines, existing components, the platforms you have to support.
- **What is genuinely open?** This is where the design work actually lives.
- **What would tell you that you chose wrong?** If you can't answer, the decision isn't specified tightly enough yet.

## A concrete next step

Sketch the smallest version that could be wrong in an interesting way, then put it in front of someone. Two rounds of that beats a week of planning almost every time.

Tell me more about the specifics and I'll get more pointed — the more context you give me, the less generic this gets.`;

/** Prefixes the reply when reference toggles are pulling in extra context. */
export const REFERENCE_PREAMBLE: Record<string, string> = {
  knowledgeBase:
    "_Pulling from your **knowledge base** — the docs attached to this workspace._",
  campaignMemory:
    "_Reading **campaign memory** — earlier decisions from this project are in scope._",
  thirdPartyModels:
    "_**Third party models** are on, so this answer is a blend of several providers._",
};

export function pickReply(prompt: string): string {
  const text = prompt.toLowerCase();
  const words = new Set(text.split(/[^a-z]+/).filter(Boolean));

  let best: { reply: CannedReply; score: number } | null = null;

  for (const reply of CANNED_REPLIES) {
    let score = 0;
    for (const keyword of reply.match) {
      if (keyword.includes(" ")) {
        if (text.includes(keyword)) score += 2;
      } else if (words.has(keyword)) {
        score += 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { reply, score };
  }

  return best ? best.reply.body : FALLBACK_REPLY;
}
