# Polyaura

An AI chat interface built from Figma mockups, for a design portfolio. There is
no model behind it; the streaming, the uploads and the reference toggles are
all simulated so every state in the design can be reached and demonstrated.

<!-- Run `npm run dev` and open http://localhost:3000 -->

## Stack

| Piece     | Choice                      | Why                                                             |
| --------- | --------------------------- | --------------------------------------------------------------- |
| Framework | Next.js 15 (App Router)     | Route handlers give a real streaming endpoint without a backend |
| UI        | React 19 + TypeScript       | Typed components end to end                                     |
| Styling   | Tailwind CSS v4             | Design tokens live in `@theme`, so the palette is one file      |
| State     | Zustand + `persist`         | Conversations survive a reload without a database               |
| Motion    | Motion (Framer Motion)      | Panel transitions, message entrances, chip enter/exit           |
| Markdown  | react-markdown + remark-gfm | Headings, lists, tables                                         |
| Code      | Prism                       | Syntax highlighting inside answers                              |
| Icons     | lucide-react                | Consistent stroke icon set                                      |
| Type      | Figtree via `next/font`     | Self-hosted, no layout shift                                    |

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## How the fake backend works

`POST /api/chat` picks a canned reply by keyword (see `src/data/responses.ts`),
then streams it back as newline-delimited JSON: `{"type":"delta"}` events
followed by `citations` and `done`. Chunks are word-sized with jittered delays,
and the request's abort signal stops the stream, so **Stop generating** cancels
mid-answer exactly as it would against a real model.

The client reads that stream in `src/store/chat-store.ts` and batches deltas
into one state write per animation frame, which keeps long answers smooth.

Uploads are simulated the same way: `src/lib/uploads.ts` runs a progress ticker
so the chip spinner, the ready state and the size badge are all reachable.

## What's built

**Chat**

- Streaming answers with a text caret, a thinking/writing indicator and stop
- Edit a prompt in place; the turns after it are discarded and the answer re-runs
- Regenerate, copy, save-to-memory on hover
- Markdown with tables and highlighted code blocks, each with its own copy button
- Attachments: click, drag-and-drop anywhere, or paste through the file picker;
  upload progress, removal, and size formatting
- Source chips under an answer when a reference toggle is set to show them
- Empty state with prompt starters, and scroll-follow that releases when you
  scroll up

**Workspace**

- Sidebar history grouped by recency, with rename, pin and delete
- Command palette (`⌘K`) over chats and actions, with keyboard navigation
- Chat settings: preset picker, three reference toggles each with a separate
  "show sources" eye, and a document list
- Pages overview, memories, prompt library
- Reading mode, which collapses the chrome and widens the type

**Keyboard**

| Shortcut      | Does                                                        |
| ------------- | ----------------------------------------------------------- |
| `⌘K`          | Command palette                                             |
| `⌘B`          | Toggle sidebar                                              |
| `⌘J`          | New chat                                                    |
| `Enter`       | Send                                                        |
| `Shift+Enter` | Newline                                                     |
| `Tab`         | Accept the suggested prompt when the composer is empty      |
| `Esc`         | Stop generating, clear the composer, or close the top layer |

## Glass

A frosted surface scale for anything that floats above content: modals, the
command palette, menus, dropdowns, the floating side panels, and the buttons
on the bottom bar. `.glass` is the base recipe and a tier class sets the blur
and tint; add `.glass-sheen` for a specular highlight that follows the pointer.

| Tier            | Blur | Tint floor | Text over black | Use                                                  |
| --------------- | ---- | ---------- | --------------- | ---------------------------------------------------- |
| `glass-control` | 14px | 90%        | 4.44:1          | Icon buttons and pills. Icons and short labels only. |
| `glass-popover` | 24px | 93%        | 4.76:1          | Menus, dropdowns, the command palette.               |
| `glass-panel`   | 28px | 95%        | 4.98:1          | Modals and floating side panels.                     |
| `glass-veil`    | 3px  | n/a        | n/a             | The scrim behind a modal. Carries no text.           |

The tint opacity is not a taste decision. Glass can end up over any backdrop,
so each tier's floor is the lowest value whose text still clears 4.5:1 over
pure black. That makes the glass restrained by construction: it reads at the
rim, in the blur of whatever passes behind it, and in the sheen, never as a
see-through sheet. Without `backdrop-filter` support every tier falls back to
a fully opaque surface rather than leaving text over raw content.

Glass needs something behind it to be worth the cost, so it is reserved for
surfaces that float over content. The chat card, message rows and the composer
dock stay opaque.

```tsx
import { Glass, glassClass, useSheen } from "@/components/ui/glass"

<Glass tier="panel" className="rounded-2xl p-5">…</Glass>

// For elements that are already something else:
<aside className={cn(glassClass("panel"), "rounded-2xl")}>…</aside>
```

`/design-system` renders the tiers over a deliberately busy backdrop alongside
the colour, type and motion tokens.

## Accessibility

Audited with axe-core against WCAG 2.1 A and AA with zero violations across
the main view, the settings panel, the modals, and the command palette.

- Every text token meets the 4.5:1 contrast minimum on every surface it
  appears on; decorative marks use a separate token that never carries text.
- A skip link jumps keyboard users straight to the message input.
- All scrollable regions are keyboard focusable; all icon-only controls carry
  accessible names; toggles are labelled switches.
- Streaming is announced through a polite status region instead of a live
  region on the transcript, so screen readers are not spammed per token.
- Interactive controls expand to a 44x44px hit area on touch devices.
- `prefers-reduced-motion` collapses all animation.
- Chat history shows an accessible skeleton while persisted state rehydrates.

## Product completeness

- Terms of Service and Privacy Policy boilerplate, reachable from the
  account menu.
- A route-level error boundary (`src/app/error.tsx`) and a 404 page.
- Empty states for new chats, memories, and palette searches; inline error
  and stopped states on messages with retry.
- Prompt length is capped client-side with a visible countdown and enforced
  again by the API route, which also validates every field of the request
  body before use.

## Layout notes

The composer is two tiers: a narrow rounded block holding the input, sitting on
a wider utility dock. The concave shoulders where one meets the other are cut
with a masked radial gradient (`composer-notch` in `globals.css`) rather than an
image, so they stay crisp at any width.

Below 1180px the settings panel becomes an overlay; below 1100px the sidebar
does too. Both keep the same content; only the container changes.

## Structure

```
src/
├─ app/
│  ├─ api/chat/route.ts     mock streaming endpoint
│  ├─ globals.css           design tokens, markdown styles, notch mask
│  └─ layout.tsx, page.tsx
├─ components/
│  ├─ chat/                 message list, message, composer, markdown, code
│  ├─ layout/               shell, sidebar, settings, bottom bar, modals
│  └─ ui/                   tooltip, toggle, dropdown, modal, avatar, button
├─ data/                    canned replies, presets, seeded conversations
├─ lib/                     types, hooks, upload simulation, helpers
└─ store/chat-store.ts      conversations, streaming, panels
```

## Swapping in a real model

Replace the body of `src/app/api/chat/route.ts` with a provider call and keep
emitting the same three event shapes. Nothing in the client knows the answers
are canned.
