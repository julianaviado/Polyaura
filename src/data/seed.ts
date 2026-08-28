import { EM_REM_SEED_REPLY } from "@/data/responses";
import type {
  Conversation,
  Preset,
  ReferenceToggle,
  UploadedDoc,
} from "@/lib/types";

const MINUTE = 60_000;
const DAY = 86_400_000;

/**
 * Seed timestamps are relative so the history buckets stay meaningful whenever
 * the demo is opened. Anything date-derived renders after mount, which keeps
 * the statically prerendered HTML free of stale dates.
 */
const T = Date.now() - 42 * MINUTE;

export const PRESETS: Preset[] = [
  {
    id: "polyaura-ai",
    name: "Polyaura AI",
    description: "The house voice. Balanced, opinionated, cites its sources.",
    voice: "balanced",
  },
  {
    id: "critique",
    name: "Design Critique",
    description: "Blunt feedback on layout, hierarchy and type.",
    voice: "concise",
  },
  {
    id: "research",
    name: "Research Partner",
    description: "Explores the option space before recommending anything.",
    voice: "exploratory",
  },
  {
    id: "copy",
    name: "Copy Studio",
    description: "Product copy, microcopy and empty states.",
    voice: "concise",
  },
];

export const REFERENCE_DEFAULTS: ReferenceToggle[] = [
  {
    key: "knowledgeBase",
    label: "Knowledge base",
    hint: "Search the documents attached to this workspace before answering.",
    enabled: true,
    visible: true,
  },
  {
    key: "campaignMemory",
    label: "Campaign memory",
    hint: "Carry decisions and context forward from earlier campaigns.",
    enabled: false,
    visible: false,
  },
  {
    key: "thirdPartyModels",
    label: "Third party AI Models",
    hint: "Blend responses from external providers alongside Polyaura AI.",
    enabled: false,
    visible: false,
  },
];

export const SEED_UPLOADS: UploadedDoc[] = [
  {
    id: "doc_principles",
    name: "Polyaura-design-principles.pdf",
    size: 130_547_712,
    kind: "PDF",
    addedAt: T - 3 * DAY,
  },
  {
    id: "doc_type",
    name: "Web-type-and-spacing-scale.pdf",
    size: 130_547_712,
    kind: "PDF",
    addedAt: T - 3 * DAY,
  },
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_units",
    title: "em vs rem for responsive layout",
    createdAt: T,
    updatedAt: T + 2 * MINUTE,
    messages: [
      {
        id: "msg_units_user",
        role: "user",
        content:
          "What are the key differences between `em` and `rem` units in web design, and how can they impact the responsiveness of my layout?",
        createdAt: T,
        attachments: [
          {
            id: "att_units_1",
            name: "Polyaura-design-principles.pdf",
            size: 130_547_712,
            kind: "PDF",
            status: "ready",
            progress: 100,
          },
          {
            id: "att_units_2",
            name: "Web-type-and-spacing-scale.pdf",
            size: 130_547_712,
            kind: "PDF",
            status: "ready",
            progress: 100,
          },
        ],
      },
      {
        id: "msg_units_assistant",
        role: "assistant",
        content: EM_REM_SEED_REPLY,
        createdAt: T + 2 * MINUTE,
        attachments: [],
        citations: [
          {
            id: "kb-1",
            label: "Polyaura Design Principles v3",
            source: "knowledge-base",
          },
          {
            id: "kb-2",
            label: "Web Type & Spacing Scale",
            source: "knowledge-base",
          },
        ],
      },
    ],
  },
  {
    id: "conv_tokens",
    title: "Naming the semantic token tier",
    createdAt: T - DAY - 4 * 60 * MINUTE,
    updatedAt: T - DAY - 3 * 60 * MINUTE,
    messages: [
      {
        id: "msg_tokens_user",
        role: "user",
        content:
          "How should we structure design tokens so Figma and code stop drifting apart?",
        createdAt: T - DAY - 4 * 60 * MINUTE,
        attachments: [],
      },
    ],
  },
  {
    id: "conv_a11y",
    title: "Contrast pass on the dashboard",
    createdAt: T - 4 * DAY,
    updatedAt: T - 4 * DAY,
    messages: [
      {
        id: "msg_a11y_user",
        role: "user",
        content:
          "Which accessibility checks should we run before the dashboard ships?",
        createdAt: T - 4 * DAY,
        attachments: [],
      },
    ],
  },
  {
    id: "conv_motion",
    title: "Motion durations for panel transitions",
    createdAt: T - 12 * DAY,
    updatedAt: T - 12 * DAY,
    messages: [
      {
        id: "msg_motion_user",
        role: "user",
        content: "What easing and duration should panel transitions use?",
        createdAt: T - 12 * DAY,
        attachments: [],
      },
    ],
  },
];

export const PROMPT_SUGGESTIONS = [
  "Audit this layout for accessibility issues",
  "Turn these notes into design system documentation",
  "Compare `grid` and `flexbox` for this component",
  "Draft empty-state copy for the campaign dashboard",
  "Explain the spacing scale in our knowledge base",
];

export const USER = {
  name: "Jasmine",
  handle: "jasmine@polyaura.studio",
  avatar: "/avatar.svg",
};

export type PromptTemplate = {
  id: string;
  category: string;
  title: string;
  body: string;
};

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: "pl_audit",
    category: "Audit",
    title: "Accessibility sweep",
    body: "Audit this screen for accessibility issues. Cover contrast, focus order, target sizes and reduced motion, and rank what to fix first.",
  },
  {
    id: "pl_tokens",
    category: "Design system",
    title: "Token taxonomy",
    body: "Propose a three-tier token taxonomy for our palette — primitives, semantic and component — and show the naming pattern for each tier.",
  },
  {
    id: "pl_critique",
    category: "Critique",
    title: "Hierarchy critique",
    body: "Critique the visual hierarchy of this layout. Tell me what a reader sees first, second and third, and where that ordering fights the goal of the screen.",
  },
  {
    id: "pl_copy",
    category: "Copy",
    title: "Empty state copy",
    body: "Write three options for this empty state. Say what happened, why it is empty, and give one obvious next action. Keep each under 20 words.",
  },
  {
    id: "pl_spec",
    category: "Handoff",
    title: "Component spec",
    body: "Turn this component into a handoff spec: anatomy, states, sizing tokens, keyboard behaviour and the accessibility contract.",
  },
  {
    id: "pl_research",
    category: "Research",
    title: "Readout summary",
    body: "Summarise these research notes into findings, evidence and recommendations. Flag anything only one participant said.",
  },
];
