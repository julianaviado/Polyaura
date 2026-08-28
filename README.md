# Polyaura

An AI chat interface built from Figma mockups, for a design portfolio. There is
no model behind it — the streaming, the uploads and the reference toggles are
all simulated so every state in the design can be reached and demonstrated.

<!-- Run `npm run dev` and open http://localhost:3000 -->

## Stack

| Piece     | Choice                      | Why                                                             |
| --------- | --------------------------- | --------------------------------------------------------------- |
| Framework | Next.js 15 (App Router)     | Route handlers give a real streaming endpoint without a backend |
| UI        | React 19 + TypeScript       | —                                                               |
| Styling   | Tailwind CSS v4             | Design tokens live in `@theme`, so the palette is one file      |
| State     | Zustand + `persist`         | Conversations survive a reload without a database               |
| Motion    | Motion (Framer Motion)      | Panel transitions, message entrances, chip enter/exit           |
| Markdown  | react-markdown + remark-gfm | Headings, lists, tables                                         |
| Code      | Prism                       | Syntax highlighting inside answers                              |
| Icons     | lucide-react                | —                                                               |
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
then streams it back as newline-delimited JSON — `{"type":"delta"}` events
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
- Edit a prompt in place — the turns after it are discarded and the answer re-runs
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

## Layout notes

The composer is two tiers: a narrow rounded block holding the input, sitting on
a wider utility dock. The concave shoulders where one meets the other are cut
with a masked radial gradient (`composer-notch` in `globals.css`) rather than an
image, so they stay crisp at any width.

Below 1180px the settings panel becomes an overlay; below 1100px the sidebar
does too. Both keep the same content — only the container changes.

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
